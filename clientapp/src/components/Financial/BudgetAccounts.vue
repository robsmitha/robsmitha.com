<template>
    <ContentHeader
        title="Budget Accounts"
        :overline="store.budget?.dateRange"
    />
    <AccountList :access-items="store.budget?.budgetAccessItems" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBudgetStore } from "@/store/budget"

const store = useBudgetStore()

onMounted(async () =>{
    store.fetchAccessItems()
})


</script>