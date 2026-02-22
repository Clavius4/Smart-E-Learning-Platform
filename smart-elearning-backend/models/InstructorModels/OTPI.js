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
        default: Date.now, // ✅ Remove the parentheses
        expires: 3 * 60     // or 5 * 60 for 5 minutes
    }
    

});

//  function to send email
async function sendVerificationEmail(email, otp) {
    try {
        //const mailResponse = mailSender(email, 'Verification Email from E learning platform', otp);
        const mailResponse = await mailSender(email, 'Verification Email from E learning platform', otp);

        console.log('✅ Email sent successfully to -', email);

    }
    catch (error) {
        //console.log('Error while sending an email to ', email);
        throw new error;
    }
}



OTPSchema.pre('save', async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});




module.exports = mongoose.model('OTPI', OTPSchema);