<template>
    <!-- Placeholder cards laid out like the institution cards below. -->
    <div v-if="!props.accessItems" class="institution-grid" aria-busy="true" aria-label="Loading accounts">
        <div v-for="i in 3" :key="i" class="institution-card pa-5">
            <div class="d-flex align-center ga-3 mb-5">
                <v-skeleton-loader type="avatar" class="bone bone--badge" />
                <div class="flex-grow-1">
                    <v-skeleton-loader type="text" class="bone bone--line mb-2" style="width: 55%" />
                    <v-skeleton-loader type="text" class="bone bone--small" style="width: 35%" />
                </div>
            </div>
            <v-skeleton-loader v-for="r in 2" :key="r" type="text" class="bone bone--row" />
        </div>
    </div>

    <div v-else-if="props.accessItems.length" class="institution-grid">
        <div
            v-for="(a, i) in props.accessItems"
            :key="a.institutionAccessItemId"
            class="institution-card pa-5 d-flex flex-column"
            :style="{ '--accent': accentFor(a, i) }"
        >
            <div class="d-flex align-center ga-3 mb-4">
                <span class="badge font-weight-bold flex-shrink-0">
                    <img v-if="a.institution.logo" :src="`data:image/png;base64,${a.institution.logo}`" :alt="''" />
                    <template v-else>{{ a.institution.name.charAt(0).toUpperCase() }}</template>
                </span>
                <div class="min-width-0 flex-grow-1">
                    <span class="text-lightest-slate font-weight-bold d-block text-truncate">{{ a.institution.name }}</span>
                    <span class="font-mono text-caption text-slate d-flex align-center ga-2">
                        <span class="sync-dot" :class="isStale(a) ? 'bg-amber' : 'bg-green'"></span>
                        Synced {{ moment(a.item.lastSuccessfulUpdate).fromNow() }}
                    </span>
                </div>
            </div>

            <div class="account-list mb-4">
                <div v-for="acc in visibleAccounts(a)" :key="acc.account_id" class="account-row d-flex align-center ga-3 py-2">
                    <v-icon size="18" class="text-slate flex-shrink-0">{{ accountIcon(acc) }}</v-icon>
                    <div class="min-width-0 flex-grow-1">
                        <span class="text-light-slate text-body-2 d-block text-truncate">{{ acc.name }}</span>
                        <span class="font-mono text-caption text-slate">
                            <template v-if="acc.subtype">{{ acc.subtype }}</template>
                            <template v-if="acc.mask"> &middot; &bull;&bull;&bull;&bull; {{ acc.mask }}</template>
                        </span>
                    </div>
                    <span v-if="acc.balances?.current != null" class="font-mono text-body-2 text-lightest-slate flex-shrink-0">
                        {{ currency(acc.balances.current, acc.balances.iso_currency_code) }}
                    </span>
                </div>
                <button
                    v-if="a.accounts.length > accountLimit"
                    type="button"
                    class="expand-toggle font-mono text-caption d-flex align-center ga-1 py-2"
                    :aria-expanded="isExpanded(a)"
                    @click="toggle(a)"
                >
                    <v-icon size="16" class="expand-icon" :class="{ 'expand-icon--open': isExpanded(a) }">mdi-chevron-down</v-icon>
                    {{ isExpanded(a) ? 'Show fewer' : `Show ${a.accounts.length - accountLimit} more account${a.accounts.length - accountLimit === 1 ? '' : 's'}` }}
                </button>
            </div>

            <p v-if="isStale(a)" class="font-mono text-caption text-amber mb-4">
                Hasn't synced in a while. Re-link it if transactions look out of date.
            </p>

            <v-btn
                v-if="showIncome"
                variant="outlined"
                color="primary"
                rounded="pill"
                class="text-none mt-auto align-self-start"
                append-icon="mdi-arrow-right"
                :to="`/account/${a.institutionAccessItemId}/income`"
            >
                Open dashboard
            </v-btn>
        </div>
    </div>

    <div v-else class="empty-state d-flex flex-column align-center py-12 px-4 text-center">
        <v-icon size="40" class="mb-3 text-slate">mdi-bank-outline</v-icon>
        <p class="text-lightest-slate font-weight-bold mb-1">No linked accounts yet</p>
        <p class="text-body-2 text-slate mb-5">Link a bank through Plaid to start tracking income and spending.</p>
        <slot name="empty-action" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import moment from 'moment'

