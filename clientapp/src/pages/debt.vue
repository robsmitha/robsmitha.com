<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <PageHero eyebrow="> finance / debt" tone="navy" art="arcs" compact>
        <h1 class="hero-title font-weight-bold mb-2">Debt payoff roadmap</h1>
        <p v-if="d" class="text-body-2 hero-label mb-0">
            <template v-if="d.plan">{{ money(d.plan.monthlyAmount) }} a month goes to your debts before anything else is budgeted.</template>
            <template v-else>Choose how much goes to your debts each month. It’s set aside before anything else is budgeted.</template>
        </p>
        <dl v-if="d" class="d-flex flex-wrap hero-stats mt-5 mb-0">
            <div>
                <dt class="font-mono text-caption hero-label">Carried balance</dt>
                <dd class="font-mono text-h6 font-weight-bold">{{ money(d.totalBalance) }}</dd>
            </div>
            <div>
                <dt class="font-mono text-caption hero-label">Debt-free</dt>
                <dd class="font-mono text-h6 font-weight-bold">{{ debtFree(d.selected.summary) }}</dd>
            </div>
            <div>
                <dt class="font-mono text-caption hero-label">Interest to go</dt>
                <dd class="font-mono text-h6 font-weight-bold">{{ d.selected.summary.neverPaysOff ? '—' : money(d.selected.summary.totalInterest) }}</dd>
            </div>
            <div v-if="latest && latest.status !== 'Baseline'">
                <dt class="font-mono text-caption hero-label">Plan vs. actual</dt>
                <dd class="font-mono text-h6 font-weight-bold" :class="latest.status === 'Behind' ? 'text-error' : ''">{{ statusText(latest) }}</dd>
            </div>
        </dl>
    </PageHero>

    <v-container class="body py-6">
        <v-alert v-if="store.error" type="warning" variant="tonal" density="compact" class="mb-4">{{ store.error }}</v-alert>
        <v-skeleton-loader v-if="!d && store.loading" type="table" />

        <div v-else-if="d" class="d-flex flex-column ga-6">
            <v-alert v-if="needDetails.length" type="info" variant="tonal" density="comfortable">
                Enter the APR and minimum for {{ needDetails.map(x => x.name).join(', ') }}. Until then the plan uses a guess for the minimum and 0% interest.
            </v-alert>
            <v-alert v-for="w in d.selected.warnings" :key="w" type="warning" variant="tonal" density="compact">{{ w }}</v-alert>

            <!-- Debts -->
            <section class="card">
                <header class="d-flex flex-wrap align-center justify-space-between ga-2 px-5 py-3 head">
                    <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">Your debts</h2>
                    <v-btn size="small" variant="outlined" class="text-none" prepend-icon="mdi-plus" @click="editing = { source: 'Manual' }">Add manually</v-btn>
                </header>
                <p v-if="!d.debts.length" class="text-body-2 text-subtle pa-5 mb-0">
                    No debts yet. Credit cards and loans you link on the <router-link to="/accounts" class="text-primary">Accounts</router-link> page show up here, or add one by hand.
                </p>
                <div v-else class="scroll">
                    <table class="table text-body-2">
                        <thead class="font-mono text-caption text-subtle">
                            <tr>
                                <th scope="col" class="pl-5">Debt</th><th scope="col" class="text-right">Balance</th><th scope="col" class="text-right">APR</th>
                                <th scope="col" class="text-right">Minimum</th><th scope="col" class="text-right">Paid off</th><th scope="col" class="text-right pr-5">Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="x in d.debts" :key="x.debtId" :class="{ 'row--off': !x.isActive }">
                                <td class="pl-5">
                                    <button type="button" class="name-btn text-left" :aria-label="`Edit ${x.name}`" @click="editing = x">
                                        <span class="d-block text-high-emphasis font-weight-medium">{{ x.name }}</span>
                                        <span class="d-block font-mono text-caption text-subtle">{{ x.detail }}<template v-if="!x.isActive"> · not in the plan</template></span>
                                    </button>
                                </td>
                                <td class="text-right font-mono text-high-emphasis">
                                    {{ money(x.balance) }}
                                    <v-tooltip v-if="x.isStale" location="top" text="The bank needs attention, so this balance may be out of date.">
                                        <template #activator="{ props: tip }"><v-icon v-bind="tip" size="16" color="warning" aria-label="Balance may be out of date">mdi-alert-outline</v-icon></template>
                                    </v-tooltip>
                                </td>
                                <td class="text-right font-mono">
                                    <v-chip v-if="!x.detailsConfirmed" size="x-small" variant="tonal" color="info" class="font-mono" @click="editing = x">Enter</v-chip>
                                    <template v-else>
                                        <span class="text-high-emphasis">{{ x.apr.toFixed(2) }}%</span>
                                        <span v-if="x.promoApr !== null" class="d-block text-caption text-subtle">{{ x.promoApr }}% to {{ shortDate(x.promoEndsOn!) }}</span>
                                    </template>
                                </td>
                                <td class="text-right font-mono text-high-emphasis">{{ target(x.minimumPayment) }}</td>
                                <td class="text-right font-mono text-high-emphasis">{{ x.isActive && x.balance > 0 ? (x.paidOffMonth ? monthLabel(x.paidOffMonth.slice(0, 7)) : '—') : '' }}</td>
                                <td class="text-right pr-5">
                                    <v-chip size="x-small" variant="tonal" :color="x.source === 'Linked' ? 'info' : 'subtle'" class="font-mono"
                                        :prepend-icon="x.source === 'Linked' ? 'mdi-bank-outline' : 'mdi-pencil-outline'">
                                        {{ x.source === 'Linked' ? 'Balance from bank' : 'Manual' }}
                                    </v-chip>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <div class="layout">
                <section class="d-flex flex-column ga-4">
                    <div class="card pa-4">
                        <label for="monthly" class="d-block text-body-2 font-weight-bold text-high-emphasis mb-2">Each month toward debts</label>
                        <v-text-field id="monthly" v-model.number="monthly" type="number" min="0" step="25" prefix="$" density="compact" variant="outlined" hide-details />
                        <p class="text-caption text-subtle mt-2 mb-0">Minimums add up to {{ money(d.totalMinimums) }}.</p>
                    </div>

                    <div class="d-flex flex-column ga-3" role="radiogroup" aria-label="Payoff order">
                        <button v-for="s in strategyCards" :key="s.strategy" type="button" role="radio" :aria-checked="strategy === s.strategy"
                            class="card strat pa-4 text-left" :class="{ 'strat--on': strategy === s.strategy }" @click="strategy = s.strategy">
                            <span class="d-flex align-center ga-2 mb-1">
                                <span class="text-body-2 font-weight-bold text-high-emphasis">{{ s.title }}</span>
                                <v-chip v-if="s.badge" size="x-small" variant="tonal" color="success" class="font-mono ml-auto">{{ s.badge }}</v-chip>
                            </span>
                            <span class="d-block text-caption text-subtle mb-2">{{ s.note }}</span>
                            <span v-if="s.summary" class="d-block text-body-2 text-high-emphasis font-mono">{{ debtFree(s.summary) }} · {{ money(s.summary.totalInterest) }} interest</span>
                        </button>
                    </div>

                    <div v-if="strategy === 'Custom'" class="card pa-4">
                        <span class="d-block text-body-2 font-weight-bold text-high-emphasis mb-2">Your order</span>
                        <ol class="order">
                            <li v-for="(id, i) in order" :key="id" class="d-flex align-center ga-2 py-1 text-body-2">
                                <span class="font-mono text-caption text-subtle">{{ i + 1 }}</span>
                                <span class="flex-grow-1 text-high-emphasis text-truncate">{{ nameOf(id) }}</span>
                                <v-btn icon="mdi-arrow-up" size="x-small" variant="text" :disabled="i === 0" :aria-label="`Move ${nameOf(id)} up`" @click="moveUp(i)" />
                            </li>
                        </ol>
                    </div>

                    <v-btn color="primary" variant="flat" class="text-none" :loading="busy" :disabled="!monthly || monthly <= 0 || !changed" @click="save">
                        {{ d.plan ? 'Save plan' : 'Start this plan' }}
                    </v-btn>
                    <p v-if="saveError" class="text-caption text-error mb-0" role="alert">{{ saveError }}</p>
                    <p v-if="d.plan" class="text-caption text-subtle mb-0">Saving starts a new baseline from today’s balances.</p>

                    <div class="card pa-4">
                        <label for="extra" class="d-flex justify-space-between text-body-2 mb-1">
                            <span class="font-weight-bold text-high-emphasis">What if I paid more?</span>
                            <span class="font-mono text-high-emphasis">+{{ target(extra) }}/mo</span>
                        </label>
                        <v-slider id="extra" v-model="extra" :min="0" :max="1000" :step="25" color="primary" hide-details aria-label="Extra per month" />
                        <p class="text-body-2 text-muted mt-2 mb-0">{{ whatIfText }}</p>
                        <p class="text-caption text-subtle mt-2 mb-0">Paying more would lower safe to spend by the same amount.</p>
                    </div>
                </section>

                <section class="card pa-5 min-width-0">
                    <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis mb-1">Balance by debt</h2>
                    <p class="text-caption text-subtle mb-3">{{ strategyName(d.selected.summary.strategy) }} order · balance after each month’s payment</p>
                    <DebtBalanceChart v-if="activeDebts.length && d.selected.schedule.length" :debts="activeDebts" :schedule="d.selected.schedule" />
                    <p v-else class="text-body-2 text-subtle mb-0">Nothing to pay off.</p>
                </section>
            </div>

            <section v-if="d.history.length" class="card pa-5">
                <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-3">
                    <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">Plan vs. actual</h2>
                    <span class="text-caption text-subtle">Measured by balance, since card payments also cover new spending</span>
                </div>
                <div class="scroll">
                    <table class="table text-body-2">
                        <thead class="font-mono text-caption text-subtle">
                            <tr><th scope="col">Month start</th><th scope="col" class="text-right">Planned balance</th><th scope="col" class="text-right">Actual balance</th>
                                <th scope="col" class="text-right">Payments found</th><th scope="col" class="text-right">Status</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="h in [...d.history].reverse()" :key="h.month">
                                <td class="text-high-emphasis">{{ shortDate(h.month) }}, {{ h.month.slice(0, 4) }}</td>
                                <td class="text-right font-mono text-high-emphasis">{{ money(h.planned) }}</td>
                                <td class="text-right font-mono text-high-emphasis">{{ h.actual === null ? '—' : money(h.actual) }}</td>
                                <td class="text-right font-mono">
                                    <span class="text-high-emphasis">{{ money(h.paymentsFound) }}</span>
                                    <span v-if="h.paymentShortfall" class="d-block text-caption text-error">{{ money(h.paymentShortfall) }} short of {{ target(d.plan!.monthlyAmount) }}</span>
                                </td>
                                <td class="text-right">
                                    <v-chip size="x-small" variant="tonal" :color="statusColor(h)" class="font-mono" :prepend-icon="statusIcon(h)">{{ statusText(h) }}</v-chip>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </v-container>

    <DebtDialog :debt="editing" @close="editing = null" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDebtStore } from '@/store/debt'
