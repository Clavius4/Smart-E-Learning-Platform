import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Route imports
import LandingView from '../views/LandingView.vue'
import GamesView from '../views/GamesView.vue'
import AuthView from '../views/AuthView.vue'
import HelpView from '../views/HelpView.vue'
import CategoryView from '../views/CategoryView.vue'
import NotFoundView from '../views/404View.vue'
import ForgotPasswordView from '../views/ForgotPassword.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import LearningCoursesView from '../views/LearningCourses.vue'
import DashboardView from '../views/DashboardView.vue'
import CoursesView from '../views/CoursesView.vue'
import CoursePlayer from '../views/CoursePlayer.vue'
import CourseQuiz from '../views/CourseQuiz.vue'
import QuizResults from '../views/QuizResults.vue'
import OnboardingFlow from '../components/navigation/OnboardingFlow.vue'
import OTPverification from '../views/OTPverification.vue'
import LevelAssessment from '../views/LevelAssessment.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LandingView,
    meta: { title: 'Home - Smart Learning' }
  },
  {
    path: '/games',
    name: 'games',
    component: GamesView,
    meta: { title: 'Educational Games' }
  },
  {
    path: '/grade/:level',
    name: 'grade',
    component: CategoryView,
    props: true,
    meta: { title: 'Grade Level' }
  },
  {
    path: '/parents',
    name: 'parents',
    component: AuthView,
    props: true,
    meta: { title: 'Parents Portal' }
  },
  {
    path: '/help',
    name: 'help',
    component: HelpView,
    props: true,
    meta: { title: 'Help Center' }
  },
  {
    path: '/404',
    name: '404',
    component: NotFoundView,
    props: true,
    meta: { title: 'Page Not Found' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    props: true,
    meta: {
      guestOnly: true,
      title: 'Login'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    props: true,
    meta: {
      guestOnly: true,
      title: 'Create Account'
    }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    props: true,
    meta: {
      guestOnly: true,
      title: 'Reset Password'
    }
  },
  {
    path: '/learning-courses',
    name: 'learning-courses',
    component: LearningCoursesView,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Learning Courses'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      title: 'Dashboard'
    },
    props: true
  },
  //     {
  //   path: '/level-assessment',
  //   name: 'level-assessment',
  //   component: LevelAssessment,
  //   children: [
  //     {
  //       path: 'beginner',
  //       name: 'level-assessment-beginner',
  //       component: () => import('@/views/assessment/BeginnerAssessment.vue'),
  //       meta: { requiresAuth: true, title: 'Beginner Assessment' }
  //     },
  //     {
  //       path: 'intermediate',
  //       name: 'level-assessment-intermediate',
  //       component: () => import('@/views/assessment/IntermediateAssessment.vue'),
  //       meta: { requiresAuth: true, title: 'Intermediate Assessment' }
  //     }
  //   ],
  //   meta: { requiresAuth: true, title: 'Level Assessment' },
  //   props: true
  // },
  {
    path: '/level-assessment/:level',
    name: 'level-assessment',
    component: LevelAssessment,
    meta: { requiresAuth: true, title: 'Level Assessment' },
    props: true
  },

  {
    path: '/course/:id/quiz',
    name: 'QuizPage',
    component: () => import('@/views/QuizPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesView,
    meta: {
      title: 'Browse Courses',
      requiresAuth: true
    }
  },
  {
    path: '/course/:id',
    name: 'course-player',
    component: CoursePlayer,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Course Player'
    }
  },
  // {
  //   path: '/course/:courseId/quiz',
  //   name: 'course-quiz',
  //   component: CourseQuiz,
  //   props: true,
  //   meta: { 
  //     requiresAuth: true,
  //     title: 'Course Quiz' 
  //   }
  // },
  {
    path: '/quiz-results',
    name: 'quiz-results',
    component: QuizResults,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Quiz Results'
    }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: OnboardingFlow,
    props: true,
    meta: {
      title: 'Onboarding'
    }
  },
  {
    path: '/verify-otp',
    name: 'verify-otp',
    component: () => import('@/views/OTPverification.vue'),
    meta: {
      guestOnly: true,
      title: 'Verify Account'
    }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/ResetPassword.vue'),
    meta: {
      guestOnly: true,
      title: 'Reset Password'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: 'My Profile'
    }
  },
  {
    path: '/profile/edit',
    name: 'edit-profile',
    component: () => import('@/views/EditProfile.vue'),
    meta: {
      requiresAuth: true,
      title: 'Edit Profile'
    }
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: () => import('@/views/ChangePassword.vue'),
    meta: {
      requiresAuth: true,
      title: 'Change Password'
    }
  },
  {
    path: '/enrolled-courses',
    name: 'enrolled-courses',
    component: () => import('@/views/EnrolledCourses.vue'),
    meta: {
      requiresAuth: true,
      title: 'My Courses'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating
    return savedPosition || { top: 0 }
  }
})

export const setupRouter = (app) => {
  // Set document titles
  router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Smart Learning Platform'
    next()
  })

  // Authentication guard
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    try {
      // Skip auth check if no auth requirements
      if (!to.meta.requiresAuth && !to.meta.guestOnly) {
        return next()
      }

      // Check authentication status
      const isAuthenticated = await authStore.checkAuth()

      // Redirect authenticated users away from guest-only routes
      if (to.meta.guestOnly && isAuthenticated) {
        return next('/courses')
      }

      // Redirect unauthenticated users away from protected routes
      if (to.meta.requiresAuth && !isAuthenticated) {
        return next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }

      next()
    } catch (error) {
      console.error('Router navigation error:', error)
      next('/') // Fallback to home on error
    }
  })

  return router
}

export default router
