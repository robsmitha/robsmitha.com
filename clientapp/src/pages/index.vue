<template>
  <HelloWorld text="Hello World" :actions="actions" />
  <Features />
  <AboutMe />
</template>

<script lang="ts" setup>
  const actions = [
    { icon: 'mdi-certificate-outline', text: 'Resume', to: '/about'}
  ]
</script>
