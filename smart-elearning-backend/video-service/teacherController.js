const Video = require('../models/Video');
const videoService = require('../services/videoService');

exports.uploadCourseVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }

    // Upload to Cloudinary
    const uploadResult = await videoService.uploadVideo(req.file.path, {
      folder: `teacher-${req.user.id}/courses`
    });

    // Save video metadata to MongoDB
    const video = new Video({
      teacher: req.user.id,
      publicId: uploadResult.public_id,
      originalFilename: req.file.originalname,
      duration: uploadResult.duration,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      url: uploadResult.secure_url,
      thumbnail: uploadResult.thumbnail_url,
      caption: req.body.caption || '',
      signLanguageIncluded: req.body.signLanguageIncluded || false
    });

    await video.save();

    // Associate with course (example)
    if (req.body.courseId) {
      await Course.findByIdAndUpdate(req.body.courseId, {
        $push: { videos: video._id }
      });
    }

    res.status(201).json({
      success: true,
      video: {
        id: video._id,
        url: video.url,
        thumbnail: video.thumbnail,
        duration: video.duration
      }
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Video upload failed',
      error: error.message
    });
  }

  exports.getCourseVideo = async (req, res) => {
    try {
      const video = await Video.findById(req.params.videoId)
        .populate('teacher', 'firstName lastName')
        .populate('course', 'title description');
  
      if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
      }
  
      // Check if student is enrolled in the course
      const isEnrolled = await Enrollment.exists({
        student: req.user.id,
        course: video.course
      });
  
      if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      }
  
      // Get optimized video URL with adaptive streaming
      const videoUrl = videoService.getVideoUrl(video.publicId, {
        streaming_profile: 'full_hd',
        transformation: [
          { width: 1280, height: 720, crop: 'limit' }
        ]
      });
  
      res.json({
        success: true,
        video: {
          ...video.toObject(),
          url: videoUrl,
          // Include signed URL for security if needed
          signedUrl: videoService.getSignedUrl(video.publicId)
        }
      });
  
    } catch (error) {
      console.error('Video fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching video',
        error: error.message
      });
    }
  };

};