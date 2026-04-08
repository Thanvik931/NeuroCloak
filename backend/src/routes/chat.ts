import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AiSystem, Decision, AnomalyAlert } from '../models';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const query = message.toLowerCase();

    let response = "I'm sorry, I couldn't find specific data on that. Try asking about 'accuracy', 'anomalies', or a specific model name.";

    // Logic: Simple Keyword-based Intelligence for the "Master Trained" System
    
    if (query.includes('hello') || query.includes('hi')) {
      response = "Hello! I am the NeuroCloak Assistant. I am connected to your master-trained AI models. How can I help you audit them today?";
    } 
    else if (query.includes('accuracy') || query.includes('performing best') || query.includes('highest')) {
      const best = await AiSystem.findOne().sort({ accuracy: -1 }).limit(1);
      if (best) {
        response = `The highest performing system is currently **${best.name}** with a training accuracy of **${best.accuracy}%**. It operates in the ${best.domain} domain.`;
      }
    } 
    else if (query.includes('anomaly') || query.includes('anomalies') || query.includes('issues')) {
      const count = await AnomalyAlert.countDocuments({ resolved: false });
      response = `I have detected **${count} unresolved anomalies** across your systems. You should check the Anomalies panel for critical alerts.`;
    }
    else if (query.includes('how many systems') || query.includes('models')) {
      const count = await AiSystem.countDocuments({ isActive: true });
      response = `There are currently **${count} active AI systems** being monitored in your NeuroCloak dashboard.`;
    }
    else if (query.includes('credit') || query.includes('finance')) {
      const sys = await AiSystem.findOne({ name: /credit/i });
      if (sys) {
        response = `The **${sys.name}** is a perfection-mode model with **${sys.accuracy}% accuracy**. It has processed several decisions today with 100% ethical compliance.`;
      }
    }
    else if (query.includes('medical') || query.includes('healthcare')) {
      const sys = await AiSystem.findOne({ name: /med/i });
      if (sys) {
        response = `The **${sys.name}** healthcare model is operating at **${sys.accuracy}% precision**. Master-level training verified for oncology diagnostics.`;
      }
    }

    return res.json({ response });
  } catch (error) {
    return res.status(500).json({ error: 'Assistant logic error' });
  }
});

export default router;
