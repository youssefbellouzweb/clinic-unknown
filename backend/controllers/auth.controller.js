import * as authService from '../services/auth.service.js';
import * as passwordResetService from '../services/passwordReset.service.js';
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

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        await passwordResetService.requestPasswordReset(email);
        res.json({ success: true, message: 'If an account exists, a reset email has been sent.' });
    } catch (error) {
        logger.error('Forgot password error:', error);
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        await passwordResetService.resetPassword(token, newPassword);
        res.json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        logger.error('Reset password error:', error);
        next(error);
    }
};

export const acceptInvite = async (req, res, next) => {
    try {
        const userInvitationService = (await import('../services/userInvitation.service.js'));
        const { token, name, password } = req.body;
        const user = await userInvitationService.acceptInvitation(token, name, password);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        logger.error('Accept invite error:', error);
        next(error);
    }
};

export default {
    registerClinic,
    login,
    refreshToken,
    getCurrentUser,
    logout,
    forgotPassword,
    resetPassword,
    acceptInvite
};
