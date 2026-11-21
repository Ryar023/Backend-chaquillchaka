const { validationResult } = require('express-validator');
const { GoogleGenAI } = require('@google/genai');
const ChatSession = require('../models/ChatSession');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const systemInstruction = `Eres un asistente útil para Chaquill Chak'a Hostal.
Responde en español, mantén un tono amable y profesional, y ayuda a clientes con reservas, disponibilidad, habitaciones, precios, políticas del hostal y preguntas generales sobre Cusco y su experiencia de hospedaje.`;

const geminiClient = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

async function createChatResponse(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Revisa los datos enviados.', errors: errors.array() });
  }

  const { sessionId, message } = req.body;

  if (!sessionId || !message || !String(message).trim()) {
    return res.status(400).json({ message: 'Debes enviar sessionId y message válidos.' });
  }

  if (!geminiClient) {
    return res.status(503).json({ message: 'La API key de Gemini no está configurada en GEMINI_API_KEY.' });
  }

  try {
    const trimmedMessage = String(message).trim();
    const existingSession = await ChatSession.findOne({ sessionId });
    const history = (existingSession?.messages || []).slice(-12);

    const contents = [
      ...history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: trimmedMessage }]
      }
    ];

    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction
      }
    });

    const reply = response.text || 'No pude generar una respuesta en este momento.';
    const userMessage = { role: 'user', text: trimmedMessage, timestamp: new Date() };
    const modelMessage = { role: 'model', text: reply, timestamp: new Date() };

    if (existingSession) {
      existingSession.messages.push(userMessage, modelMessage);
      await existingSession.save();
    } else {
      await ChatSession.create({
        sessionId,
        messages: [userMessage, modelMessage]
      });
    }

    return res.status(200).json({ reply, sessionId });
  } catch (error) {
    return next(error);
  }
}

async function getChatHistory(req, res, next) {
  const { sessionId } = req.params;

  try {
    const chatSession = await ChatSession.findOne({ sessionId });
    return res.status(200).json({
      sessionId,
      messages: chatSession ? chatSession.messages : []
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createChatResponse,
  getChatHistory,
  systemInstruction,
  GEMINI_MODEL
};
