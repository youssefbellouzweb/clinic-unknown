import db from '../config/db.js';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

const getCached = (key) => {
    const item = cache.get(key);
    if (item && item.expires > Date.now()) {
        return item.data;
    }
    return null;
};

const setCache = (key, data) => {
    cache.set(key, {
        data,
        expires: Date.now() + CACHE_TTL
    });
};

export const getOverview = (clinicId, from, to) => {
    const cacheKey = `overview:${clinicId}:${from}:${to}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients WHERE clinic_id = ?').get(clinicId).count;

    const newPatients = db.prepare(`
        SELECT COUNT(*) as count FROM patients 
        WHERE clinic_id = ? AND created_at BETWEEN ? AND ?
    `).get(clinicId, from, to).count;

    const totalAppointments = db.prepare(`
        SELECT COUNT(*) as count FROM appointments 
        WHERE clinic_id = ? AND datetime BETWEEN ? AND ?
    `).get(clinicId, from, to).count;

    const appointmentsByStatus = db.prepare(`
        SELECT status, COUNT(*) as count FROM appointments 
        WHERE clinic_id = ? AND datetime BETWEEN ? AND ?
        GROUP BY status
    `).all(clinicId, from, to);

    const activeDoctors = db.prepare(`
        SELECT COUNT(DISTINCT id) as count FROM users 
        WHERE clinic_id = ? AND role = 'doctor' AND is_verified = 1
    `).get(clinicId).count;

    const result = {
        total_patients: totalPatients,
        new_patients: newPatients,
        total_appointments: totalAppointments,
        appointments_by_status: appointmentsByStatus.reduce((acc, curr) => ({ ...acc, [curr.status]: curr.count }), {}),
        active_doctors: activeDoctors
    };

    setCache(cacheKey, result);
    return result;
};

export const getAppointmentsTrend = (clinicId, period, from, to) => {
    // SQLite date formatting for grouping
    let dateFormat;
    if (period === 'day') dateFormat = '%Y-%m-%d';
    else if (period === 'month') dateFormat = '%Y-%m';
    else dateFormat = '%Y-%W'; // week

    const sql = `
        SELECT strftime('${dateFormat}', datetime) as date, COUNT(*) as count
        FROM appointments
        WHERE clinic_id = ? AND datetime BETWEEN ? AND ?
        GROUP BY date
        ORDER BY date ASC
    `;

    return db.prepare(sql).all(clinicId, from, to);
};

export const getPatientsTrend = (clinicId, period, from, to) => {
    let dateFormat;
    if (period === 'day') dateFormat = '%Y-%m-%d';
    else if (period === 'month') dateFormat = '%Y-%m';
    else dateFormat = '%Y-%W';

    const sql = `
        SELECT strftime('${dateFormat}', created_at) as date, COUNT(*) as count
        FROM patients
        WHERE clinic_id = ? AND created_at BETWEEN ? AND ?
        GROUP BY date
        ORDER BY date ASC
    `;

    return db.prepare(sql).all(clinicId, from, to);
};

export const getDoctorPerformance = (clinicId, from, to) => {
    const sql = `
        SELECT u.name, COUNT(a.id) as appointment_count,
               SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
        FROM users u
        LEFT JOIN appointments a ON u.id = a.doctor_id AND a.datetime BETWEEN ? AND ?
        WHERE u.clinic_id = ? AND u.role = 'doctor'
        GROUP BY u.id
    `;

    const stats = db.prepare(sql).all(from, to, clinicId);

    return stats.map(stat => ({
        ...stat,
        cancellation_rate: stat.appointment_count > 0 ? (stat.cancelled_count / stat.appointment_count).toFixed(2) : 0
    }));
};
