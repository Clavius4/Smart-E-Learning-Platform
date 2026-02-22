import api from "./api"

export interface InstructorDoc {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: string;
  image?: string;
  courses?: {
    _id: string;
    title: string;
  }[];
}




export const fetchInstructors = () =>
  api
    .get<{ success: boolean; data: InstructorDoc[] }>('/admin/instructors')
    .then((r) => r.data.data);


export const createInstructor = (payload: {
    firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => api.post<InstructorDoc>('/admin/instructors', payload).then((r) => r.data);

export const deleteInstructor = (id: string) =>
  api.delete<void>(`/admin/instructors/${id}`);
