<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <PageHero eyebrow="> finance / budget" tone="plum" art="arcs" compact>
        <div class="d-flex align-center ga-2 mb-1">
            <v-btn icon="mdi-chevron-left" variant="text" color="hero-ink" size="small" aria-label="Previous month" @click="step(-1)" />
            <h1 class="hero-title font-weight-bold">{{ title }}</h1>
            <v-btn icon="mdi-chevron-right" variant="text" color="hero-ink" size="small" aria-label="Next month" @click="step(1)" />
        </div>
        <p v-if="m" class="font-mono text-caption hero-label mb-0">{{ dayText }}</p>

        <dl v-if="m" class="d-flex flex-wrap hero-stats mt-5 mb-0">
            <div v-for="s in heroStats" :key="s.label">
                <dt class="font-mono text-caption hero-label">{{ s.label }}</dt>
                <dd class="font-mono text-subtitle-1 font-weight-bold" :class="s.class">{{ s.value }}</dd>
            </div>
        </dl>

        <div v-if="m && m.income.total > 0" class="assign mt-4">
            <div class="hero-track" role="img" :aria-label="`${money(m.assigned)} of ${money(m.income.total - m.committed)} assigned`">
                <span :style="{ width: `${assignedPct}%` }" />
            </div>
            <div class="d-flex flex-wrap ga-4 font-mono hero-label hero-small mt-1">
                <span class="d-flex align-center ga-1"><span class="key key--on" />Assigned</span>
                <span class="d-flex align-center ga-1"><span class="key" />Not assigned</span>
                <span v-if="m.committed">Committed: debt {{ target(m.committedDebt) }} + goals {{ target(m.committedGoals) }}</span>
            </div>
        </div>

        <div class="d-flex flex-wrap ga-2 mt-5">
            <v-btn color="hero-ink" variant="outlined" rounded="pill" size="small" class="text-none" prepend-icon="mdi-content-copy" :loading="busy === 'copy'" @click="run('copy', store.copyPrevious)">
                Copy {{ previousName }}
            </v-btn>
            <v-btn color="hero-ink" variant="outlined" rounded="pill" size="small" class="text-none" prepend-icon="mdi-chart-bell-curve" :loading="busy === 'avg'" @click="run('avg', store.useAverage)">
                Use 3-month average
            </v-btn>
            <v-btn color="hero-ink" variant="outlined" rounded="pill" size="small" class="text-none" prepend-icon="mdi-cash-plus" @click="paychecksOpen = true">
                Income
            </v-btn>
        </div>
    </PageHero>

    <v-container class="body py-6">
        <v-alert v-if="store.error || error" type="warning" variant="tonal" density="compact" closable class="mb-4" @click:close="store.error = null; error = null">
            {{ error ?? store.error }}
        </v-alert>

        <div v-if="!m && store.loading" class="layout"><v-skeleton-loader type="card" /><v-skeleton-loader type="card" /></div>

        <div v-else-if="m" class="layout">
            <div class="d-flex flex-column ga-6 min-width-0">
                <div class="d-flex flex-wrap align-center ga-4 text-caption text-subtle">
                    <span class="d-flex align-center ga-2"><span class="tick-key" />even-pace marker (flexible only)</span>
                    <span class="d-flex align-center ga-1"><v-icon size="14">mdi-autorenew</v-icon>rolls over</span>
                    <span class="d-flex align-center ga-1"><v-icon size="14">mdi-pencil-outline</v-icon>select a target to change it</span>
                </div>

                <v-alert v-if="!m.lines.length" type="info" variant="tonal" density="comfortable">
                    {{ m.hasBudget ? 'No targets yet this month.' : 'There’s no budget for this month.' }}
                    Copy {{ previousName }}, use your 3-month average, or add targets below.
                </v-alert>

                <section v-for="g in groups" :key="g.group" class="card">
                    <header class="d-flex align-center justify-space-between px-5 py-3 group-head">
                        <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">
                            {{ groupInfo[g.group].title }} <span class="font-mono text-caption text-subtle ml-1">{{ groupInfo[g.group].note }}</span>
                        </h2>
                        <span class="font-mono text-body-2 text-muted">{{ money(g.spent) }} / {{ money(g.available) }}</span>
                    </header>
                    <ul class="plain">
                        <li v-for="l in g.lines" :key="l.categoryId" class="line px-5 py-3">
                            <span class="d-flex align-center ga-2 min-width-0">
                                <router-link :to="transactionsLink(l)" class="cat-link d-flex align-center ga-2 min-width-0" :title="`See ${l.name} transactions for ${title}`">
                                    <v-icon size="18" class="text-subtle">{{ l.icon ?? 'mdi-tag-outline' }}</v-icon>
                                    <span class="text-body-2 text-high-emphasis text-truncate cat-name">{{ l.name }}</span>
                                    <v-icon size="14" class="text-subtle cat-arrow" aria-hidden="true">mdi-arrow-right</v-icon>
                                </router-link>
                                <v-tooltip v-if="l.rollover" location="top" :text="carryText(l)">
                                    <template #activator="{ props: tip }"><v-icon v-bind="tip" size="16" class="text-subtle" :aria-label="carryText(l)">mdi-autorenew</v-icon></template>
                                </v-tooltip>
                                <v-chip v-if="statusChip(l)" size="x-small" variant="tonal" :color="statusChip(l)!.color" class="font-mono flex-shrink-0">{{ statusChip(l)!.label }}</v-chip>
                            </span>
                            <BudgetBar :spent="l.spent" :available="l.available" :color="fillColor(l)" :expected="l.expectedByNow" :projected="l.projectedOver ? l.available + l.projectedOver : null" />
                            <span class="font-mono text-body-2 text-right amounts">
                                <span class="text-high-emphasis">{{ money(l.spent) }}</span>
                                <span class="text-subtle"> / </span>
                                <template v-if="editing?.categoryId === l.categoryId">
                                    <span class="d-inline-flex align-center ga-1 edit">
                                        <v-text-field v-model.number="editing.amount" type="number" min="0" step="1" prefix="$" density="compact" variant="outlined" hide-details autofocus
                                            class="target-input" :aria-label="`${l.name} target`" @keyup.enter="saveEdit" @keyup.esc="editing = null" />
                                        <v-btn icon="mdi-autorenew" size="x-small" :variant="editing.rollover ? 'tonal' : 'text'" :color="editing.rollover ? 'primary' : undefined"
                                            :aria-pressed="editing.rollover" :aria-label="editing.rollover ? 'Rolls over: on' : 'Rolls over: off'" @click="editing.rollover = !editing.rollover" />
                                        <v-btn icon="mdi-check" size="x-small" color="primary" variant="flat" aria-label="Save target" :loading="busy === 'save'" @click="saveEdit" />
                                    </span>
                                </template>
                                <button v-else type="button" class="target-btn text-high-emphasis" :aria-label="`Change ${l.name} target, now ${target(l.target)}`" @click="startEdit(l)">
                                    {{ l.target ? target(l.available) : 'Set' }}
                                </button>
                            </span>
                        </li>
                    </ul>
                </section>

                <!-- Add a target for a category that doesn't have one -->
                <div class="d-flex flex-wrap align-center ga-2">
                    <v-autocomplete v-model="addCategory" :items="addable" item-title="name" item-value="financialCategoryId" placeholder="Add a category" density="compact"
                        variant="outlined" hide-details class="add-field" aria-label="Category to add" />
                    <v-text-field v-model.number="addAmount" type="number" min="0" prefix="$" density="compact" variant="outlined" hide-details class="target-input" aria-label="Target" />
                    <v-btn color="primary" variant="outlined" class="text-none" :disabled="!addCategory || !addAmount" :loading="busy === 'add'" @click="addTarget">Add target</v-btn>
                </div>

                <router-link v-if="m.uncategorized.count" to="/transactions" class="card px-5 py-4 d-flex align-center ga-3 nudge">
                    <v-icon color="warning">mdi-help-circle-outline</v-icon>
                    <span class="flex-grow-1 text-body-2">
                        <strong class="text-high-emphasis">{{ m.uncategorized.count }} transaction{{ m.uncategorized.count === 1 ? '' : 's' }} need{{ m.uncategorized.count === 1 ? 's' : '' }} a category</strong>
                        <span v-if="m.uncategorized.example" class="text-muted"> · {{ m.uncategorized.example }} {{ money(m.uncategorized.exampleAmount ?? 0) }} isn’t in any category yet</span>
                    </span>
                    <v-icon class="text-subtle">mdi-arrow-right</v-icon>
                </router-link>
            </div>

            <aside class="d-flex flex-column ga-6 min-width-0">
                <section class="card pa-5">
                    <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis">Spending by month</h2>
                    <p class="text-caption text-subtle mb-3">Counted spending only; {{ monthName(new Date().getMonth() + 1) }} is month-to-date</p>
                    <SpendingTrendChart v-if="store.trends.length" :trends="store.trends" />
                </section>

                <section class="card pa-5">
                    <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis mb-3">Not counted this month</h2>
                    <ul class="plain d-flex flex-column ga-2 text-body-2">
                        <li class="d-flex justify-space-between"><span class="text-muted">Card payments ({{ m.notCounted.cardPayments }})</span><span class="font-mono text-high-emphasis">{{ money(m.notCounted.cardPaymentsTotal) }}</span></li>
                        <li class="d-flex justify-space-between"><span class="text-muted">Transfers ({{ m.notCounted.transfers }})</span><span class="font-mono text-high-emphasis">{{ money(m.notCounted.transfersTotal) }}</span></li>
                        <li class="d-flex justify-space-between"><span class="text-muted">Refunds netted in categories</span><span class="font-mono text-high-emphasis">{{ money(m.notCounted.refundsTotal) }}</span></li>
                        <li v-if="m.notCounted.hidden" class="d-flex justify-space-between"><span class="text-muted">Hidden</span><span class="font-mono text-high-emphasis">{{ m.notCounted.hidden }}</span></li>
                    </ul>
                    <v-btn variant="text" color="primary" size="small" class="text-none px-0 mt-2" append-icon="mdi-arrow-right" to="/transactions">Review them</v-btn>
                </section>

                <section class="card pa-5">
                    <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis mb-3">Recurring</h2>
                    <p v-if="!store.recurring.length" class="text-body-2 text-subtle mb-0">Bills and subscriptions show up here after they’ve been charged a few times.</p>
                    <ul class="plain d-flex flex-column ga-3">
                        <li v-for="r in store.recurring" :key="r.merchantKey" class="d-flex align-center ga-3 text-body-2">
                            <div class="flex-grow-1 min-width-0">
                                <span class="d-block text-high-emphasis text-truncate">
                                    {{ r.name }}
                                    <v-chip v-if="r.priceChange" size="x-small" variant="tonal" :color="r.priceChange > 0 ? 'warning' : 'success'" class="font-mono ml-1">
                                        {{ r.priceChange > 0 ? '+' : '−' }}{{ money(Math.abs(r.priceChange)) }}
                                    </v-chip>
                                </span>
                                <span class="d-block font-mono text-caption text-subtle">{{ cadence(r) }} · next {{ shortDate(r.nextDate) }}</span>
                            </div>
                            <span class="font-mono" :class="r.counted ? 'text-high-emphasis' : 'text-subtle'">{{ r.isVariable ? '~' : '' }}{{ money(r.amount) }}</span>
                        </li>
                    </ul>
                </section>
            </aside>
        </div>
    </v-container>

    <PaychecksDialog :open="paychecksOpen" @close="paychecksOpen = false" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBudgetStore } from '@/store/budget'
