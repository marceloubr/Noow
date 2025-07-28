const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./models');

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

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));

const uberEatsService = require('./services/uberEatsService');
const glovoService = require('./services/glovoService');
const deliveryService = require('./services/deliveryService');

// Sincronizar o banco de dados e iniciar o servidor
db.sequelize.sync({ force: true }).then(async () => { // force: true irá recriar as tabelas a cada inicialização
  // Criar um restaurante padrão
  await db.Restaurant.create({
    name: 'Restaurante Exemplo',
    address: 'Rua Principal, 1',
  });

  // Criar um usuário entregador padrão
  const hashedPassword = await require('bcrypt').hash('123', 10);
  await db.User.create({
    email: 'entregador@email.com',
    password: hashedPassword,
    status: 'verified',
  });

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    uberEatsService.start();
    glovoService.start();
    deliveryService.start();
  });
});
