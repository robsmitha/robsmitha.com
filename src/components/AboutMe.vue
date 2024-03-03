<template>
  <v-container>
    <v-row>
      <v-col md="8">
        <v-skeleton-loader
          v-if="!page"
          type="article"
        ></v-skeleton-loader>
        <template v-else>
          <h1 v-html="page.title.rendered" class="pb-4"></h1>
          <div v-html="page.content.rendered"></div>
        </template>
      </v-col>
      <v-col md="4">
        <v-img 
          :width="300"
          aspect-ratio="4/3"
          cover
          src="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/unDraw/undraw_fatherhood_-7-i19.svg">
        </v-img>
      </v-col>
    </v-row>
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
