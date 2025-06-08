<template>
  <v-main class="d-flex flex-column" style="min-height: 100vh;">
      <v-sheet color="grey-lighten-4" class="flex-grow-1">
      <router-view />
    </v-sheet>
  </v-main>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)
</script>
