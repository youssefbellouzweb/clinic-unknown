import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const registerPatientPortal = async (clinicId, data) => {
    const { patient_id, email, password } = data;

    // Check if patient exists
    const patient = db.prepare('SELECT id FROM patients WHERE id = ? AND clinic_id = ?').get(patient_id, clinicId);
    if (!patient) {
        throw new Error('Patient not found');
    }

    // Check if portal user exists
    const existing = db.prepare('SELECT id FROM patient_portal_users WHERE patient_id = ?').get(patient_id);
    if (existing) {
        throw new Error('Patient already has portal access');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = db.prepare(`
        INSERT INTO patient_portal_users (patient_id, clinic_id, email, password_hash)
        VALUES (?, ?, ?, ?)
    `).run(patient_id, clinicId, email, password_hash);

    return {
        id: result.lastInsertRowid,
        patient_id,
        email
    };
};

export const loginPatientPortal = async (email, password) => {
    const portalUser = db.prepare('SELECT * FROM patient_portal_users WHERE email = ? AND is_active = 1').get(email);
    if (!portalUser) {
        throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, portalUser.password_hash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(portalUser.patient_id);

    db.prepare('UPDATE patient_portal_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(portalUser.id);

    const token = jwt.sign(
        {
            id: portalUser.id,
            patient_id: portalUser.patient_id,
            clinic_id: portalUser.clinic_id,
            type: 'patient_portal'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        token,
        user: {
            id: portalUser.id,
            patient_id: portalUser.patient_id,
            clinic_id: portalUser.clinic_id,
            email: portalUser.email,
            patient_name: patient.name,
            patient_phone: patient.phone
        }
    };
};

export const getPatientAppointments = (clinicId, patientId) => {
    return db.prepare(`
        SELECT a.*, u.name as doctor_name, c.name as clinic_name
        FROM appointments a
        LEFT JOIN users u ON a.doctor_id = u.id
        LEFT JOIN clinics c ON a.clinic_id = c.id
        WHERE a.clinic_id = ? AND a.patient_id = ?
        ORDER BY a.datetime DESC
    `).all(clinicId, patientId);
};

export const requestAppointment = (clinicId, patientId, data) => {
    const { doctor_id, date, time, notes } = data;
    const datetime = `${date} ${time}`; // Assuming date is YYYY-MM-DD and time is HH:MM

    const result = db.prepare(`
        INSERT INTO appointments (clinic_id, patient_id, doctor_id, datetime, status, notes, created_by)
        VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).run(clinicId, patientId, doctor_id, datetime, notes, patientId);

    return db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
};

export const cancelAppointment = (clinicId, patientId, appointmentId, reason) => {
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND clinic_id = ? AND patient_id = ?').get(appointmentId, clinicId, patientId);
    if (!appointment) {
        throw new Error('Appointment not found');
    }
    if (appointment.status === 'cancelled') {
        throw new Error('Appointment already cancelled');
    }

    db.prepare('UPDATE appointments SET status = ?, notes = notes || ? WHERE id = ?').run('cancelled', ` [Cancelled: ${reason}]`, appointmentId);
};

export const getPatientProfile = (clinicId, patientId) => {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ? AND clinic_id = ?').get(patientId, clinicId);
    if (!patient) throw new Error('Patient not found');

    const portalUser = db.prepare('SELECT email, last_login FROM patient_portal_users WHERE patient_id = ?').get(patientId);

    return {
        ...patient,
        portal_email: portalUser?.email,
        last_login: portalUser?.last_login
    };
};

export const updatePatientProfile = (clinicId, patientId, data) => {
    const updates = [];
    const params = [];

    if (data.phone !== undefined) {
        updates.push('phone = ?');
        params.push(data.phone);
    }
    if (data.email !== undefined) {
        updates.push('email = ?');
        params.push(data.email);
    }
    if (data.address !== undefined) {
        updates.push('address = ?');
        params.push(data.address);
    }

    if (updates.length === 0) throw new Error('No fields to update');

    params.push(patientId, clinicId);

    db.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE id = ? AND clinic_id = ?`).run(...params);

    return getPatientProfile(clinicId, patientId);
};

export const getBills = (clinicId, patientId) => {
    return db.prepare('SELECT * FROM bills WHERE clinic_id = ? AND patient_id = ? ORDER BY created_at DESC').all(clinicId, patientId);
};

export const getPrescriptions = (clinicId, patientId) => {
    return db.prepare(`
        SELECT p.*, u.name as doctor_name
        FROM prescriptions p
        LEFT JOIN users u ON p.doctor_id = u.id
        WHERE p.clinic_id = ? AND p.patient_id = ?
        ORDER BY p.created_at DESC
    `).all(clinicId, patientId);
};
