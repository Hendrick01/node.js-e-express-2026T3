const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// "Banco de dados" em memória
let tasks = [
  { id: 1, title: "Aprender Node.js", completed: false },
  { id: 2, title: "Criar uma API", completed: true },
];
let nextId = 3;

// Listar tarefas: substantivo no plural, sem verbo na URI
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

// Buscar por ID: path parameter e 404 quando não existe
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (task) {
    res.status(200).json(task);
  } else {
    res.status(404).send("Tarefa não encontrada");
  }
});

// Criar: 201 Created devolvendo o recurso criado
app.post("/tasks", (req, res) => {
  const { title, completed = false } = req.body;

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

// Atualizar: PUT substitui o recurso inteiro
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).send("Tarefa não encontrada");
  }

  const { title, completed } = req.body;
  if (!title || typeof completed !== "boolean") {
    return res.status(400).send("Dados incompletos para atualização.");
  }

  tasks[taskIndex] = { id, title, completed };
  res.status(200).json(tasks[taskIndex]);
});

// Deletar: método DELETE e 204 No Content
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
});
