require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)
  .then(async () => {
    const Assessment = mongoose.connection.collection('assessmentquizs');
    const doc = await Assessment.findOne({});
    console.log(JSON.stringify(doc, null, 2));
    process.exit(0);
  });
