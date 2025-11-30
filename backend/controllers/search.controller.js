import searchService from '../services/search.service.js';
import logger from '../utils/logger.js';

class SearchController {
    async globalSearch(req, res) {
        try {
            const { q: query } = req.query;
            const clinicId = req.user.clinic_id;

            if (!query || query.length < 2) {
                return res.status(400).json({ error: 'Search query must be at least 2 characters' });
            }

            const results = searchService.globalSearch(query, clinicId);
            res.json({ data: results });
        } catch (error) {
            logger.error({ error: error.message }, 'Global search failed');
            res.status(500).json({ error: 'Search failed' });
        }
    }

    async searchPatients(req, res) {
        try {
            const { q: query } = req.query;
            const clinicId = req.user.clinic_id;

            if (!query || query.length < 2) {
                return res.status(400).json({ error: 'Search query must be at least 2 characters' });
            }

            const results = searchService.searchPatients(query, clinicId);
            res.json({ data: results });
        } catch (error) {
            logger.error({ error: error.message }, 'Patient search failed');
            res.status(500).json({ error: 'Search failed' });
        }
    }

    async searchAppointments(req, res) {
        try {
            const { q: query, status, dateFrom, dateTo } = req.query;
            const clinicId = req.user.clinic_id;

            const results = searchService.searchAppointments(query, clinicId, {
                status,
                dateFrom,
                dateTo
            });

            res.json({ data: results });
        } catch (error) {
            logger.error({ error: error.message }, 'Appointment search failed');
            res.status(500).json({ error: 'Search failed' });
        }
    }
}

export default new SearchController();
