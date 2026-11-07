<template>
  <DefaultBar />

  <DefaultView />

  <DefaultFooter />

  <!-- The budget assistant; stays open across pages -->
  <AssistantDrawer />
</template>

<script lang="ts" setup>
  import DefaultBar from './default/AppBar.vue'
  import DefaultView from './default/View.vue'
  import DefaultFooter from './default/Footer.vue'
  import AssistantDrawer from '@/components/Assistant/AssistantDrawer.vue'
</script>
