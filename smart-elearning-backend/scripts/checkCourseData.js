const mongoose = require("mongoose");
const Course = require("./../models/course");
const Category = require("./../models/category");
require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL).then(async () => {
    console.log("Connected to DB. Checking course data...\n");

    // Check all courses
    const courses = await Course.find({})
        .populate('category', 'name')
        .select('courseName level status category quizzes createdAt');

    console.log(`Total courses: ${courses.length}\n`);

    courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.courseName}`);
        console.log(`   Level: ${course.level}`);
        console.log(`   Status: ${course.status}`);
        console.log(`   Category: ${course.category?.name || 'NONE'}`);
        console.log(`   Quizzes: ${course.quizzes?.length || 0}`);
        console.log(`   Created: ${course.createdAt}`);
        console.log('');
    });

    // Check categories
    console.log('\n--- Categories ---');
    const categories = await Category.find({}).select('name');
    categories.forEach(cat => {
        console.log(`- ${cat.name} (ID: ${cat._id})`);
    });

    // Check for Draft courses
    const draftCourses = await Course.find({ status: 'Draft' }).select('courseName level');
    console.log(`\n--- Draft Courses (${draftCourses.length}) ---`);
    draftCourses.forEach(c => console.log(`- ${c.courseName} (${c.level})`));

    // Check for courses without category
    const noCategoryCourses = await Course.find({ category: null }).select('courseName level');
    console.log(`\n--- Courses without Category (${noCategoryCourses.length}) ---`);
    noCategoryCourses.forEach(c => console.log(`- ${c.courseName} (${c.level})`));

    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
