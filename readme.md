# Projeto Quiz App com Node.js e Azure Cosmos DB

Este projeto é uma aplicação web construída com Node.js, Express e Azure Cosmos DB, que permite criar, editar, visualizar e deletar quizzes interativos. A aplicação inclui um front-end em HTML, CSS e JavaScript, utilizando o Bootstrap para estilização, e implementa autenticação básica com proteção por senha.

## Índice

- [Recursos Utilizados](#recursos-utilizados)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Uso](#uso)
  - [Front-end](#front-end)
  - [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Autenticação](#autenticação)
- [Considerações de Segurança](#considerações-de-segurança)
- [Problemas Conhecidos e Soluções](#problemas-conhecidos-e-soluções)
- [Licença](#licença)

---

## Recursos Utilizados

- **Node.js**: Ambiente de execução JavaScript no lado do servidor.
- **Express**: Framework web para Node.js.
- **Azure Cosmos DB**: Banco de dados NoSQL totalmente gerenciado, utilizado para armazenar os quizzes.
- **Bootstrap**: Biblioteca front-end para estilização responsiva.
- **jQuery**: Biblioteca JavaScript para manipulação do DOM e requisições AJAX.
- **dotenv**: Carregar variáveis de ambiente a partir de um arquivo `.env`.
- **cookie-parser**: Middleware para parsear cookies em requisições HTTP.
- **@azure/cosmos**: SDK do Azure Cosmos DB para Node.js.

---

## Pré-requisitos

- **Node.js** instalado (versão 12 ou superior).
- **NPM** (geralmente instalado junto com o Node.js).
- Conta no **Azure** com acesso ao **Cosmos DB** ou **Azure Cosmos DB Emulator** instalado localmente.
- **Git** (opcional, para clonar o repositório).

---

## Instalação

1. **Clone o repositório ou baixe os arquivos do projeto**:

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   ```

2. **Acesse o diretório do projeto**:

   ```bash
   cd seu-repositorio
   ```

3. **Instale as dependências do projeto**:

   ```bash
   npm install
   ```

---

## Configuração

1. **Configurar o Azure Cosmos DB**:

   - Crie uma conta no [portal do Azure](https://portal.azure.com) se ainda não tiver.
   - Crie uma instância do **Azure Cosmos DB** com a API **Core (SQL)**.
   - Anote o **URI** e a **Chave Primária** do Cosmos DB.

2. **Criar o arquivo `.env` na raiz do projeto**:

   Crie um arquivo chamado `.env` e adicione as seguintes variáveis de ambiente:

   ```env
   COSMOSDB_URI=<SEU_COSMOSDB_URI>
   COSMOSDB_KEY=<SUA_COSMOSDB_CHAVE_PRIMÁRIA>
   COSMOSDB_DATABASE=QuizDatabase
   COSMOSDB_CONTAINER=Quizzes
   PASSWORD=<SUA_SENHA_DESEJADA>
   PORT=3000
   ```

   - Substitua `<SEU_COSMOSDB_URI>` pelo URI do seu Cosmos DB.
   - Substitua `<SUA_COSMOSDB_CHAVE_PRIMÁRIA>` pela chave primária do seu Cosmos DB.
   - Substitua `<SUA_SENHA_DESEJADA>` pela senha que deseja utilizar para proteção da aplicação.

3. **Certifique-se de que o arquivo `.env` está no `.gitignore`** para não versionar informações sensíveis.

---

## Execução

Inicie o servidor com o comando:

```bash
node index.js
```

Você verá a mensagem:

```
Servidor rodando na porta 3000
```

---

## Uso

### Front-end

1. **Acesse a aplicação no navegador**:

   ```
   http://localhost:3000/
   ```

2. **Login**:

   - Você será redirecionado para a página de login.
   - Insira a senha definida no arquivo `.env`.
   - Após o login bem-sucedido, você será redirecionado para a página principal.

3. **Criar um Quiz**:

   - Clique no botão **"Create Quiz"**.
   - Preencha o nome do quiz.
   - Adicione perguntas e respostas dinamicamente.
     - Para cada pergunta, você pode adicionar múltiplas respostas.
     - Marque a caixa **"Is True"** para indicar as respostas corretas.
   - Clique em **"Save Quiz"** para salvar.

4. **Visualizar Quizzes**:

   - Abaixo do botão "Create Quiz", você verá uma tabela listando todos os quizzes com **ID**, **Nome** e **Ações**.

5. **Editar um Quiz**:

   - Clique no botão **"Edit"** correspondente ao quiz que deseja editar.
   - Uma nova aba será aberta com o formulário preenchido com os dados atuais.
   - Faça as alterações desejadas e clique em **"Save Quiz"**.

6. **Deletar um Quiz**:

   - Clique no botão **"Delete"** correspondente ao quiz que deseja excluir.
   - Confirme a ação na janela de confirmação.
   - O quiz será removido da lista.

### API Endpoints

A aplicação expõe os seguintes endpoints:

- **Registrar um Quiz**:

  ```
  POST /api/quiz/register
  ```

  - Corpo da requisição (JSON):

    ```json
    {
      "quizName": "Nome do Quiz",
      "questions": [
        {
          "question": "Texto da Pergunta",
          "answers": [
            {
              "answer": "Texto da Resposta",
              "isTrue": true
            }
          ]
        }
      ]
    }
    ```

- **Obter Todos os Quizzes**:

  ```
  GET /api/quiz/all
  ```

- **Buscar um Quiz por ID ou Nome**:

  ```
  GET /api/quiz/search?id={id}
  GET /api/quiz/search?name={nome}
  ```

- **Editar um Quiz**:

  ```
  PUT /api/quiz/edit/{id}
  ```

  - Corpo da requisição (JSON): Mesmo formato do registro de quiz.

- **Deletar um Quiz**:

  ```
  DELETE /api/quiz/delete/{id}
  ```

---

## Estrutura do Projeto

```
├── api
│   └── quiz-register.js       # Rotas da API para gerenciamento de quizzes
├── middlewares
│   └── passwordProtect.js     # Middleware para proteção por senha
├── public
│   ├── index.html             # Página principal
│   ├── edit.html              # Página de edição de quizzes
│   ├── login.html             # Página de login
│   ├── css
│   │   └── styles.css         # (Opcional) Arquivo de estilos personalizados
│   └── js
│       ├── main.js            # Script da página principal
│       ├── edit.js            # Script da página de edição
│       └── login.js           # Script da página de login (se necessário)
├── .env                       # Variáveis de ambiente (não versionado)
├── index.js                   # Arquivo principal do servidor
├── package.json               # Dependências e scripts do projeto
└── README.md                  # Documentação do projeto
```

---

## Autenticação

A aplicação implementa uma proteção por senha simples usando cookies HTTP.

- **Middleware `passwordProtect`**:

  - Intercepta todas as requisições e verifica se o usuário está autenticado.
  - Permite acesso sem autenticação às rotas `/login.html`, `/login` e quaisquer rotas que comecem com `/chat`.
  - Redireciona para `/login.html` caso o usuário não esteja autenticado.

- **Rota `/login`**:

  - Processa o formulário de login.
  - Verifica se a senha fornecida corresponde à senha definida no arquivo `.env`.
  - Define um cookie `authToken` com a senha em caso de sucesso.

- **Logout**:

  - Para implementar o logout, basta limpar o cookie `authToken` no cliente ou criar uma rota `/logout` que remova o cookie.

---

## Considerações de Segurança

- **Não use esta implementação em produção sem melhorias**:

  - **Senha em Texto Simples**: A senha é comparada em texto simples e armazenada em um cookie. Em produção, utilize hashes seguros e nunca armazene senhas em texto simples.
  - **HTTPS**: Utilize HTTPS para garantir que as comunicações sejam criptografadas.
  - **Cookies Seguros**: Marque os cookies como `Secure` e `HttpOnly` para prevenir ataques.
  - **Bibliotecas de Autenticação**: Considere utilizar bibliotecas como `passport` para uma autenticação mais robusta.

---

## Problemas Conhecidos e Soluções

- **Redirecionamento não funciona no middleware**:

  - **Problema**: O `res.redirect('/login.html')` não funcionava porque o middleware `passwordProtect` estava sendo aplicado após o middleware `express.static`.
  - **Solução**: Mover o `passwordProtect` para antes do `express.static` no `index.js`.

- **`req.cookies` não está definido**:

  - **Problema**: O `req.cookies` estava indefinido porque o middleware `cookie-parser` não estava sendo usado.
  - **Solução**: Instalar o `cookie-parser` com `npm install cookie-parser` e adicioná-lo aos middlewares no `index.js`.

---

## Licença

Este projeto está licenciado sob os termos da licença MIT.

---

## Contato

Para mais informações ou dúvidas, entre em contato com [seu-email@example.com](mailto:seu-email@example.com).

---

**Nota**: Este projeto foi desenvolvido como um exemplo educativo e pode requerer ajustes para uso em ambientes de produção.