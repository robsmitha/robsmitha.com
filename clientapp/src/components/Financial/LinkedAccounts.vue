<template>
    <PageHero eyebrow="> finance / accounts" tone="teal" art="ribbon" compact>
        <h1 class="hero-title font-weight-bold mb-2">Accounts &amp; connections</h1>
        <p class="hero-text mb-5">Banks linked through Plaid. New transactions arrive on their own; you can also sync a bank by hand.</p>
        <div class="d-flex flex-wrap align-center ga-8">
            <div v-for="s in stats" :key="s.label">
                <span class="font-mono text-h6 font-weight-bold d-block" :class="s.attention ? 'text-warning' : ''">{{ s.value }}</span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
            <v-btn
                color="hero-ink" variant="flat" rounded="pill" class="text-none" prepend-icon="mdi-plus"
                :loading="opening?.mode === 'add'" @click="open('add')"
            >
                Link a bank
            </v-btn>
        </div>
    </PageHero>

    <v-container class="admin-body py-8 d-flex flex-column ga-5">
        <v-alert v-if="store.error" type="warning" variant="tonal" closable density="compact" @click:close="store.clearError()">
            {{ store.error }}
        </v-alert>

        <template v-if="store.connections === undefined">
            <v-skeleton-loader v-for="i in 2" :key="i" type="list-item-avatar-two-line, divider, list-item-two-line, list-item-two-line" class="skeleton" />
        </template>

        <div v-else-if="!store.connections.length" class="empty-state d-flex flex-column align-center py-12 px-4 text-center">
            <v-icon size="40" class="mb-3 text-subtle">mdi-bank-outline</v-icon>
            <p class="text-high-emphasis font-weight-bold mb-1">No linked banks yet</p>
            <p class="text-body-2 text-subtle mb-5">Link a bank through Plaid to start tracking spending.</p>
            <v-btn variant="outlined" color="primary" rounded="pill" class="text-none" prepend-icon="mdi-plus" :loading="opening?.mode === 'add'" @click="open('add')">
                Link a bank
            </v-btn>
        </div>

        <template v-else>
            <ConnectionCard
                v-for="c in store.connections"
                :key="c.institutionAccessItemId"
                :connection="c"
                :syncing="store.syncing.includes(c.institutionAccessItemId)"
                :opening="opening"
                :now="now"
                @reconnect="open('reconnect', c.institutionAccessItemId)"
                @manage-accounts="open('accounts', c.institutionAccessItemId)"
                @sync="store.syncNow(c.institutionAccessItemId)"
                @remove="removing = c"
                @role-change="(accountId: number, role: BudgetRole) => store.updateAccountRole(accountId, role)"
            />

            <section v-if="store.recentSyncs.length" class="activity pa-5">
                <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-3">
                    <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">Sync activity</h2>
                    <span class="font-mono text-caption text-subtle">last 24 hours</span>
                </div>
                <div class="table-scroll">
                    <v-table density="compact" class="bg-transparent">
                        <thead>
                            <tr><th>When</th><th>Bank</th><th>Why</th><th class="text-right">Changes</th><th class="text-right">Result</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="(s, i) in store.recentSyncs" :key="i">
                                <td class="font-mono text-caption text-subtle">{{ moment(s.startedAt).format('h:mm A') }}</td>
                                <td>{{ s.institutionName }}</td>
                                <td>{{ triggerLabel[s.trigger] ?? s.trigger }}</td>
                                <td class="font-mono text-caption text-right">{{ changes(s) }}</td>
                                <td class="text-right">
                                    <v-chip size="x-small" variant="tonal" :color="s.errorCode ? 'error' : 'success'" class="font-mono">
                                        {{ s.errorCode ? errorLabel(s.errorCode) : 'OK' }}
                                    </v-chip>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </div>
                <p class="text-caption text-subtle mt-2 mb-0">"Plaid update" means the bank told us new data was ready. "−1" is usually a pending charge that posted or dropped off.</p>
            </section>
        </template>
    </v-container>

    <v-dialog :model-value="!!removing" max-width="480" @update:model-value="v => { if (!v) removing = null }">
        <v-card v-if="removing" color="surface" rounded="lg" class="pa-2">
            <v-card-title class="text-h6">Remove {{ removing.institutionName }}?</v-card-title>
            <v-card-text>
                <p class="text-body-2 text-muted mb-4">Plaid's access to this bank is revoked first, then it's removed here.</p>
                <v-radio-group v-model="keepHistory" hide-details>
                    <v-radio :value="true" color="primary">
                        <template #label>
                            <span><span class="text-high-emphasis">Keep my history</span><br><span class="text-caption text-subtle">Past transactions stay in old budgets. Nothing new comes in.</span></span>
                        </template>
                    </v-radio>
                    <v-radio :value="false" color="error" class="mt-2">
                        <template #label>
                            <span><span class="text-high-emphasis">Delete everything</span><br><span class="text-caption text-subtle">Its accounts and transactions are deleted. Past budgets will change.</span></span>
                        </template>
                    </v-radio>
                </v-radio-group>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="text" class="text-none" @click="removing = null">Cancel</v-btn>
                <v-btn color="error" variant="flat" class="text-none" :loading="removeBusy" @click="confirmRemove">Remove bank</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import moment from 'moment'
