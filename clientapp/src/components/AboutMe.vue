<template>
  <v-sheet color="grey-lighten-4" class="py-3">
    <v-container>
      <v-row>
        <v-col md="8" cols="12">
          <v-skeleton-loader
            v-if="!page"
            type="paragraph"
          ></v-skeleton-loader>
          <template v-else>
            <v-card color="transparent" flat>
              <v-card-title v-html="page.title.rendered"></v-card-title>
              <v-card-text v-html="page.content.rendered"></v-card-text>
            </v-card>
          </template>
        </v-col>
        <v-col md="4" cols="12"  class="d-flex justify-center align-center">
          <v-img 
            :width="300"
            aspect-ratio="4/3"
            cover
            src="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/unDraw/undraw_fatherhood_-7-i19.svg">
          </v-img>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from "@/store/app";
import { storeToRefs } from 'pinia'

const appStore = useAppStore();
const { aboutPage } = storeToRefs(appStore)
const page = ref(aboutPage)
</script>
