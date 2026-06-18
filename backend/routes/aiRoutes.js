import express from 'express';
import { recommendSalons } from '../controllers/aiController.js';

const router = express.Router();

router.post('/recommend', recommendSalons);

export default router;
