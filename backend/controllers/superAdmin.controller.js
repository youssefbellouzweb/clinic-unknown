import * as superAdminService from '../services/superAdmin.service.js';
import logger from '../utils/logger.js';

/**
 * Super Admin Controller
 */

/**
 * GET /api/superadmin/clinics
 * Get all clinics
 */
export const getAllClinics = async (req, res, next) => {
    try {
        const filters = {
            is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
            city: req.query.city,
            limit: parseInt(req.query.limit) || 100
        };

        const clinics = await superAdminService.getAllClinics(filters);

        res.json({
            success: true,
            data: clinics
        });
    } catch (error) {
        logger.error('Get all clinics error:', error);
        next(error);
    }
};

/**
 * GET /api/superadmin/clinics/:id
 * Get clinic details with statistics
 */
export const getClinicDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const clinic = await superAdminService.getClinicDetails(parseInt(id));

        res.json({
            success: true,
            data: clinic
        });
    } catch (error) {
        logger.error('Get clinic details error:', error);
        next(error);
    }
};

/**
 * PUT /api/superadmin/clinics/:id/activate
 * Activate a clinic
 */
export const activateClinic = async (req, res, next) => {
    try {
        const { id } = req.params;

        await superAdminService.activateClinic(parseInt(id));

        res.json({
            success: true,
            message: 'Clinic activated successfully'
        });
    } catch (error) {
        logger.error('Activate clinic error:', error);
        next(error);
    }
};

/**
 * PUT /api/superadmin/clinics/:id/deactivate
 * Deactivate a clinic
 */
export const deactivateClinic = async (req, res, next) => {
    try {
        const { id } = req.params;

        await superAdminService.deactivateClinic(parseInt(id));

        res.json({
            success: true,
            message: 'Clinic deactivated successfully'
        });
    } catch (error) {
        logger.error('Deactivate clinic error:', error);
        next(error);
    }
};

/**
 * DELETE /api/superadmin/clinics/:id
 * Delete a clinic
 */
export const deleteClinic = async (req, res, next) => {
    try {
        const { id } = req.params;

        await superAdminService.deleteClinic(parseInt(id));

        res.json({
            success: true,
            message: 'Clinic deleted successfully'
        });
    } catch (error) {
        logger.error('Delete clinic error:', error);
        next(error);
    }
};

/**
 * GET /api/superadmin/analytics
 * Get platform analytics
 */
export const getPlatformAnalytics = async (req, res, next) => {
    try {
        const analytics = await superAdminService.getPlatformAnalytics();

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        logger.error('Get platform analytics error:', error);
        next(error);
    }
};

/**
 * GET /api/superadmin/audit-logs
 * Get platform audit logs
 */
export const getAuditLogs = async (req, res, next) => {
    try {
        const filters = {
            clinic_id: req.query.clinic_id,
            action: req.query.action,
            start_date: req.query.start_date,
            limit: parseInt(req.query.limit) || 100
        };

        const logs = await superAdminService.getPlatformAuditLogs(filters);

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        logger.error('Get audit logs error:', error);
        next(error);
    }
};

export const getMetricsUsers = async (req, res, next) => {
    try {
        const metrics = await superAdminService.getMetricsUsers();
        res.json({ success: true, data: metrics });
    } catch (error) {
        logger.error('Get user metrics error:', error);
        next(error);
    }
};

export const getMetricsAppointments = async (req, res, next) => {
    try {
        const metrics = await superAdminService.getMetricsAppointments();
        res.json({ success: true, data: metrics });
    } catch (error) {
        logger.error('Get appointment metrics error:', error);
        next(error);
    }
};

export const getMetricsPerformance = async (req, res, next) => {
    try {
        const metrics = await superAdminService.getMetricsPerformance();
        res.json({ success: true, data: metrics });
    } catch (error) {
        logger.error('Get performance metrics error:', error);
        next(error);
    }
};

export const getClinicSupportData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await superAdminService.getClinicSupportData(parseInt(id));
        res.json({ success: true, data });
    } catch (error) {
        logger.error('Get clinic support data error:', error);
        next(error);
    }
};

export default {
    getAllClinics,
    getClinicDetails,
    activateClinic,
    deactivateClinic,
    deleteClinic,
    getPlatformAnalytics,
    getAuditLogs,
    getMetricsUsers,
    getMetricsAppointments,
    getMetricsPerformance,
    getClinicSupportData
};
