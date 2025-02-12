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
]);

module.exports = upload;
