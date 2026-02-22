const cloudinary = require('cloudinary').v2;
//const { CloudinaryStorage } = require('multer-storage-cloudinary');
//const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Create storage engine for Multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'esmart-learning',
//     resource_type: 'video',
//     allowed_formats: ['mp4', 'mov', 'avi'],
//     transformation: [
//       { width: 640, height: 360, crop: 'limit', quality: 'auto' },
//       { fetch_format: 'auto' }
//     ]
//   }
// });

// const upload = multer({ storage });

// Upload video to Cloudinary
exports.uploadVideo = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
};


// Get optimized video URL
exports.getVideoUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    ...options
  });
};