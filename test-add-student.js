async function testAddStudent() {
    try {
        // 1. Admin login
        const loginRes = await fetch('http://206.189.112.134:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'sharkjoe@gmail.com',
                password: 'sharkjoe123'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Admin token:', token);

        if (!token) {
            console.log('Login failed:', loginData);
            return;
        }

        // 2. Add student
        const res = await fetch('http://206.189.112.134:5000/api/admin/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                firstName: 'Alice',
                lastName: 'Wonderland',
                email: `alice${Date.now()}@example.com`,
                password: 'password123',
                confirmPassword: 'password123'
            })
        });

        const data = await res.json();
        console.log('Student added response status:', res.status);
        console.log('Student added data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testAddStudent();
