<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <PageHero eyebrow="> finance / goals" tone="teal" art="arcs" compact>
        <h1 class="hero-title font-weight-bold mb-2">Savings goals</h1>
        <p class="text-body-2 hero-label mb-0">Money set aside for known bills. Each month’s amounts come off income before you budget.</p>
        <div class="d-flex flex-wrap align-end hero-stats mt-5">
            <dl v-if="d" class="d-flex flex-wrap hero-stats mb-0">
                <div>
                    <dt class="font-mono text-caption hero-label">Needed this month</dt>
                    <dd class="font-mono text-h6 font-weight-bold">{{ money(d.neededThisMonth) }}</dd>
                </div>
                <div>
                    <dt class="font-mono text-caption hero-label">Saved toward goals</dt>
                    <dd class="font-mono text-h6 font-weight-bold">{{ money(d.totalSaved) }}</dd>
                </div>
                <div v-if="d.goals.length">
                    <dt class="font-mono text-caption hero-label">On track</dt>
                    <dd class="font-mono text-h6 font-weight-bold">{{ d.onTrack }} of {{ d.goals.length }}</dd>
                </div>
            </dl>
            <v-btn color="hero-ink" variant="outlined" rounded="pill" class="text-none" prepend-icon="mdi-plus" @click="editing = {}">New goal</v-btn>
        </div>
    </PageHero>

    <v-container class="body py-6">
        <v-alert v-if="store.error" type="warning" variant="tonal" density="compact" class="mb-4">{{ store.error }}</v-alert>
        <v-skeleton-loader v-if="!d && store.loading" type="card" />

        <template v-else-if="d">
            <v-alert v-for="a in overClaimed" :key="a.financialAccountId" type="warning" variant="tonal" density="compact" class="mb-4">
                Goals kept in {{ a.name }} add up to {{ money(a.allocated) }}, but it holds {{ money(a.balance) }}. Some of that money isn’t really there.
            </v-alert>

            <div v-if="!d.goals.length" class="card pa-6 text-center">
                <v-icon size="36" class="text-subtle mb-2">mdi-piggy-bank-outline</v-icon>
                <p class="text-body-1 text-high-emphasis mb-1">No goals yet</p>
                <p class="text-body-2 text-muted mb-4">Property taxes, insurance, gifts, an emergency fund: anything you know is coming.</p>
                <v-btn color="primary" variant="flat" class="text-none" prepend-icon="mdi-plus" @click="editing = {}">New goal</v-btn>
            </div>

            <div class="goals">
                <article v-for="g in d.goals" :key="g.savingsGoalId" class="card pa-5 d-flex flex-column">
                    <div class="d-flex align-start ga-3 mb-4">
                        <span class="icon-box"><v-icon class="text-muted">{{ g.icon ?? 'mdi-piggy-bank-outline' }}</v-icon></span>
                        <div class="flex-grow-1 min-width-0">
                            <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis text-truncate">{{ g.name }}</h2>
                            <p class="font-mono text-caption text-subtle mb-0">Due {{ longDate(g.dueDate) }}</p>
                        </div>
                        <v-chip size="x-small" variant="tonal" :color="goalChip(g).color" :prepend-icon="goalChip(g).icon" class="font-mono flex-shrink-0">{{ goalChip(g).label }}</v-chip>
                    </div>

                    <div class="d-flex align-baseline justify-space-between mb-2">
                        <span class="font-mono text-h6 font-weight-bold text-high-emphasis">{{ money(g.saved) }}</span>
                        <span class="font-mono text-body-2 text-muted">of {{ target(g.targetAmount) }}</span>
                    </div>
                    <BudgetBar :spent="g.saved" :available="g.targetAmount" :color="g.status === 'Behind' || g.status === 'Overdue' ? 'error' : 'success'" :expected="g.expectedByNow" verb="saved" />
                    <p class="font-mono text-caption text-subtle mt-1 mb-4">even pace today: {{ money(g.expectedByNow) }}</p>

                    <div class="aside-box d-flex align-center justify-space-between px-3 py-2 mb-4 text-body-2">
                        <span class="text-muted">Set aside</span>
                        <span v-if="g.requiredMonthly > 0"><span class="font-mono font-weight-bold text-high-emphasis">{{ money(g.requiredMonthly) }}</span><span class="text-subtle">/mo × {{ g.monthsLeft }}</span></span>
                        <span v-else class="text-high-emphasis">Nothing more needed</span>
                    </div>

                    <ul class="plain text-caption text-muted d-flex flex-column ga-1 mb-4">
                        <li><v-icon size="14" class="text-subtle mr-1">mdi-repeat</v-icon>{{ cycleText(g) }}</li>
                        <li><v-icon size="14" class="text-subtle mr-1">mdi-bank-outline</v-icon>{{ whereText(g) }}</li>
                        <li v-if="g.contributedThisMonth"><v-icon size="14" class="text-subtle mr-1">mdi-check</v-icon>{{ money(g.contributedThisMonth) }} added this month</li>
                    </ul>

                    <details v-if="g.contributions.length || g.pastCycles.length" class="text-body-2 mb-4">
                        <summary class="text-muted">History</summary>
                        <ul class="plain mt-2 d-flex flex-column ga-1">
                            <li v-for="c in g.contributions" :key="c.goalContributionId" class="d-flex align-center ga-2 font-mono text-caption">
                                <span class="text-subtle date">{{ shortDate(c.date) }}</span>
                                <span class="flex-grow-1 text-muted text-truncate">{{ c.note ?? (c.source === 'Transfer' ? 'Transfer' : 'Added') }}</span>
                                <span class="text-high-emphasis">{{ money(c.amount) }}</span>
                                <v-btn icon="mdi-close" size="x-small" variant="text" :aria-label="`Remove ${money(c.amount)} on ${shortDate(c.date)}`" @click="store.removeContribution(c.goalContributionId)" />
                            </li>
                            <li v-for="p in [...g.pastCycles].reverse()" :key="p.start" class="d-flex justify-space-between font-mono text-caption text-subtle">
                                <span>Cycle ending {{ shortDate(p.due) }}, {{ p.due.slice(0, 4) }}</span><span>{{ money(p.saved) }} of {{ target(p.target) }}</span>
                            </li>
                        </ul>
                    </details>

                    <div class="mt-auto d-flex ga-2">
                        <v-btn v-if="g.fundingMode === 'Shared'" variant="outlined" class="text-none flex-grow-1" prepend-icon="mdi-plus" @click="adding = g">Add money</v-btn>
                        <v-btn icon="mdi-pencil-outline" variant="outlined" size="small" :aria-label="`Edit ${g.name}`" @click="editing = g" />
                    </div>
                </article>
            </div>

            <section class="card pa-5 mt-6">
                <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis mb-1">How pace works</h2>
                <p class="text-body-2 text-muted mb-0">
                    Each goal has a straight line from where it started to its due date. On track means you’re within 5% of that line;
                    the marker on each bar shows where the line is today. Each month’s amount is what was still needed when the month began,
                    split over the months left, and it comes off safe to spend.
                </p>
            </section>
        </template>
    </v-container>

    <GoalDialog :goal="editing" @close="editing = null" />
    <GoalMoneyDialog :goal="adding" @close="adding = null" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useGoalsStore } from '@/store/goals'
