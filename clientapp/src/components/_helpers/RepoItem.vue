<template>
    <v-card
      class="repo-card d-flex flex-column h-100 pa-6"
      color="surface"
      flat
      rounded="lg"
      :ripple="true"
      :hover="true"
      @click="emit('repo-selected', repo.name)"
    >
      <div class="d-flex align-start justify-space-between ga-3 mb-2">
        <h3 class="text-lightest-slate text-subtitle-1 font-weight-bold repo-card-title">
          {{ props.repo.name }}
        </h3>
        <div class="d-flex align-center ga-3 flex-shrink-0 repo-card-meta">
          <span v-if="props.repo.stargazers_count > 0" class="d-flex align-center ga-1 font-mono text-caption text-amber">
            <v-icon size="14" color="amber">mdi-star</v-icon>
            {{ props.repo.stargazers_count }}
          </span>
          <v-tooltip v-if="isRecent" text="Updated in the last 30 days" location="top">
            <template v-slot:activator="{ props: tip }">
              <span v-bind="tip" class="recent-indicator" aria-label="Recently updated">
                <span
                  v-for="(p, i) in ashParticles"
                  :key="i"
                  class="ash-particle"
                  :style="{ '--dx': p.dx, '--dy': p.dy, 'animation-delay': p.delay }"
                ></span>
                <span class="recent-core"></span>
              </span>
            </template>
          </v-tooltip>
          <v-icon color="slate" size="20">mdi-arrow-top-right</v-icon>
        </div>
      </div>

      <p v-if="!hideDescription" class="text-slate text-body-2 repo-card-desc flex-grow-1">
        {{ props.repo.description }}
      </p>

      <div class="d-flex align-center flex-wrap ga-2 font-mono text-caption text-slate mt-4">
        <v-avatar size="22" color="surface-bright" class="repo-lang-avatar">
          <Devicon :icon="icon" />
        </v-avatar>
        <span>{{ props.repo.language }}</span>
        <span class="text-lightest-navy">&middot;</span>
        <span>{{ formatter.format(new Date(props.repo.pushed_at)) }}</span>
      </div>
    </v-card>
  </template>

<script setup lang="ts">

interface Props {
  repo: GithubRepo;
  isExternalLink?: boolean;
  variant?: NonNullable<"flat" | "text" | "elevated" | "tonal" | "outlined" | "plain">;
  hideDescription?: boolean;
}

import { GithubRepo } from '@/api/githubClient';
import { computed } from 'vue'
import { map, TechnologyKey } from '@/components/_helpers/Devicons/Devicons';

const props = withDefaults(defineProps<Props>(), {
  variant: 'flat'
})
const emit = defineEmits(['repo-selected'])

const icon = computed(() => {
  if(props.isExternalLink && props.repo && props.repo.name && map){
      const key = props.repo.name.toLowerCase() as TechnologyKey
      if(map.has(key)){
        return props.repo.name
      }
    }
    return props.repo.language
});

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const isRecent = computed(() => {
  const daysSincePush = (Date.now() - new Date(props.repo.pushed_at).getTime()) / 86_400_000;
  return daysSincePush <= 30;
});

// Scatter vectors for the "snap" dust particles — golden-angle spacing keeps
// them from landing in an obviously even/mechanical ring, with a slight
// upward drift bias so the ash reads as rising and dispersing, not just
// radiating outward.
const ashParticles = computed(() => {
  return Array.from({ length: 10 }).map((_, i) => {
    const angle = (i * 137.508 * Math.PI) / 180;
    const distance = 9 + (i % 3) * 4;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 5;
    return {
      dx: `${dx.toFixed(1)}px`,
      dy: `${dy.toFixed(1)}px`,
      delay: `${(-(i * 0.14)).toFixed(2)}s`,
    };
  });
});

</script>

<style scoped>
.repo-card {
  cursor: pointer;
  border: 1px solid rgb(var(--v-theme-lightest-navy));
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.repo-card:hover {
  transform: translateY(-6px);
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 20px 30px -15px rgba(2, 12, 27, 0.7);
}

.repo-card-title {
  line-height: 1.3;
  word-break: break-word;
}

.repo-card-meta {
  min-height: 1.3em;
}

/* Devicon renders its own 40px avatar; shrink it so the logo sits fully
   inside the round badge instead of being clipped at the corners. */
.repo-lang-avatar :deep(.v-avatar) {
  width: 14px !important;
  height: 14px !important;
}

.repo-card-desc {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Recently-updated indicator: a solid core that periodically "snaps" —
   dissolving into drifting ash particles that scatter and fade, then
   reforming, like the Thanos snap disintegration effect. */
.recent-indicator {
  position: relative;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.recent-core {
  position: relative;
  z-index: 1;
  width: 6px;
  height: 6px;
  background: rgb(var(--v-theme-primary));
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  animation: core-snap 3.4s ease-in-out infinite;
}

@keyframes core-snap {
  0%, 10% { opacity: 0; transform: scale(0.4); }
  24% { opacity: 1; transform: scale(1); }
  56% { opacity: 1; transform: scale(1); }
  68% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 0; transform: scale(0.5); }
}

.ash-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 2px;
  margin: -1px 0 0 -1px;
  border-radius: 1px;
  background: rgb(var(--v-theme-primary));
  opacity: 0;
  animation: ash-drift 3.4s ease-in infinite;
}

@keyframes ash-drift {
  0%, 56% {
    opacity: 0;
    transform: translate(0, 0) scale(1);
  }
  63% {
    opacity: 1;
    transform: translate(calc(var(--dx) * 0.3), calc(var(--dy) * 0.3)) scale(0.9);
  }
  88% {
    opacity: 0;
    transform: translate(var(--dx), var(--dy)) scale(0.1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx), var(--dy)) scale(0.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .recent-core {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .ash-particle {
    display: none;
  }
}
</style>
