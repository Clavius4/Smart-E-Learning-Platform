const mongoose = require('mongoose');
require('dotenv').config();

// atlas live connectivity:
//     mongodb+srv://frankkiruma05:kiruma05@cluster0.9nyi6gm.mongodb.net/smart-elearning?retryWrites=true&w=majority&appName=Cluster0

exports.connectDB = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log('Database connected succcessfully');
        })
        .catch(error => {
            console.log(`Error while connecting server with Database`);
            console.log(error);
            process.exit(1);
        })
};

