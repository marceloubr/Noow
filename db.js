const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler o banco de dados:", error);
    // Se o arquivo não existir ou for inválido, retorna uma estrutura padrão
    return { deliveries: [] };
  }
}

function writeDB(data) {
  try {
    // Usamos writeFileSync para garantir que a operação seja atômica
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Erro ao escrever no banco de dados:", error);
  }
}

module.exports = { readDB, writeDB };
