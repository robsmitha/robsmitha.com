<template>
  <DefaultBar />

  <LandingView />

  <DefaultFooter />

  <AssistantDrawer />
</template>

<script lang="ts" setup>
  import DefaultBar from './default/AppBar.vue'
  import LandingView from './landing/View.vue'
  import DefaultFooter from './default/Footer.vue'
  import AssistantDrawer from '@/components/Assistant/AssistantDrawer.vue'
</script>
