<template>
    <ConnectionBanner />
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <PageHero eyebrow="> finance / dashboard" tone="teal" art="arcs" compact>
        <div class="d-flex flex-wrap align-end hero-row">
            <div>
                <h1 class="hero-title font-weight-bold">{{ title }}</h1>
                <p v-if="m" class="font-mono text-caption hero-label mb-0 mt-1">Day {{ m.dayOfMonth }} of {{ m.daysInMonth }} · {{ m.daysLeft }} days left</p>
            </div>
            <div v-if="m">
                <p class="font-mono text-caption hero-label mb-1">Safe to spend</p>
                <p class="font-mono hero-number font-weight-bold mb-0" :class="{ 'text-error': m.safeToSpend < 0 }">{{ money(m.safeToSpend) }}</p>
                <p v-if="m.safePerDay !== null" class="font-mono text-caption hero-label mb-0 mt-1">
                    about <span class="hero-strong">{{ money(m.safePerDay) }} a day</span> for the rest of the month
                </p>
            </div>
        </div>

        <div v-if="m" class="month-bar mt-6">
            <div class="d-flex justify-space-between font-mono hero-label hero-small mb-1">
                <span>{{ monthShort }} 1</span><span>Month {{ monthGone }}% gone</span><span>{{ monthShort }} {{ m.daysInMonth }}</span>
            </div>
            <div class="hero-track" role="img" :aria-label="`${monthGone}% of the month has gone`"><span :style="{ width: `${monthGone}%` }" /></div>
        </div>

        <dl v-if="m" class="d-flex flex-wrap hero-stats mt-6 mb-0">
            <div v-for="s in heroStats" :key="s.label">
                <dt class="font-mono text-caption hero-label">{{ s.label }}</dt>
                <dd class="font-mono text-subtitle-1 font-weight-bold">{{ s.value }}</dd>
                <dd class="font-mono hero-label hero-small">{{ s.note }}</dd>
            </div>
        </dl>
    </PageHero>

    <v-container class="body py-6">
        <v-alert v-if="store.error" type="warning" variant="tonal" density="compact" class="mb-4">{{ store.error }}</v-alert>

        <div v-if="!m && store.loading" class="layout">
            <v-skeleton-loader type="card" /><v-skeleton-loader type="card" />
        </div>

        <div v-else-if="m" class="layout">
            <div class="d-flex flex-column ga-6 min-width-0">
                <!-- Alerts (in-app; email comes later and is off by default) -->
                <section v-if="alerts.length" class="card pa-5" aria-label="Alerts">
                    <ul class="plain d-flex flex-column ga-2">
                        <li v-for="(a, i) in alerts" :key="i" class="d-flex align-start ga-2 text-body-2">
                            <v-icon size="18" :color="a.severity === 'error' ? 'error' : 'warning'" class="mt-1">{{ a.severity === 'error' ? 'mdi-alert-circle-outline' : 'mdi-alert-outline' }}</v-icon>
                            <span class="text-high-emphasis">{{ a.message }}</span>
                        </li>
                    </ul>
                </section>

                <section class="card pa-5">
                    <div class="d-flex align-center justify-space-between mb-4">
                        <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">How it adds up</h2>
                        <span class="font-mono text-caption text-subtle">income{{ m.committed ? ' − committed' : '' }} − spent</span>
                    </div>
                    <ul class="plain adds">
                        <li v-for="row in addsUp" :key="row.label">
                            <span class="d-flex align-center ga-2 text-body-2">
                                <v-icon size="18" :color="row.income ? 'success' : undefined" :class="{ 'text-subtle': !row.income }">{{ row.icon }}</v-icon>
                                <router-link v-if="row.to" :to="row.to" class="link text-high-emphasis">{{ row.label }}</router-link>
                                <span v-else class="text-high-emphasis">{{ row.label }}</span>
                                <v-chip v-if="row.chip" size="x-small" variant="tonal" color="subtle" class="font-mono">{{ row.chip }}</v-chip>
                            </span>
                            <span class="font-mono text-body-2" :class="row.income ? 'text-high-emphasis' : 'text-muted'">{{ row.value }}</span>
                            <div class="row-track"><span :class="row.income ? 'bg-success' : 'bg-subtle'" :style="{ width: `${row.width}%` }" /></div>
                        </li>
                        <li class="total">
                            <span class="text-body-2 font-weight-bold text-high-emphasis">Safe to spend</span>
                            <span class="font-mono text-subtitle-1 font-weight-bold" :class="m.safeToSpend < 0 ? 'text-error' : 'text-high-emphasis'">{{ money(m.safeToSpend) }}</span>
                        </li>
                    </ul>
                    <p v-if="notCountedNote" class="text-caption text-subtle mt-3 mb-0">{{ notCountedNote }}</p>
                </section>

                <section class="card pa-5">
                    <div class="d-flex align-center justify-space-between mb-1">
                        <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">Top categories</h2>
                        <v-btn variant="text" color="primary" size="small" class="text-none" append-icon="mdi-arrow-right" to="/budget">Full budget</v-btn>
                    </div>
                    <p class="text-caption text-subtle mb-4 d-flex align-center ga-2"><span class="tick-key" />marker = where you'd be at an even pace</p>
                    <p v-if="!top.length" class="text-body-2 text-subtle mb-0">
                        No spending in a category yet this month.
                        <router-link v-if="!m.lines.length" to="/budget" class="link text-primary">Set targets</router-link>
                    </p>
                    <ul class="plain d-flex flex-column ga-4">
                        <li v-for="l in top" :key="l.categoryId">
                            <div class="d-flex align-center ga-2 text-body-2 mb-2">
                                <v-icon size="18" class="text-subtle">{{ l.icon ?? 'mdi-tag-outline' }}</v-icon>
                                <span class="flex-grow-1 text-high-emphasis text-truncate">{{ l.name }}</span>
                                <v-chip v-if="chipFor(l)" size="x-small" variant="tonal" :color="chipFor(l)!.color" :prepend-icon="chipFor(l)!.icon" class="font-mono">{{ chipFor(l)!.label }}</v-chip>
                                <v-chip v-else-if="l.group !== 'Flexible'" size="x-small" variant="tonal" color="subtle" class="font-mono">{{ l.group === 'Fixed' ? 'Fixed' : 'Non-monthly' }}</v-chip>
                                <v-chip v-else size="x-small" variant="tonal" color="success" prepend-icon="mdi-check" class="font-mono">On track</v-chip>
                            </div>
                            <BudgetBar :spent="l.spent" :available="l.available" :color="fillColor(l)" :expected="l.expectedByNow" />
                            <div class="d-flex justify-space-between font-mono text-caption text-subtle mt-1">
                                <span>{{ money(l.spent) }} of {{ target(l.available) }}</span>
                                <span v-if="l.group !== 'Flexible' && l.nextCharge && l.left > 0">{{ l.nextCharge.name }} due {{ shortDate(l.nextCharge.date) }}</span>
                                <span v-else>{{ l.left >= 0 ? `${money(l.left)} left` : `${money(-l.left)} over` }}</span>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>

            <aside class="d-flex flex-column ga-6 min-width-0">
                <section class="card pa-5">
                    <div class="d-flex align-center justify-space-between mb-3">
                        <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">Paychecks</h2>
                        <v-btn variant="text" size="small" color="primary" class="text-none" @click="paychecksOpen = true">Manage</v-btn>
                    </div>
                    <p v-if="m.income.override !== null" class="text-body-2 text-muted mb-0">Income for this month is set to {{ money(m.income.override) }}.</p>
                    <p v-else-if="!m.income.paychecks.length" class="text-body-2 text-subtle mb-0">No paychecks found yet. They’re picked up automatically once a few have arrived.</p>
                    <ul v-else class="plain d-flex flex-column ga-3">
                        <li v-for="(p, i) in m.income.paychecks" :key="i" class="d-flex align-center ga-3 text-body-2">
                            <v-icon :color="p.status === 'Received' ? 'success' : p.status === 'Late' ? 'warning' : undefined" :class="{ 'text-subtle': p.status === 'Expected' }">
                                {{ p.status === 'Received' ? 'mdi-check-circle' : p.status === 'Late' ? 'mdi-alert-outline' : 'mdi-clock-outline' }}
                            </v-icon>
                            <div class="flex-grow-1 min-width-0">
                                <span class="d-block text-high-emphasis">{{ dayDate(p.receivedOn ?? p.payday) }}</span>
                                <span class="d-block font-mono text-caption text-subtle text-truncate">
                                    {{ p.status === 'Received' ? [p.name, p.accountName].filter(Boolean).join(' · ') : p.status === 'Late' ? 'Not seen yet · not counted' : 'Expected' }}
                                </span>
                            </div>
                            <span class="font-mono" :class="p.status === 'Received' ? 'text-high-emphasis' : 'text-muted'">{{ money(p.amount) }}</span>
                        </li>
                    </ul>
                    <p v-if="m.income.nextExtraPaycheckMonth" class="extra text-caption text-muted mt-4 mb-0 px-3 py-2">
                        <v-icon size="16" color="primary">mdi-calendar-star</v-icon>
                        Next 3-paycheck month: <strong class="text-high-emphasis">{{ monthLabel(m.income.nextExtraPaycheckMonth) }}</strong>
                    </p>
                </section>

                <section class="card pa-5">
                    <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis mb-3">Coming up</h2>
                    <p v-if="!comingUp.length" class="text-body-2 text-subtle mb-0">No bills or subscriptions expected in the next three weeks.</p>
                    <ul class="plain d-flex flex-column ga-3">
                        <li v-for="(u, i) in comingUp" :key="i" class="d-flex align-center ga-3 text-body-2">
                            <span class="font-mono text-caption text-subtle date">{{ shortDate(u.date) }}</span>
                            <span class="flex-grow-1 text-high-emphasis text-truncate">
                                {{ u.name }}
                                <v-chip v-if="!u.counted" size="x-small" variant="tonal" color="subtle" class="font-mono ml-1">not counted</v-chip>
                            </span>
                            <span class="font-mono" :class="u.counted ? 'text-high-emphasis' : 'text-subtle'">{{ u.isEstimate ? '~' : '' }}{{ money(u.amount) }}</span>
                        </li>
                    </ul>
                    <p v-for="a in projected" :key="a.message" class="text-caption text-warning mt-3 mb-0">
                        <v-icon size="14">mdi-alert-outline</v-icon> {{ a.message }}
                    </p>
                </section>

                <section v-if="debt.data && debt.data.debts.some(x => x.isActive && x.balance > 0)" class="card pa-5">
                    <div class="d-flex align-center justify-space-between mb-2">
                        <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">Debt plan</h2>
                        <v-chip v-if="debtStatus" size="x-small" variant="tonal" :color="debtStatus.color" :prepend-icon="debtStatus.icon" class="font-mono">{{ debtStatus.label }}</v-chip>
                    </div>
                    <p class="font-mono text-h6 font-weight-bold text-high-emphasis mb-0">{{ money(debt.data.totalBalance) }}</p>
                    <p v-if="debt.data.plan" class="text-caption text-subtle mb-0">
                        Debt-free <span class="text-high-emphasis">{{ debtFree }}</span> · {{ debt.data.plan.strategy.toLowerCase() }} · {{ target(debt.data.plan.monthlyAmount) }}/mo
                    </p>
                    <p v-else class="text-caption text-subtle mb-0">No plan yet. Choose a monthly amount to see your debt-free date.</p>
                    <v-btn variant="text" color="primary" size="small" class="text-none px-0 mt-2" append-icon="mdi-arrow-right" to="/debt">
                        {{ debt.data.plan ? 'See the roadmap' : 'Make a plan' }}
                    </v-btn>
                </section>

                <section class="card pa-5">
                    <div class="d-flex align-center justify-space-between mb-3">
                        <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">Goals</h2>
                        <v-btn variant="text" color="primary" size="small" class="text-none" to="/goals">{{ goals.data?.goals.length ? 'All' : 'Add one' }}</v-btn>
                    </div>
                    <p v-if="!goals.data?.goals.length" class="text-body-2 text-subtle mb-0">Set money aside for known bills like property taxes or insurance.</p>
                    <ul v-else class="plain d-flex flex-column ga-2">
                        <li v-for="g in goals.data.goals.slice(0, 5)" :key="g.savingsGoalId" class="d-flex align-center ga-2 text-body-2">
                            <v-icon size="18" class="text-subtle">{{ g.icon ?? 'mdi-piggy-bank-outline' }}</v-icon>
                            <span class="flex-grow-1 text-high-emphasis text-truncate">{{ g.name }}</span>
                            <v-chip size="x-small" variant="tonal" :color="goalChip(g).color" :prepend-icon="goalChip(g).icon" class="font-mono">{{ goalChip(g).label }}</v-chip>
                        </li>
                    </ul>
                </section>
            </aside>
        </div>
    </v-container>

    <PaychecksDialog :open="paychecksOpen" @close="paychecksOpen = false" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useBudgetStore } from '@/store/budget'
