const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.DATABASE_URL).then(async () => {
    const now = new Date();
    const futureLogs = await ActivityLog.find({ timestamp: { $gt: now } });
    console.log(`Found ${futureLogs.length} logs with future timestamps.`);

    let updatedCount = 0;
    for (const log of futureLogs) {
        log.timestamp = log.createdAt || new Date(now.getTime() - Math.random() * 86400000);
        await log.save();
        updatedCount++;
    }
    console.log(`Successfully updated ${updatedCount} logs.`);
    process.exit(0);
}).catch(console.error);
