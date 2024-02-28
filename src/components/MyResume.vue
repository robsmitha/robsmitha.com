<template>
  <v-container>
    <v-skeleton-loader
      v-if="!summary"
      type="article"
    ></v-skeleton-loader>
    <template v-else>
      <h1 v-html="summary?.title.rendered" class="pb-4"></h1>
      <div class="text-body-1 mb-2" v-html="summary?.content.rendered"></div>
      <template v-if="summaryTags?.length > 0">
          <div class="text-subtitle-1 font-weight-bold mb-1">Core Competencies:</div>
          <v-chip v-for="t in summaryTags" :key="t.id" size="small" color="primary" class="mr-2 mb-2">{{ t.name }}</v-chip>
      </template>
    </template>
    <div class="text-subtitle-1 font-weight-bold my-1">Skills & Tools</div>
    <v-divider class="my-1"></v-divider>
    <v-skeleton-loader
      v-if="tagsByPost.size === 0"
      type="paragraph"
    ></v-skeleton-loader>
    <v-sheet v-else v-for="slug in skills.keys()" :value="slug" :key="slug">
      <span class="text-overline pr-2">{{ slug }}:</span>
      <span class="text-body-2" v-for="(t, i) in skills.get(slug)" :key="t.id">{{ t.name }}<span v-if="i < (skills.get(slug)?.length ?? 0) - 1">, </span></span>
    </v-sheet>
    <div class="text-subtitle-1 font-weight-bold my-1">Professional Experience & Achievements</div>
    <v-divider class="my-1"></v-divider>
    <v-skeleton-loader
      v-if="!professionalExperience"
      type="article"
    ></v-skeleton-loader>
    <div class="professional-experience" v-html="professionalExperience?.content.rendered"></div>
  </v-container>
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
  professionalExperiencePost
} = storeToRefs(appStore)

const summary = ref(summaryPost)
const summaryTags = ref(summaryPostTags)
const skills = ref(tagsByPost);
const professionalExperience = ref(professionalExperiencePost);

</script>
