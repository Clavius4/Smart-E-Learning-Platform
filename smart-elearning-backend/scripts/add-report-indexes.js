/**
 * Script to add necessary indexes for reporting
 * Run: node scripts/add-report-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function addIndexes() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // CourseProgress indexes
        console.log('\n📊 Adding CourseProgress indexes...');
        const courseProgressCollection = db.collection('courseprogresses');

        // FIX: Remove uniqueness constraint - allow duplicates if they exist
        await courseProgressCollection.createIndex({ userId: 1, courseID: 1 });
        console.log('✅ Created index: userId_1_courseID_1 (non-unique)');

        await courseProgressCollection.createIndex({ instructor: 1, lastAccessed: -1 });
        console.log('✅ Created index: instructor_1_lastAccessed_-1');

        await courseProgressCollection.createIndex({ 'quizAttempts.attemptedAt': -1 });
        console.log('✅ Created index: quizAttempts.attemptedAt_-1');

        await courseProgressCollection.createIndex({ completionStatus: 1 });
        console.log('✅ Created index: completionStatus_1');

        await courseProgressCollection.createIndex({ isCourseCompleted: 1 });
        console.log('✅ Created index: isCourseCompleted_1');

        // ActivityLog indexes
        console.log('\n📊 Adding ActivityLog indexes...');
        const activityLogCollection = db.collection('activitylogs');

        await activityLogCollection.createIndex({ timestamp: -1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
        console.log('✅ Created index: timestamp_-1 (TTL 90 days)');

        await activityLogCollection.createIndex({ userId: 1, timestamp: -1 });
        console.log('✅ Created index: userId_1_timestamp_-1');

        await activityLogCollection.createIndex({ action: 1, timestamp: -1 });
        console.log('✅ Created index: action_1_timestamp_-1');

        await activityLogCollection.createIndex({ courseId: 1, action: 1 });
        console.log('✅ Created index: courseId_1_action_1');

        // Student indexes
        console.log('\n📊 Adding Student indexes...');
        const studentCollection = db.collection('students');

        await studentCollection.createIndex({ difficultyPreference: 1, onboardingComplete: 1 });
        console.log('✅ Created index: difficultyPreference_1_onboardingComplete_1');

        await studentCollection.createIndex({ learningStyle: 1 });
        console.log('✅ Created index: learningStyle_1');

        await studentCollection.createIndex({ createdAt: -1 });
        console.log('✅ Created index: createdAt_-1');

        // Course indexes
        console.log('\n📊 Adding Course indexes...');
        const courseCollection = db.collection('courses');

        await courseCollection.createIndex({ level: 1, category: 1, order: 1 });
        console.log('✅ Created index: level_1_category_1_order_1');

        await courseCollection.createIndex({ instructor: 1, status: 1 });
        console.log('✅ Created index: instructor_1_status_1');

        await courseCollection.createIndex({ studentsEnrolled: 1 });
        console.log('✅ Created index: studentsEnrolled_1');

        console.log('\n✅ All indexes created successfully!');

    } catch (error) {
        console.error('Error creating indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

addIndexes();