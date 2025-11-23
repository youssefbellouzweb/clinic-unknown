import * as publicDirectoryService from '../services/publicDirectory.service.js';

export const searchClinics = (req, res, next) => {
    try {
        const filters = req.query;
        const result = publicDirectoryService.searchClinics(filters);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const getClinicProfile = (req, res, next) => {
    try {
        const { slug } = req.params;
        const clinic = publicDirectoryService.getClinicProfile(slug);

        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }

        res.json({ success: true, data: clinic });
    } catch (error) {
        next(error);
    }
};

export const requestAppointment = (req, res, next) => {
    try {
        const requestData = req.body;
        const result = publicDirectoryService.createPublicAppointmentRequest(requestData);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getCities = (req, res, next) => {
    // Placeholder for getting list of cities with active clinics
    // In a real app, this would query the DB for distinct cities
    res.json({ success: true, data: ['New York', 'Los Angeles', 'Chicago'] });
};

export const getSpecialties = (req, res, next) => {
    // Placeholder for getting list of specialties
    res.json({ success: true, data: ['General Practice', 'Dentistry', 'Dermatology', 'Pediatrics'] });
};
