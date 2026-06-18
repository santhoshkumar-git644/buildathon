import express from 'express';
import { createReview, getSalonReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', createReview);
router.get('/:salonId', getSalonReviews);

export default router;
