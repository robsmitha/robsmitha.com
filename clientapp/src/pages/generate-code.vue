<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <CodeGeneration />
</template>
<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'GENERATE CODE',
    disabled: true
  }
]
</script>