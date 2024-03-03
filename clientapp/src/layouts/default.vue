<template>
  <v-app>
    <DefaultBar />

    <DefaultView />

    <DefaultFooter />
  </v-app>
</template>

<script lang="ts" setup>
  import DefaultBar from './default/AppBar.vue'
  import DefaultView from './default/View.vue'
  import DefaultFooter from './default/Footer.vue'
</script>
