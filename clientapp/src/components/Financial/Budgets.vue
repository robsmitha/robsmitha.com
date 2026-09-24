<template>
    <PageHero eyebrow="> finance / budgets" tone="plum" art="arcs" compact>
        <h1 class="hero-title font-weight-bold mb-2">Spending</h1>
        <p class="hero-text mb-5">Budgets across linked accounts, and how actual spending is tracking against each estimate.</p>
        <div class="d-flex flex-wrap align-center ga-8">
            <div v-for="s in stats" :key="s.label">
                <span class="font-mono text-h6 font-weight-bold d-block" :class="s.color ? `text-${s.color}` : ''">{{ s.value }}</span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
            <v-btn color="white" variant="flat" rounded="pill" class="text-none" prepend-icon="mdi-plus" @click="dialog = true">
                New budget
            </v-btn>
        </div>
    </PageHero>

    <v-container class="admin-body py-10">
        <section class="mb-14">
            <SectionHeading index="01" title="Active" />

            <!-- Placeholder cards laid out like the budget cards below. -->
            <div v-if="loading" class="budget-grid" aria-busy="true" aria-label="Loading budgets">
                <div v-for="i in 3" :key="i" class="budget-card pa-5">
                    <div class="d-flex align-center ga-4 mb-5">
                        <v-skeleton-loader type="avatar" class="bone bone--ring" />
                        <div class="flex-grow-1">
                            <v-skeleton-loader type="text" class="bone bone--line mb-2" style="width: 70%" />
                            <v-skeleton-loader type="text" class="bone bone--small" style="width: 50%" />
                        </div>
                    </div>
                    <v-skeleton-loader type="text" class="bone bone--bar mb-3" />
                    <v-skeleton-loader type="text" class="bone bone--small" style="width: 80%" />
                </div>
            </div>

            <div v-else-if="activeBudgets.length" class="budget-grid">
                <router-link
                    v-for="b in activeBudgets"
                    :key="b.budget.budgetId"
                    :to="`/budget/${b.budget.budgetId}/edit`"
                    class="budget-card pa-5 d-flex flex-column"
                    :style="{ '--accent': `var(--v-theme-${status(b).color})` }"
                >
                    <div class="d-flex align-center ga-4 mb-4">
                        <v-progress-circular
                            :model-value="Math.min(b.totalPercent, 100)"
                            :color="status(b).color"
                            bg-color="lightest-navy"
                            size="64"
                            width="6"
                            class="flex-shrink-0"
                        >
                            <span class="font-mono text-body-2 font-weight-bold text-lightest-slate">{{ b.totalPercent }}%</span>
                        </v-progress-circular>
                        <div class="min-width-0 flex-grow-1">
                            <span class="text-lightest-slate font-weight-bold d-block text-truncate">{{ b.budget.name }}</span>
                            <span class="font-mono text-caption text-slate d-block">{{ dateRange(b) }}</span>
                            <span class="status-pill font-mono text-caption mt-1">{{ status(b).label }}</span>
                        </div>
                    </div>

                    <div class="amount mb-1">
                        <span class="font-mono text-h6 font-weight-bold" :class="remaining(b) < 0 ? 'text-error' : 'text-lightest-slate'">
                            {{ currency(Math.abs(remaining(b))) }}
                        </span>
                        <span class="text-slate text-body-2"> {{ remaining(b) < 0 ? 'over budget' : 'left to spend' }}</span>
                    </div>

                    <div class="track my-3">
                        <span :style="{ width: `${Math.min(b.totalPercent, 100)}%` }"></span>
                        <!-- Where today falls in the budget period, to compare pace against spending. -->
                        <i v-if="periodProgress(b) !== null" class="today-marker" :style="{ left: `${periodProgress(b)}%` }" :title="`${periodProgress(b)}% of the period has passed`"></i>
                    </div>

                    <div class="d-flex justify-space-between font-mono text-caption mt-auto">
                        <span class="text-light-slate">{{ currency(b.transactionsTotal) }} spent</span>
                        <span class="text-slate">of {{ currency(b.estimateTotal) }}</span>
                    </div>
                    <span v-if="daysLeft(b) !== null" class="font-mono text-caption text-slate mt-1">
                        {{ daysLeft(b) }} day{{ daysLeft(b) === 1 ? '' : 's' }} left
                    </span>
                </router-link>
            </div>

            <div v-else class="empty-state d-flex flex-column align-center py-12 px-4 text-center">
                <v-icon size="40" class="mb-3 text-slate">mdi-wallet-outline</v-icon>
                <p class="text-lightest-slate font-weight-bold mb-1">No active budgets</p>
                <p class="text-body-2 text-slate mb-5">Create a budget to start tracking spending against an estimate.</p>
                <v-btn variant="outlined" color="primary" rounded="pill" class="text-none" prepend-icon="mdi-plus" @click="dialog = true">
                    New budget
                </v-btn>
            </div>
        </section>

        <section>
            <SectionHeading index="02" title="Past" />

            <div v-if="loading" aria-busy="true" aria-label="Loading past budgets">
                <v-skeleton-loader v-for="i in 3" :key="i" type="text" class="bone bone--past" />
            </div>

            <div v-else-if="pastBudgets.length" class="past-list">
                <router-link
                    v-for="b in pastBudgets"
                    :key="b.budget.budgetId"
                    :to="`/budget/${b.budget.budgetId}/edit`"
                    class="past-row px-4 py-3"
                    :style="{ '--accent': `var(--v-theme-${status(b).color})` }"
                >
                    <div class="min-width-0">
                        <span class="text-lightest-slate font-weight-bold d-block text-truncate">{{ b.budget.name }}</span>
                        <span class="font-mono text-caption text-slate">{{ dateRange(b) }}</span>
                    </div>
                    <div class="past-track">
                        <span :style="{ width: `${Math.min(b.totalPercent, 100)}%` }"></span>
                    </div>
                    <span class="font-mono text-caption text-light-slate text-right text-no-wrap">
                        {{ currency(b.transactionsTotal) }} <span class="text-slate">/ {{ currency(b.estimateTotal) }}</span>
                    </span>
                    <span class="status-pill font-mono text-caption justify-self-end">{{ b.totalPercent }}%</span>
                </router-link>
            </div>

            <p v-else class="text-body-2 text-slate">No past budgets yet.</p>
        </section>
    </v-container>

    <SaveBudgetDialog :open="dialog" @close="dialog = false" @budget-saved="loadBudgets" />
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import moment from 'moment'
import budgetService from "@/services/budget.service"

