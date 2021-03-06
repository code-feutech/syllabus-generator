<template>
<v-container fluid>

  <v-text-field
    solo
    label="Search user"
    prepend-icon="search"
    :append-icon="search ? 'close' : undefined"
    :append-icon-cb="() => { search ? search = null : null }"
    class="mb-2"
    ref="searchbar"
    v-model="search"
  />

  <v-layout
    class="mb-2"
    v-if="selectedUser"
  >
    <v-subheader class="pr-1">Viewing activity of</v-subheader>
    <v-chip
      close
      @input="selectedUser = null"
    >
      <icon-img
        no-elevation
        :item="selectedUser"
        :alt="selectedUser.username"
      />
      <span>{{ $wrap.fullname(selectedUser) }}</span>
    </v-chip>

  </v-layout>

  <v-data-table
    class="elevation-1 mb-2"
    :loading="loading"
    :headers="headers"
    :pagination.sync="pagination"
    :items="logs"
  >
    <template slot="no-data">
      <td colspan="100%" class="text-xs-center" :class="{ 'py-4': !loading }">
        <template v-if="loading">Loading...</template>
        <template v-else>Sorry, nothing to display here :(
          <br>
          <v-btn @click="fetch">Refresh</v-btn>
        </template>
      </td>
      <!-- <td v-else colspan="100%">
        <v-alert
          style="margin: 0"
          :value="true"
          color="error"
          icon="warning"></v-alert>
      </td> -->
    </template>
    <template slot="items" slot-scope="props">
      <td>
        <span class="none">{{ props.item.created_at }}</span>
        <div v-html="$moment.unix(props.item.created_at).format('MMMM DD, YYYY h:mm A')"></div>
      </td>
      <td>{{ props.item.user_id }}</td>
      <!-- <td>
        <template v-if="props.item.img_src.length">
          <icon-img
            class="ma-2"
            size="32"
            :item="props.item"
            :alt="props.item.username"
          />
        </template>
        <pre v-else>No image.</pre>
      </td> -->
      <td>
        <a
          @click="selectedUser = props.item"
          style="text-decoration: underline"
        >{{ $wrap.fullname(props.item) }}</a>
      </td>
      <td>{{ props.item.username }}</td>
      <td v-html="$md.makeHtml(props.item.content)"></td>
      <td>
        <v-chip
          label
        >{{ categories[props.item.category].name }}</v-chip>
      </td>
      <td>{{ categories[props.item.category].types[props.item.type] }}</td>
      <td class="px-0">
        <v-layout justify-center align-center>
          <v-tooltip top>
            <v-btn
              icon
              class="mx-0"
              slot="activator"
              @click="viewItem(props.item)"
              :disabled="isNonViewable(props.item.category)"
            >
              <v-icon color="teal">info</v-icon>
            </v-btn>
            <span>View Detailed</span>
          </v-tooltip>
        </v-layout>

      </td>
    </template>
  </v-data-table>

  <dialog-detailed-audit ref="dialog"/>

</v-container>
</template>

<script>
import qs from 'qs'
import debounce from 'lodash/debounce'
import IconImg from '@/include/IconImg'
import DialogDetailedAudit from '@/include/dialogs/DialogDetailedAudit'

export default {
  name: 'audit',
  components: {
    IconImg,
    DialogDetailedAudit
  },
  data: () => ({
    url: '/logs',
    headers: [
      { text: 'Datetime', value: 'created_at', align: 'left', sortable: true },
      { text: 'User Id', value: 'user_id', align: 'left', sortable: false },
      // { text: 'Image', value: 'img_src', align: 'left', sortable: false },
      { text: 'Name', value: 'fname', align: 'left', sortable: false },
      { text: 'Username', value: 'username', align: 'left', sortable: false },
      { text: 'Content', value: 'content', align: 'left', sortable: false },
      { text: 'Category', value: 'category', align: 'left', sortable: true },
      { text: 'Type', value: 'type', align: 'left', sortable: false },
      { text: 'Actions', value: 'id', align: 'left', sortable: false }
    ],
    categories: {
      1: {
        name: 'User Logs',
        types: {
          0: 'Out',
          1: 'In'
        }
      },
      2: {
        name: 'Workflow Logs',
        types: {
          1: 'View',
          2: 'Approval',
          3: 'Disapproval'
        }
      },
      3: {
        name: 'Manage Users',
        types: {
          1: 'Add',
          2: 'Update',
          3: 'Delete',
          4: 'CSV'
        }
      },
      4: {
        name: 'Manage Courses',
        types: {
          1: 'Add',
          2: 'Update',
          3: 'Delete',
          4: 'CSV'
        }
      },
      5: {
        name: 'Manage Curriculum',
        types: {
          1: 'Add',
          2: 'Update',
          3: 'Delete'
        }
      },
      6: {
        name: 'Manage Outcomes',
        types: {
          1: 'Add',
          2: 'Update',
          3: 'Delete'
        }
      },
      7: {
        name: 'Manage Books',
        types: {
          1: 'Add',
          2: 'Update',
          3: 'Delete',
          4: 'CSV'
        }
      },
      8: {
        name: 'Syllabus Content',
        types: {
          1: 'Update'
        }
      },
      9: {
        name: 'Grading System',
        types: {
          1: 'Update'
        }
      },
      10: {
        name: 'CLO Options',
        types: {
          1: 'Update'
        }
      },

      11: {
        name: 'Workflow',
        types: {
          1: 'Create',
          1: 'Delete'
        }
      },
      12: {
        name: 'Generator',
        types: {
          1: 'Save',
          1: 'Submit'
        }
      },
      13: {
        name: 'Course',
        types: {
          1: 'View',
          1: 'Tree View'
        }
      },
      14: {
        name: 'Syllabus',
        types: {
          1: 'View'
        }
      },
      15: {
        name: 'Profile',
        types: {
          1: 'Update'
        }
      }
    },

    logs: [],

    selectedUser: null,

    loading: false,
    pagination: {},
    limit: 5,
    offset: 1,

    search: null
  }),

  watch: {
    pagination: {
      deep: true,
      handler(e) {
        console.log(e)
        this.limit = e.rowsPerPage
        this.offset = e.page
        this.fetch()
      }
    },
    selectedUser(e) {
      this.fetch()
    },
    
    loading(e) {
      this.$bus.refresh(e)
    },
    search(e) {
      this.fetch()
    }
  },

  created() {
    // this.fetch()
  },

  methods: {
    isNonViewable(category) {
      category = Number(category)
      const nonViewable = [1, 8, 9, 10]
      // if category belongs in nonviewable, it is not viewable
      return nonViewable.includes(category)
    },

    viewItem(item) {
      if (this.$refs.dialog) {
        this.$refs.dialog.viewItem(item)
      }
    },

    fetch: debounce(function() {
      this.loading = true
      this.$http.post(this.url, qs.stringify({
        userId: this.selectedUser ? this.selectedUser.user_id : null,
        search: this.search,
        limit: this.limit,
        offset: this.offset
      })).then(res => {
        console.warn(res.data)
        if (!res.data.success) {
          throw new Error('Request failure.')
        }
        this.logs = res.data.logs
        this.loading = false
      }).catch(e => {
        console.error(e)
        this.loading = false
      })
    }, 300)
  }
}
</script>
