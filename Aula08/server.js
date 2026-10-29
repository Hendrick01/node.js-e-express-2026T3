const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const basicAuth = require("express-basic-auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do Swagger JSDoc
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Tarefas",
      version: "1.0.0",
      description: "Uma API simples para gerenciar tarefas (CRUD)",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [__filename], // Este próprio arquivo contém a documentação da API
};

const specs = swaggerJsdoc(options);

// Autenticação básica da documentação (usuário e senha vêm do .env)
const auth = basicAuth({
  users: { [process.env.DOCS_USER]: process.env.DOCS_PASSWORD },
  challenge: true, // Faz com que o navegador exiba um pop-up de login.
  unauthorizedResponse: "Acesso não autorizado. Credenciais inválidas.",
});

// Rota para a documentação do Swagger, protegida por usuário e senha
app.use("/api-docs", auth, swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: integer
 *           description: O ID gerado automaticamente para a tarefa
 *         title:
 *           type: string
 *           description: O título da tarefa
 *         completed:
 *           type: boolean
 *           description: O status da tarefa
 *       example:
 *         id: 1
 *         title: "Aprender Swagger"
 *         completed: false
 *     TaskInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: O título da tarefa
 *         completed:
 *           type: boolean
 *           description: O status da tarefa (opcional, padrão false)
 *       example:
 *         title: "Documentar minha API"
 *         completed: false
 *   parameters:
 *     TaskId:
 *       in: path
 *       name: id
 *       required: true
 *       description: O ID da tarefa
 *       schema:
 *         type: integer
 */

// "Banco de dados" em memória
let tasks = [
  { id: 1, title: "Aprender Node.js", completed: false },
  { id: 2, title: "Criar uma API", completed: true },
];
let nextId = 3;

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retorna a lista de todas as tarefas
 *     tags: [Tarefas]
 *     responses:
 *       200:
 *         description: A lista de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Busca uma tarefa pelo ID
 *     tags: [Tarefas]
 *     parameters:
 *       - $ref: '#/components/parameters/TaskId'
 *     responses:
 *       200:
 *         description: A tarefa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarefa não encontrada
 */
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (task) {
    res.status(200).json(task);
  } else {
    res.status(404).send("Tarefa não encontrada");
  }
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Cria uma nova tarefa
 *     tags: [Tarefas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: A tarefa foi criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Dados inválidos
 */
app.post("/tasks", (req, res) => {
  const { title, completed = false } = req.body ?? {};

  if (!title) {
    return res.status(400).send("O título da tarefa é obrigatório.");
  }

  const newTask = {
    id: nextId++,
    title,
    completed,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Substitui uma tarefa inteira
 *     tags: [Tarefas]
 *     parameters:
 *       - $ref: '#/components/parameters/TaskId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, completed]
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *           example:
 *             title: "Documentar minha API"
 *             completed: true
 *     responses:
 *       200:
 *         description: A tarefa atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Dados incompletos (title e completed são obrigatórios)
 *       404:
 *         description: Tarefa não encontrada
 */
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).send("Tarefa não encontrada");
  }

  const { title, completed } = req.body ?? {};
  if (!title || typeof completed !== "boolean") {
    return res.status(400).send("Dados incompletos para atualização.");
  }

  tasks[taskIndex] = { id, title, completed };
  res.status(200).json(tasks[taskIndex]);
});

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Atualiza parcialmente uma tarefa
 *     description: "Permite atualizar apenas campos específicos (ex: marcar como concluída) sem reenviar todos os dados."
 *     tags: [Tarefas]
 *     parameters:
 *       - $ref: '#/components/parameters/TaskId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             completed: true
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso.
 *       400:
 *         description: Nenhum campo enviado para atualizar.
 *       404:
 *         description: Tarefa não encontrada.
 */
app.patch("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }

  const { title, completed } = req.body ?? {};

  if (title === undefined && completed === undefined) {
    return res.status(400).json({ erro: "Envie ao menos um campo para atualizar." });
  }

  if (title !== undefined) task.title = title;
  if (completed !== undefined) task.completed = completed;

  res.status(200).json(task);
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Remove uma tarefa
 *     tags: [Tarefas]
 *     parameters:
 *       - $ref: '#/components/parameters/TaskId'
 *     responses:
 *       204:
 *         description: Tarefa removida (sem conteúdo)
 *       404:
 *         description: Tarefa não encontrada
 */
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).send("Tarefa não encontrada");
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send(); // 204 No Content
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação em http://localhost:${PORT}/api-docs`);
});
