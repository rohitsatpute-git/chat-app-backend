import express from 'express'
import { signin, signup, verify, signout } from '../controllers/authController.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.get('/verify', verify)
router.get('/signout', signout)

export default router;