<template>
  <section class="hero-section d-flex align-center bg-background">
    <div class="hero-glow" aria-hidden="true"></div>

    <v-container class="hero-container">
      <v-row>
        <v-col cols="12" lg="9" xl="8">
          <!-- <p class="font-mono text-primary text-body-2 mb-4 hero-eyebrow">
            <span aria-hidden="true">&gt;</span> Hi, my name is
          </p> -->

          <h1 class="font-weight-bold hero-name mb-1">
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
              color="white"
              size="large"
              class="font-mono text-none hero-cta"
              :to="b.to"
              :href="b.href"
              :target="b.href ? '_blank' : undefined"
              :prepend-icon="b.icon"
            >
              {{ b.text }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  min-height: 65vh;
  /* v-main already reserves 64px via the fixed app-bar's layout offset (padding-top),
     which pushes this section's box below the app-bar instead of behind it. Pull it
     back up by that same amount so the glow background renders underneath the
     transparent navbar too, then pad the content back down so it isn't covered by it. */
  margin-top: -64px;
  padding-top: 64px;
}

.hero-container {
  position: relative;
  z-index: 1;
}

/* Ambient RGB backlight bleed, like a mechanical keyboard glowing in a dark room. */
.hero-glow {
  position: absolute;
  inset: -25%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 14% 22%, rgba(255, 70, 165, 0.32), transparent 38%),
    radial-gradient(circle at 84% 12%, rgba(64, 255, 210, 0.30), transparent 40%),
    radial-gradient(circle at 72% 78%, rgba(140, 95, 255, 0.28), transparent 42%),
    radial-gradient(circle at 22% 82%, rgba(255, 195, 60, 0.20), transparent 40%),
    radial-gradient(circle at 50% 48%, rgba(60, 175, 255, 0.16), transparent 46%);
  filter: blur(70px);
  animation: hero-glow-drift 24s ease-in-out infinite alternate;
}

@keyframes hero-glow-drift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-2%, 3%, 0) scale(1.08); }
  100% { transform: translate3d(3%, -2%, 0) scale(1); }
}

.hero-eyebrow {
  letter-spacing: 0.02em;
}

.hero-name {
  font-size: clamp(2.25rem, 3vw + 1.5rem, 4.5rem);
  line-height: 1.1;
  display: inline-block;
  background: linear-gradient(90deg, #ff5fa2, #ffb454, #64ffda, #5fc8ff, #b57bff, #ff5fa2);
  background-size: 300% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: hero-name-shimmer 10s linear infinite;
}

@keyframes hero-name-shimmer {
  to { background-position: 300% center; }
}

.hero-cta {
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 0 1px rgba(var(--v-theme-primary), 0.4),
    0 0 20px 2px rgba(86, 168, 245, 0.2),
    0 0 36px 6px rgba(207, 142, 109, 0.15);
}

@media (prefers-reduced-motion: reduce) {
  .hero-glow,
  .hero-name {
    animation: none;
  }
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


@media (max-width: 600px) {
  .hero-section {
    min-height: 80vh;
  }
}
</style>
