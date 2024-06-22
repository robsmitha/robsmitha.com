<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
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