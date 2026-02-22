// services/reportService.js
import axios from 'axios';

import { BASE_URL } from './apis';

export const fetchInstructorCourseProgress = async (courseId) => {
  const token = localStorage.getItem('token'); // adjust if you use a different auth method
  const response = await axios.get(`${BASE_URL}/api/course/instructor-course-progress/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
