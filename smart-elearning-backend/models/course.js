const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String
    },
    courseDescription: {
        type: String
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'instructors',
        required: true
    },
    whatYouWillLearn: {
        type: String
    },
    level:{
        type:String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        }
    ],
  
    thumbnail: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    tag: {
        type: [String],
        required: true
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'students',
            required: true
        }
    ],
    // instructions: {
    //     type: [String]
    // },
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default:"Published",
    },
    quizzes: [{
         type: mongoose.Schema.Types.ObjectId, 
         ref: "Quiz" }],
    createdAt: {
        type: Date,
    }
    ,
    updatedAt: {
        type: Date,
    },
    order: {
  type: Number,
  required: true,
  default: 1
}


});

module.exports = mongoose.model('Course', courseSchema);