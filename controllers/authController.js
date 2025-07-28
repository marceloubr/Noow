const db = require('../models');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await db.User.findOne({ where: { username, password } });
  if (user) {
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username });
  } else {
    res.status(401).send('Credenciais inválidas');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Não foi possível fazer logout');
    }
    res.clearCookie('connect.sid');
    res.status(200).send('Logout bem-sucedido');
  });
};

exports.checkAuth = (req, res) => {
  if (req.session.userId) {
    res.status(200).send({ authenticated: true });
  } else {
    res.status(401).send({ authenticated: false });
  }
};
