const mongoose = require('mongoose');

const reportCacheSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: [
            'instructor-dashboard',
            'instructor-course-analytics',
            'instructor-comparative',
            'student-progress',
            'admin-platform-overview',
            'admin-user-analytics',
            'admin-course-analytics'
        ]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['students', 'instructors', 'Admin']
    },
    params: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    version: {
        type: Number,
        default: 1
    },
    hitCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for快速查找
reportCacheSchema.index({ reportType: 1, userId: 1, 'params.hash': 1 });

// Generate cache key hash from params
reportCacheSchema.statics.generateKey = function(reportType, userId, params = {}) {
    const crypto = require('crypto');
    const paramsString = JSON.stringify(params);
    const hash = crypto.createHash('md5').update(paramsString).digest('hex');
    return `${reportType}:${userId}:${hash}`;
};

// Get or set cache
reportCacheSchema.statics.getOrSet = async function(key, ttlSeconds = 900, generator) {
    const [reportType, userId, paramsHash] = key.split(':');

    // Try to get from cache
    const cached = await this.findOne({
        reportType,
        userId,
        'params.hash': paramsHash,
        expiresAt: { $gt: new Date() }
    });

    if (cached) {
        // Increment hit count asynchronously
        this.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } }).exec();
        return { data: cached.data, fromCache: true };
    }

    // Generate new data
    const data = await generator();

    // Parse params from hash? For simplicity, we'll just store empty params
    // In production, you'd want to store the actual params
    await this.create({
        reportType,
        userId,
        params: { hash: paramsHash },
        data,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000)
    });

    return { data, fromCache: false };
};

module.exports = mongoose.model('ReportCache', reportCacheSchema);