<route lang="yaml">
meta:
  layout: landing
</route>

<template>
  <HelloWorld
    title="Code Fast. Dad Faster."
    subtitle="Full-stack software engineer building fast, accessible web applications for the public sector. Currently a Senior Software Engineer at JustFOIA."
    :actions="actions"
  />

  <TechStrip />

  <v-container class="landing">
    <section id="about" class="landing-section">
      <SectionHeading index="01" title="About" />
      <About />
    </section>

    <section id="experience" class="landing-section">
      <SectionHeading index="02" title="Experience" />
      <Experience />
    </section>

    <CtaPanel
      tone="teal"
      art="ribbon"
      eyebrow="Live on this site"
      title="Don't just read about it. Try it."
      text="Search the code in my GitHub repos, turn JSON into C# and TypeScript DTOs, or follow Congress as it happens. Every feature runs right here."
    >
      <v-btn color="white" variant="flat" rounded="pill" size="large" class="text-none" @click="goTo('#projects', { offset: -64 })">
        See what I've built
      </v-btn>
      <v-btn color="white" variant="outlined" rounded="pill" size="large" class="text-none" to="/code">
        Search my code
      </v-btn>
    </CtaPanel>

    <section id="projects" class="landing-section">
      <SectionHeading index="03" title="Projects" />

      <h3 class="font-mono text-primary text-caption text-uppercase mb-1">Built on this site</h3>
      <p class="text-slate text-body-2 mb-6">Working features you can try right here.</p>
      <Features />

      <h3 class="font-mono text-primary text-caption text-uppercase mt-16 mb-1">Open source</h3>
      <p class="text-slate text-body-2 mb-6">Recently updated repos on GitHub.</p>
      <Repos />
    </section>

    <CtaPanel
      class="mb-16"
      tone="plum"
      art="arcs"
      eyebrow="Get in touch"
      title="Let's talk shop."
      text="Whether it's a role, a project, or a question about something on this site, the best way to reach me is on LinkedIn."
    >
      <v-btn color="white" variant="flat" rounded="pill" size="large" class="text-none" prepend-icon="mdi-linkedin" href="https://www.linkedin.com/in/robsmitha/" target="_blank">
        Connect on LinkedIn
      </v-btn>
      <v-btn color="white" variant="outlined" rounded="pill" size="large" class="text-none" :href="resumeUrl" target="_blank">
        View resume
      </v-btn>
    </CtaPanel>
  </v-container>
</template>

<script lang="ts" setup>
import { useGoTo } from 'vuetify'

const goTo = useGoTo()

const resumeUrl = 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf'

const actions = [
  { text: 'Resume', icon: 'mdi-file-document-outline', href: resumeUrl },
  { text: 'GitHub', icon: 'mdi-github', href: 'https://github.com/robsmitha' },
]
</script>

<style scoped>
.landing {
  max-width: 1100px;
}

.landing-section {
  padding: 5rem 0;
  scroll-margin-top: 64px;
}
</style>
