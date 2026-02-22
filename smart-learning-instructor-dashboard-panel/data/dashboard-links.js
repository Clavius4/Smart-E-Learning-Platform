import { ACCOUNT_TYPE } from './../src/utils/constants';

export const sidebarLinks = [
  {
    id: 1,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
  {
    id: 2,
    name: "Dashboard",
    path: "/dashboard/instructor",
   // type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 3,
    name: "My Courses",
    path: "/dashboard/my-courses",
   // type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 4,
    name: "Add Course",
    path: "/dashboard/add-course",
    //type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },
  {
    id: 5,
    name: "Course Report",
    path: "/dashboard/report",
    //type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscGraphLine",
  },{
    id: 6,
    name: "Student progress",
    path: "/dashboard/reportstudent",
    //type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscGraphLine",
  },
  {
    id: 7,
    name: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 8,
    name: "Purchase History",
    path: "/dashboard/purchase-history",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscHistory",
  },
  {
    id: 9,
    name: "Assessments",
    path: "/dashboard/begginer-assessment",
    //type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscMortarBoard",
  },
  // {
  //   id: 9,
  //   name: "Intermediate Assessment",
  //   path: "/dashboard/intermediate-assessment",
  //   //type: ACCOUNT_TYPE.INSTRUCTOR,
  //   icon: "VscLayers",
  // },
];
