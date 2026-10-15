const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Ingresa tus credenciales.', errors: errors.array() });
  }

  const { email, password } = req.body;
  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET;

  if (!configuredEmail || !configuredPassword || !secret) {
    return res.status(503).json({ message: 'El acceso administrativo no está configurado en el servidor.' });
  }
  if (email.toLowerCase() !== configuredEmail.toLowerCase() || password !== configuredPassword) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
  }

  const token = jwt.sign({ sub: configuredEmail, role: 'ADMIN' }, secret, { expiresIn: '8h' });
  return res.json({ token, user: { email: configuredEmail, role: 'ADMIN' }, expiresIn: 28800 });
}

module.exports = { login };
