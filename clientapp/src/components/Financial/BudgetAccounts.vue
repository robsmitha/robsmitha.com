<template>
    <section>
        <SectionHeading index="01" title="Accounts" />
        <p class="text-slate text-body-2 mb-6">The linked banks whose transactions feed this budget.</p>
        <AccountList :access-items="store.loadingBudget && !store.budget ? undefined : (store.budget?.budgetAccessItems ?? [])" />
    </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBudgetStore } from "@/store/budget"

const store = useBudgetStore()

onMounted(async () =>{
    store.fetchAccessItems()
})
</script>
