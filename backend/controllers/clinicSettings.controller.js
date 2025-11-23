import * as clinicSettingsService from '../services/clinicSettings.service.js';
import logger from '../utils/logger.js';

export const getSettings = async (req, res, next) => {
    try {
        const settings = clinicSettingsService.getClinicSettings(req.user.clinicId);
        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error('Get clinic settings error:', error);
        next(error);
    }
};

export const updateSettings = async (req, res, next) => {
    try {
        const settings = clinicSettingsService.updateClinicSettings(req.user.clinicId, req.body, req.user.id);
        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error('Update clinic settings error:', error);
        next(error);
    }
};

export const updateLogo = async (req, res, next) => {
    try {
        // MVP: Assuming logo_url is passed in body. Real file upload handled by multer middleware before this.
        const { logo_url } = req.body;
        const result = clinicSettingsService.updateLogo(req.user.clinicId, logo_url);
        res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Update logo error:', error);
        next(error);
    }
};

export const getSchema = async (req, res, next) => {
    try {
        const schema = clinicSettingsService.getSettingsSchema();
        res.json({ success: true, data: schema });
    } catch (error) {
        logger.error('Get settings schema error:', error);
        next(error);
    }
};