import { useConnectionsStore } from '@/store/connections'
import { usePlaidLink } from '@/composables/usePlaidLink'
import type { BudgetRole, Connection, SyncActivity } from '@/services/connection.service'

const store = useConnectionsStore()
const { open, opening } = usePlaidLink()

const removing = ref<Connection | null>(null)
const keepHistory = ref(true)
const removeBusy = ref(false)

// Ticks so "Synced 3 minutes ago" and "Sync again in 9 min" stay current
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
    store.fetch()
    timer = setInterval(() => { now.value = Date.now() }, 30_000)
})

onBeforeUnmount(() => clearInterval(timer))

type Stat = { label: string, value: string | number, attention?: boolean }

const stats = computed((): Stat[] => {
    const list = store.connections
    if (!list) return [{ label: 'Banks', value: '—' }, { label: 'Accounts', value: '—' }]
    const attention = list.filter(c => !['healthy', 'syncing'].includes(c.status)).length
    return [
        { label: 'Banks', value: list.length },
        { label: 'Accounts', value: list.reduce((n, c) => n + c.accounts.length, 0) },
        ...(attention ? [{ label: 'Need attention', value: attention, attention: true }] : []),
    ]
})

const triggerLabel: Record<string, string> = {
    Initial: 'First sync',
    Webhook: 'Plaid update',
    Manual: 'You',
    Nightly: 'Nightly',
    Reconnect: 'Reconnect',
}

function changes (s: SyncActivity) {
    const parts = [s.added && `+${s.added}`, s.modified && `~${s.modified}`, s.removed && `−${s.removed}`].filter(Boolean)
    return parts.length ? parts.join(' ') : '—'
}

function errorLabel (code: string) {
    return code === 'ITEM_LOGIN_REQUIRED' ? 'Sign-in' : code.replace(/_/g, ' ').toLowerCase()
}

async function confirmRemove () {
    if (!removing.value) return
    removeBusy.value = true
    const ok = await store.remove(removing.value.institutionAccessItemId, keepHistory.value)
    removeBusy.value = false
    if (ok) {
        removing.value = null
        keepHistory.value = true
    }
}
</script>

<style scoped>
.admin-body {
    max-width: 1100px;
}

.hero-title {
    font-size: clamp(1.6rem, 1.5vw + 1rem, 2.2rem);
    line-height: 1.1;
}

.hero-text {
    max-width: 52ch;
    opacity: 0.82;
}

.hero-label {
    opacity: 0.7;
}

.empty-state {
    border-radius: 12px;
    border: 1px dashed rgb(var(--v-theme-border));
}

.activity {
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface));
}

.table-scroll {
    overflow-x: auto;
}

.skeleton {
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface));
}
</style>
