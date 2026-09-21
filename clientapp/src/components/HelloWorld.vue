<template>
  <section class="hero-section d-flex align-center bg-background">
    <v-container>
      <v-row>
        <v-col cols="12" lg="9" xl="8">
          <!-- <p class="font-mono text-primary text-body-2 mb-4 hero-eyebrow">
            <span aria-hidden="true">&gt;</span> Hi, my name is
          </p> -->

          <h1 class="text-lightest-slate font-weight-bold hero-name mb-1">
            Rob Smitha.
          </h1>
          <h2 class="text-slate font-weight-bold hero-role mb-6">
            {{ props.title }}
          </h2>

          <p class="text-slate hero-bio" v-html="props.subtitle"></p>

          <div class="mt-8 d-flex flex-wrap ga-4">
            <v-btn
              v-for="b in props.actions"
              :key="b.text"
              variant="outlined"
              color="primary"
              size="large"
              class="font-mono text-none"
              :to="b.to"
              :href="b.href"
              :target="b.href ? '_blank' : undefined"
              :prepend-icon="b.icon"
            >
              {{ b.text }}
            </v-btn>
          </div>

          <div class="mt-12 d-flex flex-wrap ga-8 hero-stats">
            <div v-for="s in stats" :key="s.label">
              <span class="font-mono text-h4 text-lightest-slate font-weight-bold d-block">{{ s.value }}</span>
              <span class="font-mono text-caption text-slate text-uppercase">{{ s.label }}</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGithubStore } from '@/store/github'

type HeroAction = {
  text: string,
  to: string | undefined,
  href: string | undefined,
  icon: string | undefined
}

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  actions: { type: Array<HeroAction>, default: [] }
})

const store = useGithubStore()

// Real numbers pulled from the GitHub API via the shared store, not hardcoded copy.
const stats = computed(() => {
  const repos = store.repos ?? []
  const languageCount = new Set(repos.map(r => r.language).filter(Boolean)).size
  const yearsExperience = new Date().getFullYear() - 2016
  return [
    { value: repos.length > 0 ? repos.length : '—', label: 'Public Repos' },
    { value: languageCount > 0 ? languageCount : '—', label: 'Languages' },
    { value: yearsExperience, label: 'Years Experience' },
  ]
})
</script>

<style scoped>
.hero-section {
  min-height: 70vh;
  padding-top: 64px;
}

.hero-eyebrow {
  letter-spacing: 0.02em;
}

.hero-name {
  font-size: clamp(2.25rem, 3vw + 1.5rem, 4.5rem);
  line-height: 1.1;
}

.hero-role {
  font-size: clamp(1.5rem, 2vw + 1rem, 3rem);
  line-height: 1.15;
}

.hero-bio {
  max-width: 560px;
  font-size: 1.0625rem;
  line-height: 1.6;
}

.hero-stats > div {
  padding-left: 2rem;
  border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.hero-stats > div:first-child {
  padding-left: 0;
  border-left: none;
}

@media (max-width: 600px) {
  .hero-section {
    min-height: 92vh;
  }

  .hero-stats {
    gap: 1.5rem !important;
  }

  .hero-stats > div {
    padding-left: 0;
    border-left: none;
    min-width: 40%;
  }
}
</style>
