import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        image: /jpeg|jpg|png|gif|webp/,
        document: /pdf|doc|docx/,
        all: /jpeg|jpg|png|gif|webp|pdf|doc|docx/
    };

    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const filterType = req.uploadType || 'all';

    if (allowedTypes[filterType].test(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${filterType}`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// Middleware for different upload types
export const uploadSingle = (fieldName, type = 'all') => {
    return (req, res, next) => {
        req.uploadType = type;
        upload.single(fieldName)(req, res, next);
    };
};

export const uploadMultiple = (fieldName, maxCount = 5, type = 'all') => {
    return (req, res, next) => {
        req.uploadType = type;
        upload.array(fieldName, maxCount)(req, res, next);
    };
};

export const uploadFields = (fields) => {
    return upload.fields(fields);
};

export default upload;