const dialog = ref(false)
const budgets = ref<any>(null)
const loading = ref(false)

onMounted(async () => {
    loadBudgets()
})

const activeBudgets = computed(() => {
    const now = new Date();
    return budgets.value ? budgets.value.filter((b: any) => new Date(b.budget.endDate) >= now) : [];
});

const pastBudgets = computed(() => {
    const now = new Date()
    const past = budgets.value ? budgets.value.filter((b: any) => new Date(b.budget.endDate) < now) : []
    return [...past].sort((a: any, b: any) => Number(new Date(b.budget.endDate)) - Number(new Date(a.budget.endDate)))
});

const remaining = (b: any) => (b.estimateTotal ?? 0) - (b.transactionsTotal ?? 0)

function status(b: any): { label: string, color: string } {
    if (b.totalPercent > 100) return { label: 'Over budget', color: 'error' }
    if (b.totalPercent >= 85) return { label: 'Near limit', color: 'amber' }
    return { label: 'On track', color: 'green' }
}

// How far through the budget's date range today is, as a percent.
function periodProgress(b: any): number | null {
    const start = moment(b.budget.startDate)
    const end = moment(b.budget.endDate)
    if (!start.isValid() || !end.isValid() || !end.isAfter(start)) return null
    const pct = (moment().diff(start) / end.diff(start)) * 100
    return Math.round(Math.max(0, Math.min(100, pct)))
}

function daysLeft(b: any): number | null {
    const end = moment(b.budget.endDate)
    return end.isValid() ? Math.max(0, end.startOf('day').diff(moment().startOf('day'), 'days')) : null
}

