import { Router } from 'express';
import { aiService } from '../services/aiService';
import { authenticate } from '../middleware/auth';

const router = Router();

// 1. Parse natural language scenario to JSON
router.post('/parse-scenario', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const data = await aiService.parseScenario(text);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during parsing' });
  }
});

export default router;
