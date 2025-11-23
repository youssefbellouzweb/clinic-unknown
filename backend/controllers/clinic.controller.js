import db from '../config/db.js';
import logger from '../utils/logger.js';

// Get my clinic details
export const getMyClinic = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;

        const clinic = db.prepare('SELECT * FROM clinics WHERE id = ?').get(clinicId);
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }

        res.json({ success: true, data: clinic });
    } catch (error) {
        logger.error('Get my clinic error:', error);
        next(error);
    }
};

// Update clinic details
export const updateClinic = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const { name, phone, address, website } = req.body;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (address !== undefined) {
            updates.push('address = ?');
            params.push(address);
        }
        if (website !== undefined) {
            updates.push('website = ?');
            params.push(website);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(clinicId);

        db.prepare(
            `UPDATE clinics SET ${updates.join(', ')} WHERE id = ?`
        ).run(...params);

        const updatedClinic = db.prepare('SELECT * FROM clinics WHERE id = ?').get(clinicId);

        res.json({
            success: true,
            message: 'Clinic updated successfully',
            data: updatedClinic
        });
    } catch (error) {
        logger.error('Update clinic error:', error);
        next(error);
    }
};
