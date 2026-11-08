<template>
  <section class="hero">
    <v-container class="hero-inner">
      <div class="hero-meta font-mono">
        <span>{{ props.badge }}</span>
        <span>{{ props.meta }}</span>
      </div>

      <h1 class="hero-title font-display">{{ props.title }}<span class="text-primary" aria-hidden="true">.</span></h1>

      <div class="hero-lead">
        <p class="hero-bio" v-html="props.subtitle"></p>

        <div class="hero-actions">
          <v-btn
            v-for="(b, i) in props.actions"
            :key="b.text"
            :variant="i === 0 ? 'flat' : 'outlined'"
            :color="i === 0 ? 'primary' : 'rule'"
            size="x-large"
            class="hero-cta"
            :class="{ 'hero-cta--joined': i > 0 }"
            :to="b.to"
            :href="b.href"
            :target="b.href?.startsWith('http') ? '_blank' : undefined"
            :append-icon="b.icon"
          >
            {{ b.text }}
          </v-btn>
        </div>
      </div>
    </v-container>

    <!-- Key figures, separated by hairlines -->
    <div v-if="props.stats.length" class="hero-stats">
      <v-container class="hero-stats-inner">
        <div v-for="s in props.stats" :key="s.label" class="hero-stat">
          <span class="hero-stat-value font-display">{{ s.value }}</span>
          <span class="hero-stat-label">{{ s.label }}</span>
        </div>
      </v-container>
    </div>
  </section>
</template>

<script setup lang="ts">
type HeroAction = {
  text: string,
  to?: string,
  href?: string,
  icon?: string
}

type HeroStat = {
  value: string,
  label: string
}

const props = defineProps({
  // The headline. A period in the accent color is added after it.
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  // Small mono line above the headline (left), with `meta` on the right
  badge: { type: String, default: '' },
  meta: { type: String, default: '' },
  // The first action is the primary (filled) button
  actions: { type: Array<HeroAction>, default: () => [] },
  stats: { type: Array<HeroStat>, default: () => [] }
})
</script>

<style scoped>
.hero {
  border-bottom: 1px solid rgb(var(--v-theme-rule));
}

.hero-inner {
  max-width: 1280px;
  padding: 4.5rem 2rem 0;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-subtle));
}

.hero-title {
  margin: 0;
  font-size: clamp(3.25rem, 11vw, 10rem);
  line-height: 0.9;
  letter-spacing: -0.055em;
  font-weight: 800;
  color: rgb(var(--v-theme-on-background));
  text-wrap: balance;
}

.hero-lead {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem 4rem;
  padding: 3rem 0 3.5rem;
}

.hero-bio {
  flex: 1 1 420px;
  max-width: 36rem;
  margin: 0;
  font-size: 1.3125rem;
  line-height: 1.5;
  color: rgb(var(--v-theme-muted));
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
}

.hero-cta {
  font-weight: 600;
  letter-spacing: 0;
}

/* Secondary buttons sit flush against each other, sharing one border */
.hero-cta--joined + .hero-cta--joined {
  margin-left: -1px;
}

.hero-stats {
  border-top: 1px solid rgb(var(--v-theme-rule));
}

.hero-stats-inner {
  max-width: 1280px;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.75rem 1.5rem;
  border-left: 1px solid rgb(var(--v-theme-border));
}

.hero-stat:first-child {
  padding-left: 0;
  border-left: 0;
}

.hero-stat-value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  color: rgb(var(--v-theme-on-background));
}

.hero-stat-label {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-subtle));
}

@media (max-width: 600px) {
  .hero-inner {
    padding: 3rem 1rem 0;
  }

  .hero-stats-inner {
    padding: 0 1rem;
  }

  /* Stacked figures read as rows, so drop the left border and use a top hairline */
  .hero-stat {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid rgb(var(--v-theme-border));
  }

  .hero-stat:first-child {
    border-top: 0;
  }
}
</style>
