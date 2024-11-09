const multer = require("multer");
const path = require("path");

const filename = (req, file, callback) => {
    const fileName = Date.now() + path.extname(file.originalname);
    callback(null, fileName);
};

const generateStorage = (destination) => {
    return multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, destination);
        },
        filename
    });
}

// Menggunakan memory storage untuk buffer
const memoryStorage = multer.memoryStorage();

module.exports = {
    imageDisk: multer({
        storage: generateStorage("./public/images"),
        fileFilter: (req, file, callback) => {
            const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];

            if (allowedMimeTypes.includes(file.mimetype)) {
                callback(null, true);
            } else {
                const err = new Error(`Only ${allowedMimeTypes.join(' ')} allowed to upload!`);
                callback(err, false);
            }
        },
        onerror: (err, next) => {
            next(err)
        }
    }),

    imageBuffer: multer({
        storage: memoryStorage, 
        fileFilter: (req, file, callback) => {
            const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];

            if (allowedMimeTypes.includes(file.mimetype)) {
                callback(null, true);
            } else {
                const err = new Error(`Only ${allowedMimeTypes.join(', ')} allowed to upload!`);
                callback(err, false);
            }
        },
        onerror: (err, next) => {
            next(err);
        }
    })
};