import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export const createUser = async (clinicId, userData) => {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(`
        INSERT INTO users (clinic_id, name, email, password_hash, role, is_verified)
        VALUES (?, ?, ?, ?, ?, 1)
    `).run(clinicId, name, email, passwordHash, role);

    return {
        id: result.lastInsertRowid,
        name,
        email,
        role,
        clinic_id: clinicId
    };
};

export const getUsers = (clinicId, filters = {}) => {
    let sql = 'SELECT id, clinic_id, name, email, role, is_verified, created_at FROM users WHERE clinic_id = ?';
    const params = [clinicId];

    if (filters.role) {
        sql += ' AND role = ?';
        params.push(filters.role);
    }

    if (filters.q) {
        sql += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.q}%`, `%${filters.q}%`);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(parseInt(filters.offset));
    }

    return db.prepare(sql).all(...params);
};

export const getUserById = (userId, clinicId) => {
    return db.prepare(`
        SELECT id, clinic_id, name, email, role, is_verified, created_at 
        FROM users 
        WHERE id = ? AND clinic_id = ?
    `).get(userId, clinicId);
};

export const updateUser = (userId, clinicId, updates) => {
    const allowedFields = ['name', 'email', 'role'];
    const fieldsToUpdate = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            fieldsToUpdate.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (fieldsToUpdate.length === 0) return getUserById(userId, clinicId);

    values.push(userId, clinicId);

    const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND clinic_id = ?`;
    db.prepare(sql).run(...values);

    return getUserById(userId, clinicId);
};

export const deleteUser = (userId, clinicId) => {
    // Soft delete by setting is_verified to 0 or use a deleted_at column
    db.prepare('UPDATE users SET is_verified = 0 WHERE id = ? AND clinic_id = ?').run(userId, clinicId);
    return true;
};
