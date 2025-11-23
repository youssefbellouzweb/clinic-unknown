import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from './config/db.js';
import logger from './utils/logger.js';
import { errorHandler } from './utils/errorHandler.js';
import { requestLogger } from './middleware/logging.js';
import { securityHeaders, sanitizeInput, additionalSecurity } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiting.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import clinicRoutes from './routes/clinic.routes.js';
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import medicalRecordRoutes from './routes/medicalRecord.routes.js';
import visitRoutes from './routes/visit.routes.js';
import patientPortalRoutes from './routes/patientPortal.routes.js';
import visitorRoutes from './routes/visitor.routes.js';
import superAdminRoutes from './routes/superAdmin.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import labRoutes from './routes/lab.routes.js';
import billingRoutes from './routes/billing.routes.js';
import docsRoutes from './routes/docs.routes.js';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (for rate limiting and IP detection behind reverse proxy)
app.set('trust proxy', 1);

// HTTPS Redirect (Production only)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Security middleware (must be early in the chain)
app.use(securityHeaders);
app.use(additionalSecurity);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4321',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Input sanitization
app.use(sanitizeInput);

// Rate limiting (apply to all routes)
app.use('/api/', apiLimiter);

// Health check (no auth required)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Clinic Management API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

import clinicSettingsRoutes from './routes/clinicSettings.routes.js';
import dashboardAnalyticsRoutes from './routes/dashboardAnalytics.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import gdprRoutes from './routes/gdpr.routes.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
// Dashboard Routes
app.use('/api/dashboard/clinic', clinicSettingsRoutes);
app.use('/api/dashboard/analytics', dashboardAnalyticsRoutes);
app.use('/api/dashboard/audit-logs', auditLogRoutes);
app.use('/api/dashboard/gdpr', gdprRoutes);
app.use('/api/dashboard/users', userRoutes); // Assuming this exists or will be createds);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/patient-portal', patientPortalRoutes);
app.use('/api/visitor', visitorRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);
app.use('/docs', docsRoutes);


// 404 handler
app.use((req, res) => {
    logger.warn({ url: req.url, method: req.method }, 'Route not found');
    res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
    try {
        // Database is initialized on import
        logger.info('Database initialized successfully');

        const server = app.listen(PORT, () => {
            logger.info({
                port: PORT,
                environment: process.env.NODE_ENV,
                frontendUrl: process.env.FRONTEND_URL
            }, `🚀 Server running on http://localhost:${PORT}`);
        });

        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            logger.info({ signal }, 'Received shutdown signal');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
};

startServer();
