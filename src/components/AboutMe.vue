<template>
  <v-container>
    <v-skeleton-loader
      v-if="!page"
      type="article"
    ></v-skeleton-loader>
    <template v-else>
      <h1 v-html="page.title.rendered" class="pb-4"></h1>
      <div v-html="page.content.rendered"></div>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from "@/store/app";
import { storeToRefs } from 'pinia'

const appStore = useAppStore();
const { aboutPage } = storeToRefs(appStore)
const page = ref(aboutPage)
</script>
