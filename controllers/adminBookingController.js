const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');

const allowedStatuses = ['pending', 'confirmed', 'cancelled'];

async function listBookings(req, res, next) {
  try {
    const query = {};
    if (req.query.status && allowedStatuses.includes(req.query.status)) query.status = req.query.status;
    if (req.query.room) query.room = req.query.room;
    if (req.query.from || req.query.to) {
      query.checkIn = {};
      if (req.query.from) query.checkIn.$gte = new Date(`${req.query.from}T00:00:00.000Z`);
      if (req.query.to) query.checkIn.$lte = new Date(`${req.query.to}T23:59:59.999Z`);
    }

    const bookings = await Booking.find(query).populate('room', 'name type').sort({ checkIn: 1, createdAt: -1 }).lean();
    return res.json({ data: bookings });
  } catch (error) {
    return next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'El estado seleccionado no es válido.', errors: errors.array() });

  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate('room', 'name type');
    if (!booking) return res.status(404).json({ message: 'No se encontró la reserva.' });
    return res.json({ message: 'Estado actualizado correctamente.', data: booking });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listBookings, updateBookingStatus };
