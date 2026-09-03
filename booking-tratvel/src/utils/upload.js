import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// ─── Cloudinary Storage (auto-upload to Cloudinary) ────────────────
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'booking-travel',           // folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
    },
});

const LIMITS = { fileSize: 5 * 1024 * 1024 };

// Multer and Cloudinary reject a bad file by throwing *before* the controller
// runs, so without this the client gets Express's default HTML 500 instead of
// the JSON shape every other endpoint returns.
const handleUploadErrors = (middleware) => (req, res, next) => {
    middleware(req, res, (error) => {
        if (!error) return next();

        const message =
            error.code === 'LIMIT_FILE_SIZE'
                ? 'Image is too large. The limit is 5 MB.'
                : /format not allowed|allowed formats|invalid image|unsupported/i.test(error.message || '')
                    ? 'Unsupported image type. Use JPG, PNG, WebP or GIF.'
                    : error.message || 'Upload failed';

        console.error('[upload]', error.message);
        return res.status(400).json({ success: false, message });
    });
};

// Multer middleware – accepts a single file from field "image"
export const uploadSingle = handleUploadErrors(multer({ storage, limits: LIMITS }).single('image'));

// Multer middleware – accepts up to 10 files from field "images"
export const uploadMultiple = handleUploadErrors(multer({ storage, limits: LIMITS }).array('images', 10));

// ─── Manual upload helper (for base64 / buffer / URL) ──────────────
export const uploadToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: options.folder || 'booking-travel',
            resource_type: options.resource_type || 'image',
            ...options,
        };

        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(fileBuffer);
    });
};

// ─── Delete image from Cloudinary by public_id ─────────────────────
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

// ─── Extract public_id from a Cloudinary URL ───────────────────────
export const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    return publicId;
};
