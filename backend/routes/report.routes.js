import express from 'express';
import reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Generate report
router.get('/generate', reportController.generateReport);

export default router;