import { useDebtStore } from '@/store/debt'
import { useGoalsStore } from '@/store/goals'
import type { BudgetLine } from '@/services/budget.service'
import { dayDate, fillColor, goalChip, money, monthLabel, monthName, shortDate, statusChip, target } from '@/composables/budgetFormat'

const store = useBudgetStore()
const debt = useDebtStore()
const goals = useGoalsStore()
const paychecksOpen = ref(false)

const breadcrumbs = [
    { title: 'HOME', disabled: false, to: '/' },
    { title: 'DASHBOARD', disabled: true },
]

onMounted(() => {
    // The dashboard is always this month
    const now = new Date()
    store.go(now.getFullYear(), now.getMonth() + 1)
    debt.extra = 0
    debt.fetch()
    goals.fetch()
})

const debtFree = computed(() => {
    const s = debt.data?.selected.summary
    if (!s) return ''
    return s.neverPaysOff ? 'never at this amount' : s.debtFreeMonth ? monthLabel(s.debtFreeMonth.slice(0, 7)) : 'now'
})

const debtStatus = computed(() => {
    const h = debt.latest
    if (!h || h.status === 'Baseline') return null
    if (h.status === 'OnTrack') return { label: 'On track', color: 'success', icon: 'mdi-check' }
    const amount = target(Math.round(Math.abs(h.difference)))
    return h.status === 'Ahead'
        ? { label: `Ahead ${amount}`, color: 'success', icon: 'mdi-trending-down' }
        : { label: `Behind ${amount}`, color: 'error', icon: 'mdi-arrow-down' }
})

