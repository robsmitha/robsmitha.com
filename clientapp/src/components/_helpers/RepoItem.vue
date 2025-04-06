<template>
    <v-card
      class="mx-auto pb-3 border-sm h-100 rounded-0"
      :ripple="true"
      :hover="true"
      :title="props.repo.name"
      :subtitle="`${formatter.format(new Date(props.repo.pushed_at))}`"
      :text="hideDescription ? '' : props.repo.description"
      :variant="props.variant"
      @click="emit('repo-selected', repo.name)"
    >
      <template v-slot:append>
        <v-avatar
          size="50"
          class="ma-2"
        >
          <Devicon :icon="icon" />
        </v-avatar>
      </template>
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
import { useDisplay } from 'vuetify'
import { map, TechnologyKey } from '@/components/_helpers/Devicons/Devicons';
const { mobile } = useDisplay()

const props = withDefaults(defineProps<Props>(), {
  variant: 'flat'
})
const emit = defineEmits(['repo-selected'])
const isMobile = computed(() => mobile.value)

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

</script>