import type { Debt, DebtStrategy, PayoffSummary, PlanVsActual } from '@/services/debt.service'
import { money, monthLabel, shortDate, target } from '@/composables/budgetFormat'

const store = useDebtStore()
const breadcrumbs = [
    { title: 'HOME', disabled: false, to: '/' },
    { title: 'DASHBOARD', disabled: false, to: '/dashboard' },
    { title: 'DEBT', disabled: true },
]

const editing = ref<Partial<Debt> | null>(null)
const monthly = ref<number | null>(null)
const strategy = ref<DebtStrategy>('Avalanche')
const order = ref<number[]>([])
const extra = ref(0)
const busy = ref(false)
const saveError = ref<string | null>(null)

onMounted(() => {
    store.extra = 0
    store.fetch()
})

const d = computed(() => store.data)
const latest = computed(() => store.latest)
const activeDebts = computed(() => (d.value?.debts ?? []).filter(x => x.isActive && x.balance > 0))
const needDetails = computed(() => activeDebts.value.filter(x => !x.detailsConfirmed))

// The form starts from the saved plan (or the minimums before there is one)
watch(d, data => {
    if (!data) return
    monthly.value = data.plan?.monthlyAmount ?? Math.ceil(data.totalMinimums)
    strategy.value = data.plan?.strategy ?? 'Avalanche'
    const saved = data.plan?.customOrder ?? []
    const ids = activeDebts.value.map(x => x.debtId)
    order.value = [...saved.filter(id => ids.includes(id)), ...ids.filter(id => !saved.includes(id))]
}, { immediate: true })

