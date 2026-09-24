<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <PageHero eyebrow="> finance / account" tone="teal" art="ribbon" compact>
        <div class="d-flex align-center flex-wrap ga-3 mb-2">
            <h1 class="hero-title font-weight-bold">
                <v-skeleton-loader v-if="!store.transactionsResponse && store.loadingTransactions" type="heading" class="hero-bone" style="width: 220px" />
                <template v-else>{{ store.transactionsResponse?.institutionName ?? 'Account' }}</template>
            </h1>

            <v-menu v-model="selectMenu" location="bottom">
                <template #activator="{ props: menuProps }">
                    <button v-bind="menuProps" type="button" class="month-pill font-mono text-caption" :disabled="!store.incomeSourceResponse">
                        <v-icon size="14">mdi-calendar-month-outline</v-icon>
                        {{ store.selectedMonthlyTimeline?.text || 'Loading…' }}
                        <v-icon size="14">mdi-chevron-down</v-icon>
                    </button>
                </template>
                <v-list bg-color="surface" density="compact">
                    <v-list-item
                        v-for="option in store.incomeSourceResponse?.monthlyTimelineList"
                        :key="option.text"
                        :active="option.text === store.selectedMonthlyTimeline?.text"
                        @click="() => { store.selectedMonthlyTimeline = option; selectMenu = false }"
                    >
                        <v-list-item-title class="font-mono text-body-2">{{ option.text }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>
        <p class="hero-text mb-5">Income due and received for this account, matched against its bank transactions.</p>

        <div class="d-flex flex-wrap ga-8">
            <div v-for="s in stats" :key="s.label">
                <span class="font-mono text-h6 font-weight-bold d-block" :class="s.color ? `text-${s.color}` : ''">{{ s.value }}</span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
        </div>
        <div v-if="collectedPercent !== null" class="collected mt-4" :aria-label="`${collectedPercent}% of income due collected`">
            <span :style="{ width: `${collectedPercent}%` }"></span>
        </div>
    </PageHero>

    <PageTabs :tabs="tabs" />

    <v-container class="admin-body py-8">
        <div v-if="store.transactionsResponse?.expired" class="expired-banner d-flex align-center ga-3 pa-4 mb-6" role="alert">
            <v-icon color="amber">mdi-link-variant-off</v-icon>
            <span class="text-body-2 flex-grow-1">
                This bank connection has expired, so recent transactions may be missing.
                Re-link it from the accounts page to resume syncing.
            </span>
            <v-btn variant="outlined" color="amber" rounded="pill" size="small" class="text-none" to="/accounts">Accounts</v-btn>
        </div>

        <router-view />
    </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import moment from 'moment'
import { useIncomeStore } from "@/store/income"
import { MonthlyTimeline } from '@/store/types'
import { currency } from '@/filters/currencyFilter'

const props = defineProps({
  institutionAccessItemId: { type: Number }
})

const store = useIncomeStore()
const selectMenu = ref(false)

const breadcrumbs = computed(() => [
  { title: 'HOME', disabled: false, to: '/' },
  { title: 'ACCOUNTS', disabled: false, to: '/accounts' },
  { title: (store.transactionsResponse?.institutionName ?? 'ACCOUNT').toUpperCase(), disabled: true }
])

const tabs = computed(() => [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: `/account/${props.institutionAccessItemId}/income` },
  { title: 'Transactions', icon: 'mdi-swap-horizontal', to: `/account/${props.institutionAccessItemId}/transactions`, count: store.transactions?.length ?? 0 },
])

const stats = computed(() => {
  const r = store.incomeSourceResponse
  if (!r) {
    return ['Due', 'Collected', 'Overdue', 'Next due'].map(label => ({ label, value: '—', color: undefined as string | undefined }))
  }
  const next = r.nextDueDate && !r.nextDueDate.startsWith('0001-01-01') ? moment(r.nextDueDate).format('MMM D') : 'None'
  return [
    { label: 'Due', value: currency(r.totalDue), color: undefined },
    { label: 'Collected', value: currency(r.totalPaid), color: 'green' },
    { label: 'Overdue', value: currency(r.totalOverdue), color: r.totalOverdue > 0 ? 'error' : undefined },
    { label: 'Next due', value: next, color: undefined },
  ]
})

// Share of this month's income that has come in.
const collectedPercent = computed(() => {
  const r = store.incomeSourceResponse
  if (!r || !r.totalDue) return null
  return Math.min(100, Math.round((r.totalPaid / r.totalDue) * 100))
})

watch(() => store.selectedMonthlyTimeline, (val: MonthlyTimeline | null, oldVal: MonthlyTimeline | null) => {
  if(val && val.text !== oldVal?.text) {
    store.fetchIncomeSources(Number(props.institutionAccessItemId))
  }
})

onMounted(async () => {
    store.fetchIncomeSources(Number(props.institutionAccessItemId))
    store.fetchTransactions(Number(props.institutionAccessItemId))
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

.hero-text {
    max-width: 52ch;
    opacity: 0.82;
}

.hero-label {
    opacity: 0.7;
}

.month-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(0, 0, 0, 0.25);
    cursor: pointer;
}

.month-pill:hover:not(:disabled),
.month-pill:focus-visible {
    border-color: #fff;
    outline: none;
}

.collected {
    height: 6px;
    max-width: 420px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.15);
}

.collected > span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: rgb(var(--v-theme-green));
}

.expired-banner {
    border-radius: 12px;
    border: 1px solid rgba(var(--v-theme-amber), 0.4);
    background: rgba(var(--v-theme-amber), 0.08);
    color: rgb(var(--v-theme-lightest-slate));
}

.hero-bone {
    background: transparent;
}

.hero-bone :deep(.v-skeleton-loader__heading) {
    margin: 0;
    width: 100%;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
}
</style>
