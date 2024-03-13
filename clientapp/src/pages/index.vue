<template>
  <HelloWorld text="Hello World" :actions="actions" />
  <AboutMe />
</template>

<script lang="ts" setup>
  const actions = [
    { text: 'Career', to: '/about'},
    { text: 'Code', to: '/code'}
  ]
</script>
