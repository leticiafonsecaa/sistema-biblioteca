import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';

type Livro = {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  quantidade: number;
  qtdEmprestados: number;
};

const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido.' });
  }

  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(jsonData) as { livros?: Livro[] };
  const livros = parsed.livros ?? [];

  const { titulo, autor, genero, quantidade } = req.body;

  // Validação de campos obrigatórios
  if (!titulo || !autor || !genero || quantidade === undefined || quantidade === null) {
    return res.status(400).json({ mensagem: 'Os campos titulo, autor, genero e quantidade são obrigatórios.' });
  }

  // Validação: quantidade deve ser inteiro positivo
  const qtd = Number(quantidade);
  if (!Number.isInteger(qtd) || qtd <= 0) {
    return res.status(400).json({ mensagem: 'O campo quantidade deve ser um número inteiro positivo.' });
  }

  // Validação de duplicidade (mesmo título e mesmo autor)
  const jaExiste = livros.some(
    (livro: Livro) =>
      livro.titulo.trim().toLowerCase() === titulo.trim().toLowerCase() &&
      livro.autor.trim().toLowerCase() === autor.trim().toLowerCase()
  );

  if (jaExiste) {
    return res.status(409).json({ mensagem: 'Já existe um livro cadastrado com este título e autor.' });
  }

  const novoLivro: Livro = {
    id: uuidv4(),
    titulo: titulo.trim(),
    autor: autor.trim(),
    genero: genero.trim(),
    quantidade: qtd,
    qtdEmprestados: 0,
  };

  livros.push(novoLivro);
  fs.writeFileSync(filePath, JSON.stringify({ ...parsed, livros }, null, 2));

  return res.status(201).json({ mensagem: 'Livro cadastrado com sucesso!', livro: novoLivro });
}