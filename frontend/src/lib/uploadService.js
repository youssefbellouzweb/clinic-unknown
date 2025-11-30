import axios from 'axios';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000/api';

class UploadService {
    /**
     * Upload patient image
     * @param {number} patientId - Patient ID
     * @param {File} file - Image file
     * @returns {Promise<object>} Upload result
     */
    async uploadPatientImage(patientId, file) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(
            `${API_URL}/upload/patient-image/${patientId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data;
    }

    /**
     * Upload lab result
     * @param {number} requestId - Lab request ID
     * @param {File} file - Result file
     * @returns {Promise<object>} Upload result
     */
    async uploadLabResult(requestId, file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
            `${API_URL}/upload/lab-result/${requestId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data;
    }

    /**
     * Upload prescription
     * @param {number} prescriptionId - Prescription ID
     * @param {File} file - Prescription file
     * @returns {Promise<object>} Upload result
     */
    async uploadPrescription(prescriptionId, file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
            `${API_URL}/upload/prescription/${prescriptionId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data;
    }

    /**
     * Upload clinic logo
     * @param {number} clinicId - Clinic ID
     * @param {File} file - Logo file
     * @returns {Promise<object>} Upload result
     */
    async uploadClinicLogo(clinicId, file) {
        const formData = new FormData();
        formData.append('logo', file);

        const response = await axios.post(
            `${API_URL}/upload/clinic-logo/${clinicId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data;
    }

    /**
     * Upload medical document
     * @param {string} entityType - Entity type (patient, lab_result, etc.)
     * @param {number} entityId - Entity ID
     * @param {File} file - Document file
     * @returns {Promise<object>} Upload result
     */
    async uploadDocument(entityType, entityId, file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);

        const response = await axios.post(
            `${API_URL}/upload/document`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data;
    }

    /**
     * Upload multiple files
     * @param {string} entityType - Entity type
     * @param {number} entityId - Entity ID
     * @param {File[]} files - Array of files
     * @returns {Promise<object>} Upload result
     */
    async uploadMultipleFiles(entityType, entityId, files) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);

        const response = await axios.post(
            `${API_URL}/upload/multiple`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data;
    }

    /**
     * Get files by entity
     * @param {string} entityType - Entity type
     * @param {number} entityId - Entity ID
     * @returns {Promise<Array>} Array of files
     */
    async getFilesByEntity(entityType, entityId) {
        const response = await axios.get(
            `${API_URL}/upload/${entityType}/${entityId}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data.files;
    }

    /**
     * Delete file
     * @param {number} fileId - File ID
     * @returns {Promise<object>} Delete result
     */
    async deleteFile(fileId) {
        const response = await axios.delete(
            `${API_URL}/upload/${fileId}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data;
    }

    /**
     * Get storage statistics
     * @returns {Promise<object>} Storage stats
     */
    async getStorageStats() {
        const response = await axios.get(
            `${API_URL}/upload/stats`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        return response.data.stats;
    }
}

export default new UploadService();
