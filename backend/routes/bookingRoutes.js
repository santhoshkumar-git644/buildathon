import express from 'express';
import { createBooking, getUserBookings, cancelBooking, getSalonBookings, verifyBooking, getAllBookings } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/all', getAllBookings);
router.get('/user/:userId', getUserBookings);
router.get('/salon/:salonId', getSalonBookings);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/verify', verifyBooking);

export default router;
