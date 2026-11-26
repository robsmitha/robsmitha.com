<template>
  <v-container class="py-16 text-center" style="max-width: 480px">
    <h1 class="text-h5 mb-4">{{ expired ? 'Your session has expired' : 'Signing you in' }}</h1>
    <template v-if="expired">
      <v-alert v-if="failed" type="error" variant="tonal" class="mb-4 text-left">
        The sign-in page couldn&rsquo;t be opened. Check your connection and try again.
      </v-alert>
      <p class="text-medium-emphasis mb-6">
        You&rsquo;ve been signed out because it has been a while since you signed in. Sign in again to pick up
        where you left off.
      </p>
      <v-btn color="primary" class="text-none" prepend-icon="mdi-login" :loading="working" @click="signInAgain">Sign in again</v-btn>
      <div class="mt-4"><v-btn variant="text" class="text-none" to="/">Back to the home page</v-btn></div>
    </template>
    <template v-else-if="failed">
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
import { auth, sessionHasEnded } from '@/services/auth'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const failed = ref(false)
const working = ref(false)
// Sent here because the session ran out: say so and wait for a click, instead of leaving the site unasked
const expired = ref(false)

// Straight to the sign-in page. "Already signed in" isn't checked: this browser still remembers the
// account whose session ran out.
async function signInAgain() {
  failed.value = false
  working.value = true
  try {
    await auth.signIn(auth.safeReturnTo(route.query.returnTo))
  } catch (error) {
    console.error('Could not start sign-in', error)
    failed.value = true
  } finally {
    working.value = false
  }
}

async function start() {
  failed.value = false
  working.value = true
  const returnTo = auth.safeReturnTo(route.query.returnTo)
  try {
    // An old "expired" link opened by someone whose sign-in is in fact fine goes on as usual
    if (route.query.expired !== undefined && (useAuthStore().sessionExpired || await sessionHasEnded() || !(await auth.currentUser()))) {
      expired.value = true
      return
    }

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
