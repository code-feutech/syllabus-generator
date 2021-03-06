<template>
<v-navigation-drawer
  app
  fixed
  :mini-variant="$bus.nav.miniVariant"
  :clipped="clipped"
  :temporary="temporary"
  v-model="$bus.nav.model"
>
  <nav-user/>
  <v-list
    class="pb-0"
    :class="{ 'py-0': i != 0 }"
    :key="i"
    v-if="$bus.authHas(list.auth, $bus.session.auth, -1)"
    v-for="(list, i) in lists"
    :subheader="Boolean(list.header)"
  >
    <v-subheader
      class="grey--text"
      v-if="list.header"
    >{{ list.header }}</v-subheader>
    <template v-for="(item, i) in list.items">
      <v-divider :key="i" v-if="typeof item !== 'object'"/>
      <v-tooltip
        :key="i"
        v-else
        :disabled="!$bus.nav.miniVariant"
        right
      >
        <v-list-tile
          ripple
          slot="activator"
          :to="item.to"
          @keypress.enter="listItemClick(item.click)"
          @click="listItemClick(item.click)"
          :exact-active-class="item.to"
          tabindex="1"
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <span>{{ item.tip || item.title }}</span>
      </v-tooltip>
    </template>
  </v-list>

  <v-list class="pa-0">
    <v-tooltip right :disabled="!$bus.nav.miniVariant">
      <v-list-tile
        ripple
        tabindex="1"
        slot="activator"
        @click="$bus.nav.miniVariant = !$bus.nav.miniVariant">
        <v-list-tile-action>
          <v-btn
            icon
            tabindex="1"
            :ripple="false"
            @click.stop="$bus.nav.miniVariant = !$bus.nav.miniVariant">
            <v-icon v-html="$bus.nav.miniVariant ? 'chevron_right' : 'chevron_left'"/>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-content>{{ collapseText }}</v-list-tile-content>
      </v-list-tile>
      <span>{{ collapseText }}</span>
    </v-tooltip>
  </v-list>

  <template v-if="$bus.authHas($bus.session.auth, 1)">
    <dialog-clo-options ref="cloOptions"/>
    <dialog-syllabus-content ref="syllabusContent"/>
    <dialog-grading-system ref="gradingSystem"/>
  </template>
  <dialog-manage-user
    profile
    ref="profile"
    v-if="$bus.authHas($bus.session.auth, [1, 3, 4, 5, 6])"
  />

</v-navigation-drawer>
</template>

<script>
import NavUser from './nav/NavUser'
import DialogCloOptions from '@/include/dialogs/DialogCloOptions'
import DialogSyllabusContent from '@/include/dialogs/DialogSyllabusContent'
import DialogGradingSystem from '@/include/dialogs/DialogGradingSystem'
import DialogManageUser from '@/include/dialogs/DialogManageUser'

