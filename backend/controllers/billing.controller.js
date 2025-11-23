import db from '../config/db.js';
import logger from '../utils/logger.js';

// Create bill
export const createBill = (req, res, next) => {
    try {
        const { patient_id, amount, status } = req.body;
        const clinicId = req.user.clinicId;
        const userId = req.user.id;

        const result = db.prepare(`
            INSERT INTO bills (clinic_id, patient_id, amount, status, created_by)
            VALUES (?, ?, ?, ?, ?)
        `).run(clinicId, patient_id, amount, status || 'pending', userId);

        const newBill = db.prepare('SELECT * FROM bills WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: 'Bill created successfully',
            data: newBill
        });
    } catch (error) {
        logger.error('Create bill error:', error);
        next(error);
    }
};

// Get bills for clinic
export const getBills = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;
        const { patient_id, status } = req.query;

        let sql = `
            SELECT b.*, p.name as patient_name, u.name as created_by_name
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            LEFT JOIN users u ON b.created_by = u.id
            WHERE b.clinic_id = ?
        `;
        const params = [clinicId];

        if (patient_id) {
            sql += ' AND b.patient_id = ?';
            params.push(patient_id);
        }
        if (status) {
            sql += ' AND b.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY b.created_at DESC';

        const bills = db.prepare(sql).all(...params);

        res.json({ success: true, data: bills });
    } catch (error) {
        logger.error('Get bills error:', error);
        next(error);
    }
};

// Update bill
export const updateBill = (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, status } = req.body;
        const clinicId = req.user.clinicId;

        const bill = db.prepare('SELECT * FROM bills WHERE id = ? AND clinic_id = ?').get(id, clinicId);

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        const updates = [];
        const params = [];

        if (amount !== undefined) {
            updates.push('amount = ?');
            params.push(amount);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length > 0) {
            params.push(id);
            db.prepare(`UPDATE bills SET ${updates.join(', ')} WHERE id = ?`).run(...params);
        }

        const updatedBill = db.prepare('SELECT * FROM bills WHERE id = ?').get(id);

        res.json({
            success: true,
            message: 'Bill updated successfully',
            data: updatedBill
        });
    } catch (error) {
        logger.error('Update bill error:', error);
        next(error);
    }
};

// Delete bill
export const deleteBill = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const bill = db.prepare('SELECT * FROM bills WHERE id = ? AND clinic_id = ?').get(id, clinicId);

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        db.prepare('DELETE FROM bills WHERE id = ?').run(id);

        res.json({ success: true, message: 'Bill deleted successfully' });
    } catch (error) {
        logger.error('Delete bill error:', error);
        next(error);
    }
};
