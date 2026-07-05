import paths from 'routes/paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  path: string;
  active?: boolean;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: string;
  subheader: string;
  path: string;
  icon?: string;
  avatar?: string;
  active?: boolean;
  items?: SubMenuItem[];
  messages?: number;
}

const sitemap: MenuItem[] = [
  {
    id: 'dashboard',
    subheader: 'Dashboard',
    path: '/',
    icon: 'solar:widget-bold',
    active: true,
  },
  {
    id: 'analytics',
    subheader: 'Instructors',
    path: paths.analytics,
    icon: 'solar:chart-square-bold',
  },
  {
    id: 'invoice',
    subheader: 'Students',
    path: paths.invoice,
    icon: 'solar:ticket-bold',
  },
  {
    id: 'schedule',
    subheader: 'Courses',
    path: paths.schedule,
    icon: 'solar:document-text-bold',
  },

  {
    id: 'categories',
    subheader: 'Categories',
    path: paths.categories,
    icon: 'mage:dashboard-chart-fill',
    messages: 2,
  },
  {
    id: 'calendar',
    subheader: 'Calendar',
    path: '#!',
    icon: 'mage:calendar-2-fill',
  },
  
  {
    id: 'notification',
    subheader: 'Notification',
    path: '#!',
    icon: 'solar:bell-bold',
  },
  {
    id: 'settings',
    subheader: 'Settings',
    path: '#!',
    icon: 'solar:settings-bold',
  },
];

export default sitemap;