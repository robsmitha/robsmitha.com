<template>
    <v-container>
      <v-skeleton-loader
        v-if="!summary"
        type="paragraph"
      ></v-skeleton-loader>
      <template v-else>
        <h1 v-html="summary?.title.rendered" class="pb-4"></h1>
        <div class="text-body-1 mb-2" v-html="summary?.content.rendered"></div>
        <template v-if="summaryTags?.length > 0">
            <div class="text-subtitle-1 font-weight-bold mb-1">Core Competencies:</div>
            <v-chip v-for="t in summaryTags" :key="t.id" size="small" color="primary mr-2 mb-2">{{ t.name }}</v-chip>
        </template>
      </template>
      <v-divider class="my-1"></v-divider>
      <div class="text-subtitle-1 font-weight-bold pb-4">Skills & Tools</div>
      <div class="d-flex flex-row">
        <v-tabs
            v-model="tab"
            direction="vertical"
            color="primary"
            >
            <v-tab v-for="slug in skills.keys()" :value="slug" :key="slug">{{ slug }}</v-tab>
        </v-tabs>
        <v-window v-model="tab">
            <v-window-item v-for="slug in skills.keys()" :value="slug" :key="slug">
                <v-container>
                  <v-row>
                      <v-col v-for="tag in skills.get(slug)" :key="tag.id" cols="3">
                          <v-card :text="tag.name" height="75" variant="outlined" color="primary">
                          </v-card>
                      </v-col>
                  </v-row>  
                </v-container>
            </v-window-item>
        </v-window>
      </div> 
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useAppStore } from "@/store/app";
  import { storeToRefs } from 'pinia'
  
  const appStore = useAppStore();
  const { 
    summaryPost, 
    summaryPostTags,
    tagsByPost,
  } = storeToRefs(appStore)
  
  const tab = ref("languages")
  const summary = ref(summaryPost)
  const summaryTags = ref(summaryPostTags)

  const skills = ref(tagsByPost);
  
  </script>
  