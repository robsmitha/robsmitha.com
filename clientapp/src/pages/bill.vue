<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>
    <!-- Keyed so following a related bill link loads the new bill instead of reusing this one. -->
    <BillDetails
        :key="fullBillNumber + props.congress"
        :congress="props.congress"
        :bill-type="props.billType"
        :bill-number="props.billNumber"
    />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  congress: { type: String },
  billType: { type: String },
  billNumber: { type: String }
})

const fullBillNumber = computed(() => props?.billType && props?.billNumber ? props?.billType + props?.billNumber : '')
const breadcrumbs = computed(() => [
  {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'CONGRESS',
    disabled: false,
    to: '/congress',
  },
  {
    title: fullBillNumber.value,
    disabled: true
  }
])
</script>