const m = computed(() => store.data)
const title = computed(() => `${monthName(store.month)} ${store.year}`)
const monthShort = computed(() => monthName(store.month).slice(0, 3))
const monthGone = computed(() => m.value ? Math.round((m.value.dayOfMonth / m.value.daysInMonth) * 100) : 0)

const heroStats = computed(() => {
    const d = m.value!
    const received = d.income.paychecks.filter(p => p.status === 'Received' && p.incomeStreamId !== null).length
    const scheduled = d.income.paydays
    const stats = [
        {
            label: 'Income',
            value: money(d.income.total),
            note: d.income.override !== null ? 'typed in for this month' : scheduled ? `${received} of ${scheduled} paycheck${scheduled === 1 ? '' : 's'} in` : 'received so far',
        },
        { label: 'Spent so far', value: money(d.spent), note: d.pendingSpent ? `incl. ${money(d.pendingSpent)} pending` : 'all posted' },
        { label: 'Left in budget', value: money(d.leftInBudget), note: `of ${target(d.assigned)} assigned` },
    ]
    if (d.committed) stats.splice(1, 0, { label: 'Committed', value: money(d.committed), note: 'debt plan + goals' })
    return stats
})

const addsUp = computed(() => {
    const d = m.value!
    const base = Math.max(d.income.total, 1)
    const width = (n: number) => Math.min(100, Math.max(0, (n / base) * 100))
    const rows: { label: string, value: string, icon: string, width: number, income?: boolean, chip?: string, to?: string }[] = [
        { label: 'Income this month', value: money(d.income.total), icon: 'mdi-cash-plus', width: 100, income: true, chip: d.income.paydays ? `${d.income.paydays} payday${d.income.paydays === 1 ? '' : 's'}` : undefined },
    ]
    if (d.committedDebt) rows.push({ label: 'Debt payoff plan', value: money(-d.committedDebt), icon: 'mdi-credit-card-clock-outline', width: width(d.committedDebt), to: '/debt' })
    if (d.committedGoals) rows.push({ label: 'Savings goals', value: money(-d.committedGoals), icon: 'mdi-piggy-bank-outline', width: width(d.committedGoals), to: '/goals' })
    rows.push({ label: 'Spent so far', value: money(-d.spent), icon: 'mdi-cart-outline', width: width(d.spent), to: '/transactions' })
    return rows
})

