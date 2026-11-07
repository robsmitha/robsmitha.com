<template>
    <article class="connection" :class="{ 'connection--attention': attention }" :style="{ '--accent': accent }">
        <div class="d-flex flex-wrap align-center ga-4 pa-5">
            <span class="badge font-weight-bold flex-shrink-0">
                <img v-if="connection.institutionLogo" :src="`data:image/png;base64,${connection.institutionLogo}`" alt="" />
                <template v-else>{{ connection.institutionName.charAt(0).toUpperCase() }}</template>
            </span>

            <div class="min-width-0 flex-grow-1">
                <div class="d-flex flex-wrap align-center ga-2">
                    <h2 class="text-h6 text-high-emphasis">{{ connection.institutionName }}</h2>
                    <v-chip :color="status.color" size="small" variant="tonal" :prepend-icon="status.icon" class="font-mono">
                        {{ status.label }}
                    </v-chip>
                </div>
                <p class="font-mono text-caption text-subtle mb-0">{{ syncedText }}</p>
            </div>

            <div class="d-flex flex-wrap align-center ga-2">
                <v-btn
                    v-if="connection.status === 'login_required'"
                    color="primary" variant="flat" rounded="pill" class="text-none" prepend-icon="mdi-link-variant"
                    :loading="isOpening('reconnect')" @click="$emit('reconnect')"
                >Reconnect</v-btn>
                <v-btn
                    v-else-if="connection.status === 'pending_expiration'"
                    color="warning" variant="outlined" rounded="pill" class="text-none" prepend-icon="mdi-shield-refresh-outline"
                    :loading="isOpening('reconnect')" @click="$emit('reconnect')"
                >Renew access</v-btn>
                <v-btn
                    v-if="connection.newAccountsAvailable"
                    color="primary" variant="outlined" rounded="pill" class="text-none" prepend-icon="mdi-plus"
                    :loading="isOpening('accounts')" @click="$emit('manage-accounts')"
                >Add new accounts</v-btn>

                <span v-if="cooldownText" class="font-mono text-caption text-subtle">{{ cooldownText }}</span>
                <v-btn
                    variant="outlined" rounded="pill" class="text-none" prepend-icon="mdi-sync"
                    :disabled="!canSync" :loading="syncing" @click="$emit('sync')"
                >Sync now</v-btn>

                <v-menu location="bottom end">
                    <template #activator="{ props: menuProps }">
                        <v-btn v-bind="menuProps" icon="mdi-dots-horizontal" variant="text" size="small" :aria-label="`More actions for ${connection.institutionName}`" />
                    </template>
                    <v-list density="compact" bg-color="surface">
                        <v-list-item prepend-icon="mdi-format-list-checks" title="Choose shared accounts" :disabled="connection.status === 'login_required'" @click="$emit('manage-accounts')" />
                        <v-list-item prepend-icon="mdi-link-variant" title="Sign in again" @click="$emit('reconnect')" />
                        <v-list-item prepend-icon="mdi-delete-outline" title="Remove" base-color="error" @click="$emit('remove')" />
                    </v-list>
                </v-menu>
            </div>
        </div>

        <div v-if="attention && connection.statusMessage" class="status-note mx-5 mb-4 pa-3 d-flex ga-3" :style="{ '--status': `var(--v-theme-${status.color})` }" role="status">
            <v-icon :color="status.color" size="18">mdi-information-outline</v-icon>
            <span class="text-body-2">{{ connection.statusMessage }}</span>
        </div>

        <ul class="accounts" aria-label="Accounts">
            <li v-for="account in connection.accounts" :key="account.financialAccountId" class="account d-flex flex-wrap align-center ga-3 px-5 py-3">
                <v-icon size="18" class="text-subtle flex-shrink-0">{{ accountIcon(account) }}</v-icon>
                <div class="min-width-0 flex-grow-1">
                    <span class="d-block text-body-2 text-high-emphasis text-truncate">{{ account.name }}</span>
                    <span class="font-mono text-caption text-subtle">
                        {{ account.subtype ?? account.type }}<template v-if="account.mask"> · ••{{ account.mask }}</template>
                        <template v-if="account.creditLimit"> · {{ currency(account.creditLimit) }} limit</template>
                    </span>
                </div>
                <v-select
                    :model-value="account.budgetRole"
                    :items="roles"
                    density="compact" variant="outlined" hide-details
                    class="role-select flex-grow-0"
                    :aria-label="`How ${account.name} counts`"
                    @update:model-value="(role: BudgetRole) => $emit('role-change', account.financialAccountId, role)"
                />
                <span class="font-mono text-body-2 text-high-emphasis balance">
                    {{ account.currentBalance != null ? currency(account.currentBalance, account.isoCurrencyCode) : '—' }}
                </span>
            </li>
            <li v-if="!connection.accounts.length" class="px-5 py-4 text-body-2 text-subtle">
                Accounts appear after the first sync.
            </li>
        </ul>
    </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'
