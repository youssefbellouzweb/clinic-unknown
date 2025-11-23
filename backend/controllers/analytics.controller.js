import * as analyticsService from '../services/analytics.service.js';
import logger from '../utils/logger.js';

/**
 * Analytics Controller
 * Provides dashboard metrics and statistics
 */

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics for the authenticated user's clinic
 */
export const getDashboard = async (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;

        const analytics = await analyticsService.getDashboardAnalytics(clinicId);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        logger.error('Get dashboard error:', error);
        next(error);
    }
};

/**
 * GET /api/analytics/appointments
 * Get appointment statistics for a date range
 */
export const getAppointmentStats = async (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const { start_date, end_date } = req.query;

        const stats = await analyticsService.getAppointmentStats(clinicId, start_date, end_date);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Get appointment stats error:', error);
        next(error);
    }
};

/**
 * GET /api/analytics/doctors
 * Get doctor performance metrics
 */
export const getDoctorPerformance = async (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const { doctor_id } = req.query;

        const performance = await analyticsService.getDoctorPerformance(clinicId, doctor_id);

        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        logger.error('Get doctor performance error:', error);
        next(error);
    }
};

export default {
    getDashboard,
    getAppointmentStats,
    getDoctorPerformance
};
