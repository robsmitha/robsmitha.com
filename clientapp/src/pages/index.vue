<template>
  <HelloWorld title="Welcome" subtitle="Building things on the web since 2016." :actions="actions" />
  <!-- <AboutMe /> -->
  <Features />
</template>

<script lang="ts" setup>
  const actions = [
    { text: 'Resume', to: '/about'}
  ]
</script>
