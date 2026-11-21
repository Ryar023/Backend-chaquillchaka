const express = require('express');
const { body } = require('express-validator');
const { createChatResponse, getChatHistory } = require('../controllers/chatController');

const router = express.Router();

router.post('/', [
  body('sessionId').trim().notEmpty().withMessage('sessionId es obligatorio.'),
  body('message').trim().notEmpty().withMessage('message es obligatorio.')
], createChatResponse);

router.get('/:sessionId', getChatHistory);

module.exports = router;
