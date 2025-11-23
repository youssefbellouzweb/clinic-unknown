import db from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'config', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function seed() {
    logger.info('🌱 Starting database seed...');

    try {
        // Execute schema
        db.exec(schema);
        logger.info('✅ Schema applied successfully');

        // Check if data exists
        const existingClinics = db.prepare('SELECT count(*) as count FROM clinics').get();
        if (existingClinics.count > 0) {
            logger.info('⚠️ Database already seeded, skipping...');
            return;
        }

        // Create Clinics
        const insertClinic = db.prepare(`
            INSERT INTO clinics (name, slug, email, phone, address, latitude, longitude)
            VALUES (@name, @slug, @email, @phone, @address, @latitude, @longitude)
        `);

        const clinics = [
            {
                name: 'City Health Clinic',
                slug: 'city-health',
                email: 'contact@cityhealth.com',
                phone: '555-0123',
                address: '123 Main St, New York, NY',
                latitude: 40.7128,
                longitude: -74.0060
            },
            {
                name: 'Valley Medical Center',
                slug: 'valley-med',
                email: 'info@valleymed.com',
                phone: '555-0456',
                address: '456 Valley Rd, Los Angeles, CA',
                latitude: 34.0522,
                longitude: -118.2437
            }
        ];

        const clinicIds = [];
        for (const clinic of clinics) {
            const info = insertClinic.run(clinic);
            clinicIds.push(info.lastInsertRowid);
            logger.info(`✅ Created clinic: ${clinic.name}`);
        }

        // Create Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const insertUser = db.prepare(`
            INSERT INTO users (clinic_id, name, email, password_hash, role, is_verified)
            VALUES (@clinic_id, @name, @email, @password_hash, @role, @is_verified)
        `);

        const users = [
            // City Health Users
            { clinic_id: clinicIds[0], name: 'Admin User', email: 'admin@cityhealth.com', password_hash: hashedPassword, role: 'owner', is_verified: 1 },
            { clinic_id: clinicIds[0], name: 'Dr. Sarah Smith', email: 'sarah@cityhealth.com', password_hash: hashedPassword, role: 'doctor', is_verified: 1 },
            { clinic_id: clinicIds[0], name: 'Nurse Emily', email: 'emily@cityhealth.com', password_hash: hashedPassword, role: 'nurse', is_verified: 1 },
            { clinic_id: clinicIds[0], name: 'Receptionist Bob', email: 'robert@cityhealth.com', password_hash: hashedPassword, role: 'reception', is_verified: 1 },
            { clinic_id: clinicIds[0], name: 'Lab Tech Mike', email: 'mike@cityhealth.com', password_hash: hashedPassword, role: 'lab', is_verified: 1 },

            // Valley Med Users
            { clinic_id: clinicIds[1], name: 'Dr. John Doe', email: 'john@valleymed.com', password_hash: hashedPassword, role: 'owner', is_verified: 1 },

            // Super Admin
            { clinic_id: null, name: 'Super Admin', email: 'super@platform.com', password_hash: hashedPassword, role: 'super_admin', is_verified: 1 }
        ];

        const userIds = [];
        for (const user of users) {
            const info = insertUser.run(user);
            userIds.push(info.lastInsertRowid);
            logger.info(`✅ Created user: ${user.name} (${user.role})`);
        }

        // Create Patients
        const insertPatient = db.prepare(`
            INSERT INTO patients (clinic_id, name, phone, birthdate, gender, notes)
            VALUES (@clinic_id, @name, @phone, @birthdate, @gender, @notes)
        `);

        const patients = [
            { clinic_id: clinicIds[0], name: 'Alice Johnson', phone: '555-1111', birthdate: '1985-04-12', gender: 'female', notes: 'Allergic to penicillin' },
            { clinic_id: clinicIds[0], name: 'Bob Williams', phone: '555-2222', birthdate: '1990-08-23', gender: 'male', notes: 'Chronic back pain' },
            { clinic_id: clinicIds[1], name: 'Charlie Brown', phone: '555-3333', birthdate: '1978-12-05', gender: 'male', notes: 'Regular checkup' }
        ];

        const patientIds = [];
        for (const patient of patients) {
            const info = insertPatient.run(patient);
            patientIds.push(info.lastInsertRowid);
            logger.info(`✅ Created patient: ${patient.name}`);
        }

        // Create Appointments
        const insertAppointment = db.prepare(`
            INSERT INTO appointments (clinic_id, patient_id, doctor_id, datetime, status, created_by)
            VALUES (@clinic_id, @patient_id, @doctor_id, @datetime, @status, @created_by)
        `);

        const appointments = [
            { clinic_id: clinicIds[0], patient_id: patientIds[0], doctor_id: userIds[1], datetime: new Date(Date.now() + 86400000).toISOString(), status: 'confirmed', created_by: userIds[3] },
            { clinic_id: clinicIds[0], patient_id: patientIds[1], doctor_id: userIds[1], datetime: new Date(Date.now() + 172800000).toISOString(), status: 'pending', created_by: userIds[3] },
            { clinic_id: clinicIds[0], patient_id: patientIds[0], doctor_id: userIds[1], datetime: new Date(Date.now() - 86400000).toISOString(), status: 'completed', created_by: userIds[3] }
        ];

        const appointmentIds = [];
        for (const appointment of appointments) {
            const info = insertAppointment.run(appointment);
            appointmentIds.push(info.lastInsertRowid);
            logger.info(`✅ Created appointment for patient ${appointment.patient_id}`);
        }

        // Create Visits & Medical Records for completed appointment
        const completedAppt = appointments.find(a => a.status === 'completed');
        if (completedAppt) {
            const visitResult = db.prepare(`
                INSERT INTO visits (clinic_id, patient_id, doctor_id, appointment_id, date, notes, diagnosis)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                completedAppt.clinic_id,
                completedAppt.patient_id,
                completedAppt.doctor_id,
                appointmentIds[2], // The completed one
                new Date().toISOString(),
                'Patient complained of headache',
                'Tension headache'
            );

            const visitId = visitResult.lastInsertRowid;

            db.prepare(`
                INSERT INTO medical_records (clinic_id, patient_id, doctor_id, visit_id, diagnosis, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                completedAppt.clinic_id,
                completedAppt.patient_id,
                completedAppt.doctor_id,
                visitId,
                'Tension headache',
                'Prescribed rest and hydration'
            );
            logger.info('✅ Created visit and medical record');
        }

        // Create Doctor Schedule
        const insertSchedule = db.prepare(`
            INSERT INTO schedules (doctor_id, clinic_id, day_of_week, start_time, end_time)
            VALUES (@doctor_id, @clinic_id, @day_of_week, @start_time, @end_time)
        `);

        const schedules = [
            { doctor_id: userIds[1], clinic_id: clinicIds[0], day_of_week: 'Mon', start_time: '09:00', end_time: '17:00' },
            { doctor_id: userIds[1], clinic_id: clinicIds[0], day_of_week: 'Wed', start_time: '09:00', end_time: '17:00' },
            { doctor_id: userIds[1], clinic_id: clinicIds[0], day_of_week: 'Fri', start_time: '09:00', end_time: '13:00' }
        ];

        for (const schedule of schedules) {
            insertSchedule.run(schedule);
        }
        logger.info('✅ Created doctor schedules');

        // Create Medical Notes
        const insertNote = db.prepare(`
            INSERT INTO medical_notes (patient_id, doctor_id, clinic_id, notes)
            VALUES (@patient_id, @doctor_id, @clinic_id, @notes)
        `);

        insertNote.run({
            patient_id: patientIds[0],
            doctor_id: userIds[1],
            clinic_id: clinicIds[0],
            notes: 'Patient is showing good progress.'
        });
        logger.info('✅ Created medical notes');

        // Create Lab Requests
        const insertLabRequest = db.prepare(`
            INSERT INTO lab_requests (clinic_id, patient_id, test_type, requested_by, status)
            VALUES (@clinic_id, @patient_id, @test_type, @requested_by, @status)
        `);

        const labRequestResult = insertLabRequest.run({
            clinic_id: clinicIds[0],
            patient_id: patientIds[0],
            test_type: 'Blood Test - Complete Blood Count',
            requested_by: userIds[1], // Doctor
            status: 'pending'
        });
        const labRequestId = labRequestResult.lastInsertRowid;
        logger.info('✅ Created lab request');

        // Create Lab Result
        const insertLabResult = db.prepare(`
            INSERT INTO lab_results (lab_request_id, clinic_id, uploaded_by, result_text)
            VALUES (@lab_request_id, @clinic_id, @uploaded_by, @result_text)
        `);

        insertLabResult.run({
            lab_request_id: labRequestId,
            clinic_id: clinicIds[0],
            uploaded_by: userIds[4], // Lab technician
            result_text: 'WBC: 7.5, RBC: 5.2, Hemoglobin: 14.5 g/dL - All values within normal range'
        });
        logger.info('✅ Created lab result');

        // Create Bills
        const insertBill = db.prepare(`
            INSERT INTO bills (clinic_id, patient_id, amount, status, created_by)
            VALUES (@clinic_id, @patient_id, @amount, @status, @created_by)
        `);

        insertBill.run({
            clinic_id: clinicIds[0],
            patient_id: patientIds[0],
            amount: 150.00,
            status: 'pending',
            created_by: userIds[0] // Admin
        });
        logger.info('✅ Created bills');

        // Create Patient Portal User
        const insertPortalUser = db.prepare(`
            INSERT INTO patient_portal_users (clinic_id, patient_id, email, password_hash)
            VALUES (@clinic_id, @patient_id, @email, @password_hash)
        `);

        insertPortalUser.run({
            clinic_id: clinicIds[0],
            patient_id: patientIds[0], // Alice Johnson
            email: 'alice@example.com',
            password_hash: hashedPassword
        });
        logger.info('✅ Created patient portal user');

        logger.info('\n🎉 Database seeded successfully!');
        logger.info('\n📝 Sample Login Credentials:');
        logger.info('Clinic Owner: admin@cityhealth.com / password123');
        logger.info('Doctor: sarah@cityhealth.com / password123');
        logger.info('Patient Portal: alice@example.com / password123');
        logger.info('Super Admin: super@platform.com / password123');

    } catch (error) {
        console.error(error);
        logger.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seed();
