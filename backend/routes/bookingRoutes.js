import express from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/user/:userId', getUserBookings);
router.patch('/:id/cancel', cancelBooking);

export default router;
