import * as analyticsService from '../services/dashboardAnalytics.service.js';
import logger from '../utils/logger.js';

export const getOverview = async (req, res, next) => {
    try {
        const { from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), to = new Date().toISOString() } = req.query;
        const data = analyticsService.getOverview(req.user.clinicId, from, to);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get analytics overview error:', error);
        next(error);
    }
};

export const getAppointmentsTrend = async (req, res, next) => {
    try {
        const { period = 'day', from, to } = req.query;
        const data = analyticsService.getAppointmentsTrend(req.user.clinicId, period, from, to);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get appointments trend error:', error);
        next(error);
    }
};

export const getPatientsTrend = async (req, res, next) => {
    try {
        const { period = 'day', from, to } = req.query;
        const data = analyticsService.getPatientsTrend(req.user.clinicId, period, from, to);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get patients trend error:', error);
        next(error);
    }
};

export const getDoctorPerformance = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const data = analyticsService.getDoctorPerformance(req.user.clinicId, from, to);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get doctor performance error:', error);
        next(error);
    }
};
