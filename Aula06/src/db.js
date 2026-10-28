// src/db.js

const { Pool } = require("pg");

// Configuração da conexão com o banco de dados (valores vêm do arquivo .env)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME, // O nome do nosso banco de dados
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Mensagem para verificar se a conexão foi bem-sucedida
pool.on("connect", () => {
  console.log("Conexão com o banco de dados estabelecida com sucesso!");
});

// Exportamos um objeto com um método 'query' que encapsula a execução de consultas
module.exports = {
  query: (text, params) => pool.query(text, params),
};
