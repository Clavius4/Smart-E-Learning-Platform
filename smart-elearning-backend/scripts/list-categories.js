const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/category');

async function listCategories() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');

        const categories = await Category.find({});
        console.log('Categories:', categories);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

listCategories();
