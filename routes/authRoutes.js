const express = require('express');
const { body } = require('express-validator');
const { login } = require('../controllers/authController');
const { isAllowedStaffEmail } = require('../utils/emailPolicy');

const router = express.Router();
router.post('/login', [
  body('email').trim().isEmail().withMessage('Ingresa un correo válido.')
    .bail().custom(isAllowedStaffEmail).withMessage('Usa una cuenta @chaquillchaka.com.pe.'),
  body('password').isString().isLength({ min: 8, max: 200 }).withMessage('La contraseña no es válida.')
], login);

module.exports = router;
