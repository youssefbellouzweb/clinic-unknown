import express from 'express';
import uploadController from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/upload/patient-image/:patientId
 * @desc    Upload patient image
 * @access  Staff (reception, admin, doctor, nurse)
 */
router.post(
    '/patient-image/:patientId',
    authorize(['owner', 'admin', 'doctor', 'nurse', 'reception']),
    uploadSingle('image', 'image'),
    uploadController.uploadPatientImage
);

/**
 * @route   POST /api/upload/lab-result/:requestId
 * @desc    Upload lab result file
 * @access  Lab, Admin, Doctor
 */
router.post(
    '/lab-result/:requestId',
    authorize(['owner', 'admin', 'doctor', 'lab']),
    uploadSingle('file', 'all'),
    uploadController.uploadLabResult
);

/**
 * @route   POST /api/upload/prescription/:prescriptionId
 * @desc    Upload prescription file
 * @access  Doctor, Admin
 */
router.post(
    '/prescription/:prescriptionId',
    authorize(['owner', 'admin', 'doctor']),
    uploadSingle('file', 'all'),
    uploadController.uploadPrescription
);

/**
 * @route   POST /api/upload/clinic-logo/:clinicId
 * @desc    Upload clinic logo
 * @access  Owner, Admin
 */
router.post(
    '/clinic-logo/:clinicId',
    authorize(['owner', 'admin']),
    uploadSingle('logo', 'image'),
    uploadController.uploadClinicLogo
);

/**
 * @route   POST /api/upload/document
 * @desc    Upload medical document
 * @access  Staff
 */
router.post(
    '/document',
    authorize(['owner', 'admin', 'doctor', 'nurse', 'reception', 'lab']),
    uploadSingle('file', 'all'),
    uploadController.uploadMedicalDocument
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Staff
 */
router.post(
    '/multiple',
    authorize(['owner', 'admin', 'doctor', 'nurse', 'reception', 'lab']),
    uploadMultiple('files', 10, 'all'),
    uploadController.uploadMultipleFiles
);

/**
 * @route   GET /api/upload/:entityType/:entityId
 * @desc    Get files by entity
 * @access  Staff
 */
router.get(
    '/:entityType/:entityId',
    authorize(['owner', 'admin', 'doctor', 'nurse', 'reception', 'lab', 'billing']),
    uploadController.getFilesByEntity
);

/**
 * @route   DELETE /api/upload/:fileId
 * @desc    Delete file
 * @access  Admin, Owner
 */
router.delete(
    '/:fileId',
    authorize(['owner', 'admin']),
    uploadController.deleteFile
);

/**
 * @route   GET /api/upload/stats
 * @desc    Get storage statistics
 * @access  Owner, Admin
 */
router.get(
    '/stats',
    authorize(['owner', 'admin']),
    uploadController.getStorageStats
);

export default router;
