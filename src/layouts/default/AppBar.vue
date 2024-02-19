<template>
  <v-app-bar
    flat
  >
  <v-app-bar-title>
    <v-btn density="comfortable" icon="mdi-hand-wave-outline" href="/"></v-btn>
  </v-app-bar-title>
    <v-spacer></v-spacer>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
  </v-app-bar>

  <v-navigation-drawer
      v-model="drawer"
      temporary
  >
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home-outline" title="Home" value="home" to="/"></v-list-item>
      <v-list-item prepend-icon="mdi-information-outline" title="About" value="about" to="/about"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from "@/store/app";
const store = useAppStore()
store.fetchPages();

const drawer = ref(false)
</script>