import { useTransactionsStore } from '@/store/transactions'
import type { BudgetLine, CategoryGroup, Recurring, TargetSave } from '@/services/budget.service'
import { fillColor, money, monthName, shortDate, statusChip, target } from '@/composables/budgetFormat'

const store = useBudgetStore()
const categories = useTransactionsStore()
const route = useRoute()
const router = useRouter()

const breadcrumbs = [
    { title: 'HOME', disabled: false, to: '/' },
    { title: 'DASHBOARD', disabled: false, to: '/dashboard' },
    { title: 'BUDGET', disabled: true },
]

const paychecksOpen = ref(false)
const busy = ref<string | null>(null)
const error = ref<string | null>(null)
const editing = ref<TargetSave | null>(null)
const addCategory = ref<number | null>(null)
const addAmount = ref<number | null>(null)

/** ?month=2026-11 links to a month; without it, this month */
function fromRoute () {
    const match = /^(\d{4})-(\d{2})$/.exec(String(route.query.month ?? ''))
    const now = new Date()
    return match ? { year: +match[1], month: +match[2] } : { year: now.getFullYear(), month: now.getMonth() + 1 }
}

onMounted(() => {
    const { year, month } = fromRoute()
    store.go(year, month)
    store.fetchTrends(6)
    store.fetchRecurring()
    categories.fetchCategories()
})

