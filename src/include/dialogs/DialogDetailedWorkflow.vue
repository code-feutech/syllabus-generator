<template>
<v-dialog
  v-model="show"
  width="720"
  :persistent="loading"
  transition="fade-transition"
  scrollable
>
  <v-card v-if="assign">
    <v-card-title primary-title>
      <div>
        <div class="headline">{{ course().code }}</div>
        <div class="subheading">{{ course().title }}</div>
      </div>
    </v-card-title>

    <v-card-text class="pt-0">

      <v-layout row wrap>
        <v-flex
          xs12 sm5 class="pr-2 minimal-scrollbar"
          style="max-height: 420px; overflow-y: auto"
        >
          <div class="body-1 grey--text">Workflow by</div>
          <v-list>
            <v-list-tile @click="() => {}">
              <v-list-tile-action class="thinner-action">
                <icon-img
                  :item="createdBy()"
                  color="primary lighten-1"
                  size="32"
                  caption
                />
              </v-list-tile-action>
              <v-list-tile-content>
                <v-subheader>
                  <div>
                    <div>
                      <span v-text="$wrap.fullname(createdBy())"/>
                      <add-me :id="createdBy().id"/>
                    </div>
                    <div
                      class="caption"
                      v-if="createdBy().title"
                      v-html="createdBy().title"
                    />
                  </div>
                </v-subheader>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>

          <remarks-inst
            :remarks="remarks()"
            class="mx-1 mb-2"
          />

          <v-list dense class="mb-3">

            <v-list-tile
              ripple
              v-if="$bus.session.user.id == assigned().id"
              :to="'/generator/' + assign.id"
            >
              <v-list-tile-action class="thin-action">
                <v-tooltip top>
                  <v-btn icon slot="activator" :to="'/generator/' + assign.id">
                    <v-icon color="grey">build</v-icon>
                  </v-btn>
                  <span>Create syllabus</span>
                </v-tooltip>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="'Create syllabus'"/>
              </v-list-tile-content>
            </v-list-tile>

            <!-- <v-list-tile
              ripple
              v-if="!viewOnly && $bus.session.user.id == createdBy().id"
              @click="() => {}"
            >
              <v-list-tile-action class="thin-action">
                <v-tooltip top>
                  <v-btn icon slot="activator" @click="() => {}">
                    <v-icon color="grey">edit</v-icon>
                  </v-btn>
                  <span>Edit workflow</span>
                </v-tooltip>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="'Edit workflow'"/>
              </v-list-tile-content>
            </v-list-tile> -->

            <v-list-tile
              ripple
              v-if="assign.status != 3"
              :to="'/syllabus/' + assign.id"
            >
              <v-list-tile-action class="thin-action">
                <v-tooltip top>
                  <v-btn icon slot="activator" :to="'/syllabus/' + assign.id">
                    <v-icon color="grey">visibility</v-icon>
                  </v-btn>
                  <span>View syllabus</span>
                </v-tooltip>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="'View syllabus'"/>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile
              ripple
              @click="viewActivity"
            >
              <v-list-tile-action class="thin-action">
                <v-tooltip top>
                  <v-btn icon slot="activator" @click="viewActivity">
                    <v-icon color="grey">history</v-icon>
                  </v-btn>
                  <span>View activity</span>
                </v-tooltip>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="'View activity'"/>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider
              v-if="
                $bus.session.user.id == assigned().id ||
                $bus.session.user.id == createdBy().id ||
                assign.status != 3
              "
            />

            <v-list-tile @click="() => {}">
              <v-list-tile-action class="thin-action">
                <v-tooltip top>
                  <v-btn icon slot="activator">
                    <v-icon color="grey">update</v-icon>
                  </v-btn>
                  <span>Last updated in</span>
                </v-tooltip>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title
                  v-text="$moment.unix(assign.updated_at).format('MMM D, YYYY h:mmA')"
                />
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile @click="() => {}">
              <v-list-tile-action class="thin-action">
                <v-tooltip top>
                  <v-btn icon slot="activator">
                    <v-icon color="grey">access_time</v-icon>
                  </v-btn>
                  <span>Created at</span>
                </v-tooltip>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title
                  v-text="$moment.unix(assign.created_at).format('MMM D, YYYY h:mmA')"
                />
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile @click="() => {}">
              <v-list-tile-action class="thin-action">
                <status :item="assign"/>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Status:
                  <strong>{{ $wrap.status(assign.status) }}</strong>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

          </v-list>
        </v-flex>

        <v-flex xs12 sm7 class="pl-2 minimal-scrollbar">

          <!-- end of about -->
          <div>

            <div class="body-1 grey--text">Assigned</div>
            <v-list>
              <v-list-tile @click="() => {}">
                <v-list-tile-action class="thinner-action">
                  <icon-img
                    :item="assigned()"
                    color="primary lighten-1"
                    size="32"
                    caption
                  />
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-subheader>
                    <div>
                      <div>
                        <span v-text="$wrap.fullname(assigned())"/>
                        <add-me :id="assigned().id"/>
                      </div>
                      <div class="caption">
                        <template
                          v-if="assigned().title"
                        >{{ assigned().title }}&nbsp;</template>
                        <template>(Faculty-In-Charge)</template>
                      </div>
                    </div>
                  </v-subheader>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>

            <template v-if="levels().length">
              <div class="body-1 grey--text">
                <span>Reviewers</span>
                <strong
                  class="caption grey--text"
                  style="font-weight: bold"
                >(Level {{ levelText() }})</strong>
              </div>
              <v-tabs v-model="tabs">
                <v-tab
                  :key="level"
                  :disabled="loading"
                  v-for="level in levels().length"
                >Lvl{{ level }}</v-tab>

                <v-tab-item
                  :key="i+1"
                  v-for="(level, i) in levels()"
                >
                  <v-list
                    style="max-height: 256px; overflow-y: auto"
                    class="minimal-scrollbar"
                  >
                    <template v-for="(user, j) in level">
                      <v-list-tile
                        :key="'tile-' + j"
                        @click="() => {}"
                      >
                        <v-list-tile-action class="thinner-action">
                          <icon-img
                            :item="user.user"
                            color="primary lighten-1"
                            size="32"
                            caption
                          />
                        </v-list-tile-action>
                        <v-list-tile-content>
                          <v-subheader>
                            <div>
                              <div>
                                <span v-text="$wrap.fullname(user.user)"/>
                                <add-me :id="user.id"/>
                              </div>
                              <div
                                class="caption"
                                v-if="user.user.title"
                                v-html="user.user.title"
                              />
                            </div>
                          </v-subheader>
                        </v-list-tile-content>
                        <v-list-tile-action :key="'action-' + j">
                          <status :item="user"/>
                        </v-list-tile-action>
                      </v-list-tile>
                    </template>
                  </v-list>
                </v-tab-item>
              </v-tabs>

            </template>
          </div>

        </v-flex>

      </v-layout>

    </v-card-text>

    <v-card-actions>
      <v-spacer/>
      <v-btn
        flat
        color="primary lighten-1"
        v-text="'Dismiss'"
        @click="show = false"
      />
    </v-card-actions>

  </v-card>
