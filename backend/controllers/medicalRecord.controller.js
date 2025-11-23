import { catchAsync } from '../utils/errorHandler.js';
import * as medicalRecordService from '../services/medicalRecord.service.js';
import { validate, createMedicalRecordSchema, updateMedicalRecordSchema } from '../utils/validators.js';

/**
 * Medical Records Controller
 */

/**
 * POST /api/medical-records
 * Create a new medical record
 */
export const createMedicalRecord = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const userId = req.user.id;

    const record = await medicalRecordService.createMedicalRecord(clinicId, req.validatedData, userId);

    res.status(201).json({
        success: true,
        message: 'Medical record created successfully',
        data: record
    });
});

/**
 * GET /api/medical-records
 * Get all medical records for the clinic
 */
export const getMedicalRecords = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const filters = {
        patient_id: req.query.patient_id,
        doctor_id: req.query.doctor_id,
        limit: parseInt(req.query.limit) || 100
    };

    const records = await medicalRecordService.getClinicMedicalRecords(clinicId, filters);

    res.json({
        success: true,
        data: records
    });
});

/**
 * GET /api/medical-records/patient/:patientId
 * Get all medical records for a specific patient
 */
export const getPatientMedicalRecords = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const { patientId } = req.params;

    const records = await medicalRecordService.getPatientMedicalRecords(clinicId, parseInt(patientId));

    res.json({
        success: true,
        data: records
    });
});

/**
 * GET /api/medical-records/:id
 * Get a single medical record
 */
export const getMedicalRecord = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const { id } = req.params;

    const record = await medicalRecordService.getMedicalRecord(clinicId, parseInt(id));

    if (!record) {
        return res.status(404).json({
            success: false,
            error: 'Medical record not found'
        });
    }

    res.json({
        success: true,
        data: record
    });
});

/**
 * PUT /api/medical-records/:id
 * Update a medical record
 */
export const updateMedicalRecord = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const { id } = req.params;

    const record = await medicalRecordService.updateMedicalRecord(clinicId, parseInt(id), req.validatedData);

    res.json({
        success: true,
        message: 'Medical record updated successfully',
        data: record
    });
});

/**
 * DELETE /api/medical-records/:id
 * Delete a medical record
 */
export const deleteMedicalRecord = catchAsync(async (req, res) => {
    const clinicId = req.user.clinic_id;
    const { id } = req.params;

    await medicalRecordService.deleteMedicalRecord(clinicId, parseInt(id));

    res.json({
        success: true,
        message: 'Medical record deleted successfully'
    });
});

export default {
    createMedicalRecord,
    getMedicalRecords,
    getPatientMedicalRecords,
    getMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
};
