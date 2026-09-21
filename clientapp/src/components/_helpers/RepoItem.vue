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
      <div class="d-flex align-center justify-space-between mb-8">
        <v-icon color="primary" size="36">mdi-folder-outline</v-icon>
        <div class="d-flex align-center ga-3">
          <span v-if="props.repo.stargazers_count > 0" class="d-flex align-center ga-1 font-mono text-caption text-amber">
            <v-icon size="14" color="amber">mdi-star</v-icon>
            {{ props.repo.stargazers_count }}
          </span>
          <v-tooltip v-if="isRecent" text="Updated in the last 30 days" location="top">
            <template v-slot:activator="{ props: tip }">
              <span v-bind="tip" class="recent-dot" aria-label="Recently updated"></span>
            </template>
          </v-tooltip>
          <v-icon color="slate" size="20">mdi-arrow-top-right</v-icon>
        </div>
      </div>

      <h3 class="text-lightest-slate text-subtitle-1 font-weight-bold mb-2 repo-card-title">
        {{ props.repo.name }}
      </h3>

      <p v-if="!hideDescription" class="text-slate text-body-2 repo-card-desc flex-grow-1">
        {{ props.repo.description }}
      </p>

      <div class="d-flex align-center flex-wrap ga-2 font-mono text-caption text-slate mt-6">
        <v-avatar size="18" tile>
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
}

.repo-card-desc {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 rgba(100, 255, 218, 0.6);
  animation: recent-pulse 2s infinite;
}

@keyframes recent-pulse {
  0% { box-shadow: 0 0 0 0 rgba(100, 255, 218, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(100, 255, 218, 0); }
  100% { box-shadow: 0 0 0 0 rgba(100, 255, 218, 0); }
}
</style>
