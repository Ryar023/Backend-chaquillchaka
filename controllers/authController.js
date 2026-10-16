const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { isAllowedStaffEmail } = require('../utils/emailPolicy');

async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Ingresa tus credenciales.', errors: errors.array() });

  const email = req.body.email.toLowerCase();
  const { password } = req.body;
  const secret = process.env.JWT_SECRET;
  if (!isAllowedStaffEmail(email)) {
    return res.status(400).json({ message: 'Usa una cuenta @chaquillchaka.com.pe.' });
  }
  if (!secret) return res.status(503).json({ message: 'El acceso administrativo no está configurado en el servidor.' });

  try {
    if (process.env.ADMIN_EMAIL && !isAllowedStaffEmail(process.env.ADMIN_EMAIL)) {
      return res.status(503).json({ message: 'ADMIN_EMAIL debe terminar en @chaquillchaka.com.pe.' });
    }
    let user = await User.findOne({ email }).select('+passwordHash');
    if (!user && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD &&
        email === process.env.ADMIN_EMAIL.toLowerCase() && password === process.env.ADMIN_PASSWORD) {
      user = await User.create({
        name: 'Administrador principal',
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: 'ADMIN'
      });
    }

    if (!user || !user.isActive || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign({ sub: user.email }, secret, { expiresIn: '8h' });
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      expiresIn: 28800
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login };
