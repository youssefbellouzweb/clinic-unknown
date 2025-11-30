import db from '../config/db.js';
import logger from '../utils/logger.js';

class DashboardAnalyticsController {
    async getOverview(req, res) {
        try {
            const clinicId = req.user.clinic_id;

            // Get total patients
            const patients = db.prepare('SELECT COUNT(*) as count FROM patients WHERE clinic_id = ?').get(clinicId);

            // Get total appointments today
            const appointmentsToday = db.prepare(`
                SELECT COUNT(*) as count FROM appointments 
                WHERE clinic_id = ? AND date(datetime) = date('now')
            `).get(clinicId);

            // Get revenue this month
            const revenue = db.prepare(`
                SELECT SUM(amount) as total FROM bills 
                WHERE clinic_id = ? AND status = 'paid' 
                AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
            `).get(clinicId);

            // Get recent activity (appointments)
            const recentActivity = db.prepare(`
                SELECT a.id, p.name as patient_name, a.datetime, a.status
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                WHERE a.clinic_id = ?
                ORDER BY a.datetime DESC
                LIMIT 5
            `).all(clinicId);

            res.json({
                data: {
                    totalPatients: patients.count,
                    appointmentsToday: appointmentsToday.count,
                    revenueMonth: revenue.total || 0,
                    recentActivity
                }
            });
        } catch (error) {
            logger.error({ error: error.message }, 'Get analytics overview failed');
            res.status(500).json({ error: 'Failed to retrieve analytics overview' });
        }
    }

    async getRevenueChart(req, res) {
        try {
            const clinicId = req.user.clinic_id;

            // Get revenue for last 6 months
            const revenue = db.prepare(`
                SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total
                FROM bills
                WHERE clinic_id = ? AND status = 'paid'
                AND created_at >= date('now', '-6 months')
                GROUP BY month
                ORDER BY month ASC
            `).all(clinicId);

            res.json({ data: revenue });
        } catch (error) {
            logger.error({ error: error.message }, 'Get revenue chart failed');
            res.status(500).json({ error: 'Failed to retrieve revenue data' });
        }
    }

    async getAppointmentStats(req, res) {
        try {
            const clinicId = req.user.clinic_id;

            // Get appointment status distribution
            const stats = db.prepare(`
                SELECT status, COUNT(*) as count
                FROM appointments
                WHERE clinic_id = ?
                GROUP BY status
            `).all(clinicId);

            res.json({ data: stats });
        } catch (error) {
            logger.error({ error: error.message }, 'Get appointment stats failed');
            res.status(500).json({ error: 'Failed to retrieve appointment stats' });
        }
    }
}

export default new DashboardAnalyticsController();
