<template>
    <template v-if="store.loadingBudget">
        <v-skeleton-loader type="text, table-tfoot, list-item" color="surface"></v-skeleton-loader>
        <v-row>
            <v-col v-for="i in 5" :key="`${i}loading`" cols="12" sm="3">
                <v-skeleton-loader
                class="mx-auto"
                type="paragraph, text, text"
                color="surface"
                boilerplate
                ></v-skeleton-loader>
            </v-col>
        </v-row>
    </template>

    <template v-else>
        <v-row>
            <v-col>
                <ContentHeader
                    :title="store.budget?.budgetName"
                    :overline="store.budget?.dateRange"
                />
            </v-col>
            <v-col cols="auto" class="text-right">
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="font-mono text-none"
                  size="large"
                  :icon="$vuetify.display.mobile"
                  @click="saveBudgetDialog = true"
                >
                    <v-icon :start="!$vuetify.display.mobile">mdi-pencil</v-icon>
                    <span v-if="!$vuetify.display.mobile">Edit</span>
                </v-btn>
            </v-col>
        </v-row>
        <v-row v-if="store.budget?.budgetCategoryData?.length > 0" class="mb-5">
            <v-col cols="12" class="d-flex justify-center align-center">
                <span class="font-mono text-lightest-slate mr-3">{{ store.budget.transactionsTotal }}</span>
                <v-progress-linear
                    bg-color="lightest-navy"
                    :color="store.budget.totalPercent > 100 ? 'error' : 'primary'"
                    :model-value="store.budget.totalPercent"
                    :height="10"
                    rounded
                >
                </v-progress-linear>
                <span class="font-mono text-lightest-slate ml-3">{{ store.budget.estimateTotal }}</span>
            </v-col>
            <v-col v-if="uncategorized">
                <v-card class="h-100 budget-card" color="surface" variant="flat" :title="uncategorized.category" :subtitle="`${uncategorized.count} transaction${uncategorized.count === 1 ? '' : 's'}`">
                    <v-card-text>
                        <span class="font-mono text-slate text-caption mr-3">
                            {{ uncategorized.sum }}
                        </span>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn variant="text" color="primary" class="font-mono text-none" to="transactions">Transactions</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col cols="12" md="4" lg="3" v-for="c in store.budget?.budgetCategoryData.filter((d: any) => d.financialCategoryId !== -1)" :key="c.category">
                <v-card class="h-100 budget-card" color="surface" variant="flat" :title="c.category" :subtitle="`${c.count} transaction${c.count === 1 ? '' : 's'}`" @click="categorySelected(c)">
                    <v-card-actions class="pb-0">
                        <span class="font-mono text-slate text-caption mr-3">
                            {{ c.sum }}
                        </span>
                        <v-spacer />
                        <span class="font-mono text-slate text-caption">
                            {{ c.estimate }}
                        </span>
                    </v-card-actions>
                    <v-card-text class="pt-0">
                        <v-progress-linear
                            bg-color="lightest-navy"
                            :color="c.totalPercent <= 100 ? 'primary' : 'error'"
                            :model-value="c.totalPercent"
                        ></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </template>
    
    <SaveEstimateDialog 
        :open="saveEstimateDialog" 
        :budget-id="props.budgetId" 
        :category-name="selectedCategory?.category" 
        :category-estimate="selectedCategory?.estimate"
        @close="saveEstimateDialog = false" 
        @estimate-saved="store.fetchBudget(Number(props.budgetId))" 
    />
    <SaveBudgetDialog 
        :open="saveBudgetDialog" 
        :budget-id="props.budgetId" 
        @close="saveBudgetDialog = false"
        @budget-saved="store.fetchBudget(Number(props.budgetId))" 
    />
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore } from '@/store/budget'

const props = defineProps({
  budgetId: { type: String }
})

const store = useBudgetStore()
const saveBudgetDialog = ref(false)
const saveEstimateDialog = ref(false)
const selectedCategory = ref<any>(null)

function categorySelected(c: any){
    selectedCategory.value = c
    saveEstimateDialog.value = true
}

const uncategorized = computed(() => {
    return store.budget?.budgetCategoryData.find((d: any) => d.financialCategoryId === -1)
})
</script>

<style scoped>
.budget-card {
    cursor: pointer;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.budget-card:hover {
    transform: translateY(-4px);
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 16px 24px -14px rgba(2, 12, 27, 0.7);
}
</style>