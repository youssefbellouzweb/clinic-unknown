import db from '../config/db.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Stub email sender
const sendEmail = async (to, subject, text) => {
    logger.info({ to, subject, text }, '📧 Email sent (stub)');
};

export const createInvitation = async (clinicId, email, role, createdBy) => {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    db.prepare(`
        INSERT INTO user_invitations (clinic_id, email, role, token_hash, expires_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(clinicId, email, role, tokenHash, expiresAt, createdBy);

    const inviteLink = `https://app.clinic-saas.com/accept-invite?token=${token}`;
    await sendEmail(email, 'You have been invited to join Clinic SaaS', `Click here to accept: ${inviteLink}`);

    return { email, role, expiresAt };
};

export const acceptInvitation = async (token, name, password) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = db.prepare(`
        SELECT * FROM user_invitations 
        WHERE token_hash = ? AND accepted = 0 AND expires_at > datetime('now')
    `).get(tokenHash);

    if (!invitation) {
        throw new Error('Invalid or expired invitation token');
    }

    // Create user
    // Note: We need to import auth service or duplicate user creation logic here. 
    // To avoid circular deps, we'll duplicate simple creation or move creation to a shared user service.
    // For MVP, we'll do direct insert here.

    const bcrypt = (await import('bcryptjs')).default;
    const passwordHash = await bcrypt.hash(password, 10);

    const transaction = db.transaction(() => {
        const result = db.prepare(`
            INSERT INTO users (clinic_id, name, email, password_hash, role, is_verified)
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(invitation.clinic_id, name, invitation.email, passwordHash, invitation.role);

        db.prepare('UPDATE user_invitations SET accepted = 1 WHERE id = ?').run(invitation.id);

        return result.lastInsertRowid;
    });

    const userId = transaction();
    return { id: userId, email: invitation.email, role: invitation.role };
};
