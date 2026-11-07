<template>
    <v-container class="py-16 d-flex flex-column align-center text-center ga-4" style="max-width: 560px">
        <v-progress-circular v-if="!failed" indeterminate color="primary" />
        <v-icon v-else size="40" class="text-subtle">mdi-link-variant-off</v-icon>
        <p class="text-body-1 text-high-emphasis mb-0">{{ failed ? 'This link session expired.' : 'Finishing up with your bank…' }}</p>
        <v-btn v-if="failed" color="primary" variant="outlined" rounded="pill" class="text-none" to="/accounts">Back to accounts</v-btn>
    </v-container>
</template>

<script lang="ts" setup>
// Banks that sign in on their own site (OAuth) send the person back here; Plaid Link reopens to finish.
// Register this page's URL as the redirect URI in the Plaid dashboard and in PlaidSettings:RedirectUri.
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaidLink } from '@/composables/usePlaidLink'

const router = useRouter()
// Leave only once Link is done: leaving the page earlier would close Link mid-way
const { resume } = usePlaidLink({ onDone: () => router.replace('/accounts') })
const failed = ref(false)

onMounted(async () => {
    const resumed = await resume(window.location.href)
    if (!resumed) {
        failed.value = true
    }
})
</script>