import type { BudgetRole, Connection, ConnectionAccount, LinkMode } from '@/services/connection.service'

const props = defineProps<{
    connection: Connection
    /** A sync for this bank is in flight */
    syncing: boolean
    /** What Plaid Link is opening right now, if anything */
    opening: { mode: LinkMode, itemId: number | null } | null
    /** The current time, ticked by the page so cooldowns count down */
    now: number
}>()

defineEmits<{
    reconnect: []
    'manage-accounts': []
    sync: []
    remove: []
    'role-change': [financialAccountId: number, role: BudgetRole]
}>()

const roles: { title: string, value: BudgetRole }[] = [
    { title: 'Spending', value: 'Spending' },
    { title: 'Income only', value: 'IncomeOnly' },
    { title: 'Savings', value: 'Savings' },
    { title: 'Not counted', value: 'Ignore' },
]

const status = computed(() => {
    switch (props.connection.status) {
        case 'login_required': return { label: 'Sign-in needed', color: 'error', icon: 'mdi-alert-circle-outline' }
        case 'pending_expiration': return {
            label: props.connection.consentExpiresAt ? `Access ends ${moment(props.connection.consentExpiresAt).format('MMM D')}` : 'Access ending',
            color: 'warning', icon: 'mdi-timer-sand',
        }
        case 'syncing': return { label: 'First sync', color: 'info', icon: 'mdi-sync' }
        case 'disconnected': return { label: 'Disconnected', color: 'subtle', icon: 'mdi-link-variant-off' }
        case 'error': return { label: 'Needs attention', color: 'warning', icon: 'mdi-alert-outline' }
        default: return { label: 'Healthy', color: 'success', icon: 'mdi-check-circle-outline' }
    }
})

const attention = computed(() => !['healthy', 'syncing'].includes(props.connection.status))

const syncedText = computed(() => {
    if (props.syncing) return 'Syncing…'
    return props.connection.lastSyncedAt
        ? `Synced ${moment(props.connection.lastSyncedAt).from(props.now)}`
        : 'Waiting for the first sync'
})

const cooldownLeft = computed(() => {
    const until = props.connection.syncAvailableAt ? new Date(props.connection.syncAvailableAt).getTime() : 0
    return Math.max(0, until - props.now)
})

const cooldownText = computed(() => {
    if (!cooldownLeft.value || props.syncing) return ''
    const minutes = Math.ceil(cooldownLeft.value / 60000)
    return `Sync again in ${minutes} min`
})

const canSync = computed(() => !cooldownLeft.value && !['login_required', 'disconnected'].includes(props.connection.status))

const isOpening = (mode: LinkMode) => props.opening?.mode === mode && props.opening.itemId === props.connection.institutionAccessItemId

// The bank's own brand color when Plaid has one, otherwise the theme's primary
const accent = computed(() => props.connection.institutionColor ?? 'rgb(var(--v-theme-primary))')

function accountIcon (account: ConnectionAccount) {
    switch (account.type) {
        case 'credit': return 'mdi-credit-card-outline'
        case 'loan': return 'mdi-home-outline'
        case 'investment': return 'mdi-chart-line'
        default: return account.subtype === 'savings' ? 'mdi-piggy-bank-outline' : 'mdi-bank-outline'
    }
}

function currency (amount: number, code?: string | null) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code || 'USD' }).format(amount)
}
</script>

<style scoped>
.connection {
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-border));
    background:
        radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%),
        rgb(var(--v-theme-surface));
}

.connection--attention {
    border-color: rgba(var(--v-theme-warning), 0.55);
}

.min-width-0 {
    min-width: 0;
}

.badge {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    font-size: 1.1rem;
}

.badge img {
    width: 28px;
    height: 28px;
    object-fit: contain;
}

.status-note {
    border-radius: 8px;
    border: 1px solid rgba(var(--status), 0.35);
    background: rgba(var(--status), 0.08);
    color: rgb(var(--v-theme-on-surface));
}

.accounts {
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 1px solid rgb(var(--v-theme-border));
}

.account + .account {
    border-top: 1px solid rgb(var(--v-theme-border));
}

.role-select {
    width: 160px;
    max-width: 100%;
}

.balance {
    min-width: 96px;
    text-align: right;
}
</style>