const notCountedNote = computed(() => {
    const n = m.value!.notCounted
    const parts = []
    if (n.cardPayments) parts.push(`Card payments (${money(n.cardPaymentsTotal)})`)
    if (n.transfers) parts.push(`transfers (${money(n.transfersTotal)})`)
    if (!parts.length) return ''
    return `${parts.join(' and ')} this month aren’t counted as spending.`
})

/** The five categories with the most spending */
const top = computed(() => [...(m.value?.lines ?? [])].filter(l => l.spent > 0 || l.available > 0).sort((a, b) => b.spent - a.spent).slice(0, 5))
const chipFor = (l: BudgetLine) => l.status === 'OnTrack' && !l.projectedOver ? null : statusChip(l)

const alerts = computed(() => (m.value?.alerts ?? []).filter(a => a.kind === 'OverBudget' || a.kind === 'OverPace'))
const projected = computed(() => (m.value?.alerts ?? []).filter(a => a.kind === 'ProjectedOver'))

const comingUp = computed(() => {
    const until = new Date()
    until.setDate(until.getDate() + 21)
    const limit = `${until.getFullYear()}-${String(until.getMonth() + 1).padStart(2, '0')}-${String(until.getDate()).padStart(2, '0')}`
    return (m.value?.upcoming ?? []).filter(u => u.date <= limit).slice(0, 8)
})
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
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
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

