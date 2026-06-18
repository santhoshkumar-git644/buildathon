import express from 'express';
import { getAllSalons, getSalonById, searchSalons } from '../controllers/salonController.js';

const router = express.Router();

router.get('/', getAllSalons);
router.get('/search', searchSalons);
router.get('/:id', getSalonById);

export default router;
