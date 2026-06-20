import express from 'express';
import { signup, login, toggleSaveSalon, getSavedSalons } from '../controllers/userController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/save-salon', toggleSaveSalon);
router.get('/:userId/saved-salons', getSavedSalons);

export default router;
