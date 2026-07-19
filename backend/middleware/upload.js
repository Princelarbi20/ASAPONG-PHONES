import multer from 'multer';
import path from 'node:path';

const safeFilename = (name) => path.basename(name)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + safeFilename(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed.'), false);
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 16 },
    fileFilter
});
