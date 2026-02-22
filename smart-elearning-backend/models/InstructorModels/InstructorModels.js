const mongoose = require('mongoose')

const instructorSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
       
        active: {
            type: Boolean,
            default: true,
        },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        image: {
            type: String,
            required: true
        },
        additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstructorProfiles',
            required: true
                },
        token: {
            type: String
        },
        resetPasswordTokenExpires: {
            type: Date
        },
        // courseProgress: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: 'CourseProgress'

        //     }
        // ]
    },// Add timestamps for when the document is created and last modified
    { timestamps: true }
);


module.exports = mongoose.model('instructors', instructorSchema);