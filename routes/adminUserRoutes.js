const express = require('express');
const { body, param } = require('express-validator');
const { requireRoles } = require('../middleware/authMiddleware');
const { listUsers, createUser, updateUser } = require('../controllers/adminUserController');
const { isAllowedStaffEmail } = require('../utils/emailPolicy');

const router = express.Router();
router.use(requireRoles('ADMIN', 'HR'));
router.get('/', listUsers);
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Ingresa un nombre de al menos 2 caracteres.'),
  body('email').trim().isEmail().withMessage('Ingresa un correo válido.')
    .bail().custom(isAllowedStaffEmail).withMessage('Usa una cuenta @chaquillchaka.com.pe.'),
  body('password').isString().isLength({ min: 12, max: 200 }).withMessage('La contraseña debe tener al menos 12 caracteres.'),
  body('role').isIn(['ADMIN', 'RECEPTION', 'ACCOUNTING', 'HR']).withMessage('Selecciona un rol válido.')
], createUser);
router.put('/:id', [
  param('id').isMongoId().withMessage('La cuenta no es válida.'),
  body('role').optional().isIn(['ADMIN', 'RECEPTION', 'ACCOUNTING', 'HR']).withMessage('Selecciona un rol válido.'),
  body('isActive').optional().isBoolean().withMessage('El estado debe ser válido.')
], updateUser);

module.exports = router;
