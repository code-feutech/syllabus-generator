<template>
<div>
  
  <v-layout justify-center>
    <v-btn
      block
      small
      color="primary lighten-1"
      @click="dialog = true"
    >
      <v-icon small>add</v-icon>
    </v-btn>
  </v-layout>

  <div
    v-if="selected.length"
    class="selection-box mt-2"
  >
    <ul>
      <li :key="i" v-for="(t, i) in selected">
        <v-layout align-baseline>
          <v-tooltip top>
            <v-btn
              icon
              small
              flat
              class="ma-0"
              slot="activator"
              @click="selected.splice(i, 1)"
            >
              <v-icon small color="error">close</v-icon>
            </v-btn>
            <span>Remove</span>
          </v-tooltip>
          <span v-html="$md.makeHtml(t)"/>
        </v-layout>
      </li>
    </ul>
  </div>

  <v-dialog
    v-model="dialog"
    width="800"
    transition="fade-transition"
  >
    <v-text-field
      solo
      ref="searchbar"
      label="Search keyword or enter ILO"
      :prepend-icon="search ? 'add' : 'search'"
      :prepend-icon-cb="search ? enterSearch : undefined"
      :append-icon="search ? 'close' : undefined"
      :append-icon-cb="search ? () => { search = null } : undefined"
      v-model="search"
      @keypress.enter.native="enterSearch"
      :loading="loading"
    />

    <v-progress-linear
      :active="loading"
      :indeterminate="true"
      color="accent"
      class="my-0"
      :height="loading ? 3 : 0"
      background-color="white"
    />

    <select-list
      v-model="selected"
      :items="selected"
      :id="'selected-ilo-' + index + '-'"
      max-height="25vh"
      delete-mode
      editable
      :is-selected="(items, item) => items.indexOf(item) > -1"
    >
      <template
        slot="title"
      ><strong v-text="selected.length"/>&nbsp;Selected</template>
      <template
        slot="item"
        slot-scope="props"
      >
        <markdown-textarea
          edit-on-click
          v-model="selected[props.index]"
        />
      </template>
    </select-list>

    <select-list
      clearable
      v-model="selected"
      :items.sync="outcomes"
      :id="'ilo-' + index + '-'"
      max-height="25vh"
      :is-selected="(items, item) => items.indexOf(item) > -1"
    >
      <template
        slot="title"
      ><strong
        v-text="outcomes.length"
      />&nbsp;{{ search ? 'Results' : 'Suggested' }}</template>
      <span
        slot="item"
        slot-scope="props"
        class="select-list-item"
        v-html="$md.makeHtml(props.item)"
      />
    </select-list>

  </v-dialog>

</div>
</template>

<script>
import qs from 'qs'
import debounce from 'lodash/debounce'
import SelectList from '@/include/SelectList'
import MarkdownTextarea from '@/include/MarkdownTextarea'

export default {
  name: 'ilo-picker',
  components: {
    SelectList,
    MarkdownTextarea
  },
  props: {
    act: Object,
    syllabus: Object,
    index: Number,
    value: Array
  },
  data: () => ({
    url: '/outcomes',
    suggestUrl: '/outcomes/suggest',
    outcomes: [],
    selected: [],

    dialog: false,
    search: null,
    loading: false
  }),

  watch: {
    value(e) {
      this.selected = e
    },
    selected(to, from) {
      // this.act.ilo = to
      this.$emit('input', to)
      this.$bus.$emit('gen--ilo.updated')
    },
    dialog(e) {
      if (e) {
        this.suggest()
        setTimeout(() => {
          if (this.$refs.searchbar) {
            this.$refs.searchbar.focus()
          }
        })
      } else {
        this.search = null
      }
    },
    search(e) {
      this.loading = true
      this.query()
    }
  },

  created() {
    this.$bus.$on('gen--suggestions.update', this.suggest)
    this.$bus.$on('gen--topics.updated', this.suggest)
    // do suggest when bus generator suggestions changes
    this.$bus.$on('watch--generator.suggestions', this.suggest)

    // set ilo
    // if (this.act) {
    //   this.selected = this.act.ilo
    // }
    this.selected = this.value

    // this.suggest()
  },
  beforeDestroy() {
    this.$bus.$off('gen--suggestions.update', this.suggest)
    this.$bus.$off('gen--topics.updated', this.suggest)
    this.$bus.$off('watch--generator.suggestions', this.suggest)
  },

  methods: {
    enterSearch() {
      this.selected.indexOf(this.search) == -1 ? this.selected.push(this.search) : undefined
    },

    query: debounce(function(e) {
      // search for book if not empty
      const search = this.search
      if (!search) {
        this.outcomes = []
        this.suggest()
        return
      }

      this.loading = true
      this.$http.post(this.url, qs.stringify({
        search: search,
        strict: true,
        type: 2
      })).then((res) => {
        this.loading = false
        this.outcomes = res.data.outcomes
      }).catch(e => {
        console.error(e)
        this.loading = false
      })
    }, 300),

    suggest(i) {
      // if same as index, proceed
      if (typeof i === 'number') {
        if (i != this.index) {
          return
        }
      }

      // do no execute sugget when bus suggestions is off
      if (!this.$bus.generator.suggestions) {
        this.loading = false
        return
      }
      // include book ids
      let bookIds = []
      if (typeof this.syllabus.content.bookReferences !== 'undefined') {
        this.syllabus.content.bookReferences.forEach(e => {
          bookIds.push(e.id)
        })
      }

      // include topic ids
      let topicIds = []
      this.act.topics.forEach(e => {
        if (typeof e.id !== 'undefined') {
          topicIds.push(e.id)
        }
      })

      // include clo content
      let cloContent = ''
      this.act.cloMap.forEach(e => {
        let clo = this.syllabus.content.courseLearningOutcomes[e]
        if (typeof clo !== 'undefined') {
          cloContent += ' ' + clo
        }
      })

      // include number of clos for limit
      let cloLimit = Object.keys(this.act.cloMap).length

      let poId = this.syllabus.content.programOutcomes.id

      this.loading = true
      this.$http.post(this.suggestUrl, qs.stringify({
        bookIds: bookIds,
        cloContent: cloContent,
        topicIds: topicIds,
        courseId: this.syllabus.course_id,
        curriculumId: poId,
        type: 2,
        limit: 30,
        cloLimit: cloLimit
      })).then((res) => {
        this.loading = false
        this.outcomes = res.data.outcomes
      }).catch((e) => {
        console.error(e)
        this.loading = false
      })
    }
  }
}
</script>
