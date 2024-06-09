<template>
  <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
  <MyResume />
</template>

<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'Home',
    disabled: false,
    to: '/',
  },
  {
    title: 'Resume',
    disabled: true
  }
]
</script>
