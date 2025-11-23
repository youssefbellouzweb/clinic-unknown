import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export const registerClinic = async (clinicData, ownerData) => {
    const { name, email, phone, address } = clinicData;
    const { name: ownerName, email: ownerEmail, password: ownerPassword } = ownerData;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Transaction for creating clinic and owner
    const transaction = db.transaction((clinic, owner) => {
        // Check if clinic slug or email exists
        const existingClinic = db.prepare('SELECT id FROM clinics WHERE slug = ? OR email = ?').get(slug, email);
        if (existingClinic) {
            throw new Error('Clinic with this name or email already exists');
        }

        // Check if owner email exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(ownerEmail);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create Clinic
        const insertClinic = db.prepare(`
            INSERT INTO clinics (name, slug, email, phone, address, is_active)
            VALUES (@name, @slug, @email, @phone, @address, 1)
        `);

        const clinicResult = insertClinic.run({ name, slug, email, phone, address });
        const clinicId = clinicResult.lastInsertRowid;

        // Create Owner
        const hashedPassword = bcrypt.hashSync(ownerPassword, 10);
        const insertUser = db.prepare(`
            INSERT INTO users (clinic_id, name, email, password_hash, role, is_verified)
            VALUES (@clinicId, @name, @email, @passwordHash, 'owner', 0)
        `);

        const userResult = insertUser.run({
            clinicId,
            name: ownerName,
            email: ownerEmail,
            passwordHash: hashedPassword
        });

        return { clinicId, userId: userResult.lastInsertRowid, slug };
    });

    try {
        const result = transaction(clinicData, ownerData);
        logger.info(`Registered new clinic: ${name} (${result.slug})`);

        // TODO: Send verification email

        return result;
    } catch (error) {
        logger.error('Error registering clinic:', error);
        throw error;
    }
};

export const getClinicBySlug = (slug) => {
    return db.prepare('SELECT * FROM clinics WHERE slug = ?').get(slug);
};
