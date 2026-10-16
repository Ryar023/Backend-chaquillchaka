const express = require('express');
const { body, param } = require('express-validator');
const { requireRoles } = require('../middleware/authMiddleware');
const { listBookings, updateBookingStatus } = require('../controllers/adminBookingController');

const router = express.Router();
router.get('/', requireRoles('ADMIN', 'RECEPTION', 'ACCOUNTING'), listBookings);
router.put('/:id/status', requireRoles('ADMIN', 'RECEPTION'), [
  param('id').isMongoId().withMessage('La reserva no es válida.'),
  body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Selecciona un estado válido.')
], updateBookingStatus);

module.exports = router;
