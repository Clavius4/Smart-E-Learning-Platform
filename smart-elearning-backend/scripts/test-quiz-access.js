const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
// Use a known existing student login or create one
const EMAIL = 'test_student_access@test.com';
const PASSWORD = 'password123';

async function testAccess() {
    try {
        // 1. Signup/Login
        let token;
        try {
            await axios.post(`${BASE_URL}/student/signup`, {
                firstName: 'Test', lastName: 'Student', email: EMAIL, password: PASSWORD, confirmPassword: PASSWORD
            });
        } catch (e) { } // Ignore if exists

        const login = await axios.post(`${BASE_URL}/student/login`, { email: EMAIL, password: PASSWORD });
        token = login.data.token;

        const headers = { Authorization: `Bearer ${token}` };

        console.log('Testing GET /api/quizzes/quiz (Missing ID)...');
        try {
            await axios.get(`${BASE_URL}/quizzes/quiz`, { headers });
        } catch (err) {
            console.log('Response for /quizzes/quiz:', err.response?.status, err.response?.data);
        }

        console.log('Testing GET /api/quizzes/quiz/trashId (Invalid ID)...');
        try {
            await axios.get(`${BASE_URL}/quizzes/quiz/trashId`, { headers });
        } catch (err) {
            console.log('Response for /quizzes/quiz/trashId:', err.response?.status, err.response?.data);
        }

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

testAccess();
