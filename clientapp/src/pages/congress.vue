<template>
    <v-breadcrumbs bg-color="grey-darken-4" :items="breadcrumbs"></v-breadcrumbs>
    <CongressFeed />
</template>

<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'CONGRESS',
    disabled: true
  }
]
</script>