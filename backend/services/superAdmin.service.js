import db from '../config/db.js';

export const getAllClinics = (filters) => {
    let sql = 'SELECT * FROM clinics WHERE 1=1';
    const params = [];

    if (filters.is_active !== undefined) {
        sql += ' AND is_active = ?';
        params.push(filters.is_active ? 1 : 0);
    }
    if (filters.city) {
        sql += ' AND address LIKE ?';
        params.push(`%${filters.city}%`);
    }

    sql += ' LIMIT ?';
    params.push(filters.limit);

    return db.prepare(sql).all(...params);
};

export const getClinicDetails = (id) => {
    const clinic = db.prepare('SELECT * FROM clinics WHERE id = ?').get(id);
    if (!clinic) return null;

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE clinic_id = ?').get(id).count;
    const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients WHERE clinic_id = ?').get(id).count;
    const appointmentCount = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ?').get(id).count;

    return {
        ...clinic,
        stats: {
            users: userCount,
            patients: patientCount,
            appointments: appointmentCount
        }
    };
};

export const activateClinic = (id) => {
    db.prepare('UPDATE clinics SET is_active = 1 WHERE id = ?').run(id);
};

export const deactivateClinic = (id) => {
    db.prepare('UPDATE clinics SET is_active = 0 WHERE id = ?').run(id);
};

export const deleteClinic = (id) => {
    // Transaction to delete everything related to clinic
    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM appointments WHERE clinic_id = ?').run(id);
        db.prepare('DELETE FROM visits WHERE clinic_id = ?').run(id);
        db.prepare('DELETE FROM medical_records WHERE clinic_id = ?').run(id);
        db.prepare('DELETE FROM patients WHERE clinic_id = ?').run(id);
        db.prepare('DELETE FROM users WHERE clinic_id = ?').run(id);
        db.prepare('DELETE FROM clinics WHERE id = ?').run(id);
    });
    transaction();
};

export const getPlatformAnalytics = () => {
    const totalClinics = db.prepare('SELECT COUNT(*) as count FROM clinics').get().count;
    const activeClinics = db.prepare('SELECT COUNT(*) as count FROM clinics WHERE is_active = 1').get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;

    return {
        totalClinics,
        activeClinics,
        totalUsers,
        totalPatients,
        totalAppointments
    };
};

export const getPlatformAuditLogs = (filters) => {
    let sql = `
        SELECT al.*, u.name as user_name, c.name as clinic_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN clinics c ON al.clinic_id = c.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.clinic_id) {
        sql += ' AND al.clinic_id = ?';
        params.push(filters.clinic_id);
    }
    if (filters.action) {
        sql += ' AND al.action = ?';
        params.push(filters.action);
    }

    sql += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(filters.limit);

    return db.prepare(sql).all(...params);
};

export const getMetricsUsers = () => {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const usersByClinic = db.prepare(`
        SELECT c.name as clinic_name, COUNT(u.id) as user_count
        FROM clinics c
        LEFT JOIN users u ON c.id = u.clinic_id
        GROUP BY c.id
    `).all();

    return {
        total: totalUsers,
        byClinic: usersByClinic
    };
};

export const getMetricsAppointments = () => {
    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
    const appointmentsByClinic = db.prepare(`
        SELECT c.name as clinic_name, COUNT(a.id) as appointment_count
        FROM clinics c
        LEFT JOIN appointments a ON c.id = a.clinic_id
        GROUP BY c.id
    `).all();

    return {
        total: totalAppointments,
        byClinic: appointmentsByClinic
    };
};

export const getMetricsPerformance = () => {
    // Mock performance metrics for MVP
    return {
        apiLatencyMs: Math.floor(Math.random() * 50) + 10,
        errorRatePercent: parseFloat((Math.random() * 0.5).toFixed(2)),
        uptimePercent: 99.99
    };
};

export const getClinicSupportData = (clinicId) => {
    const clinic = db.prepare('SELECT * FROM clinics WHERE id = ?').get(clinicId);
    if (!clinic) throw new Error('Clinic not found');

    const users = db.prepare('SELECT id, name, email, role, is_verified FROM users WHERE clinic_id = ?').all(clinicId);
    const recentLogs = db.prepare('SELECT * FROM audit_logs WHERE clinic_id = ? ORDER BY created_at DESC LIMIT 20').all(clinicId);

    return {
        clinic,
        users,
        recentLogs
    };
};
