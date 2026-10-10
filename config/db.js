const mongoose = require('mongoose');
const Room = require('../models/Room');

const initialRooms = [
  {
    name: 'Habitación Simple',
    type: 'Simple',
    description: 'Un espacio acogedor para descansar después de descubrir Cusco.',
    pricePen: 120,
    priceUsd: 32,
    capacity: 1,
    services: ['Wi-Fi 100Mbps', 'Baño privado', 'Agua caliente 24/7', 'Desayuno', 'TV'],
    photos: ['assets/images/habitacion-simple.jpg'],
    status: 'available'
  },
  {
    name: 'Habitación Doble',
    type: 'Doble',
    description: 'Comodidad para compartir tu viaje, con todo lo esencial.',
    pricePen: 170,
    priceUsd: 45,
    capacity: 2,
    services: ['Wi-Fi 100Mbps', 'Baño privado', 'Agua caliente 24/7', 'Desayuno', 'TV'],
    photos: ['assets/images/habitacion-doble.jpg'],
    status: 'available'
  },
  {
    name: 'Habitación Matrimonial',
    type: 'Matrimonial',
    description: 'Un ambiente cálido para una estancia especial en el centro histórico.',
    pricePen: 190,
    priceUsd: 50,
    capacity: 2,
    services: ['Wi-Fi 100Mbps', 'Baño privado', 'Agua caliente 24/7', 'Desayuno', 'TV'],
    photos: ['assets/images/habitacion-matrimonial.jpg'],
    status: 'available'
  },
  {
    name: 'Habitación Familiar',
    type: 'Familiar',
    description: 'Más espacio para que toda la familia disfrute Cusco con comodidad.',
    pricePen: 260,
    priceUsd: 69,
    capacity: 4,
    services: ['Wi-Fi 100Mbps', 'Baño privado', 'Agua caliente 24/7', 'Desayuno', 'TV'],
    photos: ['assets/images/Habitacion familiar(2).jpg'],
    status: 'available'
  }
];

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurada. Copia .env.example a .env y configura MongoDB.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    await Room.insertMany(initialRooms);
    console.info('Catálogo inicial de habitaciones creado.');
  }
  console.info('Conectado a MongoDB.');
}

module.exports = connectDatabase;
