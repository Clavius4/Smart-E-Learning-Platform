const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        const options = { folder };
        if (height) options.height = height;
        if (quality) options.quality = quality;

        // options.resourse_type = 'auto';
        options.resource_type = 'auto';
        return await cloudinary.uploader.upload(file.tempFilePath, options);
    }
    catch (error) {
        console.log("Error while uploading image");
        console.log(error);
    }
}

exports.uploadMediaToCloudinary = async (file, folder) => {
  try {
    const filePath = file.tempFilePath || file.path;
    return await cloudinary.uploader.upload_large(filePath, {
      folder,
      resource_type: "video",
      chunk_size: 6 * 1024 * 1024,
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw err;                         // bubble up to the controller
  }
};
// utils/imageUploader.js



exports.QuestionuploadImageToCloudinary = async (base64Image, folder) => {
  try {
    if (!base64Image) {
      throw new Error('Image data is missing');
    }

    // Upload directly with full base64 data URI
    const uploadedResponse = await cloudinary.uploader.upload(base64Image, {
      folder: folder || 'quiz-images',
      resource_type: 'image',
    });

    return uploadedResponse;
  } catch (error) {
    console.error('Error while uploading image');
    console.error(error);
    throw error;
  }
};

// Function to delete a resource by public ID
exports.deleteResourceFromCloudinary = async (url) => {
    if (!url) return;

    try {
        const result = await cloudinary.uploader.destroy(url);
        console.log(`Deleted resource with public ID: ${url}`);
        console.log('Delete Resourse result = ', result)
        return result;
    } catch (error) {
        console.error(`Error deleting resource with public ID ${url}:`, error);
        throw error;
    }
};