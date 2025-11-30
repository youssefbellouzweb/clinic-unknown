import reportService from '../services/report.service.js';
import logger from '../utils/logger.js';

class ReportController {
    async generateReport(req, res) {
        try {
            const { type, format = 'pdf', dateFrom, dateTo } = req.query;
            const clinicId = req.user.clinic_id;

            if (!type) {
                return res.status(400).json({ error: 'Report type is required' });
            }

            let buffer;
            let filename;
            let contentType;

            switch (type) {
                case 'appointments':
                    if (!dateFrom || !dateTo) {
                        return res.status(400).json({ error: 'Date range is required' });
                    }
                    buffer = await reportService.generateAppointmentsReport(clinicId, dateFrom, dateTo, format);
                    filename = `appointments_${dateFrom}_${dateTo}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
                    break;

                case 'revenue':
                    if (!dateFrom || !dateTo) {
                        return res.status(400).json({ error: 'Date range is required' });
                    }
                    buffer = await reportService.generateRevenueReport(clinicId, dateFrom, dateTo, format);
                    filename = `revenue_${dateFrom}_${dateTo}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
                    break;

                case 'patients':
                    buffer = await reportService.generatePatientsReport(clinicId, format);
                    filename = `patients_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
                    break;

                default:
                    return res.status(400).json({ error: 'Invalid report type' });
            }

            contentType = format === 'pdf'
                ? 'application/pdf'
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            logger.error({ error: error.message }, 'Report generation failed');
            res.status(500).json({ error: 'Failed to generate report' });
        }
    }
}

export default new ReportController();
