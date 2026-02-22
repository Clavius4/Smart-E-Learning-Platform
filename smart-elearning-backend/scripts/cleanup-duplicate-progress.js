/**
 * Script to clean up duplicate course progress records
 * Run: node scripts/cleanup-duplicate-progress.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupDuplicates() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('courseprogresses');

        console.log('🔍 Finding duplicate course progress records...');

        // Find duplicates
        const duplicates = await collection.aggregate([
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        courseID: "$courseID"
                    },
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]).toArray();

        console.log(`Found ${duplicates.length} duplicate groups`);

        let removedCount = 0;

        for (const group of duplicates) {
            // Keep the first (oldest) record, remove the rest
            const [keep, ...remove] = group.ids;

            const result = await collection.deleteMany({
                _id: { $in: remove }
            });

            removedCount += result.deletedCount;
            console.log(`✅ Kept: ${keep}, Removed ${remove.length} duplicates for user ${group._id.userId}, course ${group._id.courseID}`);
        }

        console.log(`\n🎉 Cleanup complete! Removed ${removedCount} duplicate records.`);

    } catch (error) {
        console.error('Error cleaning up duplicates:', error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanupDuplicates();