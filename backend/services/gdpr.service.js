import db from '../config/db.js';
import { createAuditLog } from '../middleware/audit.js';

export const exportPatientData = (clinicId, patientId) => {
    // Verify patient belongs to clinic
    const patient = db.prepare('SELECT * FROM patients WHERE id = ? AND clinic_id = ?').get(patientId, clinicId);
    if (!patient) throw new Error('Patient not found');

    // Fetch all related data
    const appointments = db.prepare('SELECT * FROM appointments WHERE patient_id = ?').all(patientId);
    const medicalRecords = db.prepare('SELECT * FROM medical_records WHERE patient_id = ?').all(patientId);
    const visits = db.prepare('SELECT * FROM visits WHERE patient_id = ?').all(patientId);
    // Add bills, prescriptions, etc. when available

    return {
        patient,
        appointments,
        medicalRecords,
        visits,
        exportedAt: new Date().toISOString()
    };
};

export const deletePatientData = (clinicId, patientId, userId) => {
    // Verify patient belongs to clinic
    const patient = db.prepare('SELECT * FROM patients WHERE id = ? AND clinic_id = ?').get(patientId, clinicId);
    if (!patient) throw new Error('Patient not found');

    const transaction = db.transaction(() => {
        // Anonymize patient data instead of hard delete for integrity, or hard delete if required
        // For right to be forgotten, we usually hard delete or strictly anonymize

        // Delete related records
        db.prepare('DELETE FROM appointments WHERE patient_id = ?').run(patientId);
        db.prepare('DELETE FROM medical_records WHERE patient_id = ?').run(patientId);
        db.prepare('DELETE FROM visits WHERE patient_id = ?').run(patientId);
        // Delete other related tables...

        // Delete patient
        db.prepare('DELETE FROM patients WHERE id = ?').run(patientId);
    });

    transaction();
    return true;
};
