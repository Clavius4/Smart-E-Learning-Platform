const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "instructors",
    required: true
  },
  questions: [
    {
      type: {
        type: String,
        enum: ['mcq', 'dragdrop'],
        default: 'multiple-choice',
        required: true
      },

      question: { type: String, required: true },
      questionImage: { type: String, default: null },

      // For multiple-choice
      options: [
        {
          text: { type: String, default: null },
          image: { type: String, default: null },
        }
      ],
      correctAnswerIndex: { type: Number },

      // For drag-and-drop
      pairs: [
        {
          left: { type: String, required: true },
          right: { type: String, required: true }
        }
      ]
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
