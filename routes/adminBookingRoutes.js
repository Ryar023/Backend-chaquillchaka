const express = require('express');
const { body, param } = require('express-validator');
const { requireAdmin } = require('../middleware/authMiddleware');
const { listBookings, updateBookingStatus } = require('../controllers/adminBookingController');

const router = express.Router();
router.use(requireAdmin);
router.get('/', listBookings);
router.put('/:id/status', [
  param('id').isMongoId().withMessage('La reserva no es válida.'),
  body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Selecciona un estado válido.')
], updateBookingStatus);

module.exports = router;
