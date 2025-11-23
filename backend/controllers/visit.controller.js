import { catchAsync } from '../utils/errorHandler.js';
import * as visitService from '../services/visit.service.js';

/**
 * Visit Controller
 */

/**
 * POST /api/visits
 * Create a new visit
 */
export const createVisit = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const userId = req.user.id;

    const visit = await visitService.createVisit(clinicId, req.validatedData, userId);

    res.status(201).json({
        success: true,
        message: 'Visit created successfully',
        data: visit
    });
});

/**
 * GET /api/visits
 * Get all visits for the clinic
 */
export const getVisits = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const filters = {
        patient_id: req.query.patient_id,
        doctor_id: req.query.doctor_id,
        date: req.query.date,
        limit: parseInt(req.query.limit) || 100
    };

    const visits = await visitService.getClinicVisits(clinicId, filters);

    res.json({
        success: true,
        data: visits
    });
});

/**
 * GET /api/visits/patient/:patientId
 * Get all visits for a specific patient
 */
export const getPatientVisits = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const { patientId } = req.params;

    const visits = await visitService.getPatientVisits(clinicId, parseInt(patientId));

    res.json({
        success: true,
        data: visits
    });
});

/**
 * GET /api/visits/doctor
 * Get visits for the authenticated doctor
 */
export const getDoctorVisits = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const doctorId = req.user.id;
    const filters = {
        date: req.query.date,
        limit: parseInt(req.query.limit) || 50
    };

    const visits = await visitService.getDoctorVisits(clinicId, doctorId, filters);

    res.json({
        success: true,
        data: visits
    });
});

/**
 * GET /api/visits/:id
 * Get a single visit
 */
export const getVisit = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const { id } = req.params;

    const visit = await visitService.getVisit(clinicId, parseInt(id));

    if (!visit) {
        return res.status(404).json({
            success: false,
            error: 'Visit not found'
        });
    }

    res.json({
        success: true,
        data: visit
    });
});

/**
 * PUT /api/visits/:id
 * Update a visit
 */
export const updateVisit = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const { id } = req.params;

    const visit = await visitService.updateVisit(clinicId, parseInt(id), req.validatedData);

    res.json({
        success: true,
        message: 'Visit updated successfully',
        data: visit
    });
});

export default {
    createVisit,
    getVisits,
    getPatientVisits,
    getDoctorVisits,
    getVisit,
    updateVisit
};
