import express from 'express';
import searchController from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Global search
router.get('/', searchController.globalSearch);

// Entity-specific search
router.get('/patients', searchController.searchPatients);
router.get('/appointments', searchController.searchAppointments);

export default router;
