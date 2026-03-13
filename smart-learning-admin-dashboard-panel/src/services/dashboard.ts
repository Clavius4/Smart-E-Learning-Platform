import api from './api';

export interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  recentCourses: Array<{
    _id: string;
    courseName: string;
    courseDescription: string;
    instructor: { firstName: string; lastName: string };
    studentsEnrolled: string[];
    createdAt: string;
  }>;
  trendingCourses: Array<{
    _id: string;
    courseName: string;
    thumbnail: string;
    price: number;
    enrollmentCount: number;
  }>;
  categoryStats: Array<{
    id: string;
    name: string;
    value: number;
  }>;
  signupStats: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  // optional weekly active students (we can compute from engagementMetrics later)
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/dashboard-stats');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to fetch dashboard stats');
};