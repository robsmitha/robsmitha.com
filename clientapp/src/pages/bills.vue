<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <BillList />
</template>

<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'BILLS',
    disabled: true
  }
]
</script>