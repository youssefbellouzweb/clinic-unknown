import db from '../config/db.js';
import logger from '../utils/logger.js';

// Get all patients in clinic
export const getPatients = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const { search } = req.query;

        let sql = 'SELECT id, clinic_id, name, phone, birthdate, gender, notes, created_at FROM patients WHERE clinic_id = ?';
        const params = [clinicId];

        if (search) {
            sql += ' AND (name LIKE ? OR phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY created_at DESC';

        const patients = db.prepare(sql).all(...params);

        res.json({ success: true, data: patients });
    } catch (error) {
        logger.error('Get patients error:', error);
        next(error);
    }
};

// Get single patient
export const getPatient = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const patient = db.prepare(
            'SELECT * FROM patients WHERE id = ? AND clinic_id = ?'
        ).get(id, clinicId);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Get recent appointments
        const appointments = db.prepare(
            'SELECT * FROM appointments WHERE patient_id = ? ORDER BY datetime DESC LIMIT 5'
        ).all(id);

        res.json({ success: true, data: { ...patient, appointments } });
    } catch (error) {
        logger.error('Get patient error:', error);
        next(error);
    }
};

// Create patient
export const createPatient = (req, res, next) => {
    try {
        const { name, phone, birthdate, gender, notes } = req.body;
        const clinicId = req.user.clinicId;

        const result = db.prepare(
            'INSERT INTO patients (clinic_id, name, phone, birthdate, gender, notes) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(clinicId, name, phone, birthdate, gender, notes);

        const newPatient = db.prepare(
            'SELECT * FROM patients WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: 'Patient created successfully',
            data: newPatient
        });
    } catch (error) {
        logger.error('Create patient error:', error);
        next(error);
    }
};

// Update patient
export const updatePatient = (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, phone, birthdate, gender, notes } = req.body;
        const clinicId = req.user.clinicId;

        // Verify patient belongs to clinic
        const patient = db.prepare('SELECT id FROM patients WHERE id = ? AND clinic_id = ?').get(id, clinicId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (birthdate !== undefined) {
            updates.push('birthdate = ?');
            params.push(birthdate);
        }
        if (gender !== undefined) {
            updates.push('gender = ?');
            params.push(gender);
        }
        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);

        db.prepare(
            `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`
        ).run(...params);

        const updatedPatient = db.prepare(
            'SELECT * FROM patients WHERE id = ?'
        ).get(id);

        res.json({
            success: true,
            message: 'Patient updated successfully',
            data: updatedPatient
        });
    } catch (error) {
        logger.error('Update patient error:', error);
        next(error);
    }
};

// Delete patient
export const deletePatient = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        // Verify patient belongs to clinic
        const patient = db.prepare('SELECT id FROM patients WHERE id = ? AND clinic_id = ?').get(id, clinicId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Check for appointments
        const appointments = db.prepare('SELECT id FROM appointments WHERE patient_id = ?').get(id);
        if (appointments) {
            return res.status(400).json({ error: 'Cannot delete patient with existing appointments' });
        }

        db.prepare('DELETE FROM patients WHERE id = ?').run(id);

        res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
        logger.error('Delete patient error:', error);
        next(error);
    }
};
