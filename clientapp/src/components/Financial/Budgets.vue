<template>
    
    <v-row class="mt-3">
        <v-col>
            <ContentHeader
                title="Spending"
            />
        </v-col>
        <v-col class="text-right">
            <v-btn variant="outlined" color="primary" class="font-mono text-none" @click="dialog = true" :icon="$vuetify.display.mobile">
                <v-icon :start="!$vuetify.display.mobile">mdi-plus</v-icon> <span v-if="!$vuetify.display.mobile">New</span>
            </v-btn>
        </v-col>
    </v-row>
    <v-divider class="mt-3 mb-5" color="lightest-navy" thickness="4" length="48" />

    <v-row v-if="loading" class="mb-3">
        <v-col v-for="i in 3" :key="`${i}loading`" cols="12" sm="4">
            <v-skeleton-loader
            class="mx-auto"
            type="chip, text, paragraph, text"
            color="surface"
            boilerplate
            ></v-skeleton-loader>
        </v-col>
    </v-row>

    <p v-else-if="recentBudgets.length === 0" class="text-body-2 text-slate mb-5">No active budgets.</p>

    <v-row v-else class="mb-5">
        <v-col v-for="b in recentBudgets" :key="b.budget.budgetId" cols="12" sm="4">
            <v-card class="spending-card" color="surface" variant="flat" :to="`/budget/${b.budget.budgetId}/edit`">
                <v-card-title class="font-mono text-caption text-slate text-uppercase">
                    {{ b.budget.name }}

                    <div class="text-h3 font-weight-bold" :class="b.totalPercent > 100 ? 'text-error' : 'text-primary'">{{ b.totalPercent }}%</div>

                    <div class="text-h6 text-lightest-slate font-weight-regular">
                    ${{ b.estimateTotal - b.transactionsTotal }} remaining
                    </div>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear
                    bg-color="lightest-navy"
                    :color="b.totalPercent > 100 ? 'error' : 'primary'"
                    height="5"
                    :model-value="b.totalPercent"
                    rounded="pill"
                    >
                    </v-progress-linear>

                    <div class="d-flex justify-space-between py-3 font-mono text-caption">
                        <span class="text-lightest-slate font-weight-medium">
                            ${{ b.transactionsTotal }} spent
                        </span>

                        <span class="text-slate"> ${{ b.estimateTotal }} total estimate</span>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <ContentHeader
        title="Past Spending"
    />
    <v-divider class="mt-3 mb-5" color="lightest-navy" thickness="4" length="48" />

    <v-row v-if="loading" class="mb-5">
        <v-col v-for="i in 2" :key="`${i}loading`" cols="12" sm="4">
            <v-skeleton-loader
            class="mx-auto"
            type="chip, text, paragraph, text"
            color="surface"
            boilerplate
            ></v-skeleton-loader>
        </v-col>
    </v-row>
    <p v-else-if="pastBudgets.length === 0" class="text-body-2 text-slate">No past budgets.</p>
    <v-row v-else>
        <v-col v-for="b in pastBudgets" :key="b.budget.budgetId" cols="12" sm="4">
            <v-card class="spending-card" color="surface" variant="flat" :to="`/budget/${b.budget.budgetId}/edit`">
                <v-card-title class="font-mono text-caption text-slate text-uppercase">
                    {{ b.budget.name }}

                    <div class="text-h3 font-weight-bold" :class="b.totalPercent > 100 ? 'text-error' : 'text-primary'">{{ b.totalPercent }}%</div>

                    <div class="text-h6 text-lightest-slate font-weight-regular">
                    ${{ b.estimateTotal - b.transactionsTotal }} remaining
                    </div>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear
                    bg-color="lightest-navy"
                    :color="b.totalPercent > 100 ? 'error' : 'primary'"
                    height="5"
                    :model-value="b.totalPercent"
                    rounded="pill"
                    >
                    </v-progress-linear>

                    <div class="d-flex justify-space-between py-3 font-mono text-caption">
                        <span class="text-lightest-slate font-weight-medium">
                            ${{ b.transactionsTotal }} spent
                        </span>

                        <span class="text-slate"> ${{ b.estimateTotal }} total estimate</span>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <SaveBudgetDialog :open="dialog" @close="dialog = false" @budget-saved="loadBudgets" />
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import budgetService from "@/services/budget.service"

const dialog = ref(false)
const budgets = ref<any>(null)
const loading = ref(false)

onMounted(async () => {
    loadBudgets()
})

const recentBudgets = computed(() => {
    const now = new Date();
    return budgets.value ? budgets.value.filter((b: any) => new Date(b.budget.endDate) >= now) : [];
});

const pastBudgets = computed(() => {
    const now = new Date()
    const past = budgets.value ? budgets.value.filter((b: any) => new Date(b.budget.endDate) < now) : []
    return past
});

async function loadBudgets(){
    loading.value = true
    const response = await budgetService.getBudgets()
    loading.value = false
    if(!response.success){
        return
    }
    budgets.value = response?.data
}


</script>

<style scoped>
.spending-card {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.spending-card:hover {
    transform: translateY(-4px);
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 16px 24px -14px rgba(2, 12, 27, 0.7);
}
</style>