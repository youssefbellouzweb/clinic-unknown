import invoiceService from '../services/invoice.service.js';
import logger from '../utils/logger.js';

class BillingController {
    async createInvoice(req, res) {
        try {
            const { patientId, items, status, dueDate } = req.body;
            const clinicId = req.user.clinic_id;
            const createdBy = req.user.id;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Invoice must have at least one item' });
            }

            const invoice = invoiceService.createInvoice({
                clinicId,
                patientId,
                items,
                createdBy,
                status,
                dueDate
            });

            res.status(201).json({ message: 'Invoice created successfully', data: invoice });
        } catch (error) {
            logger.error({ error: error.message }, 'Create invoice failed');
            res.status(500).json({ error: 'Failed to create invoice' });
        }
    }

    async getInvoices(req, res) {
        try {
            const clinicId = req.user.clinic_id;
            const { status, patientId } = req.query;

            const invoices = invoiceService.getClinicInvoices(clinicId, { status, patientId });
            res.json({ data: invoices });
        } catch (error) {
            logger.error({ error: error.message }, 'Get invoices failed');
            res.status(500).json({ error: 'Failed to retrieve invoices' });
        }
    }

    async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const clinicId = req.user.clinic_id;

            const invoice = invoiceService.getInvoiceById(id, clinicId);
            if (!invoice) {
                return res.status(404).json({ error: 'Invoice not found' });
            }

            res.json({ data: invoice });
        } catch (error) {
            logger.error({ error: error.message }, 'Get invoice details failed');
            res.status(500).json({ error: 'Failed to retrieve invoice details' });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const clinicId = req.user.clinic_id;

            if (!['pending', 'paid', 'cancelled'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            invoiceService.updateStatus(id, clinicId, status);
            res.json({ message: 'Invoice status updated' });
        } catch (error) {
            logger.error({ error: error.message }, 'Update invoice status failed');
            res.status(500).json({ error: 'Failed to update invoice status' });
        }
    }
}

export default new BillingController();
