<template>
    <!-- Sits inside clickable bill rows, so clicks and Enter stop here instead of opening the bill. -->
    <v-tooltip :text="tooltip" location="top">
        <template v-slot:activator="{ props: tooltipProps }">
            <v-btn
                v-if="variant === 'hero'"
                v-bind="tooltipProps"
                color="white"
                :variant="saved ? 'flat' : 'outlined'"
                rounded="pill"
                class="text-none"
                :prepend-icon="icon"
                :href="signInUrl"
                :aria-pressed="auth.signedIn ? saved : undefined"
                :aria-label="label"
                @click.stop="onClick"
                @keydown.enter.stop
            >
                {{ saved ? 'Saved' : 'Save bill' }}
            </v-btn>
            <v-btn
                v-else
                v-bind="tooltipProps"
                icon
                variant="text"
                size="small"
                density="comfortable"
                :color="failed ? 'error' : saved ? 'primary' : 'slate'"
                :href="signInUrl"
                :aria-pressed="auth.signedIn ? saved : undefined"
                :aria-label="label"
                class="save-bill-btn flex-shrink-0"
                @click.stop="onClick"
                @keydown.enter.stop
            >
                <v-icon :icon="icon" />
                <span v-if="unseen" class="unseen-dot" aria-hidden="true"></span>
            </v-btn>
        </template>
    </v-tooltip>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useCongressStore } from '@/store/congress'

const props = defineProps({
    congress: { type: [Number, String], required: true },
    billType: { type: String, required: true },
    billNumber: { type: [Number, String], required: true },
    // "icon" for lists, "hero" for the labelled button on the bill page.
    variant: { type: String as () => 'icon' | 'hero', default: 'icon' }
})

const auth = useAuthStore()
const congressStore = useCongressStore()
const route = useRoute()

const failed = ref(false)

const billName = computed(() => `${props.billType.toUpperCase()} ${props.billNumber}`)
const saved = computed(() => congressStore.isTracked(props.congress, props.billType, props.billNumber))

// Signed out, the button is a link to sign in that comes back to this page.
const signInUrl = computed(() => auth.signedIn
    ? undefined
    : `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(route.fullPath)}`)

const icon = computed(() => {
    if (failed.value) return 'mdi-bookmark-remove-outline'
    return saved.value ? 'mdi-bookmark' : 'mdi-bookmark-outline'
})

const label = computed(() => {
    if (!auth.signedIn) return `Sign in to save ${billName.value}`
    return saved.value ? `Remove ${billName.value} from saved bills` : `Save ${billName.value}`
})

// A saved bill that has moved since the reader last opened it.
const unseen = computed(() => saved.value
    && congressStore.findTracked(props.congress, props.billType, props.billNumber)?.hasUnseenActivity === true)

const tooltip = computed(() => {
    if (failed.value) return "Couldn't update saved bills. Try again."
    if (!auth.signedIn) return 'Sign in to save bills'
    if (unseen.value) return 'Saved, with new activity since you last looked'
    return saved.value ? 'Saved. Click to remove' : 'Save bill'
})

async function onClick(event: MouseEvent) {
    if (!auth.signedIn) return

    event.preventDefault()
    failed.value = false
    const ok = await congressStore.toggleTracked(props.congress, props.billType, props.billNumber)
    if (!ok) {
        failed.value = true
        setTimeout(() => failed.value = false, 4000)
    }
}
</script>

<style scoped>
.save-bill-btn {
    margin: -4px 0;
}

.unseen-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(var(--v-theme-amber));
    box-shadow: 0 0 0 2px rgb(var(--v-theme-surface));
}
</style>
