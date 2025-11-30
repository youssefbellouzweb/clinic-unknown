import db from '../config/db.js';
import logger from '../utils/logger.js';

class SearchService {
    /**
     * Search across multiple entities
     * @param {string} query - Search query
     * @param {number} clinicId - Clinic ID
     * @param {object} options - Search options
     */
    globalSearch(query, clinicId, options = {}) {
        const { limit = 50, entities = ['patients', 'appointments', 'medical_records', 'visits'] } = options;
        const results = {};

        try {
            // Search patients
            if (entities.includes('patients')) {
                results.patients = db.prepare(`
                    SELECT id, name, email, phone, 'patient' as type
                    FROM patients
                    WHERE clinic_id = ? AND (
                        name LIKE ? OR 
                        email LIKE ? OR 
                        phone LIKE ?
                    )
                    LIMIT ?
                `).all(clinicId, `%${query}%`, `%${query}%`, `%${query}%`, limit);
            }

            // Search appointments
            if (entities.includes('appointments')) {
                results.appointments = db.prepare(`
                    SELECT a.id, a.datetime, a.status, p.name as patient_name, 'appointment' as type
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.id
                    WHERE a.clinic_id = ? AND (
                        p.name LIKE ? OR
                        a.status LIKE ?
                    )
                    LIMIT ?
                `).all(clinicId, `%${query}%`, `%${query}%`, limit);
            }

            // Search medical records
            if (entities.includes('medical_records')) {
                results.medical_records = db.prepare(`
                    SELECT m.id, m.diagnosis, m.treatment, p.name as patient_name, 'medical_record' as type
                    FROM medical_records m
                    JOIN patients p ON m.patient_id = p.id
                    WHERE m.clinic_id = ? AND (
                        m.diagnosis LIKE ? OR
                        m.treatment LIKE ? OR
                        m.notes LIKE ?
                    )
                    LIMIT ?
                `).all(clinicId, `%${query}%`, `%${query}%`, `%${query}%`, limit);
            }

            // Search visits
            if (entities.includes('visits')) {
                results.visits = db.prepare(`
                    SELECT v.id, v.date, v.reason, p.name as patient_name, 'visit' as type
                    FROM visits v
                    JOIN patients p ON v.patient_id = p.id
                    WHERE v.clinic_id = ? AND (
                        v.reason LIKE ? OR
                        v.notes LIKE ?
                    )
                    LIMIT ?
                `).all(clinicId, `%${query}%`, `%${query}%`, limit);
            }

            return results;
        } catch (error) {
            logger.error({ error: error.message }, 'Global search failed');
            throw error;
        }
    }

    /**
     * Search patients
     */
    searchPatients(query, clinicId, limit = 20) {
        return db.prepare(`
            SELECT id, name, email, phone, date_of_birth, gender
            FROM patients
            WHERE clinic_id = ? AND (
                name LIKE ? OR 
                email LIKE ? OR 
                phone LIKE ?
            )
            ORDER BY name ASC
            LIMIT ?
        `).all(clinicId, `%${query}%`, `%${query}%`, `%${query}%`, limit);
    }

    /**
     * Search appointments
     */
    searchAppointments(query, clinicId, filters = {}) {
        let sql = `
            SELECT a.*, p.name as patient_name, u.name as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN users u ON a.doctor_id = u.id
            WHERE a.clinic_id = ?
        `;
        const params = [clinicId];

        if (query) {
            sql += ` AND (p.name LIKE ? OR a.status LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`);
        }

        if (filters.status) {
            sql += ` AND a.status = ?`;
            params.push(filters.status);
        }

        if (filters.dateFrom) {
            sql += ` AND date(a.datetime) >= ?`;
            params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
            sql += ` AND date(a.datetime) <= ?`;
            params.push(filters.dateTo);
        }

        sql += ` ORDER BY a.datetime DESC LIMIT 50`;

        return db.prepare(sql).all(...params);
    }
}

export default new SearchService();
