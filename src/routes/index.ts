import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import recordingRoutes from './recording.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recordings', recordingRoutes);

export default router;