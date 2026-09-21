<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>
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