<template>
    <v-breadcrumbs bg-color="grey-darken-4" :items="breadcrumbs"></v-breadcrumbs>
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
    title: fullBillNumber,
    disabled: true
  }
]
</script>