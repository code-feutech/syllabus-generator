import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import Generator from '@/components/Generator'
import Courses from '@/components/Courses'
import CourseTree from '@/components/CourseTree'
import Assignments from '@/components/Assignments'
import Reviews from '@/components/Reviews'
import Workflow from '@/components/Workflow'
import Syllabus from '@/components/Syllabus'
import SyllabusView from '@/components/SyllabusView'

import ManageUsers from '@/components/manage/ManageUsers'
import ManageCourses from '@/components/manage/ManageCourses'
import ManageBooks from '@/components/manage/ManageBooks'
import ManageCurriculum from '@/components/manage/ManageCurriculum'
import ManageOutcomes from '@/components/manage/ManageOutcomes'

import Audit from '@/components/reports/Audit'
import UserLogs from '@/components/reports/UserLogs'

import OutcomesExplorer from '@/components/OutcomesExplorer'

import NotFound from '@/components/errors/NotFound'

Vue.use(Router)

export default new Router({
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
        // , offset: { x: 0, y: 10 }
      }
    }
    return savedPosition ? savedPosition : { x: 0, y: 0 }
  },

  routes: [
    // auth 0
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        auth: 0
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        auth: 0
      }
    },
    // auth 3
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        auth: [3, 4, 5],
        icon: 'dashboard'
      }
    },
    {
      path: '/generator/:assignId',
      name: 'Generator',
      component: Generator,
      props: true,
      meta: {
        auth: [3, 4],
        icon: 'build'
      }
    },
    {
      path: '/courses/:courseId?',
      name: 'Courses',
      component: Courses,
      props: true,
      meta: {
        auth: [3, 4, 5],
        icon: 'school'
      }
    },
    {
      path: '/tree/:courseId',
      name: 'CourseTree',
      component: CourseTree,
      props: true,
      meta: {
        auth: [3, 4, 5],
        icon: 'timeline'
      }
    },
    {
      path: '/syllabus/view/:courseId/:syllabusId',
      name: 'SyllabusView',
      component: SyllabusView,
      props: true,
      meta: {
        auth: [1, 3, 4, 5],
        title: 'Syllabus',
        icon: 'subject'
      }
    },
    {
      path: '/assignments',
      name: 'Assignments',
      component: Assignments,
      meta: {
        auth: 3,
        icon: 'assignment'
      }
    },
    {
      path: '/reviews',
      name: 'Reviews',
      component: Reviews,
      meta: {
        auth: 5,
        icon: 'rate_review'
      }
    },
    {
      path: '/workflow',
      name: 'Workflow',
      component: Workflow,
      meta: {
        auth: [4],
        icon: 'supervisor_account'
      }
    },
    {
      path: '/syllabus/:assignId',
      name: 'Syllabus',
      component: Syllabus,
      props: true,
      meta: {
        auth: [3, 4, 5],
        icon: 'subject'
      }
    },

    // manage

    {
      path: '/manage/users',
      name: 'ManageUsers',
      component: ManageUsers,
      meta: {
        auth: 1,
        title: 'Manage Users',
        icon: 'people'
      }
    },
    {
      path: '/manage/courses',
      name: 'ManageCourses',
      component: ManageCourses,
      meta: {
        auth: 1,
        title: 'Manage Courses',
        icon: 'school'
      }
    },
    {
      path: '/manage/books',
      name: 'ManageBooks',
      component: ManageBooks,
      meta: {
        auth: [1, 6],
        title: 'Manage Books',
        icon: 'library_books'
      }
    },
    {
      path: '/manage/curriculum',
      name: 'ManageCurriculum',
      component: ManageCurriculum,
      meta: {
        auth: 1,
        title: 'Manage Curriculum',
        icon: 'description'
      }
    },
    {
      path: '/manage/outcomes',
      name: 'ManageOutcomes',
      component: ManageOutcomes,
      meta: {
        auth: 1,
        title: 'Manage Outcomes',
        icon: 'notes'
      }
    },

    // end of manage

    // reports

    {
      path: '/reports/audit',
      name: 'Audit',
      component: Audit,
      meta: {
        auth: 1,
        title: 'Audit Trail',
        icon: 'timeline'
      }
    },
    {
      path: '/reports/logs/:userId?',
      name: 'UserLogs',
      component: UserLogs,
      props: true,
      meta: {
        auth: 1,
        title: 'User Logs',
        icon: 'access_time'
      }
    },

    // end of reports

    // explorer

    {
      path: '/explorer/outcomes',
      name: 'OutcomesExplorer',
      component: OutcomesExplorer,
      meta: {
        auth: [1, 3, 4, 5],
        title: 'Outcomes',
        icon: 'notes'
      }
    },

    // end of explorer

    // last resort
    {
      path: '*',
      name: 'NotFound',
      component: NotFound,
      meta: {
        title: 'Error 404',
        auth: -1
      }
    }
  ]
})
