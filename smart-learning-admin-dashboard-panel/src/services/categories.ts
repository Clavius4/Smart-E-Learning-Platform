import axios from 'axios';

//const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'http://206.189.112.134:5000/api';

export interface Instructor {
  firstName: string;
  lastName: string;
}

export interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  instructor: Instructor;
  studentsEnrolled: string[];
  status: string;
  sold?: number;
}

export interface CategoryDoc {
  _id: string;
  name: string;
  description: string;
  courses?: Course[];
}

interface NewCategoryForm {
  name: string;
  description: string;
}

export const fetchCategories = async (): Promise<CategoryDoc[]> => {
  const response = await axios.get(`${API_BASE_URL}/admin/showAllCategories`);
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to fetch categories');
};

export const createCategory = async (
  form: NewCategoryForm
): Promise<CategoryDoc> => {
  const response = await axios.post(`${API_BASE_URL}/admin/createCategory`, form);
  if (response.data.success) {
    const all = await fetchCategories();
    return all[all.length - 1];
  }
  throw new Error('Failed to create category');
};

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await axios.delete(`${API_BASE_URL}/admin/deleteCategory/${id}`);
  if (!response.data.success) {
    throw new Error('Failed to delete category');
  }
};
