import * as patientPortalService from '../services/patientPortal.service.js';
import logger from '../utils/logger.js';

/**
 * Patient Portal Controller
 */

/**
 * POST /api/patient-portal/register
 * Register a patient for portal access
 */
export const register = async (req, res, next) => {
    try {
        const clinicId = req.validatedData.clinic_id || req.body.clinic_id;

        const result = await patientPortalService.registerPatientPortal(clinicId, req.validatedData);

        res.status(201).json({
            success: true,
            message: 'Patient portal account created successfully',
            data: result
        });
    } catch (error) {
        logger.error('Patient portal register error:', error);
        next(error);
    }
};

/**
 * POST /api/patient-portal/login
 * Patient portal login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.validatedData;

        const result = await patientPortalService.loginPatientPortal(email, password);

        // Set HTTP-only cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: result.user,
            token: result.token
        });
    } catch (error) {
        logger.error('Patient portal login error:', error);
        next(error);
    }
};

/**
 * GET /api/patient-portal/profile
 * Get patient profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const patientId = req.user.patient_id;

        const profile = await patientPortalService.getPatientProfile(clinicId, patientId);

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        next(error);
    }
};

/**
 * PUT /api/patient-portal/profile
 * Update patient profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const patientId = req.user.patient_id;

        const profile = await patientPortalService.updatePatientProfile(clinicId, patientId, req.body);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: profile
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        next(error);
    }
};

/**
 * GET /api/patient-portal/appointments
 * Get patient appointments
 */
export const getAppointments = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const patientId = req.user.patient_id;

        const appointments = await patientPortalService.getPatientAppointments(clinicId, patientId);

        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        logger.error('Get appointments error:', error);
        next(error);
    }
};

/**
 * POST /api/patient-portal/appointments
 * Request an appointment
 */
export const requestAppointment = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const patientId = req.user.patient_id;

        const appointment = await patientPortalService.requestAppointment(clinicId, patientId, req.validatedData);

        res.status(201).json({
            success: true,
            message: 'Appointment requested successfully',
            data: appointment
        });
    } catch (error) {
        logger.error('Request appointment error:', error);
        next(error);
    }
};

/**
 * DELETE /api/patient-portal/appointments/:id
 * Cancel an appointment
 */
export const cancelAppointment = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const patientId = req.user.patient_id;
        const { id } = req.params;
        const { reason } = req.body;

        await patientPortalService.cancelAppointment(clinicId, patientId, parseInt(id), reason);

        res.json({
            success: true,
            message: 'Appointment canceled successfully'
        });
    } catch (error) {
        logger.error('Cancel appointment error:', error);
        next(error);
    }
};

/**
 * GET /api/patient-portal/bills
 * Get patient bills
 */
export const getBills = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const patientId = req.user.patient_id;

        const bills = await patientPortalService.getBills(clinicId, patientId);

        res.json({
            success: true,
            data: bills
        });
    } catch (error) {
        logger.error('Get bills error:', error);
        next(error);
    }
};

/**
 * GET /api/patient-portal/prescriptions
 * Get patient prescriptions
 */
export const getPrescriptions = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const patientId = req.user.patient_id;

        const prescriptions = await patientPortalService.getPrescriptions(clinicId, patientId);

        res.json({
            success: true,
            data: prescriptions
        });
    } catch (error) {
        logger.error('Get prescriptions error:', error);
        next(error);
    }
};

export default {
    register,
    login,
    getProfile,
    updateProfile,
    getAppointments,
    requestAppointment,
    cancelAppointment,
    getBills,
    getPrescriptions
};
