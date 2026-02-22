import api from './api';

/* ─── exact shape from your API ─── */
export interface StudentDoc {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: string;
  grade?: string;            // e.g. “Darasa la 3”
  image?: string;
  additionalDetails?: string;
}

/* ---------- GET all ---------------------------------------------------- */
export const fetchStudents = () =>
  api
    .get<{ success: boolean; data: StudentDoc[] }>('/admin/getstudents')
    .then((r) => r.data.data
  );
      
/* ---------- POST create ------------------------------------------------ */
// export const createStudent = (payload: {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   gender: string;
//   grade: string;
//   image?: string;
//   additionalDetails?: string;
// }) => api.post<StudentDoc>('/admin/students', payload).then((r) => r.data);


export const createStudent = (payload: {
    firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => api.post<StudentDoc>('/admin/students', payload).then((r) => r.data);

/* ---------- DELETE one ------------------------------------------------- */
export const deleteStudent = (id: string) =>
  api.delete<void>(`/admin/students/${id}`);