import type { Goal } from '@/services/goal.service'
import { goalChip, money, monthName, shortDate, target } from '@/composables/budgetFormat'

const store = useGoalsStore()
const breadcrumbs = [
    { title: 'HOME', disabled: false, to: '/' },
    { title: 'DASHBOARD', disabled: false, to: '/dashboard' },
    { title: 'GOALS', disabled: true },
]

const editing = ref<Partial<Goal> | null>(null)
const adding = ref<Goal | null>(null)

onMounted(() => store.fetch())

const d = computed(() => store.data)
const overClaimed = computed(() => (d.value?.accounts ?? []).filter(a => a.unallocated < -0.5))

const longDate = (iso: string) => `${shortDate(iso)}, ${iso.slice(0, 4)}`

function cycleText (g: Goal) {
    if (g.cycle === 'OneTime') return 'Once'
    const every = g.cycle === 'Annual' ? 'Every year' : g.cycle === 'Semiannual' ? 'Every 6 months' : 'Every 3 months'
    const [y, m, day] = g.dueDate.split('-').map(Number)
    const next = new Date(y, m - 1, day + 1)
    const then = `${monthName(next.getMonth() + 1).slice(0, 3)} ${next.getDate()}`
    return g.cycleEnd === 'Reset' ? `${every} · starts over ${then}` : `${every} · keeps the extra on ${then}`
}

function whereText (g: Goal) {
    if (g.fundingMode === 'Dedicated') return `${g.linkedAccountName} (its balance)`
    return g.linkedAccountName ? `Logged, kept in ${g.linkedAccountName}` : 'Logged by hand'
}
</script>

<style scoped>
.body {
    max-width: 1200px;
}

.goals {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 24px;
}

.card {
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface));
}

.icon-box {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex: none;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface-raised));
}

.aside-box {
    border-radius: 8px;
    background: rgb(var(--v-theme-surface-raised));
}

.plain {
    list-style: none;
    padding: 0;
    margin: 0;
}

.min-width-0 {
    min-width: 0;
}

.date {
    width: 48px;
    flex: none;
}

summary {
    cursor: pointer;
}

/* The hero band is dark in both themes */
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
