import express from 'express';
import analyticsController from '../controllers/dashboard.analytics.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

// Analytics Routes (Admin, Owner only)
router.get('/overview', authorize(['admin', 'owner']), analyticsController.getOverview);
router.get('/revenue', authorize(['admin', 'owner']), analyticsController.getRevenueChart);
router.get('/appointments', authorize(['admin', 'owner']), analyticsController.getAppointmentStats);

export default router;
