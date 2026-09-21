
<route lang="yaml">
meta:
  layout: landing
</route>

<template>
  <HelloWorld title="Code Fast. Dad Faster." :actions="actions" />

  <v-container id="projects" class="py-16">
    <Repos />
  </v-container>

  <v-divider color="lightest-navy"></v-divider>

  <Features />

  <!-- TODO: Resume/design patterns section with mapping to search -->
</template>

<script lang="ts" setup>
import { useGithubStore } from "@/store/github"

const store = useGithubStore()
store.fetchUser()

const actions = [
  { text: 'Resume', href: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf'}
]
</script>