function dateRange(b: any) {
    const start = moment(b.budget.startDate)
    const end = moment(b.budget.endDate)
    if (!start.isValid()) return end.isValid() ? `Ends ${end.format('MMM D, YYYY')}` : ''
    const sameYear = start.year() === end.year()
    return `${start.format(sameYear ? 'MMM D' : 'MMM D, YYYY')} – ${end.format('MMM D, YYYY')}`
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const currency = (amount: number) => usd.format(amount ?? 0)

const stats = computed(() => {
    if (loading.value && !budgets.value) {
        return [{ label: 'Active budgets', value: '—' }, { label: 'Spent', value: '—' }, { label: 'Remaining', value: '—' }]
    }
    const active = activeBudgets.value
    const spent = active.reduce((sum: number, b: any) => sum + (b.transactionsTotal ?? 0), 0)
    const left = active.reduce((sum: number, b: any) => sum + remaining(b), 0)
    const over = active.filter((b: any) => b.totalPercent > 100).length
    return [
        { label: 'Active budgets', value: active.length },
        { label: 'Spent', value: currency(spent) },
        { label: 'Remaining', value: currency(left), color: left < 0 ? 'error' : undefined },
        ...(over ? [{ label: 'Over budget', value: over, color: 'error' }] : []),
    ]
})

async function loadBudgets(){
    loading.value = true
    const response = await budgetService.getBudgets()
    loading.value = false
    if(!response.success){
        budgets.value = []
        return
    }
    budgets.value = response?.data
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

.budget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.budget-card {
    text-decoration: none;
    border-radius: 12px;
    background:
        radial-gradient(120% 90% at 100% 0%, rgba(var(--accent, var(--v-theme-slate)), 0.14), transparent 55%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

a.budget-card:hover,
a.budget-card:focus-visible {
    transform: translateY(-4px);
    border-color: rgba(var(--accent), 0.7);
    box-shadow: 0 18px 40px -20px rgba(var(--accent), 0.6);
    outline: none;
}

.min-width-0 {
    min-width: 0;
}

.status-pill {
    display: inline-block;
    padding: 1px 9px;
    border-radius: 999px;
    color: rgb(var(--accent));
    background: rgba(var(--accent), 0.14);
}

.track {
    position: relative;
    height: 6px;
    border-radius: 999px;
    background: rgb(var(--v-theme-lightest-navy));
}

.track > span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: rgb(var(--accent));
}

.today-marker {
    position: absolute;
    top: -4px;
    width: 2px;
    height: 14px;
    margin-left: -1px;
    border-radius: 2px;
    background: rgb(var(--v-theme-lightest-slate));
}

.empty-state {
    border-radius: 12px;
    border: 1px dashed rgb(var(--v-theme-lightest-navy));
}

.past-list {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-surface));
}

.past-row {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(80px, 1.2fr) auto 64px;
    align-items: center;
    gap: 1rem;
    text-decoration: none;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgba(var(--accent), 0.7);
    transition: background-color 0.15s ease;
}

.past-row:last-child {
    border-bottom: none;
}

.past-row:hover,
.past-row:focus-visible {
    background: rgba(var(--accent), 0.06);
    outline: none;
}

.past-track {
    height: 4px;
    border-radius: 999px;
    background: rgb(var(--v-theme-lightest-navy));
    overflow: hidden;
}

.past-track > span {
    display: block;
    height: 100%;
    background: rgb(var(--accent));
}

.justify-self-end {
    justify-self: end;
}

@media (max-width: 700px) {
    .past-row {
        grid-template-columns: minmax(0, 1fr) auto;
    }

    .past-track {
        grid-column: 1 / -1;
        order: 3;
    }
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

.bone--ring :deep(.v-skeleton-loader__avatar) {
    width: 64px;
    min-width: 64px;
    height: 64px;
    min-height: 64px;
}

.bone--line :deep(.v-skeleton-loader__text) {
    height: 14px;
}

.bone--small :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.bone--bar :deep(.v-skeleton-loader__text) {
    height: 6px;
    border-radius: 999px;
}

.bone--past {
    height: 64px;
    margin-bottom: 1px;
}

.bone--past :deep(.v-skeleton-loader__text) {
    height: 100%;
    border-radius: 8px;
}

@media (prefers-reduced-motion: reduce) {
    .budget-card {
        transition: none;
    }

    a.budget-card:hover {
        transform: none;
    }
}
</style>
