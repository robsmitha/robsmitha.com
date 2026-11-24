<template>
  <v-container class="py-16 text-center" style="max-width: 480px">
    <h1 class="text-h5 mb-4">Signing you in</h1>
    <template v-if="failed">
      <v-alert type="error" variant="tonal" class="mb-4 text-left">We couldn&rsquo;t sign you in. Please try again.</v-alert>
      <v-btn color="primary" to="/auth/sign-in">Try again</v-btn>
    </template>
    <v-progress-linear v-else indeterminate color="primary" />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/services/auth'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const failed = ref(false)

// The page a sign-in comes back to. It finishes the sign-in and goes on to where the person was headed.
onMounted(async () => {
  try {
    const returnTo = await auth.completeSignIn()
    if (returnTo) {
      // The app bar asked who was signed in before the sign-in had finished; ask again now that it has
      await useAuthStore().fetchAuth()
      await router.replace(returnTo)
    } else {
      failed.value = true
    }
  } catch (error) {
    console.error('Could not finish sign-in', error)
    failed.value = true
  }
})
</script>
