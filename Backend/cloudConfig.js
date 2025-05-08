const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
            folder: 'Talk_Test',
            allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'avi'],
            resource_type: 'auto',
      },
});

const upload = multer({ storage }).fields([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
      { name: 'profile', maxCount: 1 },
      { name: 'profilePicture', maxCount: 1 }
]);
// First, set up proper file upload middleware
// cloudConfig.js
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('cloudinary').v2;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Create storage engine for Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'Talk_Test',
//     allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'avi'],
//     resource_type: 'auto', // Auto-detect whether it's image or video
//   }
// });

// // Create and export the multer middleware
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB file size limit
//   }
// }).fields([
//   { name: 'image', maxCount: 1 },
//   { name: 'video', maxCount: 1 },
//   { name: 'profile', maxCount: 1 },
//   { name: 'profilePicture', maxCount: 1 }
// ]);

module.exports = upload;