export default {
  name: 'navigation',
  components: {
    NavUser,
    DialogCloOptions,
    DialogSyllabusContent,
    DialogGradingSystem,
    DialogManageUser
  },
  data: () => ({
    logoutUrl: '/logout',
    lists: [
      {
        header: '',
        auth: [1, 3, 4, 5, 6],
        items: [
          { title: 'Profile', icon: 'account_circle', tip: 'Profile', click: 'profile' }
        ]
      },
      {
        header: '',
        auth: [3, 4, 5],
        items: [
          // { title: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
          { title: 'Courses', icon: 'school', to: '/courses' }
        ]
      },
      {
        header: '',
        auth: 3,
        items: [
          { title: 'Assignments', icon: 'assignment', to: '/assignments' }
        ]
      },
      {
        header: '',
        auth: 5,
        items: [
          { title: 'Reviews', icon: 'rate_review', to: '/reviews' }
        ]
      },
      {
        header: '',
        auth: [4],
        items: [
          { title: 'Workflow', icon: 'supervisor_account', to: '/workflow' }
        ]
      },
      {
        header: 'Manage',
        auth: 1,
        items: [
          { title: 'Users', icon: 'people', tip: 'Manage Users', to: '/manage/users' },
          { title: 'Courses', icon: 'school', tip: 'Manage Courses', to: '/manage/courses' },
          { title: 'Curriculum', icon: 'assignment', tip: 'Manage Curriculum', to: '/manage/curriculum' },
          { title: 'Outcomes', icon: 'notes', tip: 'Manage Outcomes', to: '/manage/outcomes' }
        ]
      },
      {
        auth: [1, 6],
        items: [
          { title: 'Books', icon: 'library_books', tip: 'Manage Books', to: '/manage/books' }
        ]
      },
      {
        header: 'Syllabus',
        auth: 1,
        items: [
          { title: 'Syllabus Content', icon: 'description', tip: 'Syllabus Content', click: 'syllabusContent' },
          { title: 'Grading System', icon: 'grade', tip: 'Grading System', click: 'gradingSystem' },
          { title: 'CLO Options', icon: 'settings', tip: 'CLO Options', click: 'cloOptions' }
        ]
      },
      {
        header: 'Report',
        auth: 1,
        items: [
          { title: 'Audit Trail', icon: 'timeline', tip: 'Audit Trail', to: '/reports/audit' },
          { title: 'User Logs', icon: 'access_time', tip: 'Grading System', to: '/reports/logs' },
        ]
      },
      {
        header: 'Explorer',
        auth: [1, 3, 4, 5],
        items: [
          { title: 'Outcomes', icon: 'notes', tip: 'Outcomes', to: '/explorer/outcomes' }
        ]
      },
      // logout
      {
        auth: -1,
        items: [
          '',
          { title: 'Logout', icon: 'exit_to_app', click: 'logout' }
        ]
      }
    ],

    routes: {
      hidden: ['Syllabus', 'CourseTree', 'OutcomesExplorer'],
      short: ['Generator', 'SyllabusView']
    }
  }),

  computed: {
    collapseText() {
      return this.$bus.nav.miniVariant ? 'Expand' : 'Collapse'
    },
    temporary() {
      return this.checkRoute(this.$route.name, this.routes.hidden)
    },
    clipped() {
      return !this.temporary
    }
  },

  watch: {
    $route(to, from) {
      this.triggerRoute(to, from)
    }
  },

  created() {
    this.triggerRoute(this.$route, this.$route)
  },

  methods: {
    logout() {
      // logout here
      this.$bus.refresh(true)
      this.$http.post(this.logoutUrl).then((res) => {
        if (!res.data.success) {
          throw new Error('Request failure.')
        }
        this.$bus.refresh(false)
        this.$bus.$emit('snackbar--show', 'Logout successfully.')
        this.$bus.sessionCheck(this.$route, this.$http)
      }).catch(e => {
        console.error(e)
        this.$bus.$emit('snackbar--show', 'Unable to logout.')
        this.$bus.refresh(false)
      })
    },

    triggerRoute(to, from) {
      if (
        !this.checkRoute(to.name, this.routes.hidden) &&
        this.checkRoute(from.name, this.routes.hidden)
      ) {
        this.$bus.nav.model = null
      }

      if (
        this.checkRoute(to.name, this.routes.short) || 
        this.checkRoute(from.name, this.routes.short)
      ) {
        if (this.$bus.nav.model === null || this.$bus.nav.model === true) {
          this.$bus.nav.model = null
          this.$bus.nav.miniVariant = this.checkRoute(to.name, this.routes.short)
        }
      }
    },

    cloOptions() {
      if (this.$refs.cloOptions) {
        this.$refs.cloOptions.show = true
      }
    },
    syllabusContent() {
      if (this.$refs.syllabusContent) {
        this.$refs.syllabusContent.show = true
      }
    },
    gradingSystem() {
      if (this.$refs.gradingSystem) {
        this.$refs.gradingSystem.show = true
      }
    },
    profile() {
      if (this.$refs.profile) {
        this.$refs.profile.editItem(this.$bus.session.user)
      }
    },

    checkRoute(route, arr) {
      return arr.includes(route)
    },

    listItemClick(e) {
      if (typeof e === 'string') {
        this[e]()
      }
    }
  }
}
</script>
