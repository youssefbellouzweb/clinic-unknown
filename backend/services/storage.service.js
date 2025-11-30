import db from '../config/db.js';
import { uploadToCloudinary, deleteFromCloudinary, getOptimizedImageUrl } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

class StorageService {
    /**
     * Upload file and save metadata to database
     * @param {object} file - Multer file object
     * @param {number} clinicId - Clinic ID
     * @param {string} entityType - Entity type (patient, lab_result, prescription, clinic)
     * @param {number} entityId - Entity ID
     * @param {number} uploadedBy - User ID who uploaded
     * @returns {Promise<object>} File metadata
     */
    async uploadFile(file, clinicId, entityType, entityId, uploadedBy) {
        try {
            // Upload to Cloudinary
            const folder = `clinic-${clinicId}/${entityType}`;
            const cloudinaryResult = await uploadToCloudinary(file.path, folder);

            // Save metadata to database
            const stmt = db.prepare(`
                INSERT INTO files (clinic_id, entity_type, entity_id, file_name, file_path, 
                                   file_size, mime_type, cloudinary_public_id, uploaded_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = stmt.run(
                clinicId,
                entityType,
                entityId,
                file.originalname,
                cloudinaryResult.secure_url,
                file.size,
                file.mimetype,
                cloudinaryResult.public_id,
                uploadedBy
            );

            // Delete local file
            fs.unlinkSync(file.path);

            // Get the inserted file
            const fileRecord = db.prepare('SELECT * FROM files WHERE id = ?').get(result.lastInsertRowid);

            logger.info({ fileId: fileRecord.id, entityType, entityId }, 'File uploaded successfully');

            return {
                id: fileRecord.id,
                fileName: fileRecord.file_name,
                fileUrl: fileRecord.file_path,
                fileSize: fileRecord.file_size,
                mimeType: fileRecord.mime_type,
                publicId: fileRecord.cloudinary_public_id,
                createdAt: fileRecord.created_at
            };
        } catch (error) {
            // Clean up local file if exists
            if (file && file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            logger.error({ error: error.message }, 'File upload failed');
            throw error;
        }
    }

    /**
     * Upload multiple files
     * @param {Array} files - Array of multer file objects
     * @param {number} clinicId - Clinic ID
     * @param {string} entityType - Entity type
     * @param {number} entityId - Entity ID
     * @param {number} uploadedBy - User ID who uploaded
     * @returns {Promise<Array>} Array of file metadata
     */
    async uploadMultipleFiles(files, clinicId, entityType, entityId, uploadedBy) {
        const uploadPromises = files.map(file =>
            this.uploadFile(file, clinicId, entityType, entityId, uploadedBy)
        );
        return Promise.all(uploadPromises);
    }

    /**
     * Get files by entity
     * @param {number} clinicId - Clinic ID
     * @param {string} entityType - Entity type
     * @param {number} entityId - Entity ID
     * @returns {Array} Array of files
     */
    getFilesByEntity(clinicId, entityType, entityId) {
        const stmt = db.prepare(`
            SELECT f.*, u.name as uploaded_by_name
            FROM files f
            LEFT JOIN users u ON f.uploaded_by = u.id
            WHERE f.clinic_id = ? AND f.entity_type = ? AND f.entity_id = ?
            ORDER BY f.created_at DESC
        `);
        return stmt.all(clinicId, entityType, entityId);
    }

    /**
     * Get file by ID
     * @param {number} fileId - File ID
     * @param {number} clinicId - Clinic ID
     * @returns {object|null} File metadata
     */
    getFileById(fileId, clinicId) {
        const stmt = db.prepare(`
            SELECT f.*, u.name as uploaded_by_name
            FROM files f
            LEFT JOIN users u ON f.uploaded_by = u.id
            WHERE f.id = ? AND f.clinic_id = ?
        `);
        return stmt.get(fileId, clinicId);
    }

    /**
     * Delete file
     * @param {number} fileId - File ID
     * @param {number} clinicId - Clinic ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteFile(fileId, clinicId) {
        try {
            const file = this.getFileById(fileId, clinicId);
            if (!file) {
                throw new Error('File not found');
            }

            // Delete from Cloudinary
            if (file.cloudinary_public_id) {
                const resourceType = file.mime_type.startsWith('image/') ? 'image' : 'raw';
                await deleteFromCloudinary(file.cloudinary_public_id, resourceType);
            }

            // Delete from database
            const stmt = db.prepare('DELETE FROM files WHERE id = ? AND clinic_id = ?');
            stmt.run(fileId, clinicId);

            logger.info({ fileId, clinicId }, 'File deleted successfully');
            return true;
        } catch (error) {
            logger.error({ error: error.message, fileId }, 'File deletion failed');
            throw error;
        }
    }

    /**
     * Get optimized image URL
     * @param {string} publicId - Cloudinary public ID
     * @param {object} options - Transformation options
     * @returns {string} Optimized URL
     */
    getOptimizedUrl(publicId, options = {}) {
        return getOptimizedImageUrl(publicId, options);
    }

    /**
     * Get storage statistics for a clinic
     * @param {number} clinicId - Clinic ID
     * @returns {object} Storage statistics
     */
    getStorageStats(clinicId) {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total_files,
                SUM(file_size) as total_size,
                entity_type,
                COUNT(*) as count
            FROM files
            WHERE clinic_id = ?
            GROUP BY entity_type
        `);

        const byType = stmt.all(clinicId);

        const totalStmt = db.prepare(`
            SELECT 
                COUNT(*) as total_files,
                SUM(file_size) as total_size
            FROM files
            WHERE clinic_id = ?
        `);

        const total = totalStmt.get(clinicId);

        return {
            totalFiles: total.total_files || 0,
            totalSize: total.total_size || 0,
            totalSizeMB: ((total.total_size || 0) / (1024 * 1024)).toFixed(2),
            byType: byType
        };
    }
}

export default new StorageService();