watch(() => route.query.month, () => {
    const { year, month } = fromRoute()
    if (year !== store.year || month !== store.month) store.go(year, month)
})

function step (by: number) {
    const d = new Date(store.year, store.month - 1 + by, 1)
    editing.value = null
    router.replace({ query: { month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` } })
}

const m = computed(() => store.data)
const title = computed(() => `${monthName(store.month)} ${store.year}`)
const previousName = computed(() => monthName(store.previous.month))

const dayText = computed(() => {
    const d = m.value!
    if (d.isCurrent) return `Day ${d.dayOfMonth} of ${d.daysInMonth}`
    return d.daysLeft === 0 ? 'Finished' : 'Hasn’t started yet'
})

const heroStats = computed(() => {
    const d = m.value!
    const stats = [
        { label: d.income.override !== null ? 'Income (typed in)' : d.isCurrent || d.daysLeft ? 'Income (expected)' : 'Income', value: money(d.income.total), class: '' },
        { label: 'Assigned to categories', value: money(d.assigned), class: '' },
        { label: 'Not yet assigned', value: money(d.unassigned), class: d.unassigned < 0 ? 'text-error' : '' },
    ]
    if (d.committed) stats.splice(1, 0, { label: 'Committed', value: money(d.committed), class: '' })
    return stats
})

const assignedPct = computed(() => {
    const d = m.value!
    const room = d.income.total - d.committed
    return room > 0 ? Math.min(100, (d.assigned / room) * 100) : 100
})

const groupInfo: Record<CategoryGroup, { title: string, note: string }> = {
    Fixed: { title: 'Fixed', note: 'bills that don’t change much' },
    Flexible: { title: 'Flexible', note: 'day-to-day spending' },
    NonMonthly: { title: 'Non-monthly', note: 'lumpy spending' },
}

const groups = computed(() => (m.value?.groups ?? [])
    .map(g => ({ ...g, lines: m.value!.lines.filter(l => l.group === g.group) }))
    .filter(g => g.lines.length))

const addable = computed(() => {
    const used = new Set((m.value?.lines ?? []).filter(l => l.target > 0).map(l => l.categoryId))
    return categories.categories.filter(c => !c.isArchived && !used.has(c.financialCategoryId))
})

function carryText (l: BudgetLine) {
    if (!l.carry) return 'Rolls over: what’s left carries into next month'
    return l.carry > 0 ? `Rolls over: +${money(l.carry)} from last month` : `Rolls over: ${money(-l.carry)} overspent last month`
}

/** The transactions page, filtered to this category and month */
function transactionsLink (l: BudgetLine) {
    return { path: '/transactions', query: { month: `${store.year}-${String(store.month).padStart(2, '0')}`, category: String(l.categoryId) } }
}

function cadence (r: Recurring) {
    return r.cadence === 'Biweekly' ? 'every 2 weeks' : r.cadence.toLowerCase()
}

/** Every target for the month, with one change applied */
function allTargets (change?: TargetSave): TargetSave[] {
    const list = (m.value?.lines ?? []).filter(l => l.target > 0 || l.rollover).map(l => ({ categoryId: l.categoryId, amount: l.target, rollover: l.rollover }))
    if (!change) return list
    return [...list.filter(t => t.categoryId !== change.categoryId), change]
}

function startEdit (l: BudgetLine) {
    editing.value = { categoryId: l.categoryId, amount: l.target, rollover: l.rollover }
}

async function run (key: string, action: () => Promise<string | null>) {
    busy.value = key
    error.value = await action()
    busy.value = null
    return !error.value
}

async function saveEdit () {
    const e = editing.value
    if (!e) return
    if (await run('save', () => store.saveTargets(allTargets({ ...e, amount: Number(e.amount) || 0 })))) editing.value = null
}

async function addTarget () {
    const change = { categoryId: addCategory.value!, amount: Number(addAmount.value) || 0, rollover: false }
    if (await run('add', () => store.saveTargets(allTargets(change)))) {
        addCategory.value = null
        addAmount.value = null
    }
}
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

.group-head {
    border-bottom: 1px solid rgb(var(--v-theme-border));
}

.line {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) auto;
    gap: 6px 16px;
    align-items: center;
}

.line + .line {
    border-top: 1px solid rgb(var(--v-theme-border));
}

@media (max-width: 600px) {
    .line {
        grid-template-columns: minmax(0, 1fr) auto;
    }

    .line > :nth-child(2) {
        grid-column: 1 / -1;
        grid-row: 2;
    }
}

.amounts {
    white-space: nowrap;
}

.cat-link {
    text-decoration: none;
    color: inherit;
    border-radius: 4px;
}

.cat-arrow {
    flex: none;
    transition: transform 0.15s ease;
}

.cat-link:hover .cat-name {
    text-decoration: underline;
    text-underline-offset: 3px;
}

.cat-link:hover .cat-arrow {
    transform: translateX(2px);
    color: rgb(var(--v-theme-primary)) !important;
}

.cat-link:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
}

.target-btn {
    text-decoration: underline dotted;
    text-underline-offset: 4px;
    font: inherit;
}

.target-btn:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
    border-radius: 4px;
}

.target-input {
    width: 110px;
    flex: none;
}

.add-field {
    min-width: 200px;
    max-width: 280px;
}

.nudge {
    text-decoration: none;
}

.nudge:hover {
    border-color: rgb(var(--v-theme-primary));
}

.tick-key {
    display: inline-block;
    width: 2px;
    height: 12px;
    border-radius: 1px;
    background: rgb(var(--v-theme-subtle));
}

/* Page header (PageHero) */
.hero-title {
    font-size: clamp(1.6rem, 1.5vw + 1rem, 2.2rem);
    line-height: 1.1;
}

.hero-label {
    opacity: 0.72;
}

.hero-small {
    font-size: 11px;
}

.hero-stats {
    gap: 16px 40px;
}

.hero-stats dd {
    margin: 0;
}

.assign {
    max-width: 560px;
}

.hero-track {
    position: relative;
    height: 10px;
    border-radius: 0;
    background: rgba(var(--v-theme-hero-ink), 0.18);
}

.hero-track span,
.key--on {
    background: rgba(var(--v-theme-hero-ink), 0.8);
}

.hero-track span {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 0;
}

.key {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: rgba(var(--v-theme-hero-ink), 0.18);
}
</style>
