const Section = require('../models/section');

const SubSection = require('../models/subSection');
const mongoose = require('mongoose');
//const { uploadMediaToCloudinary } = require('../utils/imageUploader');
const { uploadVideo } = require('./../video-service/videoService')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// ================ create SubSection ================


exports.createSubSection = async (req, res) => {
  try {
    // const { title, description, sectionId } = req.body;
    const { title, description, sectionId, isRemedial, linkedQuiz, order } = req.body;

    if (!req.files || !req.files.video || !title || !description || !sectionId) {
      return res.status(400).json({ success: false, message: "All fields including video file are required" });
    }

    const videoFile = req.files.video;

    // Validate file size
    const maxSize = process.env.MAX_VIDEO_SIZE || 524288000; // 500MB
    if (videoFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `Video file is too large. Maximum size is ${Math.round(maxSize / 1048576)}MB`,
        fileSize: Math.round(videoFile.size / 1048576),
        maxSize: Math.round(maxSize / 1048576)
      });
    }
    // Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(videoFile.tempFilePath, {
        resource_type: "video",
        folder: process.env.FOLDER_NAME || "esmart-learning",
        timeout: 900000 // 15 minutes for large video uploads
      });
    } catch (uploadError) {
      console.error("Error uploading video to Cloudinary:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Video upload failed",
        error: uploadError.message
      });
    }


    // Create DB entry
    const newSubSection = await SubSection.create({
      title,
      description,
      timeDuration: uploadResult.duration,
      videoUrl: uploadResult.secure_url,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      isRemedial: isRemedial || false,
      linkedQuiz: linkedQuiz || null
    });

    // Update Section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: newSubSection._id } },
      { new: true }
    ).populate("subSection");

    // Remove temp file
    fs.unlinkSync(videoFile.tempFilePath);

    return res.status(200).json({
      success: true,
      message: "SubSection created and video uploaded successfully",
      data: updatedSection,
    });

  } catch (error) {
    console.error("SubSection creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create SubSection",
      error: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description, isRemedial, linkedQuiz, order } = req.body;

    // Validation
    if (!subSectionId || !mongoose.Types.ObjectId.isValid(subSectionId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid subSection ID is required to update',
      });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // Apply updates
    if (title) subSection.title = title;
    if (description) subSection.description = description;
    if (typeof isRemedial !== 'undefined') subSection.isRemedial = isRemedial === true || isRemedial === 'true';
    if (typeof linkedQuiz !== 'undefined') subSection.linkedQuiz = linkedQuiz || null;
    if (typeof order !== 'undefined' && Number.isFinite(Number(order))) subSection.order = Number(order);

    // Handle video file upload
    if (req.files && req.files.video) {
      const video = req.files.video;

      const uploadResult = await cloudinary.uploader.upload(video.tempFilePath, {
        resource_type: "video",
        folder: process.env.FOLDER_NAME || "esmart-learning",
        timeout: 900000, // 15 minutes for large video uploads 
      });

      subSection.videoUrl = uploadResult.secure_url;
      subSection.timeDuration = uploadResult.duration;

      // Clean temp file
      try {
        fs.unlinkSync(video.tempFilePath);
      } catch (err) {
        console.warn("Temp file cleanup error:", err.message);
      }
    }

    await subSection.save();

    const updatedSection = await Section.findById(sectionId).populate("subSection");

    return res.status(200).json({
      success: true,
      data: updatedSection,
      message: "SubSection updated successfully",
    });

  } catch (error) {
    console.error("Error while updating the SubSection", error);
    return res.status(500).json({
      success: false,
      message: "Error while updating the SubSection",
      error: error.message,
    });
  }
};


// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )

    // delete from DB
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    const updatedSection = await Section.findById(sectionId).populate('subSection')

    // In frontned we have to take care - when subsection is deleted we are sending ,
    // only section data not full course details as we do in others 

    // success response
    return res.json({
      success: true,
      data: updatedSection,
      message: "SubSection deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,

      error: error.message,
      message: "An error occurred while deleting the SubSection",
    })
  }
}
