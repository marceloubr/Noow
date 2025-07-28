const http = require('http');
const fs = require('fs');
const path = require('path');
const { readDB, writeDB } = require('./db');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Roteamento básico
  if (req.method === 'GET' && req.url === '/') {
    // Servir a página de login
    const filePath = path.join(__dirname, 'public', 'login.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Erro no servidor');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    });
  } else if (req.method === 'GET' && req.url === '/index.html') {
    // Servir a página principal (dashboard)
    const filePath = path.join(__dirname, 'public', 'index.html');
     fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Erro no servidor');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    });
  } else if (req.url.startsWith('/css/')) {
    // Servir arquivos CSS
    const filePath = path.join(__dirname, 'public', req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Arquivo não encontrado');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(content, 'utf-8');
      }
    });
  } else if (req.url.startsWith('/js/')) {
    // Servir arquivos JavaScript
    const filePath = path.join(__dirname, 'public', req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Arquivo não encontrado');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content, 'utf-8');
      }
    });
  } else if (req.method === 'GET' && req.url === '/api/deliveries') {
    // Listar todas as entregas
    const db = readDB();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.deliveries));
  } else if (req.method === 'PUT' && req.url.startsWith('/api/deliveries/')) {
    // Atualizar o status de uma entrega
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const { status, assignedTo } = JSON.parse(body);
            const id = parseInt(req.url.split('/')[3]);
            const db = readDB();
            const deliveryIndex = db.deliveries.findIndex(d => d.id === id);

            if (deliveryIndex !== -1) {
              const delivery = db.deliveries[deliveryIndex];
              delivery.status = status;
              if (assignedTo) {
                delivery.assignedTo = assignedTo;
              }
              writeDB(db);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(delivery));
            } else {
              res.writeHead(404);
              res.end('Entrega não encontrada');
            }
        } catch (e) {
            res.writeHead(400);
            res.end('Dados inválidos');
        }
    });
  } else if (req.method === 'POST' && req.url === '/api/login') {
    // Login do usuário
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        const db = readDB();
        const user = db.users.find(u => u.username === username && u.password === password);

        if (user) {
          // Em um app real, retornaríamos um token (JWT)
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: user.id, username: user.username }));
        } else {
          res.writeHead(401);
          res.end('Credenciais inválidas');
        }
      } catch (e) {
        res.writeHead(400);
        res.end('Dados inválidos');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Página não encontrada');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
