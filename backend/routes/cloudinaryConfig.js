// backend/routes/cloudinaryConfig.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer'); // Must require multer here too

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure the storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'event_photos', 
        format: async (req, file) => 'png', 
        public_id: (req, file) => 'event-' + Date.now() 
    }
});

// 3. Export the configured middleware
const uploadMiddleware = multer({ storage: storage });

module.exports = uploadMiddleware;