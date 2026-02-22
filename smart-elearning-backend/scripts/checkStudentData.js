const mongoose = require("mongoose");
const Student = require("./../models/StudentModels/studentModels");
require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL).then(async () => {
    console.log("Connected to DB. Checking student data...\n");

    const students = await Student.find({}, 'firstName lastName email learningStyle difficultyPreference level onboardingComplete');

    console.log(`Found ${students.length} students:`);
    students.forEach(s => {
        console.log(`- ${s.firstName} ${s.lastName} (${s.email})`);
        console.log(`  Style: ${s.learningStyle}`);
        console.log(`  Pref: ${s.difficultyPreference}`);
        console.log(`  Level: ${s.level}`);
        console.log(`  Onboarding: ${s.onboardingComplete}`);
        console.log('---');
    });

    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
