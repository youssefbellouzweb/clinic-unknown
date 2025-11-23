import { queryAuditLogs } from '../middleware/audit.js';
import db from '../config/db.js';
import logger from '../utils/logger.js';

export const getClinicAuditLogs = async (req, res, next) => {
    try {
        const filters = {
            clinic_id: req.user.clinicId,
            user_id: req.query.user_id,
            action: req.query.action,
            entity: req.query.entity,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            limit: req.query.limit ? parseInt(req.query.limit) : 100
        };

        const logs = queryAuditLogs(db, filters);
        res.json({ success: true, data: logs });
    } catch (error) {
        logger.error('Get clinic audit logs error:', error);
        next(error);
    }
};
