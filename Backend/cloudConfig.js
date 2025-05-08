// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// cloudinary.config({
//       cloud_name: process.env.CLOUD_NAME,
//       api_key: process.env.CLOUD_API_KEY,
//       api_secret: process.env.CLOUD_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//       cloudinary: cloudinary,
//       params: {
//             folder: 'Talk_Test',
//             allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov', 'avi'],
//             resource_type: 'auto',
//       },
// });

// const upload = multer({ storage }).fields([
//       { name: 'image', maxCount: 1 },
//       { name: 'video', maxCount: 1 },
//       { name: 'profile', maxCount: 1 },
//       { name: 'profilePicture', maxCount: 1 }
// ]);
// First, set up proper file upload middleware
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'talk_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

// Set up storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'talk_videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi']
  }
});

// Create separate upload middlewares
const imageUpload = multer({ storage: imageStorage });
const videoUpload = multer({ storage: videoStorage });

// Combined middleware for handling both image and video uploads
const upload = (req, res, next) => {
  console.log("📦 Request body before upload:", req.body);
  
  // Check if the request contains an image or video
  if (req.body.type === 'media') {
    // If file is present in the request
    if (req.files && (req.files.image || req.files.video)) {
      // Process accordingly
      if (req.files.image) {
        return imageUpload.single('image')(req, res, next);
      } else if (req.files.video) {
        return videoUpload.single('video')(req, res, next);
      }
    } else {
      // Check if request has parts indicating a file upload attempt
      const contentType = req.headers['content-type'];
      if (contentType && contentType.includes('multipart/form-data')) {
        // If it's a multipart form but no files detected, manually handle it
        return multer().any()(req, res, next);
      }
    }
  }
  // If no files to process, just continue
  next();
};

module.exports = upload;
