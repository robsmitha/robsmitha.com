<template>
  <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <CodeSearch />
</template>

<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'SEARCH CODE',
    disabled: true
  }
]
</script>
  