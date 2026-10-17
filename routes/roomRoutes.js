const express = require('express');
const { getRooms, getRoomById, getOccupancy } = require('../controllers/roomController');

const router = express.Router();
router.get('/', getRooms);
router.get('/occupancy', getOccupancy);
router.get('/:id', getRoomById);

module.exports = router;
