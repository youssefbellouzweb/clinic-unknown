import db from '../config/db.js';
import { createAuditLog } from '../middleware/audit.js';

export const getClinicSettings = (clinicId) => {
    const clinic = db.prepare(`
        SELECT id, name, email, phone, address, logo_url, 
               specialties, working_hours, services, timezone, locale, metadata
        FROM clinics 
        WHERE id = ?
    `).get(clinicId);

    if (!clinic) throw new Error('Clinic not found');

    // Parse JSON fields
    try {
        if (clinic.specialties) clinic.specialties = JSON.parse(clinic.specialties);
        if (clinic.working_hours) clinic.working_hours = JSON.parse(clinic.working_hours);
        if (clinic.services) clinic.services = JSON.parse(clinic.services);
        if (clinic.metadata) clinic.metadata = JSON.parse(clinic.metadata);
    } catch (e) {
        // Ignore parsing errors, return raw or empty
    }

    return clinic;
};

export const updateClinicSettings = (clinicId, updates, userId) => {
    const allowedFields = [
        'name', 'phone', 'address', 'specialties', 'working_hours',
        'services', 'timezone', 'locale', 'metadata'
    ];

    const fieldsToUpdate = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            fieldsToUpdate.push(`${key} = ?`);
            // Stringify JSON fields
            if (['specialties', 'working_hours', 'services', 'metadata'].includes(key)) {
                values.push(JSON.stringify(value));
            } else {
                values.push(value);
            }
        }
    }

    if (fieldsToUpdate.length === 0) return getClinicSettings(clinicId);

    values.push(clinicId);

    const sql = `UPDATE clinics SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    // Audit log is handled by middleware, but we can add specific log here if needed

    return getClinicSettings(clinicId);
};

export const updateLogo = (clinicId, logoUrl) => {
    db.prepare('UPDATE clinics SET logo_url = ? WHERE id = ?').run(logoUrl, clinicId);
    return { logo_url: logoUrl };
};

export const getSettingsSchema = () => {
    return {
        specialties: { type: 'array', items: { type: 'string' } },
        working_hours: {
            type: 'object',
            properties: {
                mon: { type: 'array', items: { type: 'string' } },
                // ... other days
            }
        },
        services: { type: 'array', items: { type: 'string' } },
        timezone: { type: 'string', enum: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'Asia/Tokyo'] }, // Example
        locale: { type: 'string', enum: ['en', 'ar', 'fr', 'es'] }
    };
};
