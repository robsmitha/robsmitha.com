<template>
    <section>
        <SectionHeading index="01" title="Categories" />
        <p class="text-slate text-body-2 mb-6">Spending by category against its estimate. Click a category to change its estimate.</p>

        <!-- Placeholder cards laid out like the category cards below. -->
        <div v-if="store.loadingBudget && !store.budget" class="category-grid" aria-busy="true" aria-label="Loading categories">
            <div v-for="i in 6" :key="i" class="category-card pa-5">
                <v-skeleton-loader type="text" class="bone bone--line mb-2" style="width: 55%" />
                <v-skeleton-loader type="text" class="bone bone--small mb-5" style="width: 30%" />
                <v-skeleton-loader type="text" class="bone bone--bar mb-3" />
                <v-skeleton-loader type="text" class="bone bone--small" style="width: 70%" />
            </div>
        </div>

        <template v-else-if="store.budget?.budgetCategoryData?.length">
            <router-link v-if="uncategorized?.count" to="transactions" class="uncategorized d-flex align-center ga-4 pa-4 mb-5">
                <v-icon color="amber">mdi-tag-off-outline</v-icon>
                <span class="flex-grow-1">
                    <span class="text-lightest-slate font-weight-bold d-block">
                        {{ uncategorized.count }} uncategorized transaction{{ uncategorized.count === 1 ? '' : 's' }}
                    </span>
                    <span class="text-slate text-body-2">{{ currency(uncategorized.sum) }} isn't counted against any category yet.</span>
                </span>
                <span class="font-mono text-caption text-amber text-no-wrap">Categorize <v-icon size="14">mdi-arrow-right</v-icon></span>
            </router-link>

            <div class="category-grid" :class="{ 'is-refreshing': store.loadingBudget }">
                <button
                    v-for="c in categories"
                    :key="c.category"
                    type="button"
                    class="category-card pa-5 text-left"
                    :style="{ '--accent': `var(--v-theme-${categoryStatus(c).color})` }"
                    @click="categorySelected(c)"
                >
                    <div class="d-flex align-start ga-3 mb-4">
                        <div class="min-width-0 flex-grow-1">
                            <span class="text-lightest-slate font-weight-bold d-block text-truncate">{{ c.category }}</span>
                            <span class="font-mono text-caption text-slate">{{ c.count }} transaction{{ c.count === 1 ? '' : 's' }}</span>
                        </div>
                        <span class="percent font-mono text-body-2 font-weight-bold">{{ c.estimate ? `${c.totalPercent}%` : '—' }}</span>
                    </div>
                    <div class="track mb-3">
                        <span :style="{ width: `${Math.min(c.totalPercent ?? 0, 100)}%` }"></span>
                    </div>
                    <div class="d-flex justify-space-between font-mono text-caption">
                        <span class="text-light-slate">{{ currency(c.sum) }} spent</span>
                        <span class="text-slate">{{ c.estimate ? `of ${currency(c.estimate)}` : 'No estimate' }}</span>
                    </div>
                    <span class="edit-hint font-mono text-caption mt-3 d-inline-flex align-center ga-1">
                        <v-icon size="12">mdi-pencil-outline</v-icon> Edit estimate
                    </span>
                </button>
            </div>
        </template>

        <div v-else class="empty-state d-flex flex-column align-center py-12 px-4 text-center">
            <v-icon size="40" class="mb-3 text-slate">mdi-chart-donut</v-icon>
            <p class="text-lightest-slate font-weight-bold mb-1">No categories yet</p>
            <p class="text-body-2 text-slate mb-0">Edit the budget to choose which categories it tracks.</p>
        </div>
    </section>

    <SaveEstimateDialog
        :open="saveEstimateDialog"
        :budget-id="props.budgetId"
        :category-name="selectedCategory?.category"
        :category-estimate="selectedCategory?.estimate"
        @close="saveEstimateDialog = false"
        @estimate-saved="store.fetchBudget(Number(props.budgetId))"
    />
</template>


<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBudgetStore } from '@/store/budget'
import { currency } from '@/filters/currencyFilter'

const props = defineProps({
  budgetId: { type: String }
})

const store = useBudgetStore()
const saveEstimateDialog = ref(false)
const selectedCategory = ref<any>(null)

function categorySelected(c: any){
    selectedCategory.value = c
    saveEstimateDialog.value = true
}

const uncategorized = computed(() => {
    return store.budget?.budgetCategoryData?.find((d: any) => d.financialCategoryId === -1)
})

// Categories furthest over their estimate come first.
const categories = computed(() =>
    (store.budget?.budgetCategoryData ?? [])
        .filter((d: any) => d.financialCategoryId !== -1)
        .sort((a: any, b: any) => (b.totalPercent ?? 0) - (a.totalPercent ?? 0))
)

function categoryStatus(c: any): { color: string } {
    if (!c.estimate) return { color: 'slate' }
    if (c.totalPercent > 100) return { color: 'error' }
    if (c.totalPercent >= 85) return { color: 'amber' }
    return { color: 'green' }
}
</script>

<style scoped>
.uncategorized {
    text-decoration: none;
    border-radius: 12px;
    border: 1px solid rgba(var(--v-theme-amber), 0.4);
    background: rgba(var(--v-theme-amber), 0.08);
    transition: border-color 0.2s ease;
}

.uncategorized:hover,
.uncategorized:focus-visible {
    border-color: rgb(var(--v-theme-amber));
    outline: none;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
    transition: opacity 0.2s ease;
}

.category-grid.is-refreshing {
    opacity: 0.6;
}

.category-card {
    cursor: pointer;
    color: inherit;
    font: inherit;
    border-radius: 12px;
    background:
        radial-gradient(120% 90% at 100% 0%, rgba(var(--accent, var(--v-theme-slate)), 0.12), transparent 55%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

button.category-card:hover,
button.category-card:focus-visible {
    transform: translateY(-3px);
    border-color: rgba(var(--accent), 0.7);
    box-shadow: 0 16px 36px -20px rgba(var(--accent), 0.6);
    outline: none;
}

.min-width-0 {
    min-width: 0;
}

.percent {
    color: rgb(var(--accent));
}

.track {
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
    background: rgb(var(--v-theme-lightest-navy));
}

.track > span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: rgb(var(--accent));
}

.edit-hint {
    color: rgb(var(--v-theme-slate));
    opacity: 0;
    transition: opacity 0.2s ease;
}

.category-card:hover .edit-hint,
.category-card:focus-visible .edit-hint {
    opacity: 1;
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

.bone :deep(.v-skeleton-loader__text) {
    margin: 0;
    max-width: none;
    width: 100%;
    background: rgba(var(--v-theme-on-surface), 0.08);
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

@media (prefers-reduced-motion: reduce) {
    .category-card {
        transition: none;
    }

    button.category-card:hover {
        transform: none;
    }
}
</style>
