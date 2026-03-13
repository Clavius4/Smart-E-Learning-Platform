require('dotenv').config();
const mongoose = require('mongoose');
const CourseProgress = require('./models/courseProgress');

mongoose.connect(process.env.DATABASE_URL)
  .then(async () => {
    console.log('Connected to DB');
    const result = await CourseProgress.deleteMany({
      userId: '694d027f4ef5109eff371fc1',
      courseID: '694d86af4ef5109eff37260a'
    });
    console.log('Deleted progress records:', result.deletedCount);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
