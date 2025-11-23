import express from 'express';
import * as labController from '../controllers/lab.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate, createLabRequestSchema, createLabResultSchema, updateLabResultSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

// Lab Request Routes
router.post('/requests', authorize(['doctor', 'admin', 'owner']), validate(createLabRequestSchema), labController.createLabRequest);
router.get('/requests', authorize(['lab', 'doctor', 'admin', 'owner', 'nurse']), labController.getLabRequests);

// Lab Result Routes
router.post('/results', authorize(['lab', 'admin', 'owner']), validate(createLabResultSchema), labController.uploadLabResult);
router.get('/results/:lab_request_id', authorize(['lab', 'doctor', 'admin', 'owner', 'nurse']), labController.getLabResults);
router.put('/results/:id', authorize(['lab', 'admin', 'owner']), validate(updateLabResultSchema), labController.updateLabResult);
router.delete('/results/:id', authorize(['lab', 'admin', 'owner']), labController.deleteLabResult);

export default router;
