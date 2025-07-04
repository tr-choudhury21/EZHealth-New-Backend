// routes/ai.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/symptom-check', async (req, res) => {
  const { message } = req.body;
  try {
    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `Patient says: ${message}. What are the possible diseases and suggested medications?`,
              },
            ],
          },
        ],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const reply = geminiRes.data.candidates[0]?.content?.parts[0]?.text;
    res.json({ success: true, response: reply });
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: 'AI request failed',
      error: err.response?.data || err.message,
    });
  }
});

export default router;
