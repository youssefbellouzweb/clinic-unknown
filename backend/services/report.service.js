import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import db from '../config/db.js';
import logger from '../utils/logger.js';

class ReportService {
    /**
     * Generate appointments report
     */
    async generateAppointmentsReport(clinicId, dateFrom, dateTo, format = 'pdf') {
        try {
            const appointments = db.prepare(`
                SELECT a.*, p.name as patient_name, u.name as doctor_name
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                LEFT JOIN users u ON a.doctor_id = u.id
                WHERE a.clinic_id = ? AND date(a.datetime) BETWEEN ? AND ?
                ORDER BY a.datetime DESC
            `).all(clinicId, dateFrom, dateTo);

            if (format === 'pdf') {
                return this.generateAppointmentsPDF(appointments, dateFrom, dateTo);
            } else {
                return this.generateAppointmentsExcel(appointments, dateFrom, dateTo);
            }
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to generate appointments report');
            throw error;
        }
    }

    /**
     * Generate revenue report
     */
    async generateRevenueReport(clinicId, dateFrom, dateTo, format = 'pdf') {
        try {
            const bills = db.prepare(`
                SELECT b.*, p.name as patient_name
                FROM bills b
                JOIN patients p ON b.patient_id = p.id
                WHERE b.clinic_id = ? AND date(b.created_at) BETWEEN ? AND ?
                ORDER BY b.created_at DESC
            `).all(clinicId, dateFrom, dateTo);

            const total = bills.reduce((sum, bill) => sum + bill.total_amount, 0);
            const paid = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.total_amount, 0);
            const pending = bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + bill.total_amount, 0);

            const summary = { total, paid, pending, count: bills.length };

