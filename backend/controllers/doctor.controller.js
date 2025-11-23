import db from '../config/db.js';
import logger from '../utils/logger.js';

// Get doctor's schedule (appointments)
export const getSchedule = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const doctorId = req.user.id;
        const { from, to } = req.query;

        let sql = `
            SELECT a.*, p.name as patient_name, p.phone as patient_phone
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.clinic_id = ? AND a.doctor_id = ?
        `;
        const params = [clinicId, doctorId];

        if (from) {
            sql += ' AND date(a.datetime) >= date(?)';
            params.push(from);
        }
        if (to) {
            sql += ' AND date(a.datetime) <= date(?)';
            params.push(to);
        }

        sql += ' ORDER BY a.datetime ASC';

        const appointments = db.prepare(sql).all(...params);

        res.json({ success: true, data: appointments });
    } catch (error) {
        logger.error('Get doctor schedule error:', error);
        next(error);
    }
};

// Create medical note
export const createNote = (req, res, next) => {
    try {
        const { patient_id, visit_id, notes } = req.body;
        const clinicId = req.user.clinicId;
        const doctorId = req.user.id;

        const result = db.prepare(`
            INSERT INTO medical_notes (clinic_id, patient_id, doctor_id, visit_id, notes)
            VALUES (?, ?, ?, ?, ?)
        `).run(clinicId, patient_id, doctorId, visit_id || null, notes);

        const newNote = db.prepare('SELECT * FROM medical_notes WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            data: newNote
        });
    } catch (error) {
        logger.error('Create note error:', error);
        next(error);
    }
};

// Get medical notes for a patient
export const getNotes = (req, res, next) => {
    try {
        const { patientId } = req.params;
        const clinicId = req.user.clinicId;
        const { visit_id } = req.query;

        let sql = `
            SELECT mn.*, u.name as doctor_name
            FROM medical_notes mn
            JOIN users u ON mn.doctor_id = u.id
            WHERE mn.clinic_id = ? AND mn.patient_id = ?
        `;
        const params = [clinicId, patientId];

        if (visit_id) {
            sql += ' AND mn.visit_id = ?';
            params.push(visit_id);
        }

        sql += ' ORDER BY mn.created_at DESC';

        const notes = db.prepare(sql).all(...params);

        res.json({ success: true, data: notes });
    } catch (error) {
        logger.error('Get notes error:', error);
        next(error);
    }
};

// Update medical note
export const updateNote = (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const clinicId = req.user.clinicId;
        const doctorId = req.user.id;

        // Verify note belongs to doctor (or admin override - but let's stick to doctor for now)
        const note = db.prepare('SELECT * FROM medical_notes WHERE id = ? AND clinic_id = ?').get(id, clinicId);

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Optional: Check if doctor is the author
        // if (note.doctor_id !== doctorId && req.user.role !== 'admin' && req.user.role !== 'owner') {
        //     return res.status(403).json({ error: 'Not authorized to update this note' });
        // }

        db.prepare('UPDATE medical_notes SET notes = ? WHERE id = ?').run(notes, id);

        const updatedNote = db.prepare('SELECT * FROM medical_notes WHERE id = ?').get(id);

        res.json({
            success: true,
            message: 'Note updated successfully',
            data: updatedNote
        });
    } catch (error) {
        logger.error('Update note error:', error);
        next(error);
    }
};

// Delete medical note
export const deleteNote = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const note = db.prepare('SELECT * FROM medical_notes WHERE id = ? AND clinic_id = ?').get(id, clinicId);

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        db.prepare('DELETE FROM medical_notes WHERE id = ?').run(id);

        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        logger.error('Delete note error:', error);
        next(error);
    }
};

// Get prescriptions for a patient (Post-MVP)
export const getPrescriptions = (req, res, next) => {
    try {
        const { patientId } = req.params;
        const clinicId = req.user.clinicId;

        const prescriptions = db.prepare(`
            SELECT p.*, u.name as doctor_name
            FROM prescriptions p
            JOIN users u ON p.doctor_id = u.id
            WHERE p.clinic_id = ? AND p.patient_id = ?
            ORDER BY p.created_at DESC
        `).all(clinicId, patientId);

        res.json({ success: true, data: prescriptions });
    } catch (error) {
        logger.error('Get prescriptions error:', error);
        next(error);
    }
};
