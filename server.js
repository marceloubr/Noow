const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./models');
const deliveryRoutes = require('./routes/deliveryRoutes');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Em produção, use true com HTTPS
  })
);

// Rotas da API
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

const uberEatsService = require('./services/uberEatsService');
const glovoService = require('./services/glovoService');
const paymentService = require('./services/paymentService');

// Sincronizar o banco de dados e iniciar o servidor
db.sequelize.sync({ force: true }).then(async () => { // force: true irá recriar as tabelas a cada inicialização
  // Criar um restaurante padrão
  await db.Restaurant.create({
    name: 'Restaurante Exemplo',
    address: 'Rua Principal, 1',
  });

  // Criar um usuário entregador padrão
  await db.User.create({
    username: 'entregador',
    password: '123', // Em um app real, use hashes de senha
    role: 'deliverer',
  });

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    uberEatsService.start();
    glovoService.start();
    paymentService.start();
  });
});
