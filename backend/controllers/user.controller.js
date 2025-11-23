import bcrypt from 'bcryptjs';
import * as userService from '../services/user.service.js';
import * as userInvitationService from '../services/userInvitation.service.js';
import logger from '../utils/logger.js';

// Get all users in clinic
export const getUsers = (req, res, next) => {
    try {
        const clinicId = req.user.clinicId;

        const users = db.prepare(
            'SELECT id, clinic_id, name, email, role, created_at FROM users WHERE clinic_id = ? ORDER BY created_at DESC'
        ).all(clinicId);

        res.json({ success: true, data: users });
    } catch (error) {
        logger.error('Get users error:', error);
        next(error);
    }
};

// Create user
export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const clinicId = req.user.clinicId;

        // Check if email already exists
        const existingUser = db.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).get(email);

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const result = db.prepare(
            'INSERT INTO users (clinic_id, name, email, role, password_hash, is_verified) VALUES (?, ?, ?, ?, ?, 1)'
        ).run(clinicId, name, email, role, password_hash);

        const newUser = db.prepare(
            'SELECT id, clinic_id, name, email, role, created_at FROM users WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        logger.error('Create user error:', error);
        next(error);
    }
};

// Get user by ID
export const getUserById = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        const user = db.prepare(
            'SELECT id, clinic_id, name, email, role, created_at FROM users WHERE id = ? AND clinic_id = ?'
        ).get(id, clinicId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        logger.error('Get user by ID error:', error);
        next(error);
    }
};

// Update user
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;
        const clinicId = req.user.clinicId;

        // Verify user belongs to same clinic
        const user = db.prepare('SELECT * FROM users WHERE id = ? AND clinic_id = ?').get(id, clinicId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            params.push(email);
        }
        if (role !== undefined) {
            updates.push('role = ?');
            params.push(role);
        }
        if (password !== undefined) {
            const password_hash = await bcrypt.hash(password, 10);
            updates.push('password_hash = ?');
            params.push(password_hash);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);

        db.prepare(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
        ).run(...params);

        const updatedUser = db.prepare(
            'SELECT id, clinic_id, name, email, role, created_at FROM users WHERE id = ?'
        ).get(id);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        logger.error('Update user error:', error);
        next(error);
    }
};

// Delete user
export const deleteUser = (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinicId;

        // Verify user belongs to same clinic
        const user = db.prepare('SELECT * FROM users WHERE id = ? AND clinic_id = ?').get(id, clinicId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(id);

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        logger.error('Delete user error:', error);
        next(error);
    }
};

export const inviteUser = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        // Ensure role is allowed
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Only owners and admins can invite users' });
        }

        const result = await userInvitationService.createInvitation(req.user.clinicId, email, role, req.user.id);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        logger.error('Invite user error:', error);
        next(error);
    }
};

export default {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    inviteUser
};
