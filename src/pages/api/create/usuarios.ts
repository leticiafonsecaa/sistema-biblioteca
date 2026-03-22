import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido.' });
  }

  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(jsonData);
  const usuarios: Usuario[] = parsed.usuarios || [];

  const { nome, email, telefone } = req.body;

  // Validação de campos obrigatórios
  if (!nome || !email || !telefone) {
    return res.status(400).json({ mensagem: 'Nome, email e telefone são obrigatórios.' });
  }

  // Validação de duplicidade de e-mail
  if (usuarios.some((user: Usuario) => user.email === email)) {
    return res.status(409).json({ mensagem: 'Já existe um usuário cadastrado com este e-mail.' });
  }

  const novoUsuario: Usuario = {
    id: uuidv4(),
    nome,
    email,
    telefone,
  };

  usuarios.push(novoUsuario);
  fs.writeFileSync(filePath, JSON.stringify({ ...parsed, usuarios }, null, 2));

  return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: novoUsuario });
}