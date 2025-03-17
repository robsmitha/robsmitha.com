<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <v-container>
        <LinkedAccounts />
    </v-container>
</template>

<script lang="ts" setup>

const breadcrumbs = [
    {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'ACCOUNTS',
    disabled: true
  }
]
</script>