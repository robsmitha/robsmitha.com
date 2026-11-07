<template>
    <div v-if="problems.length || expiring.length" class="banner" role="alert">
        <v-container class="d-flex flex-wrap align-center ga-3 py-3 banner-inner">
            <v-icon color="warning" size="22">mdi-link-variant-off</v-icon>
            <p class="text-body-2 flex-grow-1 mb-0 banner-copy">
                <template v-if="problems.length">
                    <strong class="text-high-emphasis">{{ problemText }}</strong>
                    <span class="text-muted"> {{ sinceText }}</span>
                </template>
                <template v-else>
                    <strong class="text-high-emphasis">{{ expiringText }}</strong>
                </template>
            </p>
            <v-btn color="primary" variant="flat" size="small" class="text-none" prepend-icon="mdi-link-variant" to="/accounts">
                {{ problems.length ? 'Reconnect' : 'Renew' }}
            </v-btn>
            <router-link v-if="problems.length && expiring.length" to="/accounts" class="text-body-2 text-muted">{{ expiringText }}</router-link>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useConnectionsStore } from '@/store/connections'
import { shortDate } from '@/composables/budgetFormat'

const store = useConnectionsStore()

onMounted(() => {
    if (!store.connections) store.fetch()
})

const all = computed(() => store.connections ?? [])
/** Banks whose charges aren't arriving */
const problems = computed(() => all.value.filter(c => ['login_required', 'disconnected', 'error'].includes(c.status)))
/** Banks whose access ends within two weeks */
const expiring = computed(() => all.value.filter(c => {
    if (!c.consentExpiresAt || problems.value.includes(c)) return false
    const days = (new Date(c.consentExpiresAt).getTime() - Date.now()) / 86_400_000
    return days <= 14
}))

const problemText = computed(() => {
    const p = problems.value
    if (p.length > 1) return `${p.length} banks need attention.`
    return p[0].status === 'login_required' ? `${p[0].institutionName} needs you to sign in again.` : `${p[0].institutionName} isn’t syncing.`
})

const sinceText = computed(() => {
    const last = problems.value.map(c => c.lastSyncedAt).filter(Boolean).sort()[0]
    return last
        ? `Charges since ${shortDate(last.slice(0, 10))} aren’t included yet, so spending may be low.`
        : 'Recent charges aren’t included yet, so spending may be low.'
})

const expiringText = computed(() => {
    const e = expiring.value
    if (!e.length) return ''
    return e.length > 1
        ? `${e.length} banks’ access ends soon`
        : `${e[0].institutionName} access ends ${shortDate(e[0].consentExpiresAt!.slice(0, 10))}`
})
</script>

<style scoped>
.banner {
    border-bottom: 1px solid rgba(var(--v-theme-warning), 0.4);
    background: rgba(var(--v-theme-warning), 0.1);
}

.banner-inner {
    max-width: 1200px;
}

.banner-copy {
    min-width: 220px;
}
</style>
