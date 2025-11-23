import express from 'express';
import * as analyticsController from '../controllers/dashboardAnalytics.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['owner', 'admin', 'super_admin']));

router.get('/overview', analyticsController.getOverview);
router.get('/appointments-trend', analyticsController.getAppointmentsTrend);
router.get('/patients-trend', analyticsController.getPatientsTrend);
router.get('/doctor-performance', analyticsController.getDoctorPerformance);

export default router;
