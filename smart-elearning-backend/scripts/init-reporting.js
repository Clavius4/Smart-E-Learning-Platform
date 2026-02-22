/**
 * Initialize reporting system
 * Run: node scripts/init-reporting.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function initReporting() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        // Create indexes
        console.log('\n📊 Creating indexes...');
        await mongoose.connection.db.collection('activitylogs').createIndexes([
            { key: { timestamp: -1 }, expireAfterSeconds: 90 * 24 * 60 * 60 },
            { key: { userId: 1, timestamp: -1 } },
            { key: { action: 1, timestamp: -1 } }
        ]);

        await mongoose.connection.db.collection('reportcaches').createIndexes([
            { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
            { key: { reportType: 1, userId: 1 } }
        ]);

        await mongoose.connection.db.collection('questionperformances').createIndexes([
            { key: { quizId: 1, questionIndex: 1 }, unique: true }
        ]);

        console.log('✅ Indexes created successfully');

        console.log('\n🎉 Reporting system initialized successfully!');

    } catch (error) {
        console.error('Error initializing reporting system:', error);
    } finally {
        await mongoose.disconnect();
    }
}

initReporting();