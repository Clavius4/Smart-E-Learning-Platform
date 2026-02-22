/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import Splash from 'components/loader/Splash';
import PageLoader from 'components/loader/PageLoader';
import paths, { rootPaths } from './paths';
import Instructors from 'pages/instructors';
import Students from 'pages/students';
import Courses from 'pages/courses';
import RequireAuth from 'components/auth/RequireAuth';
import { AuthProvider } from '../contexts/AuthContext';   // 👈 import
import Categories from 'pages/categories';

const App = lazy(() => import('App'));
const MainLayout = lazy(() => import('layouts/main-layout'));
const AuthLayout = lazy(() => import('layouts/auth-layout'));
const Dashboard = lazy(() => import('pages/dashboard'));
const SignIn = lazy(() => import('pages/authentication/SignIn'));
const SignUp = lazy(() => import('pages/authentication/SignUp'));
const InstructorDetails = lazy(() => import('pages/instructors/InstructorDetails'));
const ResetPassword = lazy(() => import('pages/authentication/ResetPassword'));
const Error404 = lazy(() => import('pages/errors/Error404'));

const routes = [
  {
    /* 👉 wrap everything with AuthProvider so useNavigate() works inside it */
    element: (
      <AuthProvider>
        <Suspense fallback={<Splash />}>
          <App />
        </Suspense>
      </AuthProvider>
    ),

    /* --------- children (unchanged) ---------- */
    children: [
      /* Auth routes */
      {
        path: rootPaths.authRoot,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        ),
        children: [
          {
            path: 'signin',
            element: (
              <AuthLayout>
                <SignIn />
              </AuthLayout>
            ),
          },
          {
            path: 'signup',
            element: (
              <AuthLayout>
                <SignUp />
              </AuthLayout>
            ),
          },
          {
            path: 'reset-password',
            element: (
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            ),
          },
        ],
      },

      /* Main app (protected) */
      {
        path: '/',
        element: (
          <RequireAuth>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </MainLayout>
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: paths.analytics, element: <Instructors /> },
          { path: paths.invoice, element: <Students /> },
          { path: paths.schedule, element: <Courses /> },
          { path: paths.categories, element: <Categories /> },
          { path: 'instructors/:id', element: <InstructorDetails /> },
        ],
      },

      /* 404 */
      { path: '*', element: <Error404 /> },
    ],
  },
];

const router = createBrowserRouter(routes, { 
  basename: '/admin/'  // Must match Vite base
});
export default router;
