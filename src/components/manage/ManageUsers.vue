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

  <v-data-table
    class="elevation-1"
    :loading="loading"
    :headers="headers"
    :pagination.sync="pagination"
    :items="users">
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
      <td>{{ props.item.id }}</td>
      <td>
        <template v-if="props.item.img_src.length">
          <icon-img
            class="ma-2"
            size="32"
            :item="props.item"
            :alt="props.item.username"
          />
        </template>
        <pre v-else>No image.</pre>
      </td>
      <td>{{ props.item.fname }}</td>
      <td>{{ props.item.lname }}</td>
      <td>{{ props.item.username }}</td>
      <td>{{ props.item.title }}</td>
      <td>
        <v-layout justify-center align-center>
          <v-tooltip top>
            <template slot="activator">
              <v-icon
                v-if="props.item.status == 1"
                color="success">check_circle</v-icon>
              <v-icon
                v-else
                color="error">cancel</v-icon>
            </template>
            <span>{{ props.item.status == 1 ? 'Activated' : 'Deactivated' }}</span>
          </v-tooltip>
        </v-layout>
      </td>
      <td class="px-0">
        <v-layout justify-center align-center>
          <v-tooltip top>
            <v-btn slot="activator" icon class="mx-0" @click="editItem(props.item)">
              <v-icon color="teal">edit</v-icon>
            </v-btn>
            <span>Edit</span>
          </v-tooltip>
          <v-tooltip top>
            <v-btn slot="activator" icon class="mx-0" @click="deleteItem(props.item)">
              <v-icon color="pink">delete</v-icon>
            </v-btn>
            <span>Delete</span>
          </v-tooltip>
        </v-layout>
      </td>
    </template>
  </v-data-table>

  <dialog-manage-user ref="dialogManage"/>
  <dialog-csv-users ref="dialogCsv"/>

</v-container>
</template>

<script>
import qs from 'qs'
import debounce from 'lodash/debounce'
import IconImg from '@/include/IconImg'
import DialogManageUser from '@/include/dialogs/DialogManageUser'
import DialogCsvUsers from '@/include/dialogs/DialogCsvUsers'

export default {
  name: 'manage-users',
  components: {
    IconImg,
    DialogManageUser,
    DialogCsvUsers
  },
  data: () => ({
    url: '/users',
    deleteUrl: '/users/delete',
    headers: [
      { text: 'Id', value: 'id', align: 'left', sortable: false },
      { text: 'Image', value: 'img_src', align: 'left', sortable: false },
      { text: 'First Name', value: 'fname', align: 'left' },
      { text: 'Surname', value: 'lname', align: 'left' },
      { text: 'Username', value: 'username', align: 'left' },
      { text: 'Title', value: 'title', align: 'left', sortable: false },
      { text: 'Status', value: 'status', align: 'left', sortable: false },
      { text: 'Actions', value: 'id', sortable: false }
    ],
    users: [],
    // for data table
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
    loading(e) {
      this.$bus.refresh(e)
    },
    search(e) {
      this.fetch()
    }
  },

  created() {
    this.$bus.$on('manage--users.add', this.addItem)
    this.$bus.$on('manage--users.upload', this.csvUsers)
    this.$bus.$on('manage--users.update', this.fetch)
    this.$bus.$on('refresh--btn', this.fetch)
    // this.fetch()
  },
  beforeDestroy() {
    this.$bus.$off('manage--users.add', this.addItem)
    this.$bus.$off('manage--users.upload', this.csvUsers)
    this.$bus.$off('manage--users.update', this.fetch)
    this.$bus.$off('refresh--btn', this.fetch)
  },

  methods: {
    deleteItem(item) {
      this.$bus.$emit('dialog--global.confirm.show', {
        item: item,
        title: 'Delete user',
        subtitle: this.$wrap.fullname(item),
        msg: 'This will delete the user.',
        btn: {
          text: 'Delete',
          color: 'error'
        },
        fn: (onSuccess, onError, doClose, fn) => {
          this.$http.post(this.deleteUrl, qs.stringify({
            id: item.id
          })).then(res => {
            console.warn(res.data)
            if (!res.data.success) {
              throw new Error('Request failure.')
            }

            this.$bus.$emit('snackbar--show', 'User deleted.')
            this.$bus.$emit('manage--users.update')
            this.fetch()
            onSuccess()
          }).catch(e => {
            console.error(e)
            this.$bus.$emit('snackbar--show', {
              text: 'Unable to delete user.',
              btns: {
                text: 'Retry',
                icon: false,
                color: 'accent',
                cb: (sb, e) => {
                  sb.snackbar = false
                  fn(onSuccess, onError, doClose, fn)
                  // this.deleteComment(item)
                }
              }
            })
            onError()
            doClose()
          })
        }
      })
    },

    editItem(item) {
      if (this.$refs.dialogManage) {
        this.$refs.dialogManage.editItem(item)
      }
    },

    addItem() {
      if (this.$refs.dialogManage) {
        this.$refs.dialogManage.addItem()
      }
    },
    csvUsers() {
      if (this.$refs.dialogCsv) {
        this.$refs.dialogCsv.addCsv()
      }
    },

    fetch: debounce(function() {
      this.loading = true
      this.$http.post(this.url, qs.stringify({
        search: this.search,
        limit: this.limit,
        offset: this.offset
      })).then((res) => {
        console.warn(res.data)
        if (!res.data.success) {
          throw new Error('Request failure.')
        }
        let users = res.data.users
        this.users = typeof users === 'object' ? users : []
        this.loading = false
      }).catch(e => {
        console.error(e)
        this.loading = false
      })
    }, 300)
  }
}
</script>
