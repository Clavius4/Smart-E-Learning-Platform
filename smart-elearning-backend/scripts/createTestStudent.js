const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./../models/StudentModels/studentModels");
require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL).then(async () => {
    const email = "teststudent@example.com";
    const existing = await Student.findOne({ email });
    if (existing) {
        console.log("Student already exists. Resetting onboarding status.");
        existing.onboardingComplete = false;
        await existing.save();
        console.log("Student reset.");
        process.exit();
    }

    const hashedPassword = await bcrypt.hash("password123", 10);
    await Student.create({
        firstName: "Test",
        lastName: "Student",
        email,
        password: hashedPassword,
        onboardingComplete: false,
        role: "student",
        image: "https://api.dicebear.com/5.x/initials/svg?seed=Test Student"
    });
    console.log("Student created successfully!");
    process.exit();
}).catch(console.error);
