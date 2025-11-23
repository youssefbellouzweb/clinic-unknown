import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export const login = async (email, password) => {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check for account lockout
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
        throw new Error('Account locked. Please try again later.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        // Increment failed attempts
        const attempts = (user.failed_login_attempts || 0) + 1;
        let lockoutUntil = null;

        if (attempts >= 5) {
            lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
        }

        db.prepare('UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?')
            .run(attempts, lockoutUntil, user.id);

        throw new Error('Invalid credentials');
    }

    // Reset failed attempts on successful login
    db.prepare('UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = ?')
        .run(user.id);

    if (!user.is_verified && user.role === 'owner') {
        // Optional: enforce verification for owners
    }

    // Generate Tokens
    const accessToken = jwt.sign(
        { id: user.id, clinicId: user.clinic_id, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Store refresh token
    db.prepare(`
        INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
        VALUES (?, ?, ?)
    `).run(user.id, refreshTokenHash, expiresAt);

    // Update last login (if column exists, but we didn't add it in MVP schema, so skipping)

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            clinicId: user.clinic_id
        },
        accessToken,
        refreshToken
    };
};

export const refreshAccessToken = (refreshToken) => {
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = db.prepare(`
        SELECT s.*, u.id as user_id, u.clinic_id, u.role, u.name, u.email
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.refresh_token_hash = ? AND s.expires_at > datetime('now')
    `).get(refreshTokenHash);

    if (!session) {
        throw new Error('Invalid or expired refresh token');
    }

    // Rotate token
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Transaction to delete old and insert new
    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
        db.prepare(`
            INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
            VALUES (?, ?, ?)
        `).run(session.user_id, newRefreshTokenHash, newExpiresAt);
    });

    transaction();

    const newAccessToken = jwt.sign(
        { id: session.user_id, clinicId: session.clinic_id, role: session.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};

export const logout = (refreshToken) => {
    if (!refreshToken) return;
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    db.prepare('DELETE FROM sessions WHERE refresh_token_hash = ?').run(refreshTokenHash);
};
