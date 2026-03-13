import api from './api';

export interface NotificationItem {
  _id: string;
  action: string;
  userRole: string;
  timestamp: string;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
    role?: string;
  };
  courseId?: {
    _id: string;
    courseName: string;
  };
}

// Mock data for development - remove when backend endpoint is ready
const mockNotifications: NotificationItem[] = [
  {
    _id: '1',
    action: 'login',
    userRole: 'student',
    timestamp: new Date().toISOString(),
    userId: {
      _id: 's1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'student'
    }
  },
  {
    _id: '2',
    action: 'course_enroll',
    userRole: 'student',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: {
      _id: 's2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'student'
    },
    courseId: {
      _id: 'c1',
      courseName: 'Introduction to Programming'
    }
  },
  {
    _id: '3',
    action: 'course_complete',
    userRole: 'student',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    userId: {
      _id: 's3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      role: 'student'
    },
    courseId: {
      _id: 'c2',
      courseName: 'Mathematics Basics'
    }
  }
];

export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const response = await api.get('/admin/notifications');
    if (response.data.success) {
      return response.data.data.notifications;
    }
    // If API returns but with error, fallback to mock
    console.warn('API returned error, using mock data');
    return mockNotifications;
  } catch (error) {
    console.warn('Failed to fetch notifications from API, using mock data', error);
    // Return mock data for development
    return mockNotifications;
  }
};