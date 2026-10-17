const express = require('express');
const { body } = require('express-validator');
const { createBooking } = require('../controllers/bookingController');

const router = express.Router();
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Ingresa tu nombre.'),
  body('email').trim().isEmail().withMessage('Ingresa un correo válido.'),
  body('phone').trim().isLength({ min: 7, max: 20 }).withMessage('Ingresa un teléfono válido.'),
  body('roomId').isMongoId().withMessage('Selecciona una habitación válida.'),
  body('checkIn')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    })
    .withMessage('Ingresa una fecha de llegada válida.'),
  body('checkOut')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    })
    .withMessage('Ingresa una fecha de salida válida.'),
  body('guests').isInt({ min: 1, max: 20 }).withMessage('El número de huéspedes debe ser válido.'),
  body('paymentMethod').optional().isIn(['yape', 'plin', 'card', 'cash']).withMessage('Selecciona un medio de pago válido.'),
  body('paymentCurrency').optional().isIn(['PEN', 'USD']).withMessage('Selecciona una moneda válida.'),
  body('documentType').optional().isIn(['boleta', 'factura']).withMessage('Selecciona boleta o factura.'),
  body('ruc').if(body('documentType').equals('factura'))
    .trim().matches(/^(10|20)\d{9}$/).withMessage('Ingresa un RUC válido de 11 dígitos (empieza con 10 o 20).'),
  body('businessName').if(body('documentType').equals('factura'))
    .trim().isLength({ min: 3, max: 150 }).withMessage('Ingresa la razón social.'),
  body('fiscalAddress').if(body('documentType').equals('factura'))
    .trim().isLength({ min: 5, max: 200 }).withMessage('Ingresa la dirección fiscal.'),
  body('paymentMethod').custom((method, { req }) => {
    if ((method === 'yape' || method === 'plin') && req.body.paymentCurrency && req.body.paymentCurrency !== 'PEN') {
      throw new Error('Yape y Plin solo admiten pagos en soles.');
    }
    return true;
  })
], createBooking);

module.exports = router;
