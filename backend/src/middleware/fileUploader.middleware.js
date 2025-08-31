const multer = require('multer');
const { randomStringGenerator } = require('../utils/helper');
const { FileFilterType } = require('../config/constant.config');
const { bucket } = require('../config/googleCloud.config');
const { format } = require('util');

// Use memory storage for in-memory uploads
const storage = multer.memoryStorage();

const uploadFile = (fileType = FileFilterType.IMAGE, fieldName = 'file') => {
    let allowedFileTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (fileType === FileFilterType.DOCUMENT) {
        allowedFileTypes = ['pdf', 'txt', 'docs'];
    }
    if (fileType === FileFilterType.AUDIO) {
        allowedFileTypes = ['mp3', 'wav', 'm4a', 'aac', 'webm']; // Added webm format
    }
    if (fileType === FileFilterType.VIDEO) {
        allowedFileTypes = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    }

    return multer({
        storage: storage,
        limits: {
            fileSize: 20 * 1024 * 1024, // 20MB
        },
        fileFilter: (req, file, cb) => {
            const ext = file.originalname.split(".").pop().toLowerCase();
            if (allowedFileTypes.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type: ${ext}`));
            }
        }
    }).single(fieldName);
};

const uploadToGCS = async (req, res, next) => {
    try {
        if (!req.file) return next();

        const ext = req.file.originalname.split(".").pop();
        const generatedName = `Pte-Sathi-${randomStringGenerator(20)}.${ext}`;
        const filePathInBucket = req.uploadPath ? `${req.uploadPath}/${generatedName}` : generatedName;

        const blob = bucket.file(filePathInBucket);

        const blobStream = blob.createWriteStream({
            resumable: false,
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            }
        });

        blobStream.on('error', (err) => {
            console.error('❌ Google Cloud Storage Error:', err.message);
            return next(new Error(`Unable to upload file to Google Cloud Storage: ${err.message}`));
        });

        blobStream.on('finish', async () => {
            let publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);

            // Optional: try to make public (will silently fail if bucket is locked down)
            try {
                await blob.makePublic();
            } catch (e) {
                console.warn('⚠️ makePublic failed — bucket likely requires signed URLs or IAM public access.');
            }

            req.file.cloudStorageObject = blob.name;
            req.file.cloudStoragePublicUrl = publicUrl;
            req.file.path = blob.name; // legacy compatibility

            return next();
        });

        blobStream.end(req.file.buffer);
    } catch (err) {
        return next(err);
    }
};

const setPath = (path) => {
    return (req, res, next) => {
        req.uploadPath = path;
        next();
    };
};

module.exports = {
    uploadFile,
    setPath,
    uploadToGCS
};