const changed = computed(() => {
    const p = d.value?.plan
    if (!p) return true
    return p.monthlyAmount !== monthly.value || p.strategy !== strategy.value
        || (strategy.value === 'Custom' && p.customOrder.join() !== order.value.join())
})

const strategyName = (s: DebtStrategy) => s === 'Avalanche' ? 'Avalanche' : s === 'Snowball' ? 'Snowball' : 'Custom'

const strategyCards = computed(() => {
    const list = d.value?.strategies ?? []
    const av = list.find(s => s.strategy === 'Avalanche')
    const sn = list.find(s => s.strategy === 'Snowball')
    const saves = av && sn && !av.neverPaysOff && sn.totalInterest - av.totalInterest >= 1 ? `Saves ${target(Math.round(sn.totalInterest - av.totalInterest))}` : null
    return [
        { strategy: 'Avalanche' as DebtStrategy, title: 'Avalanche', note: 'Highest APR first. Least interest.', summary: av, badge: saves },
        { strategy: 'Snowball' as DebtStrategy, title: 'Snowball', note: 'Smallest balance first. Quicker early wins.', summary: sn, badge: null },
        { strategy: 'Custom' as DebtStrategy, title: 'Custom order', note: 'Pay them off in the order you choose.', summary: list.find(s => s.strategy === 'Custom'), badge: null },
    ]
})

