import db from '../config/db.js';
import logger from '../utils/logger.js';

class InvoiceService {
    /**
     * Create a new invoice
     * @param {object} data - Invoice data
     * @returns {object} Created invoice
     */
    createInvoice(data) {
        const { clinicId, patientId, items, createdBy, status = 'pending', dueDate } = data;

        const createTransaction = db.transaction(() => {
            // Calculate total amount
            const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

            // Insert bill
            const stmt = db.prepare(`
                INSERT INTO bills (clinic_id, patient_id, amount, status, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `);

            const result = stmt.run(clinicId, patientId, totalAmount, status, createdBy);
            const billId = result.lastInsertRowid;

            // Insert items
            const itemStmt = db.prepare(`
                INSERT INTO invoice_items (bill_id, description, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?)
            `);

            for (const item of items) {
                itemStmt.run(
                    billId,
                    item.description,
                    item.quantity,
                    item.unitPrice,
                    item.quantity * item.unitPrice
                );
            }

            return this.getInvoiceById(billId, clinicId);
        });

        return createTransaction();
    }

    /**
     * Get invoice by ID
     */
    getInvoiceById(id, clinicId) {
        const invoice = db.prepare(`
            SELECT b.*, p.name as patient_name, p.email as patient_email,
                   u.name as creator_name
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            LEFT JOIN users u ON b.created_by = u.id
            WHERE b.id = ? AND b.clinic_id = ?
        `).get(id, clinicId);

        if (!invoice) return null;

        const items = db.prepare(`
            SELECT * FROM invoice_items WHERE bill_id = ?
        `).all(id);

        return { ...invoice, items };
    }

    /**
     * Get clinic invoices
     */
    getClinicInvoices(clinicId, filters = {}) {
        let query = `
            SELECT b.*, p.name as patient_name 
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            WHERE b.clinic_id = ?
        `;
        const params = [clinicId];

        if (filters.status) {
            query += ` AND b.status = ?`;
            params.push(filters.status);
        }

        if (filters.patientId) {
            query += ` AND b.patient_id = ?`;
            params.push(filters.patientId);
        }

        query += ` ORDER BY b.created_at DESC`;

        return db.prepare(query).all(...params);
    }

    /**
     * Update invoice status
     */
    updateStatus(id, clinicId, status) {
        const stmt = db.prepare(`
            UPDATE bills SET status = ? WHERE id = ? AND clinic_id = ?
        `);
        return stmt.run(status, id, clinicId);
    }
}

export default new InvoiceService();
