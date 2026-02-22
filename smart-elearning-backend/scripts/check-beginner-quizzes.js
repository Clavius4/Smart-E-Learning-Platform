const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/course');
const Quiz = require('../models/quiz');

async function check() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');

        const beginnerCourses = await Course.find({ level: { $in: ['Beginner', 'beginner'] } });
        console.log(`Found ${beginnerCourses.length} beginner courses.`);

        for (const c of beginnerCourses) {
            console.log(`\nCourse: ${c.courseName} (ID: ${c._id})`);
            console.log(`  Quizzes in array: ${c.quizzes.length}`);

            if (c.quizzes.length > 0) {
                const quiz = await Quiz.findById(c.quizzes[0]);
                if (quiz) {
                    console.log(`  ✅ First Quiz ID: ${quiz._id} (Title: ${quiz.title})`);
                } else {
                    console.log(`  ❌ First Quiz ID ${c.quizzes[0]} NOT FOUND in Quiz collection.`);
                }
            } else {
                console.log(`  ⚠️ No quizzes linked.`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

check();