function debtFree (s: PayoffSummary) {
    if (s.neverPaysOff) return 'Never at this amount'
    return s.debtFreeMonth ? monthLabel(s.debtFreeMonth.slice(0, 7)) : 'Debt-free'
}

const nameOf = (id: number) => d.value?.debts.find(x => x.debtId === id)?.name ?? ''

function moveUp (i: number) {
    const list = [...order.value]
    ;[list[i - 1], list[i]] = [list[i], list[i - 1]]
    order.value = list
}

async function save () {
    busy.value = true
    saveError.value = await store.savePlan(Number(monthly.value), strategy.value, strategy.value === 'Custom' ? order.value : null)
    busy.value = false
}

// The what-if asks the server again, a moment after the slider stops
let timer: ReturnType<typeof setTimeout> | undefined
watch(extra, value => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        store.extra = value
        store.fetch()
    }, 300)
})

const whatIfText = computed(() => {
    const base = d.value?.selected.summary
    const w = d.value?.whatIf
    if (!base || !w || !extra.value) return 'Move the slider to see how much sooner you’d finish.'
    if (w.neverPaysOff) return 'Even with that much more, these debts don’t get paid off.'
    const sooner = base.neverPaysOff ? null : base.months - w.months
    const saved = base.neverPaysOff ? null : base.totalInterest - w.totalInterest
    return sooner === null
        ? `Paying ${target(w.monthlyAmount)} a month pays everything off by ${debtFree(w)}.`
        : `Paying ${target(w.monthlyAmount)} a month finishes ${sooner} month${sooner === 1 ? '' : 's'} sooner and saves ${money(saved!)} in interest.`
})

function statusText (h: PlanVsActual) {
    if (h.status === 'Baseline') return 'Baseline'
    if (h.status === 'OnTrack') return 'On track'
    return `${h.status} ${target(Math.round(Math.abs(h.difference)))}`
}

const statusColor = (h: PlanVsActual) => h.status === 'Ahead' || h.status === 'OnTrack' ? 'success' : h.status === 'Behind' ? 'error' : 'subtle'
const statusIcon = (h: PlanVsActual) => h.status === 'Ahead' ? 'mdi-arrow-up' : h.status === 'Behind' ? 'mdi-arrow-down' : h.status === 'OnTrack' ? 'mdi-check' : undefined
</script>

<style scoped>
.body {
    max-width: 1200px;
}

.layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    align-items: start;
}

@media (min-width: 1280px) {
    .layout {
        grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    }
}

.min-width-0 {
    min-width: 0;
}

.card {
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface));
}

.head {
    border-bottom: 1px solid rgb(var(--v-theme-border));
}

.scroll {
    overflow-x: auto;
}

.table {
    width: 100%;
    min-width: 600px;
    border-collapse: collapse;
}

.table th {
    font-weight: 500;
    text-align: left;
    padding: 8px 12px 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.table td {
    padding: 10px 12px 10px 0;
    border-top: 1px solid rgb(var(--v-theme-border));
    vertical-align: middle;
}

.table .text-right {
    text-align: right;
}

.row--off {
    opacity: 0.6;
}

.name-btn {
    font: inherit;
}

.name-btn:hover span:first-child {
    text-decoration: underline;
}

.name-btn:focus-visible,
.strat:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
}

.strat {
    font: inherit;
    width: 100%;
}

.strat--on {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: inset 0 0 0 1px rgb(var(--v-theme-primary));
}

.order {
    list-style: none;
    padding: 0;
    margin: 0;
}

/* Page header (PageHero) */
.hero-title {
    font-size: clamp(1.6rem, 1.5vw + 1rem, 2.2rem);
    line-height: 1.1;
}

.hero-label {
    opacity: 0.72;
}

.hero-stats {
    gap: 16px 40px;
}

.hero-stats dd {
    margin: 0;
}
</style>
