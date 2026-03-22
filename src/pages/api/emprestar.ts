import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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
  const usuarios = parsed.usuarios || [];
  const livros: Livro[] = parsed.livros || [];
  const emprestimos: Emprestimo[] = parsed.emprestimos || [];

  const { usuarioId, livrosIds, dataEmprestimo } = req.body;

  // Validação de campos obrigatórios
  if (!usuarioId || !livrosIds || !dataEmprestimo) {
    return res.status(400).json({ mensagem: 'Os campos usuarioId, livrosIds e dataEmprestimo são obrigatórios.' });
  }

  // Validação: livrosIds deve ser um array não vazio
  if (!Array.isArray(livrosIds) || livrosIds.length === 0) {
    return res.status(400).json({ mensagem: 'O campo livrosIds deve ser um array com ao menos um id.' });
  }

  // Verificar se o usuário existe
  const usuarioExiste = usuarios.some((u: { id: string }) => u.id === usuarioId);
  if (!usuarioExiste) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
  }

  // Verificar se todos os livros existem e estão disponíveis
  for (const livroId of livrosIds) {
    const livro = livros.find((l: Livro) => l.id === livroId);

    if (!livro) {
      return res.status(404).json({ mensagem: `Livro com id '${livroId}' não encontrado.` });
    }

    if (livro.qtdEmprestados >= livro.quantidade) {
      return res.status(400).json({ mensagem: `O livro '${livro.titulo}' não possui unidades disponíveis.` });
    }
  }

  // Todas as validações passaram: incrementar qtdEmprestados de cada livro
  for (const livroId of livrosIds) {
    const livro = livros.find((l: Livro) => l.id === livroId)!;
    livro.qtdEmprestados += 1;
  }

  // Criar o registro do empréstimo
  const novoEmprestimo: Emprestimo = {
    id: uuidv4(),
    usuarioId,
    livrosIds,
    dataEmprestimo,
    dataDevolucao: null,
    status: 'ativo',
  };

  emprestimos.push(novoEmprestimo);

  fs.writeFileSync(
    filePath,
    JSON.stringify({ ...parsed, livros, emprestimos }, null, 2)
  );

  return res.status(201).json({ mensagem: 'Empréstimo realizado com sucesso!', emprestimo: novoEmprestimo });
}