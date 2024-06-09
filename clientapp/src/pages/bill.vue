<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <BillDetails
        :congress="props.congress"
        :bill-type="props.billType"
        :bill-number="props.billNumber"
    />
</template>

<script lang="ts" setup>

const props = defineProps({
  congress: { type: String },
  billType: { type: String },
  billNumber: { type: String }
})

const fullBillNumber = props?.billType && props?.billNumber ? props?.billType + props?.billNumber : ''
const breadcrumbs = [
  {
    title: 'Home',
    disabled: false,
    to: '/',
  },
  {
    title: 'Bills',
    disabled: false,
    to: '/bills',
  },
  {
    title: fullBillNumber,
    disabled: true
  }
]
</script>