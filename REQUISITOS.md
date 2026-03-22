    # Cenários de Requisitos - Sistema de Biblioteca

    Este documento detalha as regras de negócio e os requisitos técnicos para a implementação das funcionalidades do sistema. Os alunos devem seguir estas diretrizes para garantir a consistência dos dados no arquivo `bd.json`.

    ---

    ## 1. Cadastro de Usuários
    **Arquivo:** `src/pages/api/create/usuarios.ts`

    ### Requisitos:
    - **Campos Obrigatórios:** O corpo da requisição (`req.body`) deve conter obrigatoriamente `nome`, `email` e `telefone`.
    - **Validação de Duplicidade:** Não deve ser permitido cadastrar dois usuários com o mesmo `email`.
    - **Identificação Única:** Cada usuário deve receber um `id` único (UUID) no momento da criação.
    - **Persistência:** O novo usuário deve ser adicionado ao array `usuarios` dentro do `bd.json`.

    ---

    ## 2. Cadastro de Livros
    **Arquivo:** `src/pages/api/create/livros.ts`

    ### Requisitos:
    - **Campos Obrigatórios:** Devem ser enviados `titulo`, `genero`, `autor` e `quantidade`.
    - **Consistência de Dados:** 
        - A `quantidade` deve ser um número inteiro positivo.
        - Inicializar o campo `qtdEmprestados` com `0`.
    - **Identificação Única:** Cada livro deve possuir um `id` único (UUID).
    - **Validação:** Impedir o cadastro de livros com o mesmo título e autor (evitar duplicatas identicas).

    ---

    ## 3. Realizar Empréstimo
    **Arquivo:** `src/pages/api/emprestar.ts`

    ### Requisitos:
    - **Entrada:** Deve receber `usuarioId`, um array `livrosIds` e a `dataEmprestimo`.
    - **Regras de Negócio:**
        1. **Verificar Usuário:** O `id` do usuário deve existir na base.
        2. **Verificar Livros:** Todos os IDs no array `livrosIds` devem ser válidos.
        3. **Disponibilidade:** Um livro só pode ser emprestado se `quantidade` for maior que `qtdEmprestados`.
        4. **Atualização de Estoque:** Para cada livro emprestado, incrementar o campo `qtdEmprestados` no objeto do livro correspondente em `livros`.
    - **Registro:** Criar um novo objeto no array `emprestimos` com:
        - `id` (do empréstimo)
        - `usuarioId`
        - `livrosIds`
        - `dataEmprestimo`
        - `status` (ex: "ativo")

    ---

    ## 4. Realizar Devolução
    **Arquivo:** `src/pages/api/devolver.ts`

    ### Requisitos:
    - **Entrada:** Deve receber `emprestimoId` e o array de `livrosIds` que estão sendo devolvidos.
    - **Regras de Negócio:**
        1. **Localizar Empréstimo:** O `id` do empréstimo deve ser válido e estar com status "ativo".
        2. **Atualização de Estoque:** Para cada livro devolvido, **decrementar** o campo `qtdEmprestados` no respectivo livro no array `livros`.
        3. **Finalização:** 
            - Se todos os livros do empréstimo forem devolvidos, marcar o status do empréstimo como "concluído".
            - Registrar a `dataDevolucao`.
    - **Validação:** Garantir que o livro sendo devolvido realmente pertence àquele empréstimo.

    ---

    ## ⚠️ Observação Importante para os Alunos
    Mesmo que o projeto já possua algumas implementações parciais ou arquivos criados, é **obrigatório** validar se cada endpoint da API está executando exatamente conforme os requisitos descritos acima. Testem todos os cenários (sucesso e erro) antes de considerar a tarefa concluída.

