import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate, registerClinicSchema, loginSchema } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

router.post('/register-clinic', authLimiter, validate(registerClinicSchema), authController.registerClinic);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/accept-invite', authLimiter, authController.acceptInvite);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
