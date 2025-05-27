<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <TrackExpenses />
</template>

<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'SPENDING',
    disabled: true
  }
]
</script>