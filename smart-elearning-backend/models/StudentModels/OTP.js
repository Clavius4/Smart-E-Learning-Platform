// models/StudentModels/OTP.js
const mongoose = require('mongoose');
const mailSender = require('../../utils/mailSender');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3 * 60 // 3 minutes
    }
});

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email, 
            'Verification Email from E learning platform', 
            `<h1>Your OTP is: ${otp}</h1>`
        );
        console.log('✅ Email sent successfully to:', email);
        return mailResponse;
    } catch (error) {
        console.error('❌ Error sending email to', email, ':', error.message);
        // Throw a proper Error object
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
}

OTPSchema.pre('save', async function (next) {
    if (this.isNew && process.env.SEND_OTP_EMAILS === 'true') {
        sendVerificationEmail(this.email, this.otp).catch((error) => {
            console.error('Email sending failed but OTP saved:', error);
        });
    }
    next();
});

module.exports = mongoose.model('OTP', OTPSchema);
