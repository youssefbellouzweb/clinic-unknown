import db from '../config/db.js';

export const createMedicalRecord = (clinicId, data, userId) => {
    const { patient_id, doctor_id, visit_id, diagnosis, prescription, notes, attachments } = data;

    const result = db.prepare(`
        INSERT INTO medical_records (clinic_id, patient_id, doctor_id, visit_id, diagnosis, prescription, notes, attachments, created_by)
        VALUES (@clinicId, @patient_id, @doctor_id, @visit_id, @diagnosis, @prescription, @notes, @attachments, @userId)
    `).run({
        clinicId,
        patient_id,
        doctor_id,
        visit_id,
        diagnosis,
        prescription,
        notes,
        attachments: attachments ? JSON.stringify(attachments) : null,
        userId
    });

    return db.prepare('SELECT * FROM medical_records WHERE id = ?').get(result.lastInsertRowid);
};

export const getClinicMedicalRecords = (clinicId, filters) => {
    let sql = `
        SELECT mr.*, p.name as patient_name, u.name as doctor_name
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN users u ON mr.doctor_id = u.id
        WHERE mr.clinic_id = ?
    `;
    const params = [clinicId];

    if (filters.patient_id) {
        sql += ' AND mr.patient_id = ?';
        params.push(filters.patient_id);
    }
    if (filters.doctor_id) {
        sql += ' AND mr.doctor_id = ?';
        params.push(filters.doctor_id);
    }

    sql += ' ORDER BY mr.created_at DESC LIMIT ?';
    params.push(filters.limit);

    return db.prepare(sql).all(...params);
};

export const getPatientMedicalRecords = (clinicId, patientId) => {
    return db.prepare(`
        SELECT mr.*, u.name as doctor_name
        FROM medical_records mr
        LEFT JOIN users u ON mr.doctor_id = u.id
        WHERE mr.clinic_id = ? AND mr.patient_id = ?
        ORDER BY mr.created_at DESC
    `).all(clinicId, patientId);
};

export const getMedicalRecord = (clinicId, id) => {
    return db.prepare(`
        SELECT mr.*, p.name as patient_name, u.name as doctor_name
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN users u ON mr.doctor_id = u.id
        WHERE mr.id = ? AND mr.clinic_id = ?
    `).get(id, clinicId);
};

export const updateMedicalRecord = (clinicId, id, data) => {
    const updates = [];
    const params = [];

    if (data.diagnosis !== undefined) {
        updates.push('diagnosis = ?');
        params.push(data.diagnosis);
    }
    if (data.prescription !== undefined) {
        updates.push('prescription = ?');
        params.push(data.prescription);
    }
    if (data.notes !== undefined) {
        updates.push('notes = ?');
        params.push(data.notes);
    }
    if (data.attachments !== undefined) {
        updates.push('attachments = ?');
        params.push(JSON.stringify(data.attachments));
    }

    if (updates.length === 0) return getMedicalRecord(clinicId, id);

    params.push(id, clinicId);

    db.prepare(`UPDATE medical_records SET ${updates.join(', ')} WHERE id = ? AND clinic_id = ?`).run(...params);

    return getMedicalRecord(clinicId, id);
};

export const deleteMedicalRecord = (clinicId, id) => {
    db.prepare('DELETE FROM medical_records WHERE id = ? AND clinic_id = ?').run(id, clinicId);
};
