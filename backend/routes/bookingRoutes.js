import express from 'express';
import { createBooking, getUserBookings, cancelBooking, getSalonBookings } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/user/:userId', getUserBookings);
router.get('/salon/:salonId', getSalonBookings);
router.patch('/:id/cancel', cancelBooking);

export default router;
