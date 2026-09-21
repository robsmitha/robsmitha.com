<template>
  <v-sheet color="background" class="pb-16">
    <v-container>
      <v-row>
        <v-col offset-lg="1" lg="10">
          <v-card color="surface" flat class="resume-card pa-2">
            <v-card-text>
              <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
                <span class="text-lightest-slate text-h5 font-weight-bold">
                  {{ $vuetify.display.mobile ? "Summary" : "Full Stack Software Engineer" }}
                </span>
                <v-btn
                  variant="outlined"
                  color="primary"
                  class="font-mono text-none"
                  prepend-icon="mdi-open-in-new"
                  href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf"
                  target="_blank"
                >
                  Open PDF
                </v-btn>
              </div>

              <v-skeleton-loader
                v-if="!summary"
                type="paragraph"
                color="surface"
              ></v-skeleton-loader>
              <template v-else>
                <div class="text-slate resume-content mb-4" v-html="summary?.content.rendered"></div>
                <template v-if="summaryTags?.length > 0">
                    <div class="font-mono text-primary text-caption text-uppercase mb-2">Core Competencies</div>
                    <v-chip v-for="t in summaryTags" :key="t.id" size="small" variant="outlined" color="primary" class="font-mono mr-2 mb-2">{{ t.name }}</v-chip>
                </template>
              </template>
            </v-card-text>

            <v-divider color="lightest-navy" class="mx-4"></v-divider>

            <v-card-text>
              <div class="d-flex align-center mb-4 section-heading">
                <span class="font-mono text-primary text-body-2 mr-3">01.</span>
                <h3 class="text-lightest-slate text-h6 font-weight-bold text-nowrap">Skills &amp; Tools</h3>
                <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
              </div>
              <v-skeleton-loader
                v-if="tagsByPost.size === 0"
                type="paragraph"
                color="surface"
              ></v-skeleton-loader>
              <v-sheet v-else color="transparent" v-for="slug in skills.keys()" :value="slug" :key="slug" class="mb-1">
                <span class="font-mono text-primary text-caption text-uppercase pr-2">{{ slug }}:</span>
                <span class="text-slate text-body-2" v-for="(t, i) in skills.get(slug)" :key="t.id">{{ t.name }}<span v-if="i < (skills.get(slug)?.length ?? 0) - 1">, </span></span>
              </v-sheet>
            </v-card-text>

            <v-divider color="lightest-navy" class="mx-4"></v-divider>

            <v-card-text>
              <div class="d-flex align-center mb-4 section-heading">
                <span class="font-mono text-primary text-body-2 mr-3">02.</span>
                <h3 class="text-lightest-slate text-h6 font-weight-bold text-nowrap">Professional Experience &amp; Achievements</h3>
                <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
              </div>
              <template v-if="!experience">
                <v-skeleton-loader
                  v-for="i in 3"
                  :key="i"
                  type="article"
                  color="surface"
                  class="mb-4"
                ></v-skeleton-loader>
              </template>
              <div class="professional-experience text-slate" v-html="experience?.content.rendered"></div>
            </v-card-text>

            <v-divider color="lightest-navy" class="mx-4"></v-divider>

            <v-card-text>
              <div class="d-flex align-center mb-4 section-heading">
                <span class="font-mono text-primary text-body-2 mr-3">03.</span>
                <h3 class="text-lightest-slate text-h6 font-weight-bold text-nowrap">Education</h3>
                <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
              </div>
              <v-skeleton-loader
                v-if="!education"
                type="paragraph"
                color="surface"
              ></v-skeleton-loader>
              <div v-html="education?.content.rendered" class="text-slate mb-5"></div>
              <v-row>
                <v-col v-for="t in educationTags" :key="t.id" sm="6" cols="12" class="py-1 d-flex align-center ga-2">
                  <v-icon color="primary" size="18">mdi-check</v-icon> <span class="text-slate text-body-2">{{ t.name }}</span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<style scoped>
.resume-card {
  border: 1px solid rgb(var(--v-theme-lightest-navy));
}

:deep(.resume-content),
:deep(.professional-experience) {
  color: rgb(var(--v-theme-slate));
}

:deep(.resume-content) a,
:deep(.professional-experience) a {
  color: rgb(var(--v-theme-primary));
}

:deep(.professional-experience) ul {
  margin-left: 1.5rem;
}

:deep(.resume-content) *,
:deep(.professional-experience) *,
:deep(.education-content) * {
  color: inherit;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from "@/store/app";
import { storeToRefs } from 'pinia'

const appStore = useAppStore();
const {
  summaryPost,
  summaryPostTags,
  tagsByPost,
  experiencePost,
  educationPost,
  educationPostTags
} = storeToRefs(appStore)

const summary = ref(summaryPost)
const summaryTags = ref(summaryPostTags)
const skills = ref(tagsByPost);
const experience = ref(experiencePost)
const education = ref(educationPost)
const educationTags = ref(educationPostTags)

</script>
