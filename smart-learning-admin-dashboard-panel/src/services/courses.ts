import api from './api';

/** Server-side doc */
export interface CourseDoc {
  _id: string;
  courseName: string;
  courseDescription: string;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string;
  } | null;
  studentsEnrolled: string[];
}

/* --- GET all ----------------------------------------------------------- */
export const fetchCourses = () =>
  api
    .get<{ success: boolean; data: CourseDoc[] }>('/admin/allcourse')
    .then((r) => r.data.data);

/* --- POST new (edit this path/shape to match your API) ----------------- */
export const createCourse = (payload: {
  courseName: string;
  courseDescription: string;
  instructorId?: string;
  whatYouWillLearn?: string;
  category?: string;
  level?: string;
}) => api.post<CourseDoc>('/course/createCourse', {
  ...payload,
  tag: JSON.stringify([]), // required by backend
  status: 'Draft',
  whatYouWillLearn: payload.whatYouWillLearn || 'TBD',
  category: payload.category || '654321', // Dummy ID if not provided, backend might fail if not valid, we need to handle this.
  level: payload.level || 'Beginner'
}).then((r) => r.data);

/* --- DELETE ------------------------------------------------------------ */

export const deleteCourse = (id: string) =>
  api.delete('/admin/deleteCourse', { data: { courseId: id } });


