<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <BillView
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

const breadcrumbs = [
  {
    title: 'Bills',
    disabled: false,
    to: '/bills',
  },
  {
    title: props.billType + props.billNumber,
    disabled: true
  }
]
</script>