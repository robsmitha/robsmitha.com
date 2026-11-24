<template>
  <v-container class="py-16 text-center" style="max-width: 480px">
    <h1 class="text-h5 mb-4">Signing you in</h1>
    <template v-if="failed">
      <v-alert type="error" variant="tonal" class="mb-4 text-left">
        The sign-in page couldn&rsquo;t be opened. Check your connection and try again.
      </v-alert>
      <v-btn color="primary" :loading="working" @click="start">Try again</v-btn>
    </template>
    <template v-else>
      <p class="text-medium-emphasis mb-4">Taking you to the sign-in page&hellip;</p>
      <v-progress-linear indeterminate color="primary" />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '@/services/auth'

const route = useRoute()
const router = useRouter()
const failed = ref(false)
const working = ref(false)

async function start() {
  failed.value = false
  working.value = true
  const returnTo = auth.safeReturnTo(route.query.returnTo)
  try {
    // Already signed in (another tab, or a stale link): go straight there
    if (await auth.currentUser()) {
      await router.replace(returnTo)
      return
    }
    await auth.signIn(returnTo)
  } catch (error) {
    console.error('Could not start sign-in', error)
    failed.value = true
  } finally {
    working.value = false
  }
}

onMounted(start)
</script>
