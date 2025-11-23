import db from '../config/db.js';

export const searchClinics = (filters = {}) => {
    const { q, city, specialty, lat, lng, radius_km = 10, limit = 10, offset = 0 } = filters;

    let sql = `
        SELECT c.id, c.name, c.slug, c.address, c.phone, c.logo_url, c.latitude, c.longitude, cs.specialties
        FROM clinics c
        LEFT JOIN clinic_settings cs ON c.id = cs.clinic_id
        WHERE c.is_active = 1
    `;

    const params = [];

    if (q) {
        sql += ` AND (c.name LIKE ? OR c.address LIKE ?)`;
        params.push(`%${q}%`, `%${q}%`);
    }

    if (city) {
        sql += ` AND c.address LIKE ?`;
        params.push(`%${city}%`);
    }

    if (specialty) {
        sql += ` AND cs.specialties LIKE ?`;
        params.push(`%${specialty}%`);
    }

    // Geo-location search (Haversine approximation for SQLite)
    // Note: SQLite doesn't have sqrt/cos/acos by default without extensions, 
    // so we'll filter by bounding box in SQL and refine in JS if needed, 
    // or use a simplified distance check if strict accuracy isn't critical.
    // For MVP, we'll use a bounding box.
    if (lat && lng) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const radius = parseFloat(radius_km);

        // 1 degree lat ~= 111km
        // 1 degree lng ~= 111km * cos(lat)
        const latDelta = radius / 111;
        const lngDelta = radius / (111 * Math.cos(latNum * (Math.PI / 180)));

        sql += ` AND c.latitude BETWEEN ? AND ? AND c.longitude BETWEEN ? AND ?`;
        params.push(latNum - latDelta, latNum + latDelta, lngNum - lngDelta, lngNum + lngDelta);
    }

    // Count total
    const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
    const totalResult = db.prepare(countSql).get(...params);
    const total = totalResult.total;

    // Pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const clinics = db.prepare(sql).all(...params);

    // Parse specialties JSON and calculate exact distance if lat/lng provided
    const results = clinics.map(clinic => {
        const data = {
            ...clinic,
            specialties: clinic.specialties ? JSON.parse(clinic.specialties) : []
        };

        if (lat && lng && clinic.latitude && clinic.longitude) {
            // Haversine formula
            const R = 6371; // Radius of the earth in km
            const dLat = (clinic.latitude - lat) * (Math.PI / 180);
            const dLon = (clinic.longitude - lng) * (Math.PI / 180);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat * (Math.PI / 180)) * Math.cos(clinic.latitude * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            data.distance_km = parseFloat((R * c).toFixed(2));
        }

        return data;
    });

    return {
        data: results,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(total / limit)
        }
    };
};

export const getClinicProfile = (slug) => {
    const clinic = db.prepare(`
        SELECT c.id, c.name, c.slug, c.address, c.phone, c.email, c.logo_url, cs.working_hours, cs.specialties
        FROM clinics c
        LEFT JOIN clinic_settings cs ON c.id = cs.clinic_id
        WHERE c.slug = ? AND c.is_active = 1
    `).get(slug);

    if (!clinic) return null;

    // Get doctors
    const doctors = db.prepare(`
        SELECT id, name, role 
        FROM users 
        WHERE clinic_id = ? AND role = 'doctor' AND is_verified = 1
    `).all(clinic.id);

    return {
        ...clinic,
        working_hours: clinic.working_hours ? JSON.parse(clinic.working_hours) : null,
        specialties: clinic.specialties ? JSON.parse(clinic.specialties) : [],
        doctors
    };
};

export const createPublicAppointmentRequest = (requestData) => {
    const { clinicId, patientName, patientEmail, patientPhone, requestedDate, reason } = requestData;

    const result = db.prepare(`
        INSERT INTO public_appointment_requests (clinic_id, patient_name, patient_email, patient_phone, requested_date, reason)
        VALUES (@clinicId, @patientName, @patientEmail, @patientPhone, @requestedDate, @reason)
    `).run({
        clinicId,
        patientName,
        patientEmail,
        patientPhone,
        requestedDate,
        reason
    });

    return { id: result.lastInsertRowid, ...requestData, status: 'pending' };
};