.plain {
    list-style: none;
    padding: 0;
    margin: 0;
}

.link {
    text-decoration: none;
}

.link:hover {
    text-decoration: underline;
}

/* Page header (PageHero) */
.hero-row {
    gap: 24px 40px;
}

.hero-title {
    font-size: clamp(1.8rem, 1.5vw + 1.2rem, 2.4rem);
    line-height: 1.1;
}

.hero-number {
    font-size: clamp(2.2rem, 2vw + 1.6rem, 3rem);
    line-height: 1.05;
}

.hero-label {
    opacity: 0.72;
}

.hero-small {
    font-size: 11px;
}

.hero-strong {
    opacity: 1;
    font-weight: 700;
}

.month-bar {
    max-width: 560px;
}

.hero-track {
    position: relative;
    height: 8px;
    border-radius: 0;
    background: rgba(var(--v-theme-hero-ink), 0.18);
}

.hero-track span {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 0;
    background: rgba(var(--v-theme-hero-ink), 0.75);
}

.hero-stats {
    gap: 16px 40px;
}

.hero-stats dd {
    margin: 0;
}

.adds {
    display: grid;
    gap: 14px;
}

.adds > li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 12px;
    align-items: center;
}

.adds > li.total {
    border-top: 1px solid rgb(var(--v-theme-border));
    padding-top: 12px;
}

.row-track {
    grid-column: 1 / -1;
    position: relative;
    height: 6px;
    border-radius: 999px;
    background: rgb(var(--v-theme-border));
}

.row-track span {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 999px;
}

.tick-key {
    display: inline-block;
    width: 2px;
    height: 12px;
    border-radius: 1px;
    background: rgb(var(--v-theme-subtle));
}

.date {
    width: 48px;
    flex: none;
}

.extra {
    border-radius: 8px;
    background: rgb(var(--v-theme-surface-raised));
}
</style>
