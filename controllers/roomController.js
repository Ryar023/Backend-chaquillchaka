const Room = require('../models/Room');
const Booking = require('../models/Booking');

async function getOccupancy(req, res, next) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const bookings = await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      checkOut: { $gt: today }
    }).select('room checkIn checkOut').sort({ checkIn: 1 }).lean();
    res.json({
      data: bookings.map((b) => ({ roomId: String(b.room), checkIn: b.checkIn, checkOut: b.checkOut }))
    });
  } catch (error) {
    next(error);
  }
}

async function getRooms(req, res, next) {
  try {
    const rooms = await Room.find({ status: 'available' }).sort({ pricePen: 1 }).lean();
    res.json({ data: rooms });
  } catch (error) {
    next(error);
  }
}

async function getRoomById(req, res, next) {
  try {
    const room = await Room.findOne({ _id: req.params.id, status: 'available' }).lean();
    if (!room) return res.status(404).json({ message: 'No encontramos esa habitación.' });
    return res.json({ data: room });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ message: 'El identificador de habitación no es válido.' });
    return next(error);
  }
}

module.exports = { getRooms, getRoomById, getOccupancy };
