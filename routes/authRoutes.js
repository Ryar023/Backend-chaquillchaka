const express = require('express');
const { body } = require('express-validator');
const { login } = require('../controllers/authController');

const router = express.Router();
router.post('/login', [
  body('email').trim().isEmail().withMessage('Ingresa un correo válido.'),
  body('password').isString().isLength({ min: 8, max: 200 }).withMessage('La contraseña no es válida.')
], login);

module.exports = router;
