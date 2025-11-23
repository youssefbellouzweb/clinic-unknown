import db from '../config/db.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

// Stub email sender
const sendEmail = async (to, subject, text) => {
    logger.info({ to, subject, text }, '📧 Email sent (stub)');
    // In production, integrate with SendGrid/AWS SES
};

export const requestPasswordReset = async (email) => {
    const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(email);
    if (!user) {
        // Don't reveal user existence
        return true;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // 1 hour

    db.prepare(`
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
    `).run(user.id, tokenHash, expiresAt);

    const resetLink = `https://app.clinic-saas.com/reset-password?token=${token}`;
    await sendEmail(email, 'Password Reset Request', `Hi ${user.name},\n\nClick here to reset your password: ${resetLink}`);

    return true;
};

export const resetPassword = async (token, newPassword) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = db.prepare(`
        SELECT * FROM password_reset_tokens 
        WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')
    `).get(tokenHash);

    if (!resetToken) {
        throw new Error('Invalid or expired token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const transaction = db.transaction(() => {
        // Update password
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, resetToken.user_id);

        // Mark token as used
        db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id);

        // Invalidate all sessions
        db.prepare('DELETE FROM sessions WHERE user_id = ?').run(resetToken.user_id);
    });

    transaction();
    return true;
};
