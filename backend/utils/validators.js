import { z } from 'zod';

export const registerClinicSchema = z.object({
    clinic: z.object({
        name: z.string().min(2, 'Clinic name is required'),
        email: z.string().email('Invalid clinic email'),
        phone: z.string().min(10, 'Phone number is required'),
        address: z.string().min(5, 'Address is required')
    }),
    owner: z.object({
        name: z.string().min(2, 'Owner name is required'),
        email: z.string().email('Invalid owner email'),
        password: z.string().min(8, 'Password must be at least 8 characters')
    })
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required')
});

export const publicAppointmentRequestSchema = z.object({
    clinicId: z.number().int().positive(),
    patientName: z.string().min(2, 'Name is required'),
    patientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    patientPhone: z.string().min(10, 'Phone number is required'),
    requestedDate: z.string().datetime(),
    reason: z.string().optional()
});

export const patientPortalRegisterSchema = z.object({
    clinic_id: z.number().int().positive(),
    patient_id: z.number().int().positive(),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

export const patientPortalLoginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required')
});

export const createAppointmentSchema = z.object({
    doctor_id: z.number().int().positive().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    notes: z.string().optional()
});

export const updateClinicSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    address: z.string().min(5).optional(),
    website: z.string().url().optional().or(z.literal(''))
});

export const createUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['admin', 'doctor', 'nurse', 'reception'])
});

export const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(['admin', 'doctor', 'nurse', 'reception']).optional(),
    password: z.string().min(8).optional()
});

export const createPatientSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(10).optional(),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    notes: z.string().optional()
});

export const updatePatientSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    notes: z.string().optional()
});

export const createMedicalRecordSchema = z.object({
    patient_id: z.number().int().positive(),
    doctor_id: z.number().int().positive().optional(),
    visit_id: z.number().int().positive().optional(),
    diagnosis: z.string().min(2),
    prescription: z.string().optional(),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional()
});

export const updateMedicalRecordSchema = z.object({
    diagnosis: z.string().min(2).optional(),
    prescription: z.string().optional(),
    notes: z.string().optional(),
    attachments: z.array(z.string()).optional()
});

export const createVisitSchema = z.object({
    patient_id: z.number().int().positive(),
    doctor_id: z.number().int().positive().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().min(2),
    diagnosis: z.string().optional(),
    notes: z.string().optional()
});

export const updateVisitSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    reason: z.string().min(2).optional(),
    diagnosis: z.string().optional(),
    notes: z.string().optional()
});

export const updateAppointmentSchema = z.object({
    doctor_id: z.number().int().positive().optional(),
    datetime: z.string().datetime().optional(),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional()
});

export const createMedicalNoteSchema = z.object({
    patient_id: z.number().int().positive(),
    visit_id: z.number().int().positive().optional(),
    notes: z.string().min(2)
});

export const updateMedicalNoteSchema = z.object({
    notes: z.string().min(2)
});

export const createLabRequestSchema = z.object({
    patient_id: z.number().int().positive(),
    test_type: z.string().min(2)
});

export const createLabResultSchema = z.object({
    lab_request_id: z.number().int().positive(),
    result_text: z.string().optional(),
    file_url: z.string().url().optional()
});

export const updateLabResultSchema = z.object({
    result_text: z.string().optional(),
    file_url: z.string().url().optional()
});

export const createBillSchema = z.object({
    patient_id: z.number().int().positive(),
    amount: z.number().positive(),
    status: z.enum(['pending', 'paid', 'cancelled']).optional()
});

export const updateBillSchema = z.object({
    amount: z.number().positive().optional(),
    status: z.enum(['pending', 'paid', 'cancelled']).optional()
});

export const validate = (schema) => (req, res, next) => {
    try {
        req.validatedData = schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation Error',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        next(error);
    }
};
