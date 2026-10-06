<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>
    <SavedBillList />
</template>

<script lang="ts" setup>
// Imported by hand: a page can refer to itself by its file name, so a component named
// after the page (SavedBills) would render this page inside itself forever.
import SavedBillList from '@/components/Congress/SavedBillList.vue'

const breadcrumbs = [
  {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'CONGRESS',
    disabled: false,
    to: '/congress',
  },
  {
    title: 'SAVED BILLS',
    disabled: true
  }
]
</script>
