<template>
  <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <CodeSearch />
</template>

<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'Home',
    disabled: false,
    to: '/',
  },
  {
    title: 'Search Code',
    disabled: true
  }
]
</script>
  