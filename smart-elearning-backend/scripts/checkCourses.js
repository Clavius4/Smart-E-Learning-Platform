const mongoose = require("mongoose");
const Course = require("./../models/course");
require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL).then(async () => {
    console.log("Connected to DB. Checking courses...");
    const courses = await Course.find({}, { courseName: 1, level: 1, _id: 1 });
    console.log("Courses found:", courses);

    const beginner = await Course.findOne({ level: 'Beginner' });
    console.log("Beginner course query result:", beginner);

    const lowercase = await Course.findOne({ level: 'beginner' });
    console.log("lowercase 'beginner' query result:", lowercase);

    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
