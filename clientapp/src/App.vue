<template>
  <v-app>
      <router-view />

      <!-- The session ran out on a page anyone can open: they stay where they are, and are told. (On a page
           for signed-in people they are taken to the sign-in page, which says the same.) -->
      <v-snackbar v-model="showExpired" :timeout="-1" location="bottom">
        Your session has expired. You&rsquo;ve been signed out.
        <template #actions>
          <v-btn class="text-none" color="primary" variant="text" :href="signInPath(route.fullPath)">Sign in again</v-btn>
          <v-btn class="text-none" variant="text" @click="dismissed = true">Dismiss</v-btn>
        </template>
      </v-snackbar>
  </v-app>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { signInPath } from '@/services/auth'
  import { useAuthStore } from '@/store/auth'

  const route = useRoute()
  const auth = useAuthStore()
  const dismissed = ref(false)

  const showExpired = computed({
    get: () => auth.sessionExpired && !dismissed.value && !route.path.startsWith('/auth/'),
    set: value => { if (!value) dismissed.value = true },
  })
</script>

<style>
/* Skeleton bones are on-surface at the border opacity. The theme sets that opacity to 1, which turns every bone solid
   black in light mode, so in light mode loaders get Vuetify's standard 12% grey. Dark mode is left as it is. */
.v-theme--portfolioLight .v-skeleton-loader {
  --v-border-opacity: 0.12;
}
</style>
