const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Simple', 'Doble', 'Matrimonial', 'Familiar'], required: true },
  description: { type: String, required: true },
  pricePen: { type: Number, required: true, min: 0 },
  priceUsd: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  services: [{ type: String, trim: true }],
  photos: [{ type: String, trim: true }],
  status: { type: String, enum: ['available', 'maintenance'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
