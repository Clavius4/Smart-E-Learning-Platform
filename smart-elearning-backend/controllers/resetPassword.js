const instructors = require('./../models/InstructorModels/InstructorModels');
const mailSender = require('../utils/mailSender');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// ================ resetPasswordToken ================
// exports.resetPasswordToken = async (req, res) => {
//     try {
//         // extract email 
//         const { email } = req.body;

//         // email validation
//         const instructor = await instructors.findOne({ email });

//         if (!instructors) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Your Email is not registered with us'
//             });
//         }

//         // generate token
//         const token = crypto.randomBytes(20).toString("hex");

//         // update user by adding token & token expire date
//         const updatedUser = await instructors.findOneAndUpdate(
//             { email: email },
//             { token: token, resetPasswordTokenExpires: Date.now() + 5 * 60 * 1000 },
//             { new: true }); // by marking true, it will return updated user


//         // create url
//         const url = `https://study-notion-mern-stack.netlify.app/update-password/${token}`;

//         // send email containing url
//         await mailSender(email, 'Password Reset Link', `Password Reset Link : ${url}`);

//         // return succes response
//         res.status(200).json({
//             success: true,
//             message: 'Email sent successfully , Please check your mail box and change password'
//         })
//     }

//     catch (error) {
//         console.log('Error while creating token for reset password');
//         console.log(error)
//         res.status(500).json({
//             success: false,
//             error: error.message,
//             message: 'Error while creating token for reset password'
//         })
//     }
// }

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    const instructor = await instructors.findOne({ email });
    if (!instructor) {
      return res.status(401).json({
        success: false,
        message: 'Your email is not registered with us',
      });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // Save token and expiry
    instructor.token = token;
    instructor.resetPasswordTokenExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await instructor.save();

    // Only send the token via email, no URL
    await mailSender(
      email,
      'Password Reset Code',
      `Use the following token to reset your password:\n\n${token}\n\nThis token will expire in 5 minutes.`
    );

    return res.status(200).json({
      success: true,
      message: 'Reset token sent to email.',
    });
  } catch (error) {
    console.log('Error in resetPasswordToken:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while generating reset password token',
    });
  }
};



// ================ resetPassword ================
// exports.resetPassword = async (req, res) => {
//     try {
//         // extract data
//         // extract token by anyone from this 3 ways
//         const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

//         const { password, confirmPassword } = req.body;

//         // validation
//         if (!token || !password || !confirmPassword) {
//             return res.status(401).json({
//                 success: false,
//                 message: "All fiels are required...!"
//             });
//         }

//         // validate both passwords
//         if (password !== confirmPassword) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Passowrds are not matched'
//             });
//         }


//         // find user by token from DB
//         const userDetails = await instructor.findOne({ token: token });

//         // check ==> is this needed or not ==> for security  
//         if (token !== userDetails.token) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Password Reset token is not matched'
//             });
//         }

//         // console.log('userDetails.resetPasswordExpires = ', userDetails.resetPasswordExpires);

//         // check token is expire or not
//         if (!(userDetails.resetPasswordTokenExpires > Date.now())) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Token is expired, please regenerate token'
//             });
//         }


//         // hash new passoword
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // update user with New Password
//         await instructor.findOneAndUpdate(
//             { token },
//             { password: hashedPassword },
//             { new: true });

//         res.status(200).json({
//             success: true,
//             message: 'Password reset successfully'
//         });
//     }

//     catch (error) {
//         console.log('Error while reseting password');
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             error: error.message,
//             message: 'Error while reseting password12'
//         });
//     }
// }

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Basic validation
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find user with valid token and not expired
    const user = await instructors.findOne({
      token,
      resetPasswordTokenExpires: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.token = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });

  } catch (error) {
    console.log("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong while resetting password",
    });
  }
};
