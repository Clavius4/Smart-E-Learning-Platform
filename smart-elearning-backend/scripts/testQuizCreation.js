const mongoose = require("mongoose");
const Quiz = require("./../models/quiz");
const Course = require("./../models/course");
require("dotenv").config();

// Test quiz data
const testQuizData = {
    courseId: null, // Will be set to first course found
    instructor: null, // Will be set to course instructor
    questions: [
        {
            type: "mcq",
            question: "What is 2 + 2?",
            questionImage: "",
            options: [
                { text: "3", image: null },
                { text: "4", image: null },
                { text: "5", image: null }
            ],
            correctAnswerIndex: 1
        },
        {
            type: "dragdrop",
            question: "Match the numbers",
            questionImage: "",
            pairs: [
                { left: "One", right: "1" },
                { left: "Two", right: "2" }
            ]
        }
    ]
};

mongoose.connect(process.env.DATABASE_URL).then(async () => {
    console.log("Connected to DB. Testing quiz creation...\n");

    // Find a course to attach the quiz to
    const course = await Course.findOne({ level: 'Beginner' }).select('_id courseName instructor');

    if (!course) {
        console.log("❌ No course found to attach quiz to");
        process.exit(1);
    }

    console.log(`✅ Found course: ${course.courseName} (ID: ${course._id})`);

    // Set courseId and instructor
    testQuizData.courseId = course._id;
    testQuizData.instructor = course.instructor;

    // Create quiz
    try {
        const newQuiz = await Quiz.create(testQuizData);
        console.log(`✅ Quiz created successfully! ID: ${newQuiz._id}`);
        console.log(`   Questions: ${newQuiz.questions.length}`);

        // Add quiz to course
        course.quizzes.push(newQuiz._id);
        await course.save();
        console.log(`✅ Quiz added to course's quizzes array`);

        // Verify
        const updatedCourse = await Course.findById(course._id).select('quizzes');
        console.log(`✅ Course now has ${updatedCourse.quizzes.length} quiz(zes)`);

    } catch (error) {
        console.error("❌ Error creating quiz:", error.message);
        console.error("   Details:", error);
    }

    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
