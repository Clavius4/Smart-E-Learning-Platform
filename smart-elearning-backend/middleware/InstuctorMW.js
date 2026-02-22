
// // AUTH , IS STUDENT , IS INSTRUCTOR , IS ADMIN

// const jwt = require("jsonwebtoken");
// require('dotenv').config();


// // ================ AUTH ================
// // user Authentication by checking token validating
// exports.authInstructor = (req, res, next) => {
//     try {
//         // extract token by anyone from this 3 ways
//         const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

//         // if token is missing
//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Token is Missing'
//             });
//         }

//         // console.log('Token ==> ', token);
//         // console.log('From body -> ', req.body?.token);
//         // console.log('from cookies -> ', req.cookies?.token);
//         // console.log('from headers -> ', req.header('Authorization')?.replace('Bearer ', ''));

//         // verify token
//         try {
//             const decode = jwt.verify(token, process.env.JWT_SECRET);
//             // console.log('verified decode token => ', decode);
            
//             // *********** example from console ***********
//             // verified decode token =>  {
//             //     email: 'buydavumli@biyac.com',
//             //     id: '650d6ae2914831142c702e4c',
//             //     accountType: 'Student',
//             //     iat: 1699452446,
//             //     exp: 1699538846
//             //   }
//             req.user = decode;
//         }
//         catch (error) {
//             console.log('Error while decoding token');
//             console.log(error);
//             return res.status(401).json({
//                 success: false,
//                 error: error.message,
//                 messgae: 'Error while decoding token'
//             })
//         }
//         // go to next middlewar
//         next();
//     }
//     catch (error) {
//         console.log('Error while token validating');
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             messgae: 'Error while token validating'
//         })
//     }
// }


// // ================ IS STUDENT ================
// exports.isStudent = (req, res, next) => {
//     try {
//         // console.log('User data -> ', req.user)
//         if (req.user != 'Student') {
//             return res.status(401).json({
//                 success: false,
//                 messgae: 'This Page is protected only for student'
//             })
//         }
//         // go to next middleware
//         next();
//     }
//     catch (error) {
//         console.log('Error while cheching user validity with student accountType');
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             error: error.message,
//             messgae: 'Error while cheching user validity with student accountType'
//         })
//     }
// }

