import express from 'express';
import { chatWithAI, getSalonSummary, getPersonalizedFeed } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', chatWithAI);
router.get('/summarize/:salonId', getSalonSummary);
router.get('/feed/:userId', getPersonalizedFeed);

export default router;