</v-dialog>
</template>

<script>
import AddMe from '@/include/AddMe'
import Status from '@/include/Status'
import IconImg from '@/include/IconImg'
import RemarksInst from '@/include/RemarksInst'

export default {
  name: 'dialog-detailed-workflow',
  components: {
    AddMe,
    Status,
    IconImg,
    RemarksInst
  },
  props: {
    viewOnly: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    show: false,
    assign: null,
    loading: false,
    tabs: 0
  }),
  watch: {
    show(e) {
      // if unshow
      if (!e) {
        this.clear()
      }
    }
  },

  created() {
    this.$bus.$on('dialog--detailed-workflow.show', this.dialogDetailedWorkflow)
  },
  beforeDestroy() {
    this.$bus.$off('dialog--detailed-workflow.show', this.dialogDetailedWorkflow)
  },

  methods: {
    dialogDetailedWorkflow(e, level) {
      this.assign = e
      // also set tabs here
      this.tabs = String(this.$bus.checkLevels(e.content.levels))
      this.show = true
    },

    viewActivity() {
      this.$bus.$emit('dialog--workflow-logs', this.assign.id, this.course().code + ' &mdash; ' + this.course().title)
    },

    clear() {
      this.assign = null
      this.show = false
    },

    course() {
      return this.assign.content.course
    },
    assigned() {
      return this.assign.content.assigned.user
    },
    remarks() {
      return this.assign.content.remarks || null
    },
    createdBy() {
      return this.assign.created_by
    },
    levels() {
      return this.assign.content.levels
    },
    levelText() {
      let levels = this.levels()
      let myLevel = this.$bus.checkLevels(levels, 1)
      return myLevel + ' of ' + levels.length
    }
  }
}
</script>
