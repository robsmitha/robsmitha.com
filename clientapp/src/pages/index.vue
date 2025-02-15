<template>
  <HelloWorld title="Welcome" subtitle="Building things on the web since 2016." :actions="actions" />
  <!-- <AboutMe /> -->
  <Features />
</template>

<script lang="ts" setup>
  const actions = [
    { text: 'Resume', href: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf'}
  ]
</script>