            if (format === 'pdf') {
                return this.generateRevenuePDF(bills, summary, dateFrom, dateTo);
            } else {
                return this.generateRevenueExcel(bills, summary, dateFrom, dateTo);
            }
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to generate revenue report');
            throw error;
        }
    }

    /**
     * Generate patients report
     */
    async generatePatientsReport(clinicId, format = 'pdf') {
        try {
            const patients = db.prepare(`
                SELECT * FROM patients
                WHERE clinic_id = ?
                ORDER BY created_at DESC
            `).all(clinicId);

            const stats = {
                total: patients.length,
                male: patients.filter(p => p.gender === 'male').length,
                female: patients.filter(p => p.gender === 'female').length
            };

            if (format === 'pdf') {
                return this.generatePatientsPDF(patients, stats);
            } else {
                return this.generatePatientsExcel(patients, stats);
            }
        } catch (error) {
            logger.error({ error: error.message }, 'Failed to generate patients report');
            throw error;
        }
    }

    // PDF Generation Methods
    generateAppointmentsPDF(appointments, dateFrom, dateTo) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Header
                doc.fontSize(20).text('Appointments Report', { align: 'center' });
                doc.fontSize(12).text(`Period: ${dateFrom} to ${dateTo}`, { align: 'center' });
                doc.moveDown();

                // Summary
                doc.fontSize(14).text(`Total Appointments: ${appointments.length}`);
                doc.moveDown();

                // Table Header
                doc.fontSize(10);
                const startY = doc.y;
                doc.text('Date', 50, startY);
                doc.text('Patient', 150, startY);
                doc.text('Doctor', 300, startY);
                doc.text('Status', 450, startY);
                doc.moveDown();

                // Table Rows
                appointments.forEach(apt => {
                    const y = doc.y;
                    doc.text(new Date(apt.datetime).toLocaleDateString(), 50, y);
                    doc.text(apt.patient_name, 150, y);
                    doc.text(apt.doctor_name || 'N/A', 300, y);
                    doc.text(apt.status, 450, y);
                    doc.moveDown(0.5);
                });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    generateRevenuePDF(bills, summary, dateFrom, dateTo) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Header
                doc.fontSize(20).text('Revenue Report', { align: 'center' });
                doc.fontSize(12).text(`Period: ${dateFrom} to ${dateTo}`, { align: 'center' });
                doc.moveDown();

                // Summary
                doc.fontSize(14).text('Summary');
                doc.fontSize(12);
                doc.text(`Total Revenue: $${summary.total.toFixed(2)}`);
                doc.text(`Paid: $${summary.paid.toFixed(2)}`);
                doc.text(`Pending: $${summary.pending.toFixed(2)}`);
                doc.text(`Total Bills: ${summary.count}`);
                doc.moveDown();

                // Table
                doc.fontSize(10);
                const startY = doc.y;
                doc.text('Date', 50, startY);
                doc.text('Patient', 150, startY);
                doc.text('Amount', 350, startY);
                doc.text('Status', 450, startY);
                doc.moveDown();

                bills.forEach(bill => {
                    const y = doc.y;
                    doc.text(new Date(bill.created_at).toLocaleDateString(), 50, y);
                    doc.text(bill.patient_name, 150, y);
                    doc.text(`$${bill.total_amount.toFixed(2)}`, 350, y);
                    doc.text(bill.status, 450, y);
                    doc.moveDown(0.5);
                });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    generatePatientsPDF(patients, stats) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Header
                doc.fontSize(20).text('Patients Report', { align: 'center' });
                doc.moveDown();

                // Stats
                doc.fontSize(14).text('Statistics');
                doc.fontSize(12);
                doc.text(`Total Patients: ${stats.total}`);
                doc.text(`Male: ${stats.male}`);
                doc.text(`Female: ${stats.female}`);
                doc.moveDown();

                // Table
                doc.fontSize(10);
                const startY = doc.y;
                doc.text('Name', 50, startY);
                doc.text('Email', 200, startY);
                doc.text('Phone', 350, startY);
                doc.text('Gender', 480, startY);
                doc.moveDown();

                patients.forEach(patient => {
                    const y = doc.y;
                    doc.text(patient.name, 50, y);
                    doc.text(patient.email, 200, y);
                    doc.text(patient.phone, 350, y);
                    doc.text(patient.gender || 'N/A', 480, y);
                    doc.moveDown(0.5);
                });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Excel Generation Methods
    async generateAppointmentsExcel(appointments, dateFrom, dateTo) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Appointments');

        // Header
        worksheet.addRow(['Appointments Report']);
        worksheet.addRow([`Period: ${dateFrom} to ${dateTo}`]);
        worksheet.addRow([]);
        worksheet.addRow([`Total Appointments: ${appointments.length}`]);
        worksheet.addRow([]);

        // Table Header
        worksheet.addRow(['Date', 'Patient', 'Doctor', 'Status']);

        // Data
        appointments.forEach(apt => {
            worksheet.addRow([
                new Date(apt.datetime).toLocaleDateString(),
                apt.patient_name,
                apt.doctor_name || 'N/A',
                apt.status
            ]);
        });

        return await workbook.xlsx.writeBuffer();
    }

    async generateRevenueExcel(bills, summary, dateFrom, dateTo) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Revenue');

        // Header
        worksheet.addRow(['Revenue Report']);
        worksheet.addRow([`Period: ${dateFrom} to ${dateTo}`]);
        worksheet.addRow([]);

        // Summary
        worksheet.addRow(['Summary']);
        worksheet.addRow(['Total Revenue', `$${summary.total.toFixed(2)}`]);
        worksheet.addRow(['Paid', `$${summary.paid.toFixed(2)}`]);
        worksheet.addRow(['Pending', `$${summary.pending.toFixed(2)}`]);
        worksheet.addRow(['Total Bills', summary.count]);
        worksheet.addRow([]);

        // Table Header
        worksheet.addRow(['Date', 'Patient', 'Amount', 'Status']);

        // Data
        bills.forEach(bill => {
            worksheet.addRow([
                new Date(bill.created_at).toLocaleDateString(),
                bill.patient_name,
                `$${bill.total_amount.toFixed(2)}`,
                bill.status
            ]);
        });

        return await workbook.xlsx.writeBuffer();
    }

    async generatePatientsExcel(patients, stats) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Patients');

        // Header
        worksheet.addRow(['Patients Report']);
        worksheet.addRow([]);

        // Stats
        worksheet.addRow(['Statistics']);
        worksheet.addRow(['Total Patients', stats.total]);
        worksheet.addRow(['Male', stats.male]);
        worksheet.addRow(['Female', stats.female]);
        worksheet.addRow([]);

        // Table Header
        worksheet.addRow(['Name', 'Email', 'Phone', 'Gender']);

        // Data
        patients.forEach(patient => {
            worksheet.addRow([
                patient.name,
                patient.email,
                patient.phone,
                patient.gender || 'N/A'
            ]);
        });

        return await workbook.xlsx.writeBuffer();
    }
}

export default new ReportService();
