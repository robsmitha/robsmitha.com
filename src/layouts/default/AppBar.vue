<template>
  <v-app-bar
    flat
  >
    <v-app-bar-title>
      <v-btn title="Rob Smitha" to="/">Rob Smitha</v-btn>
    </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
  </v-app-bar>

  <v-navigation-drawer
      v-model="drawer"
      temporary
  >
    <v-list density="compact" nav>
      <v-list-item title="Site"></v-list-item>
      <v-divider></v-divider>
      <v-list-item prepend-icon="mdi-home-outline" title="Home" value="home" to="/"></v-list-item>
      <v-list-item prepend-icon="mdi-information-outline" title="About" value="about" to="/about"></v-list-item>
      <!-- <v-list-item prepend-icon="mdi-briefcase-outline" title="Resume" value="resume" to="/resume"></v-list-item> -->
      <v-list-item subtitle="External Links"></v-list-item>
      <v-list-item prepend-icon="mdi-github" title="GitHub" href="https://github.com/robsmitha" target="_blank"></v-list-item>
      <v-list-item prepend-icon="mdi-linkedin" title="LinkedIn" href="https://www.linkedin.com/in/robsmitha/" target="_blank"></v-list-item>
      <v-list-item prepend-icon="mdi-open-in-new" title="Resume PDF" href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf" target="_blank"></v-list-item>

      <!-- <v-list-item :subtitle="store.signedIn ? store.userDetails : 'Sign in'"></v-list-item>
      <v-list-item v-if="!store.signedIn" prepend-icon="mdi-github" title="Github" href=".auth/login/github"></v-list-item>
      <v-list-item v-if="!store.signedIn" prepend-icon="mdi-microsoft" title="Microsoft" href=".auth/login/aad"></v-list-item>
      <v-list-item v-if="store.signedIn" prepend-icon="mdi-logout" title="Sign out" href=".auth/logout"></v-list-item> -->
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from "@/store/app";
const store = useAppStore()
store.fetchPages();
store.fetchPosts();
store.fetchTags();
store.fetchAuth();

const drawer = ref(false)
</script>
