const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String
    },
    // contentType: {
    //     type: String
    // },
    timeDuration: {
        type: String
    },
    description: {
        type: String
    },
    videoUrl: {
        type: String
    },
  // NEW FIELDS
    isRemedial: {
        type: Boolean,
        default: false
    },
    linkedQuiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz", // assumes you have Quiz model
        required: false
    }
});

module.exports = mongoose.model('SubSection', subSectionSchema) 