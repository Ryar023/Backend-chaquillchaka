const express = require('express');
const { getRooms, getRoomById } = require('../controllers/roomController');

const router = express.Router();
router.get('/', getRooms);
router.get('/:id', getRoomById);

module.exports = router;
