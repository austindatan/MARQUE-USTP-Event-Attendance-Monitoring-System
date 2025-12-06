  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const multer = require('multer');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // 📁 cloudinaryconfig.js - Event images storage (FIXED)
  const eventStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'MARQUE Events/EVENTS COVER PAGE',
      // ⭐ CRITICAL FIX: Change from hardcoded 'png' to 'jpg' or 'auto' 
      // 'jpg' is generally safer for cover photos.
      format: async (req, file) => 'jpg', 
      public_id: (req, file) => 'event-' + Date.now()
    }
  });
  const uploadEventImages = multer({ storage: eventStorage });

  // Organization images storage
  const orgStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: (req, file) => {
        if (file.fieldname === 'pfp') return 'MARQUE Events/ORGANIZATION PROFILE';
        if (file.fieldname === 'cover_photo') return 'MARQUE Events/ORGANIZATION COVER PHOTO';
        return 'organization_photos';
      },
      format: async (req, file) => 'png',
      public_id: (req, file) => `${file.fieldname}-${Date.now()}`
    }
  });
  const uploadOrgImages = multer({ storage: orgStorage });

  // Student profile images storage
  const studentStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: (req, file) => {
        return 'MARQUE Events/STUDENT PROFILE';
      },
      format: async (req, file) => 'png',
      public_id: (req, file) => `student-${Date.now()}`
    }
  });
  const uploadStudentImage = multer({ storage: studentStorage });

  const attendanceStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'MARQUE Events/PHOTOPROOF',
      format: async () => 'jpg',
      public_id: (req, file) => `photoproof-${Date.now()}`
    }
  });

  const uploadPhotoproof = multer({ storage: attendanceStorage });


  module.exports = {
    uploadEventImages,
    uploadOrgImages,
    uploadStudentImage,
    uploadPhotoproof,
    cloudinary
  };
