<template>
  <v-container class="py-16 text-center" style="max-width: 480px">
    <h1 class="text-h5 mb-4">Signing you out</h1>
    <template v-if="failed">
      <v-alert type="error" variant="tonal" class="mb-4 text-left">We couldn&rsquo;t sign you out. Please try again.</v-alert>
      <v-btn color="primary" @click="start">Try again</v-btn>
    </template>
    <v-progress-linear v-else indeterminate color="primary" />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { auth } from '@/services/auth'

const failed = ref(false)

async function start() {
  failed.value = false
  try {
    await auth.signOut()
  } catch (error) {
    console.error('Could not sign out', error)
    failed.value = true
  }
}

onMounted(start)
</script>
