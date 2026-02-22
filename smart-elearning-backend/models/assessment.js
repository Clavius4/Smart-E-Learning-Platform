const mongoose = require('mongoose')

const assessmentQuizSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['literacy', 'numeracy'],
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
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
        default: 'mcq',
        required: true
      },
      question: { type: String, required: true },
      questionImage: { type: String, default: null },
      options: [
        {
          text: { type: String, default: null },
          image: { type: String, default: null },
        }
      ],
      correctAnswerIndex: { type: Number },
      pairs: [
        {
          drag: { type: String },
          drop: { type: String }
        }
      ]
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('AssessmentQuiz', assessmentQuizSchema)
