const Student = require('../models/StudentModels/studentModels');
const OTP = require('../models/StudentModels/OTP');
const Profile = require('../models/StudentModels/profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mailSender = require('../utils/mailSender');
const otpTemplate = require('../mail/templates/emailVerificationTemplate');
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');

// ================ HARDCODED OTP VERIFICATION ================
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        console.log(`📧 OTP Verification Attempt:`, {
            email: email || 'No email provided',
            otp: otp || 'No OTP provided',
            timestamp: new Date().toISOString()
        });

        // Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // ✅ HARDCODED OTP - ONLY ACCEPT 123456
        const HARDCODED_OTP = '123456';

        if (otp === HARDCODED_OTP) {
            console.log(`✅ OTP Verified Successfully for: ${email}`);

            // Check if user exists
            const user = await Student.findOne({ email });

            if (user) {
                // Update user verification status if needed
                user.isVerified = true;
                user.verifiedAt = new Date();
                await user.save();

                console.log(`✅ User ${email} marked as verified`);
            }

            return res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
                data: {
                    email: email,
                    verified: true,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            console.log(`❌ Invalid OTP for ${email}. Received: "${otp}", Expected: "${HARDCODED_OTP}"`);
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please use 123456 for testing',
                hint: 'Use 123456 as the OTP for testing'
            });
        }

    } catch (error) {
        console.error('🔥 OTP Verification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification',
            error: error.message
        });
    }
};

// ================ HARDCODED RESEND OTP ================
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        console.log(`📧 Resend OTP Request for: ${email || 'No email provided'}`);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        const user = await Student.findOne({ email });

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return res.status(404).json({
                success: false,
                message: 'User not found. Please sign up first.'
            });
        }

        // For hardcoded/testing mode:
        const HARDCODED_OTP = '123456';

        console.log(`✅ Generated OTP for ${email}: ${HARDCODED_OTP}`);

        // Save OTP to database (optional for tracking)
        try {
            // Clear old OTPs
            await OTP.deleteMany({ email });

            // Save new OTP
            const otpRecord = await OTP.create({
                email,
                otp: HARDCODED_OTP,
                purpose: 'verification',
                createdAt: new Date()
            });

            console.log(`✅ OTP saved to database for ${email}`);
        } catch (dbError) {
            console.warn('⚠️ Could not save OTP to database:', dbError.message);
            // Continue even if DB save fails
        }

        // Send email with OTP asynchronously (non-blocking)
        setImmediate(() => {
            mailSender(
                email,
                "Your Verification Code",
                otpTemplate(HARDCODED_OTP, `${user.firstName} ${user.lastName}`)
            ).then(() => {
                console.log(`📧 Email sent successfully to ${email}`);
            }).catch((emailError) => {
                console.warn(`⚠️ Email sending failed for ${email}:`, emailError.message);
            });
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                email: email,
                otp: HARDCODED_OTP, // Only for debugging - remove in production
                note: 'Use 123456 as the OTP for testing',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('🔥 Resend OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resending OTP',
            error: error.message
        });
    }
};

// ================ SIGNUP (Updated with OTP) ================
exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        // Prevent sending personalization data during signup
        const forbiddenFields = ['learningStyle', 'interests', 'difficultyPreference', 'signLanguage', 'avatar', 'onboardingComplete'];
        const presentForbidden = forbiddenFields.filter(f => req.body[f] !== undefined);
        if (presentForbidden.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Personalization fields must be submitted after signup via the onboarding endpoint. Remove: ${presentForbidden.join(', ')}`
            });
        }

        console.log(`📝 Signup attempt for: ${email}`);

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        const existingUser = await Student.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            dateOfBirth: null,
            about: null,
        });

        const user = await Student.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
            isVerified: false // User needs OTP verification
        });

        // Save hardcoded OTP to database for tracking
        const HARDCODED_OTP = '123456';
        await OTP.create({
            email,
            otp: HARDCODED_OTP,
            purpose: 'signup_verification'
        });

        // Send OTP email asynchronously (non-blocking)
        // Use setImmediate to avoid blocking the response
        setImmediate(() => {
            mailSender(
                email,
                "Verify Your Account - Action Required",
                otpTemplate(HARDCODED_OTP, `${firstName} ${lastName}`)
            ).then(() => {
                console.log(`📧 Signup OTP email sent to ${email}`);
            }).catch((emailError) => {
                console.warn("⚠️ Error sending OTP email:", emailError.message);
            });
        });

        ActivityLog.log({
            userId: user._id,
            userModel: 'students',
            userRole: 'student',
            action: 'signup',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        }).catch(console.error);

        console.log(`✅ User registered: ${email} (email sending in background)`);
        res.status(200).json({
            success: true,
            message: 'User registered successfully. Please verify your email.',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isVerified: user.isVerified
                },
                requiresVerification: true,
                hint: 'Use OTP: 123456 for verification'
            }
        });

    } catch (error) {
        console.error('🔥 Signup Error:', error && error.stack ? error.stack : error);
        const errMsg = error && error.message ? error.message : 'Error registering user';
        res.status(500).json({
            success: false,
            message: errMsg
        });
    }
};

// ================ LOGIN (Check verification) ================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(`🔐 Login attempt for: ${email}`);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        let user = await Student.findOne({ email })
            .populate('additionalDetails');

        if (!user) {
            console.log(`❌ Login failed: User not found - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Optional: Check if user is verified
        if (user.isVerified === false) {
            console.log(`⚠️ User not verified: ${email}`);
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first',
                requiresVerification: true,
                email: user.email
            });
        }

        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                role: 'student'
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '24h'
            });

            user = user.toObject();
            user.token = token;
            user.password = undefined;

            const cookieOptions = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            };

            const ActivityLog = require('../models/ActivityLog');

