
//login  ,signup,changePassword in instructor panel
const optGenerator = require('otp-generator');
const OTPI = require('../models/InstructorModels/OTPI')
const Profile = require('../models/InstructorModels/InstructorProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookie = require('cookie');
const mailSender = require('../utils/mailSender');
const otpTemplate = require('../mail/templates/emailVerificationTemplate');
const { passwordUpdated } = require("../mail/templates/passwordUpdate");

const instructor = require('../models/InstructorModels/InstructorModels');

// ================ SEND-OTP For Email Verification ================




exports.verifyOTP = async (req, res) => {



    const { email } = req.body;

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // Save OTP to DB
        const newOtp = await OTPI.create({ email, otp: generatedOtp });

        // Send OTP via email
        const mailResponse = await mailSender(
            email,
            "Your OTP Code",
            `<h3>Your OTP is:</h3><h1>${generatedOtp}</h1>`
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent to instructor's email",
        });

    } catch (error) {
        console.error("Failed to send OTP:", error);
        return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }


};

// ================ SIGNUP ================
exports.signup = async (req, res) => {
    try {
        // extract data 
        const { firstName, lastName, email, password, confirmPassword
            //contactNumber 
        } = req.body;

        // validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(401).json({
                success: false,
                message: 'All fields are required..!'
            });
        }

        // check both pass matches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                messgae: 'passowrd & confirm password does not match, Please try again..!'
            });
        }

        // check user have registered already
        const checkUserAlreadyExits = await instructor.findOne({ email });

        // if yes ,then say to login
        if (checkUserAlreadyExits) {
            return res.status(400).json({
                success: false,
                message: 'User registered already, go to Login Page'
            });
        }

        // find most recent otp stored for user in DB
        // const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        // // console.log('recentOtp ', recentOtp)
        // console.log('Recent OTP from DB:', recentOtp);


        // .sort({ createdAt: -1 }): 


        // if otp not found
        // if (!recentOtp || recentOtp.length == 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Otp not found in DB, please try again'
        //     });
        // } else if (otp !== recentOtp.otp) {
        //     // otp invalid
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid Otp'
        //     })
        // }

        // hash - secure passoword
        let hashedPassword = await bcrypt.hash(password, 10);

        // additionDetails
        const profileDetails = await Profile.create({
            gender: null, dateOfBirth: null, about: null, contactNumber: null
        });

        // let approved = "";
        // approved === "Instructor" ? (approved = false) : (approved = true);

        // create entry in DB
        const userData = await instructor.create({
            firstName, lastName, email, password: hashedPassword,
            additionalDetails: profileDetails._id,
            accountType: "Instructor"
            ,
            // approved: approved,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        // Generate and save OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTPI.create({ email, otp: generatedOtp });


        // send email logic here (optional to keep inside a helper)
        //await mailSender(email, `Your OTP is ${generatedOtp}`, "Verify your email");

        // return success message
        res.status(200).json({
            success: true,
            message: 'User Registered Successfully'
        });
    }

    catch (error) {
        console.log('Error while registering user (signup)');
        console.log(error)
        res.status(401).json({
            success: false,
            error: error.message,
            messgae: 'User cannot be registered , Please try again..!'
        })
    }
}

// ================ LOGIN ================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // check user is registered and saved data in DB
        let user = await instructor.findOne({ email }).populate('additionalDetails');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'You are not registered with us'
            });
        }

        // comapare given password and saved password from DB
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                //accountType: user.accountType // This will help to check whether user have access to route, while authorzation
                role: "instructor"
            };

            // Generate token 
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });

            user = user.toObject();
            user.token = token;
            user.password = undefined; // we have remove password from object, not DB


            // cookie
            const cookieOptions = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                httpOnly: true
            }

            res.cookie('token', token, cookieOptions).status(200).json({
                success: true,
                user,
                token,
                message: 'User logged in successfully'
            });
        }
        // password not match
        else {
            return res.status(401).json({
                success: false,
                message: 'Password not matched'
            });
        }
    }

    catch (error) {
        console.log('Error while Login user');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while Login user'
        })
    }
}
// ================ CHANGE PASSWORD ================
exports.changePassword = async (req, res) => {
    try {
        // extract data
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // validation
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(403).json({
                success: false,
                message: 'All fileds are required'
            });
        }

        // get instructor
        const instructorDetails = await instructor.findById(req.user.id);

        // validate old passowrd entered correct or not
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            instructorDetails.password
        )

        // if old password not match 
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false, message: "Old password is Incorrect"
            });
        }

        // check both passwords are matched
        if (newPassword !== confirmNewPassword) {
            return res.status(403).json({
                success: false,
                message: 'The password and confirm password do not match'
            })
        }


        // hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // update in DB
        const updatedUserDetails = await instructor.findByIdAndUpdate(req.user.id,
            { password: hashedPassword },
            { new: true });


        // send email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                'Password for your account has been updated',
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            // console.log("Email sent successfully:", emailResponse);
        }
        catch (error) {
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }


        // return success response
        res.status(200).json({
            success: true,
            mesage: 'Password changed successfully'
        });
    }

    catch (error) {
        console.log('Error while changing passowrd');
        console.log(error)
        res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while changing passowrd'
        })
    }
}
