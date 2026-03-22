import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

type Livro = {
  id: string;
  titulo: string;
  quantidade: number;
  qtdEmprestados: number;
};

type Emprestimo = {
  id: string;
  usuarioId: string;
  livrosIds: string[];
  dataEmprestimo: string;
  dataDevolucao: string | null;
  status: 'ativo' | 'concluído';
};

const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido.' });
  }

  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(jsonData);
  const livros: Livro[] = parsed.livros || [];
  const emprestimos: Emprestimo[] = parsed.emprestimos || [];

  const { emprestimoId, livrosIds } = req.body;

  // Validação de campos obrigatórios
  if (!emprestimoId || !livrosIds) {
    return res.status(400).json({ mensagem: 'Os campos emprestimoId e livrosIds são obrigatórios.' });
  }

  // Validação: livrosIds deve ser um array não vazio
  if (!Array.isArray(livrosIds) || livrosIds.length === 0) {
    return res.status(400).json({ mensagem: 'O campo livrosIds deve ser um array com ao menos um id.' });
  }

  // Localizar o empréstimo ativo
  const emprestimo = emprestimos.find((e: Emprestimo) => e.id === emprestimoId);

  if (!emprestimo || emprestimo.status !== 'ativo') {
    return res.status(404).json({ mensagem: 'Empréstimo não encontrado ou já concluído.' });
  }

  // Verificar se cada livro sendo devolvido pertence a este empréstimo
  for (const livroId of livrosIds) {
    if (!emprestimo.livrosIds.includes(livroId)) {
      return res.status(400).json({ mensagem: `O livro com id '${livroId}' não pertence a este empréstimo.` });
    }
  }

  // Decrementar qtdEmprestados de cada livro devolvido
  for (const livroId of livrosIds) {
    const livro = livros.find((l: Livro) => l.id === livroId);
    if (livro && livro.qtdEmprestados > 0) {
      livro.qtdEmprestados -= 1;
    }
  }

  // Verificar se todos os livros do empréstimo foram devolvidos
  // Remove os livros devolvidos agora da lista de pendentes
  const livrosDevolvidos = new Set(livrosIds);
  const aindaPendentes = emprestimo.livrosIds.filter((id: string) => !livrosDevolvidos.has(id));

  if (aindaPendentes.length === 0) {
    // Devolução total: concluir o empréstimo
    emprestimo.status = 'concluído';
    emprestimo.dataDevolucao = new Date().toISOString().split('T')[0];

    fs.writeFileSync(filePath, JSON.stringify({ ...parsed, livros, emprestimos }, null, 2));
    return res.status(200).json({ mensagem: 'Empréstimo concluído com sucesso!', emprestimo });
  } else {
    // Devolução parcial: atualizar apenas o estoque, manter status ativo
    fs.writeFileSync(filePath, JSON.stringify({ ...parsed, livros, emprestimos }, null, 2));
    return res.status(200).json({ mensagem: 'Devolução parcial registrada com sucesso.' });
  }
}