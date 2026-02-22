const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'instructors',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  publicId: {
    type: String,
    required: true
  },
  originalFilename: String,
  duration: Number, // in seconds
  format: String,
  bytes: Number,
  url: String,
  thumbnail: String,
  caption: String,
  signLanguageIncluded: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search
VideoSchema.index({
  caption: 'text',
  originalFilename: 'text'
});

module.exports = mongoose.model('Video', VideoSchema);