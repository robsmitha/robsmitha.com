<template>
  <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>
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
  