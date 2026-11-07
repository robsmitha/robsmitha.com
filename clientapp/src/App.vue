<template>
  <v-app>
      <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  //
</script>

<style>
/* Skeleton bones are on-surface at the border opacity. The theme sets that opacity to 1, which turns every bone solid
   black in light mode, so in light mode loaders get Vuetify's standard 12% grey. Dark mode is left as it is. */
.v-theme--portfolioLight .v-skeleton-loader {
  --v-border-opacity: 0.12;
}
</style>
