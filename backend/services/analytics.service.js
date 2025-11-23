import db from '../config/db.js';

export const getDashboardAnalytics = (clinicId) => {
    const today = new Date().toISOString().split('T')[0];

    // Appointments today
    const appointmentsToday = db.prepare(`
        SELECT COUNT(*) as count FROM appointments 
        WHERE clinic_id = ? AND date(datetime) = ?
    `).get(clinicId, today).count;

    // Active patients (patients with appointments in last 30 days)
    const activePatients = db.prepare(`
        SELECT COUNT(DISTINCT patient_id) as count FROM appointments 
        WHERE clinic_id = ? AND datetime > date('now', '-30 days')
    `).get(clinicId).count;

    // Total patients
    const totalPatients = db.prepare(`
        SELECT COUNT(*) as count FROM patients WHERE clinic_id = ?
    `).get(clinicId).count;

    // Revenue today (mock calculation based on visits)
    // In a real app, this would come from a billing table
    const visitsToday = db.prepare(`
        SELECT COUNT(*) as count FROM visits 
        WHERE clinic_id = ? AND visit_date = ?
    `).get(clinicId, today).count;

    return {
        appointmentsToday,
        activePatients,
        totalPatients,
        visitsToday,
        revenueToday: visitsToday * 50 // Mock revenue
    };
};

export const getAppointmentStats = (clinicId, startDate, endDate) => {
    return db.prepare(`
        SELECT date(datetime) as date, status, COUNT(*) as count
        FROM appointments
        WHERE clinic_id = ? AND datetime BETWEEN ? AND ?
        GROUP BY date(datetime), status
        ORDER BY date(datetime)
    `).all(clinicId, startDate, endDate);
};

export const getDoctorPerformance = (clinicId, doctorId) => {
    let sql = `
        SELECT u.name as doctor_name, 
               COUNT(a.id) as total_appointments,
               COUNT(v.id) as completed_visits
        FROM users u
        LEFT JOIN appointments a ON u.id = a.doctor_id AND a.datetime > date('now', '-30 days')
        LEFT JOIN visits v ON u.id = v.doctor_id AND v.visit_date > date('now', '-30 days')
        WHERE u.clinic_id = ? AND u.role = 'doctor'
    `;
    const params = [clinicId];

    if (doctorId) {
        sql += ' AND u.id = ?';
        params.push(doctorId);
    }

    sql += ' GROUP BY u.id';

    return db.prepare(sql).all(...params);
};
