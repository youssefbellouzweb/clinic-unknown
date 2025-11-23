import db from '../config/db.js';
import logger from '../utils/logger.js';

// Get all appointments
export const getAppointments = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const { date, doctorId, patientId, status } = req.query;

        let sql = `
            SELECT a.*, p.name as patient_name, u.name as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN users u ON a.doctor_id = u.id
            WHERE a.clinic_id = ?
        `;
        const params = [clinicId];

        if (date) {
            sql += ' AND date(a.datetime) = date(?)';
            params.push(date);
        }
        if (doctorId) {
            sql += ' AND a.doctor_id = ?';
            params.push(doctorId);
        }
        if (patientId) {
            sql += ' AND a.patient_id = ?';
            params.push(patientId);
        }
        if (status) {
            sql += ' AND a.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY a.datetime ASC';

        const appointments = db.prepare(sql).all(...params);

        res.json({ success: true, data: appointments });
    } catch (error) {
        logger.error('Get appointments error:', error);
        next(error);
    }
};

// Get single appointment
export const getAppointment = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const appointment = db.prepare(`
            SELECT a.*, p.name as patient_name, u.name as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN users u ON a.doctor_id = u.id
            WHERE a.id = ? AND a.clinic_id = ?
        `).get(id, clinicId);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json({ success: true, data: appointment });
    } catch (error) {
        logger.error('Get appointment error:', error);
        next(error);
    }
};

// Create appointment
export const createAppointment = (req, res, next) => {
    try {
        const { patientId, doctorId, datetime, status = 'pending' } = req.body;
        const clinicId = req.user.clinicId;
        const createdBy = req.user.id;

        // Verify patient belongs to clinic
        const patient = db.prepare('SELECT id FROM patients WHERE id = ? AND clinic_id = ?').get(patientId, clinicId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Verify doctor belongs to clinic (if provided)
        if (doctorId) {
            const doctor = db.prepare('SELECT id FROM users WHERE id = ? AND clinic_id = ? AND role = ?').get(doctorId, clinicId, 'doctor');
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
        }

        // Check for conflicts (simple check)
        // In a real app, you'd check overlapping time slots based on duration
        const existing = db.prepare(`
            SELECT id FROM appointments 
            WHERE clinic_id = ? AND doctor_id = ? AND datetime = ? AND status != 'cancelled'
        `).get(clinicId, doctorId, datetime);

        if (existing) {
            return res.status(409).json({ error: 'Doctor is already booked at this time' });
        }

        const result = db.prepare(`
            INSERT INTO appointments (clinic_id, patient_id, doctor_id, datetime, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(clinicId, patientId, doctorId, datetime, status, createdBy);

        const newAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: newAppointment
        });
    } catch (error) {
        logger.error('Create appointment error:', error);
        next(error);
    }
};

// Update appointment
export const updateAppointment = (req, res, next) => {
    try {
        const { id } = req.params;
        const { doctorId, datetime, status } = req.body;
        const clinicId = req.user.clinicId;

        const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND clinic_id = ?').get(id, clinicId);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const updates = [];
        const params = [];

        if (doctorId !== undefined) {
            updates.push('doctor_id = ?');
            params.push(doctorId);
        }
        if (datetime !== undefined) {
            updates.push('datetime = ?');
            params.push(datetime);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);

        db.prepare(
            `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`
        ).run(...params);

        const updatedAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: updatedAppointment
        });
    } catch (error) {
        logger.error('Update appointment error:', error);
        next(error);
    }
};

// Delete appointment
export const deleteAppointment = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND clinic_id = ?').get(id, clinicId);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        db.prepare('DELETE FROM appointments WHERE id = ?').run(id);

        res.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
        logger.error('Delete appointment error:', error);
        next(error);
    }
};

// Get calendar view (grouped by date)
export const getCalendar = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const { start, end, doctorId } = req.query;

        let sql = `
            SELECT a.id, a.datetime, a.status, p.name as patient_name, u.name as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN users u ON a.doctor_id = u.id
            WHERE a.clinic_id = ?
        `;
        const params = [clinicId];

        if (start) {
            sql += ' AND date(a.datetime) >= date(?)';
            params.push(start);
        }
        if (end) {
            sql += ' AND date(a.datetime) <= date(?)';
            params.push(end);
        }
        if (doctorId) {
            sql += ' AND a.doctor_id = ?';
            params.push(doctorId);
        }

        sql += ' ORDER BY a.datetime ASC';

        const appointments = db.prepare(sql).all(...params);

        // Group by date
        const calendar = appointments.reduce((acc, appt) => {
            const date = appt.datetime.split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(appt);
            return acc;
        }, {});

        res.json({ success: true, data: calendar });
    } catch (error) {
        logger.error('Get calendar error:', error);
        next(error);
    }
};
