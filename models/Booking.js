const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true }
  },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  nights: { type: Number, required: true, min: 1 },
  pricePerNightPen: { type: Number, required: true },
  totalPen: { type: Number, required: true },
  pricePerNightUsd: { type: Number, required: true, default: 0 },
  totalUsd: { type: Number, required: true, default: 0 },
  paymentMethod: { type: String, enum: ['yape', 'plin', 'card', 'cash'], default: 'cash' },
  paymentCurrency: { type: String, enum: ['PEN', 'USD'], default: 'PEN' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

bookingSchema.index({ room: 1, status: 1, checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
