import * as gdprService from '../services/gdpr.service.js';
import logger from '../utils/logger.js';

export const exportData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = gdprService.exportPatientData(req.user.clinicId, id);
        res.json({ success: true, data });
    } catch (error) {
        logger.error('GDPR export error:', error);
        next(error);
    }
};

export const deleteData = async (req, res, next) => {
    try {
        const { id } = req.params;
        await gdprService.deletePatientData(req.user.clinicId, id, req.user.id);
        res.json({ success: true, message: 'Patient data deleted successfully' });
    } catch (error) {
        logger.error('GDPR delete error:', error);
        next(error);
    }
};