const props = defineProps(['accessItems', 'showIncome'])

// Long account lists are collapsed to the first few, with a toggle for the rest.
const accountLimit = 3
const expanded = ref(new Set<number>())

const isExpanded = (a: any) => expanded.value.has(a.institutionAccessItemId)
const visibleAccounts = (a: any) => isExpanded(a) ? a.accounts : a.accounts.slice(0, accountLimit)

function toggle(a: any) {
    const next = new Set(expanded.value)
    if (next.has(a.institutionAccessItemId)) next.delete(a.institutionAccessItemId)
    else next.add(a.institutionAccessItemId)
    expanded.value = next
}

const palette = ['primary', 'info', 'violet', 'amber', 'green', 'error']

// Use the bank's own brand color when Plaid provides one, otherwise a theme accent.
function accentFor(a: any, i: number) {
    const brand = a.institution?.primary_color
    if (brand) return brand
    return `rgb(var(--v-theme-${palette[i % palette.length]}))`
}

// Plaid items that haven't refreshed in 3+ days usually need to be re-linked.
const isStale = (a: any) => moment().diff(moment(a.item?.lastSuccessfulUpdate), 'days') >= 3

function accountIcon(acc: any) {
    switch (acc.type) {
        case 'credit': return 'mdi-credit-card-outline'
        case 'loan': return 'mdi-home-outline'
        case 'investment': return 'mdi-chart-line'
        default: return acc.subtype === 'savings' ? 'mdi-piggy-bank-outline' : 'mdi-bank-outline'
    }
}

function currency(amount: number, code?: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code || 'USD' }).format(amount)
}
</script>

<style scoped>
.institution-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    /* Expanding one card's account list shouldn't stretch its neighbors. */
    align-items: start;
}

.institution-card {
    border-radius: 12px;
    background:
        radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--accent, #8a8a93) 16%, transparent), transparent 55%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: border-color 0.2s ease;
}

.institution-card:hover {
    border-color: color-mix(in srgb, var(--accent) 70%, transparent);
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

.sync-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
}

.account-list {
    border-top: 1px solid rgb(var(--v-theme-lightest-navy));
}

.account-row {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.expand-toggle {
    width: 100%;
    color: rgb(var(--v-theme-slate));
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: color 0.15s ease;
}

.expand-toggle:hover,
.expand-toggle:focus-visible {
    color: var(--accent, rgb(var(--v-theme-primary)));
    outline: none;
}

.expand-icon {
    transition: transform 0.2s ease;
}

.expand-icon--open {
    transform: rotate(180deg);
}

.empty-state {
    border-radius: 12px;
    border: 1px dashed rgb(var(--v-theme-lightest-navy));
}

/* Placeholder bones: strip Vuetify's built-in margins and tone the color down
   (the theme's border-opacity of 1 would otherwise make every bone solid white). */
.bone {
    background: transparent;
}

.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__avatar) {
    margin: 0;
    max-width: none;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.bone :deep(.v-skeleton-loader__text) {
    width: 100%;
}

.bone--badge :deep(.v-skeleton-loader__avatar) {
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
    border-radius: 12px;
}

.bone--line :deep(.v-skeleton-loader__text) {
    height: 14px;
}

.bone--small :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.bone--row {
    height: 53px;
    border-top: 1px solid rgb(var(--v-theme-lightest-navy));
    display: flex;
    align-items: center;
}

.bone--row :deep(.v-skeleton-loader__text) {
    height: 12px;
    width: 70%;
}
</style>
