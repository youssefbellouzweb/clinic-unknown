import db from '../config/db.js';
import logger from '../utils/logger.js';

// Create lab request
export const createLabRequest = (req, res, next) => {
    try {
        const { patient_id, test_type } = req.body;
        const clinicId = req.user.clinicId;
        const requestedBy = req.user.id;

        const result = db.prepare(`
            INSERT INTO lab_requests (clinic_id, patient_id, test_type, requested_by, status)
            VALUES (?, ?, ?, ?, 'pending')
        `).run(clinicId, patient_id, test_type, requestedBy);

        const newRequest = db.prepare('SELECT * FROM lab_requests WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: 'Lab request created successfully',
            data: newRequest
        });
    } catch (error) {
        logger.error('Create lab request error:', error);
        next(error);
    }
};

// Get lab requests
export const getLabRequests = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const { patient_id, requested_by, status } = req.query;

        let sql = `
            SELECT lr.*, p.name as patient_name, u.name as requested_by_name
            FROM lab_requests lr
            JOIN patients p ON lr.patient_id = p.id
            LEFT JOIN users u ON lr.requested_by = u.id
            WHERE lr.clinic_id = ?
        `;
        const params = [clinicId];

        if (patient_id) {
            sql += ' AND lr.patient_id = ?';
            params.push(patient_id);
        }
        if (requested_by) {
            sql += ' AND lr.requested_by = ?';
            params.push(requested_by);
        }
        if (status) {
            sql += ' AND lr.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY lr.created_at DESC';

        const requests = db.prepare(sql).all(...params);

        res.json({ success: true, data: requests });
    } catch (error) {
        logger.error('Get lab requests error:', error);
        next(error);
    }
};

// Upload lab result
export const uploadLabResult = (req, res, next) => {
    try {
        const { lab_request_id, result_text, file_url } = req.body;
        const clinicId = req.user.clinicId;
        const uploadedBy = req.user.id;

        // Verify lab request exists and belongs to clinic
        const labRequest = db.prepare('SELECT * FROM lab_requests WHERE id = ? AND clinic_id = ?').get(lab_request_id, clinicId);
        if (!labRequest) {
            return res.status(404).json({ error: 'Lab request not found' });
        }

        const result = db.prepare(`
            INSERT INTO lab_results (lab_request_id, clinic_id, uploaded_by, result_text, file_url)
            VALUES (?, ?, ?, ?, ?)
        `).run(lab_request_id, clinicId, uploadedBy, result_text, file_url || null);

        // Update lab request status to completed
        db.prepare('UPDATE lab_requests SET status = ? WHERE id = ?').run('completed', lab_request_id);

        const newResult = db.prepare('SELECT * FROM lab_results WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: 'Lab result uploaded successfully',
            data: newResult
        });
    } catch (error) {
        logger.error('Upload lab result error:', error);
        next(error);
    }
};

// Get lab results for a specific request
export const getLabResults = (req, res, next) => {
    try {
        const { lab_request_id } = req.params;
        const clinicId = req.user.clinicId;

        const results = db.prepare(`
            SELECT lr.*, u.name as uploaded_by_name
            FROM lab_results lr
            LEFT JOIN users u ON lr.uploaded_by = u.id
            WHERE lr.lab_request_id = ? AND lr.clinic_id = ?
            ORDER BY lr.created_at DESC
        `).all(lab_request_id, clinicId);

        res.json({ success: true, data: results });
    } catch (error) {
        logger.error('Get lab results error:', error);
        next(error);
    }
};

// Update lab result
export const updateLabResult = (req, res, next) => {
    try {
        const { id } = req.params;
        const { result_text, file_url } = req.body;
        const clinicId = req.user.clinicId;

        const labResult = db.prepare('SELECT * FROM lab_results WHERE id = ? AND clinic_id = ?').get(id, clinicId);

        if (!labResult) {
            return res.status(404).json({ error: 'Lab result not found' });
        }

        const updates = [];
        const params = [];

        if (result_text !== undefined) {
            updates.push('result_text = ?');
            params.push(result_text);
        }
        if (file_url !== undefined) {
            updates.push('file_url = ?');
            params.push(file_url);
        }

        if (updates.length > 0) {
            params.push(id);
            db.prepare(`UPDATE lab_results SET ${updates.join(', ')} WHERE id = ?`).run(...params);
        }

        const updatedResult = db.prepare('SELECT * FROM lab_results WHERE id = ?').get(id);

        res.json({
            success: true,
            message: 'Lab result updated successfully',
            data: updatedResult
        });
    } catch (error) {
        logger.error('Update lab result error:', error);
        next(error);
    }
};

// Delete lab result
export const deleteLabResult = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const labResult = db.prepare('SELECT * FROM lab_results WHERE id = ? AND clinic_id = ?').get(id, clinicId);

        if (!labResult) {
            return res.status(404).json({ error: 'Lab result not found' });
        }

        db.prepare('DELETE FROM lab_results WHERE id = ?').run(id);

        res.json({ success: true, message: 'Lab result deleted successfully' });
    } catch (error) {
        logger.error('Delete lab result error:', error);
        next(error);
    }
};
