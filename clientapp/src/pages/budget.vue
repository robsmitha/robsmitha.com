<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <PageHero eyebrow="> finance / budget" tone="plum" art="arcs" compact>
        <template v-if="!store.budget && store.loadingBudget">
            <v-skeleton-loader type="heading" class="hero-bone hero-bone--title mb-3" style="width: 260px" />
            <v-skeleton-loader type="text" class="hero-bone mb-6" style="width: 180px" />
            <div class="d-flex ga-8">
                <v-skeleton-loader v-for="i in 4" :key="i" type="heading" class="hero-bone hero-bone--stat" />
            </div>
        </template>

        <template v-else>
            <div class="d-flex align-center flex-wrap ga-3 mb-2">
                <h1 class="hero-title font-weight-bold">{{ store.budget?.budgetName ?? 'Budget' }}</h1>
                <span v-if="store.budget" class="status-pill font-mono text-caption" :style="{ '--accent': `var(--v-theme-${status.color})` }">
                    {{ status.label }}
                </span>
            </div>
            <p v-if="store.budget?.dateRange" class="font-mono text-caption hero-meta mb-5">{{ store.budget.dateRange }}</p>

            <div class="d-flex flex-wrap align-center ga-8">
                <div v-for="s in stats" :key="s.label">
                    <span class="font-mono text-h6 font-weight-bold d-block" :class="s.color ? `text-${s.color}` : ''">{{ s.value }}</span>
                    <span class="font-mono text-caption hero-label">{{ s.label }}</span>
                </div>
                <v-btn color="white" variant="flat" rounded="pill" class="text-none" prepend-icon="mdi-pencil-outline" :disabled="!store.budget" @click="saveBudgetDialog = true">
                    Edit budget
                </v-btn>
            </div>
            <div v-if="store.budget" class="spent-bar mt-4" :aria-label="`${store.budget.totalPercent}% of the estimate spent`">
                <span :class="`bg-${status.color}`" :style="{ width: `${Math.min(store.budget.totalPercent ?? 0, 100)}%` }"></span>
            </div>
        </template>
    </PageHero>

    <PageTabs :tabs="tabs" />

    <v-container class="admin-body py-8">
        <router-view />
    </v-container>

    <SaveBudgetDialog
        :open="saveBudgetDialog"
        :budget-id="props.budgetId"
        @close="saveBudgetDialog = false"
        @budget-saved="store.fetchBudget(Number(props.budgetId))"
    />
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore } from "@/store/budget"
import { currency } from '@/filters/currencyFilter'

const props = defineProps({
  budgetId: { type: String }
})

const store = useBudgetStore()
const saveBudgetDialog = ref(false)

const breadcrumbs = computed(() => [
  { title: 'HOME', disabled: false, to: '/' },
  { title: 'SPENDING', disabled: false, to: '/spending' },
  { title: store.budget?.budgetName?.toUpperCase() ?? 'BUDGET', disabled: true }
])

const transactionCount = computed(() => store.budget?.transactions?.length ?? 0)
const excludedCount = computed(() => store.budget?.excludedTransactions?.length ?? 0)

const tabs = computed(() => [
  { title: 'Estimate', icon: 'mdi-chart-donut', to: `/budget/${props.budgetId}/edit` },
  { title: 'Transactions', icon: 'mdi-swap-horizontal', to: `/budget/${props.budgetId}/transactions`, count: transactionCount.value },
  { title: 'Exemptions', icon: 'mdi-cancel', to: `/budget/${props.budgetId}/exemptions`, count: excludedCount.value },
  { title: 'Accounts', icon: 'mdi-bank-outline', to: `/budget/${props.budgetId}/accounts` },
])

const status = computed(() => {
  const pct = store.budget?.totalPercent ?? 0
  if (pct > 100) return { label: 'Over budget', color: 'error' }
  if (pct >= 85) return { label: 'Near limit', color: 'amber' }
  return { label: 'On track', color: 'green' }
})

const stats = computed(() => {
  const b = store.budget
  if (!b) return [{ label: 'Spent', value: '—', color: undefined }, { label: 'Estimate', value: '—', color: undefined }]
  const left = (b.estimateTotal ?? 0) - (b.transactionsTotal ?? 0)
  return [
    { label: 'Spent', value: currency(b.transactionsTotal), color: undefined as string | undefined },
    { label: 'Estimate', value: currency(b.estimateTotal), color: undefined },
    { label: left < 0 ? 'Over' : 'Remaining', value: currency(Math.abs(left)), color: left < 0 ? 'error' : 'green' },
    { label: 'Used', value: `${b.totalPercent ?? 0}%`, color: undefined },
  ]
})

onMounted(async () => {
    store.fetchBudget(Number(props.budgetId))
})
</script>

<style scoped>
.admin-body {
    max-width: 1100px;
}

.hero-title {
    font-size: clamp(1.6rem, 1.5vw + 1rem, 2.2rem);
    line-height: 1.1;
}

.hero-meta,
.hero-label {
    opacity: 0.7;
}

.status-pill {
    padding: 2px 10px;
    border-radius: 999px;
    color: rgb(var(--accent));
    background: rgba(var(--accent), 0.2);
}

.spent-bar {
    height: 6px;
    max-width: 420px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.15);
}

.spent-bar > span {
    display: block;
    height: 100%;
    border-radius: 999px;
}

.hero-bone {
    background: transparent;
}

.hero-bone :deep(.v-skeleton-loader__heading),
.hero-bone :deep(.v-skeleton-loader__text) {
    margin: 0;
    max-width: none;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
}

.hero-bone--title :deep(.v-skeleton-loader__heading) {
    height: 32px;
    border-radius: 8px;
}

.hero-bone--stat {
    width: 72px;
}

.hero-bone--stat :deep(.v-skeleton-loader__heading) {
    height: 40px;
    border-radius: 8px;
}
</style>
