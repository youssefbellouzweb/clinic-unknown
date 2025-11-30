import storageService from '../services/storage.service.js';
import logger from '../utils/logger.js';

class UploadController {
    /**
     * Upload patient image
     */
    async uploadPatientImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { patientId } = req.params;
            const clinicId = req.user.clinic_id;
            const uploadedBy = req.user.id;

            const fileMetadata = await storageService.uploadFile(
                req.file,
                clinicId,
                'patient',
                parseInt(patientId),
                uploadedBy
            );

            res.status(201).json({
                message: 'Patient image uploaded successfully',
                file: fileMetadata
            });
        } catch (error) {
            logger.error({ error: error.message }, 'Upload patient image failed');
            res.status(500).json({ error: 'Failed to upload image' });
        }
    }

    /**
     * Upload lab result
     */
    async uploadLabResult(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { requestId } = req.params;
            const clinicId = req.user.clinic_id;
            const uploadedBy = req.user.id;

            const fileMetadata = await storageService.uploadFile(
                req.file,
                clinicId,
                'lab_result',
                parseInt(requestId),
                uploadedBy
            );

            res.status(201).json({
                message: 'Lab result uploaded successfully',
                file: fileMetadata
            });
        } catch (error) {
            logger.error({ error: error.message }, 'Upload lab result failed');
            res.status(500).json({ error: 'Failed to upload lab result' });
        }
    }

    /**
     * Upload prescription
     */
    async uploadPrescription(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { prescriptionId } = req.params;
            const clinicId = req.user.clinic_id;
            const uploadedBy = req.user.id;

            const fileMetadata = await storageService.uploadFile(
                req.file,
                clinicId,
                'prescription',
                parseInt(prescriptionId),
                uploadedBy
            );

            res.status(201).json({
                message: 'Prescription uploaded successfully',
                file: fileMetadata
            });
        } catch (error) {
            logger.error({ error: error.message }, 'Upload prescription failed');
            res.status(500).json({ error: 'Failed to upload prescription' });
        }
    }

    /**
     * Upload clinic logo
     */
    async uploadClinicLogo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { clinicId } = req.params;
            const uploadedBy = req.user.id;

            // Verify user owns this clinic
            if (req.user.clinic_id !== parseInt(clinicId) && req.user.role !== 'super_admin') {
                return res.status(403).json({ error: 'Access denied' });
            }

            const fileMetadata = await storageService.uploadFile(
                req.file,
                parseInt(clinicId),
                'clinic',
                parseInt(clinicId),
                uploadedBy
            );

            res.status(201).json({
                message: 'Clinic logo uploaded successfully',
                file: fileMetadata
            });
        } catch (error) {
            logger.error({ error: error.message }, 'Upload clinic logo failed');
            res.status(500).json({ error: 'Failed to upload clinic logo' });
        }
    }

    /**
     * Upload medical document
     */
    async uploadMedicalDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { entityType, entityId } = req.body;
            const clinicId = req.user.clinic_id;
            const uploadedBy = req.user.id;

            if (!entityType || !entityId) {
                return res.status(400).json({ error: 'Entity type and ID are required' });
            }

            const fileMetadata = await storageService.uploadFile(
                req.file,
                clinicId,
                entityType,
                parseInt(entityId),
                uploadedBy
            );

            res.status(201).json({
                message: 'Document uploaded successfully',
                file: fileMetadata
            });
        } catch (error) {
            logger.error({ error: error.message }, 'Upload document failed');
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }

    /**
     * Upload multiple files
     */
    async uploadMultipleFiles(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            const { entityType, entityId } = req.body;
            const clinicId = req.user.clinic_id;
            const uploadedBy = req.user.id;

            if (!entityType || !entityId) {
                return res.status(400).json({ error: 'Entity type and ID are required' });
            }

            const filesMetadata = await storageService.uploadMultipleFiles(
                req.files,
                clinicId,
                entityType,
                parseInt(entityId),
                uploadedBy
            );

            res.status(201).json({
                message: `${filesMetadata.length} files uploaded successfully`,
                files: filesMetadata
            });
        } catch (error) {
            logger.error({ error: error.message }, 'Upload multiple files failed');
            res.status(500).json({ error: 'Failed to upload files' });
        }
    }

    /**
     * Get files by entity
     */
    async getFilesByEntity(req, res) {
        try {
            const { entityType, entityId } = req.params;
            const clinicId = req.user.clinic_id;

            const files = storageService.getFilesByEntity(
                clinicId,
                entityType,
                parseInt(entityId)
            );

            res.json({ files });
        } catch (error) {
            logger.error({ error: error.message }, 'Get files failed');
            res.status(500).json({ error: 'Failed to retrieve files' });
        }
    }

    /**
     * Delete file
     */
    async deleteFile(req, res) {
        try {
            const { fileId } = req.params;
            const clinicId = req.user.clinic_id;

            await storageService.deleteFile(parseInt(fileId), clinicId);

            res.json({ message: 'File deleted successfully' });
        } catch (error) {
            logger.error({ error: error.message }, 'Delete file failed');
            res.status(500).json({ error: error.message || 'Failed to delete file' });
        }
    }

    /**
     * Get storage statistics
     */
    async getStorageStats(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const stats = storageService.getStorageStats(clinicId);

            res.json({ stats });
        } catch (error) {
            logger.error({ error: error.message }, 'Get storage stats failed');
            res.status(500).json({ error: 'Failed to retrieve storage statistics' });
        }
    }
}

export default new UploadController();
