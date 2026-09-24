<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>
    <!-- Keyed so picking another Congress starts the feed over instead of appending to it. -->
    <CongressFeed :key="congress ?? 'current'" :congress="congress" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// ?congress=118 shows a past Congress; without it the page follows the current one.
const congress = computed(() => {
  const value = Number(route.query.congress)
  return Number.isInteger(value) && value > 0 ? value : undefined
})

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
