// utils/mailSender.js
const nodemailer = require('nodemailer');

// Singleton transporter with connection pooling
let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for 587
            pool: true, // Use connection pooling
            maxConnections: 5, // Max concurrent connections
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 3000, // Reduced from 10s to 3s
            socketTimeout: 3000, // Reduced from 10s to 3s
        });
        console.log('📧 SMTP transporter initialized');
    }
    return transporter;
};

const mailSender = async (email, title, body) => {
    try {
        const transporter = getTransporter();

        const mailOptions = {
            from: `SmartLearning <${process.env.SMTP_USER}>`,
            to: email,
            subject: title,
            html: body,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("📧 Email sent successfully to:", email);
        return info;

    } catch (error) {
        console.error("❌ Email sending failed to", email, ":", error.message);
        throw error; // Re-throw the error for upstream handling
    }
};

module.exports = mailSender;