const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Event images storage
const eventStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'event_photos', 
    format: async (req, file) => 'png', 
    public_id: (req, file) => 'event-' + Date.now()
  }
});
const uploadEventImages = multer({ storage: eventStorage });

// Organization images storage
const orgStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      if (file.fieldname === 'pfp') {
        return 'MARQUE Events/ORGANIZATION PROFILE';
      } else if (file.fieldname === 'cover_photo') {
        return 'MARQUE Events/ORGANIZATION COVER PHOTO';
      }
      return 'organization_photos'; // Fallback folder
    },
    format: async (req, file) => 'png',
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`
  }
});
const uploadOrgImages = multer({ storage: orgStorage });

// Export middlewares
module.exports = {
  uploadEventImages,
  uploadOrgImages
};
