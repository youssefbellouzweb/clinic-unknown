import db from '../config/db.js';

export const createVisit = (clinicId, data, userId) => {
    const { patient_id, doctor_id, date, reason, diagnosis, notes } = data;

    const result = db.prepare(`
        INSERT INTO visits (clinic_id, patient_id, doctor_id, date, reason, diagnosis, notes, created_by)
        VALUES (@clinicId, @patient_id, @doctor_id, @date, @reason, @diagnosis, @notes, @userId)
    `).run({
        clinicId,
        patient_id,
        doctor_id,
        date,
        reason,
        diagnosis,
        notes,
        userId
    });

    return db.prepare('SELECT * FROM visits WHERE id = ?').get(result.lastInsertRowid);
};

export const getClinicVisits = (clinicId, filters) => {
    let sql = `
        SELECT v.*, p.name as patient_name, u.name as doctor_name
        FROM visits v
        JOIN patients p ON v.patient_id = p.id
        LEFT JOIN users u ON v.doctor_id = u.id
        WHERE v.clinic_id = ?
    `;
    const params = [clinicId];

    if (filters.patient_id) {
        sql += ' AND v.patient_id = ?';
        params.push(filters.patient_id);
    }
    if (filters.doctor_id) {
        sql += ' AND v.doctor_id = ?';
        params.push(filters.doctor_id);
    }
    if (filters.date) {
        sql += ' AND v.date = ?';
        params.push(filters.date);
    }

    sql += ' ORDER BY v.date DESC LIMIT ?';
    params.push(filters.limit);

    return db.prepare(sql).all(...params);
};

export const getPatientVisits = (clinicId, patientId) => {
    return db.prepare(`
        SELECT v.*, u.name as doctor_name
        FROM visits v
        LEFT JOIN users u ON v.doctor_id = u.id
        WHERE v.clinic_id = ? AND v.patient_id = ?
        ORDER BY v.date DESC
    `).all(clinicId, patientId);
};

export const getDoctorVisits = (clinicId, doctorId, filters) => {
    let sql = `
        SELECT v.*, p.name as patient_name
        FROM visits v
        JOIN patients p ON v.patient_id = p.id
        WHERE v.clinic_id = ? AND v.doctor_id = ?
    `;
    const params = [clinicId, doctorId];

    if (filters.date) {
        sql += ' AND v.date = ?';
        params.push(filters.date);
    }

    sql += ' ORDER BY v.date DESC LIMIT ?';
    params.push(filters.limit);

    return db.prepare(sql).all(...params);
};

export const getVisit = (clinicId, id) => {
    return db.prepare(`
        SELECT v.*, p.name as patient_name, u.name as doctor_name
        FROM visits v
        JOIN patients p ON v.patient_id = p.id
        LEFT JOIN users u ON v.doctor_id = u.id
        WHERE v.id = ? AND v.clinic_id = ?
    `).get(id, clinicId);
};

export const updateVisit = (clinicId, id, data) => {
    const updates = [];
    const params = [];

    if (data.reason !== undefined) {
        updates.push('reason = ?');
        params.push(data.reason);
    }
    if (data.diagnosis !== undefined) {
        updates.push('diagnosis = ?');
        params.push(data.diagnosis);
    }
    if (data.notes !== undefined) {
        updates.push('notes = ?');
        params.push(data.notes);
    }
    if (data.date !== undefined) {
        updates.push('date = ?');
        params.push(data.date);
    }

    if (updates.length === 0) return getVisit(clinicId, id);

    params.push(id, clinicId);

    db.prepare(`UPDATE visits SET ${updates.join(', ')} WHERE id = ? AND clinic_id = ?`).run(...params);

    return getVisit(clinicId, id);
};
