export interface TopCard {
  id: string | number;
  icon: string;
  title: string;
  count: number;
  iconColor: string;
  iconBg: string;
}

export const topCardsData: TopCard[] = [
  {
    id: 1,
    icon: 'mdi:teacher',
    title: 'Total Instructors',
    count: 5,
    iconColor: 'secondary.main',
    iconBg: 'transparent.secondary.main',
  },
  {
    id: 2,
    icon: 'mdi:account-group',
    title: 'Total Students',
    count: 78,
    iconColor: 'warning.main',
    iconBg: 'transparent.warning.main',
  },
  {
    id: 3,
    icon: 'mdi:book-open-page-variant',
    title: 'Courses Available',
    count: 12,
    iconColor: 'error.light',
    iconBg: 'transparent.error.light',
  },
  {
    id: 4,
    icon: 'heroicons:briefcase-20-solid',
    title: 'System Adminstrators',
    count: 2,
    iconColor: 'primary.main',
    iconBg: 'transparent.primary.main',
  },
];