// Log login activity
            ActivityLog.log({
                userId: user._id,
                userModel: 'students',
                userRole: 'student',
                action: 'login',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }).catch(console.error);

            console.log(`✅ Login successful: ${email}`);
            res.cookie('token', token, cookieOptions).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in successfully'
            });
        } else {
            console.log(`❌ Login failed: Incorrect password - ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

    } catch (error) {
        console.error('🔥 Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// ================ LOGOUT ================
exports.logout = async (req, res) => {
    try {
        res.clearCookie('token');
        console.log(`✅ User logged out`);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('🔥 Logout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

// ================ CHANGE PASSWORD ================
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.user.id;

        console.log(`🔑 Password change request for user: ${userId}`);

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        const user = await Student.findById(userId);
        if (!await bcrypt.compare(oldPassword, user.password)) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect old password'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Student.findByIdAndUpdate(userId, { password: hashedPassword });

        // Send email notification asynchronously (non-blocking)
        setImmediate(() => {
            mailSender(
                user.email,
                "Password Changed Successfully",
                passwordUpdated(user.email, user.firstName)
            ).then(() => {
                console.log(`📧 Password change notification sent to ${user.email}`);
            }).catch((emailError) => {
                console.warn("⚠️ Error sending password change email:", emailError.message);
            });
        });

        console.log(`✅ Password changed for user: ${userId}`);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('🔥 Change Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

// ================ UPDATE PROFILE ================
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, gender, contactNumber, about } = req.body;
        const userId = req.user.id;

        console.log(`👤 Profile update request for user: ${userId}`);

        const user = await Student.findById(userId);
        const profile = await Profile.findById(user.additionalDetails);

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        await user.save();

        if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
        if (gender) profile.gender = gender;
        if (contactNumber) profile.contactNumber = contactNumber;
        if (about) profile.about = about;
        await profile.save();

        const updatedUser = await Student.findById(userId)
            .populate('additionalDetails')
            .select('-password');

        console.log(`✅ Profile updated for user: ${userId}`);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('🔥 Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// ================ RESET PASSWORD TOKEN ================
exports.resetStudentPasswordToken = async (req, res) => {
    try {
        const { email } = req.body;

        console.log(`🔐 Password reset request for: ${email}`);

        const user = await Student.findOne({ email });

        if (!user) {
            console.log(`❌ Password reset failed: User not found - ${email}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordTokenExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // For testing, use a frontend URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://206.189.112.134:5173';
        const url = `${frontendUrl}/reset-password/${token}`;

        // Send reset email asynchronously (non-blocking)
        setImmediate(() => {
            mailSender(
                email,
                'Password Reset Request',
                `Click here to reset your password: ${url}\n\nThis link will expire in 1 hour.`
            ).then(() => {
                console.log(`📧 Password reset email sent to ${email}`);
            }).catch((emailError) => {
                console.warn("⚠️ Error sending reset email:", emailError.message);
            });
        });

        console.log(`✅ Password reset token generated for: ${email}`);
        res.status(200).json({
            success: true,
            message: 'Reset email sent',
            resetToken: token // For testing only
        });

    } catch (error) {
        console.error('🔥 Reset Password Token Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending reset email',
            error: error.message
        });
    }
};

// ================ RESET PASSWORD ================
exports.resetStudentPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        console.log(`🔄 Password reset attempt with token`);

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        const user = await Student.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log(`❌ Invalid or expired reset token`);
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;
        await user.save();

        console.log(`✅ Password reset successful for: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('🔥 Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};

// ================ UPDATE PERSONALIZATION ================
exports.updatePersonalization = async (req, res) => {
    try {
        const { learningStyle, interests, difficultyPreference, signLanguage } = req.body;
        const userId = req.user.id;

        console.log(`🎨 Personalization update for user: ${userId}`);

        const user = await Student.findByIdAndUpdate(
            userId,
            {
                learningStyle,
                interests,
                difficultyPreference,
                signLanguage,
                onboardingComplete: true
            },
            { new: true }
        ).select('-password');

        console.log(`✅ Personalization updated for user: ${userId}`);
        res.status(200).json({
            success: true,
            message: 'Preferences updated',
            user
        });

    } catch (error) {
        console.error('🔥 Update Personalization Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating preferences',
            error: error.message
        });
    }
};

// ================ CHECK VERIFICATION STATUS ================
exports.checkVerification = async (req, res) => {
    try {
        const { email } = req.query;

        console.log(`🔍 Checking verification status for: ${email}`);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await Student.findOne({ email }).select('email isVerified firstName lastName');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                email: user.email,
                isVerified: user.isVerified || false,
                name: `${user.firstName} ${user.lastName}`
            }
        });

    } catch (error) {
        console.error('🔥 Check Verification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking verification status',
            error: error.message
        });
    }
};

// ================ DEBUG ENDPOINT (Remove in production) ================
exports.debugOTP = async (req, res) => {
    try {
        const { email } = req.query;

        console.log(`🐛 Debug OTP request for: ${email}`);

        const otps = await OTP.find({ email }).sort({ createdAt: -1 });
        const user = await Student.findOne({ email });

        res.status(200).json({
            success: true,
            data: {
                email,
                userExists: !!user,
                user: user ? {
                    id: user._id,
                    email: user.email,
                    isVerified: user.isVerified,
                    name: `${user.firstName} ${user.lastName}`
                } : null,
                otps: otps.map(otp => ({
                    otp: otp.otp,
                    createdAt: otp.createdAt,
                    purpose: otp.purpose
                })),
                currentTime: new Date().toISOString(),
                hardcodedOtp: '123456'
            }
        });
    } catch (error) {
        console.error('🔥 Debug OTP Error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
};
