const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Student = require('../models/StudentModels/studentModels');

const verify = async () => {
    try {
        console.log('Connecting to DB...');
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env');
        }
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected.');

        // 1. Create a dummy student
        const email = `test_verify_${Date.now()}@test.com`;
        // Create a fake ObjectId for additionalDetails since we won't populate it
        const fakeProfileId = new mongoose.Types.ObjectId();

        const student = await Student.create({
            firstName: 'Test',
            lastName: 'Verify',
            email: email,
            password: 'password123',
            image: 'https://api.dicebear.com/7.x/initials/svg?seed=Test',
            additionalDetails: fakeProfileId,
            difficultyPreference: 'beginner'
        });
        console.log('Created student:', student.email, 'Level:', student.difficultyPreference);

        // 2. Simulate update (as done in controller)
        const userId = student._id;
        const newLevel = 'intermediate';

        console.log(`Updating level to ${newLevel}...`);
        const updatedUser = await Student.findByIdAndUpdate(
            userId,
            { difficultyPreference: newLevel, desiredLevel: null },
            { new: true }
        );

        console.log('Updated student level:', updatedUser.difficultyPreference);

        if (updatedUser.difficultyPreference === newLevel) {
            console.log('SUCCESS: Level updated correctly in DB.');
        } else {
            console.log('FAILURE: Level did not update.');
        }

        // 3. Cleanup
        await Student.findByIdAndDelete(userId);
        console.log('Cleanup done.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verify();
