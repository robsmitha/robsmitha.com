<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <BillList />
</template>

<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'Home',
    disabled: false,
    to: '/',
  },
  {
    title: 'Bills',
    disabled: true
  }
]
</script>