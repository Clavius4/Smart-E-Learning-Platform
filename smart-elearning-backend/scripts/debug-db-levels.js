const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/course');

async function check() {
    try {
        console.log('Connecting to:', process.env.DATABASE_URL);
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');

        const allCourses = await Course.find({});
        console.log(`Total courses found: ${allCourses.length}`);

        const levels = {};
        allCourses.forEach(c => {
            const lvl = c.level || 'UNDEFINED';
            if (!levels[lvl]) levels[lvl] = 0;
            levels[lvl]++;
            console.log(`- "${c.courseName}" | Level: "${c.level}" | Status: "${c.status}"`);
        });

        console.log('\nLevel counts:', levels);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

check();
