export interface CategoryStat {
    _id: string; // Category name
    count: number;
}

export interface SignupStat {
    _id: { year: number; month: number };
    count: number;
}

export interface TrendingCourse {
    _id: string; // Course ID
    courseName: string;
    thumbnail: string;
    price: number;
    instructorIndex: number; // or object if expanded
}

export interface DashboardStats {
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    recentCourses: RecentOrderRow[];
    trendingCourses: TrendingCourse[];
    categoryStats: CategoryStat[];
    signupStats: SignupStat[];
}

export interface TopProduct {
    id: number | string;
    image: string;
    title: string;
    price: string;
    rating: number;
    link: string;
}

export interface RecentOrderRow {
    id: number | string;
    product: { name: string };
    time: number;
    totalOrder: number | string;
    inStock: number | string;
    pending: number | string;
    canceled?: number;
    delevered?: number;
    balance?: number;
}
