const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

async function createBooking(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Revisa los datos ingresados.', errors: errors.array() });
  }

  try {
    const {
      name, email, phone, roomId, checkIn, checkOut, guests,
      paymentMethod = 'cash',
      paymentCurrency = 'PEN'
    } = req.body;
    const start = new Date(`${checkIn}T00:00:00.000Z`);
    const end = new Date(`${checkOut}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (start < today) return res.status(400).json({ message: 'La fecha de llegada no puede estar en el pasado.' });
    if (end <= start) return res.status(400).json({ message: 'La salida debe ser posterior a la llegada.' });

    const room = await Room.findOne({ _id: roomId, status: 'available' });
    if (!room) return res.status(404).json({ message: 'La habitación seleccionada ya no está disponible.' });
    if (Number(guests) > room.capacity) {
      return res.status(400).json({ message: `Esta habitación admite hasta ${room.capacity} huéspedes.` });
    }

    const overlap = await Booking.exists({
      room: room._id,
      status: { $in: ['pending', 'confirmed'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });
    if (overlap) {
      return res.status(409).json({ message: 'La habitación no está disponible para esas fechas. Elige otras fechas.' });
    }

    const nights = Math.round((end - start) / 86400000);
    const booking = await Booking.create({
      customer: { name, email, phone },
      room: room._id,
      checkIn: start,
      checkOut: end,
      guests: Number(guests),
      nights,
      pricePerNightPen: room.pricePen,
      totalPen: room.pricePen * nights,
      pricePerNightUsd: room.priceUsd,
      totalUsd: room.priceUsd * nights,
      paymentMethod,
      paymentCurrency
    });

    return res.status(201).json({
      message: 'Reserva registrada correctamente.',
      data: {
        id: booking._id,
        customer: booking.customer,
        room: { id: room._id, name: room.name, pricePen: room.pricePen, priceUsd: room.priceUsd },
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights: booking.nights,
        pricePerNightPen: booking.pricePerNightPen,
        totalPen: booking.totalPen,
        pricePerNightUsd: booking.pricePerNightUsd,
        totalUsd: booking.totalUsd,
        paymentMethod: booking.paymentMethod,
        paymentCurrency: booking.paymentCurrency,
        status: booking.status
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createBooking };
