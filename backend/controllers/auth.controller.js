import * as authService from '../services/auth.service.js';
import * as passwordResetService from '../services/passwordReset.service.js';
import logger from '../utils/logger.js';
import logger from '../utils/logger.js';

export const registerClinic = async (req, res, next) => {
    try {
        const { clinic, owner } = req.body;
        const result = await clinicService.registerClinic(clinic, owner);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        // Set refresh token cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken
            }
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        const result = await authService.refreshAccessToken(refreshToken);

        // Rotate refresh token cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            success: true,
            data: { accessToken: result.accessToken }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        authService.logout(refreshToken);

        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = (req, res) => {
    res.json({ success: true, data: req.user });
};
