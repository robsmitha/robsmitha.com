<template>
  <v-container v-if="page">
    <h1 v-html="page.title.rendered" class="pb-4"></h1>
    <div v-html="page.content.rendered"></div>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from "@/store/app";
import { storeToRefs } from 'pinia'

const appStore = useAppStore();
const { homePage } = storeToRefs(appStore)
const page = ref(homePage)
</script>
