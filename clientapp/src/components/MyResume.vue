<template>
  <v-sheet color="grey-lighten-4" class="mb-5">
    <v-container>
      <v-row>
        <v-col offset-lg="1" lg="10">
          <v-card>
            <v-toolbar color="white">
              <v-toolbar-title class="text-title-1 font-weight-bold">{{ $vuetify.display.mobile ? "Summary" : "Full Stack Software Engineer" }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf" target="_blank">
                <v-icon>mdi-open-in-new</v-icon>
              </v-btn>
            </v-toolbar>
            
            <v-divider></v-divider>
            <v-card-text>
              <v-skeleton-loader
                v-if="!summary"
                type="paragraph"
              ></v-skeleton-loader>
              <template v-else>
                <div class="text-body-1 mb-2" v-html="summary?.content.rendered"></div>
                <template v-if="summaryTags?.length > 0">
                    <div class="text-subtitle-1 font-weight-bold mb-1">Core Competencies:</div>
                    <v-chip v-for="t in summaryTags" :key="t.id" size="small" color="primary" class="mr-2 mb-2">{{ t.name }}</v-chip>
                </template>
              </template>
            </v-card-text>

            <v-toolbar density="compact">
              <v-toolbar-title class="text-subtitle-1 font-weight-bold">Skills & Tools</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-skeleton-loader
                v-if="tagsByPost.size === 0"
                type="paragraph"
              ></v-skeleton-loader>
              <v-sheet v-else v-for="slug in skills.keys()" :value="slug" :key="slug">
                <span class="text-overline pr-2">{{ slug }}:</span>
                <span class="text-body-2" v-for="(t, i) in skills.get(slug)" :key="t.id">{{ t.name }}<span v-if="i < (skills.get(slug)?.length ?? 0) - 1">, </span></span>
              </v-sheet>
            </v-card-text>

            <v-toolbar density="compact">
              <v-toolbar-title class="text-subtitle-1 font-weight-bold">Professional Experience & Achievements</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-skeleton-loader
                v-if="!experience"
                type="article"
              ></v-skeleton-loader>
              <div class="professional-experience" v-html="experience?.content.rendered"></div>
            </v-card-text>

            <v-toolbar density="compact">
              <v-toolbar-title class="text-subtitle-1 font-weight-bold">Education</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-skeleton-loader
                v-if="!education"
                type="paragraph"
              ></v-skeleton-loader>
              <div v-html="education?.content.rendered" class="mb-5"></div>
              <v-row>
                <v-col v-for="t in educationTags" :key="t.id" sm="6" cols="12" class="py-0">
                  <v-icon>mdi-check</v-icon> <span class="caption">{{ t.name }}</span>
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
:deep(.professional-experience) ul {
  margin-left: 1.5rem;
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
