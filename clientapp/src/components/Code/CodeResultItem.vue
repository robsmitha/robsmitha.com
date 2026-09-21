<template>
    <div class="result-row d-flex align-start pa-4" @click="emit('repo-selected', repo.name)">
        <v-avatar size="40" rounded="lg" color="light-navy" class="mr-4 flex-shrink-0">
            <v-icon color="primary" size="22">mdi-folder-outline</v-icon>
        </v-avatar>

        <div class="flex-grow-1 min-width-0">
            <div class="d-flex align-center flex-wrap ga-2 mb-1">
                <span class="text-lightest-slate text-body-1 font-weight-bold">{{ repo.name }}</span>
                <v-chip size="x-small" variant="tonal" color="primary" class="font-mono">
                    {{ items.length }} file{{ items.length === 1 ? '' : 's' }}
                </v-chip>
                <span v-if="repo.stargazers_count > 0" class="d-flex align-center ga-1 font-mono text-caption text-amber">
                    <v-icon size="12" color="amber">mdi-star</v-icon>{{ repo.stargazers_count }}
                </span>
            </div>

            <p v-if="repo.description" class="text-slate text-body-2 text-truncate mb-2">
                {{ repo.description }}
            </p>

            <p
                v-if="topSnippet"
                class="font-mono text-caption text-slate snippet mb-2"
                v-html="highlightFragment(topSnippet)"
            ></p>

            <div class="d-flex align-center flex-wrap ga-2 font-mono text-caption text-slate">
                <v-avatar v-if="repo.language" size="16" tile>
                    <Devicon :icon="repo.language" />
                </v-avatar>
                <span v-if="repo.language">{{ repo.language }}</span>
                <span v-if="repo.language" class="text-lightest-navy">&middot;</span>
                <span class="text-truncate">{{ items[0]?.path }}</span>
            </div>
        </div>

        <v-icon color="slate" size="20" class="ml-2 flex-shrink-0">mdi-chevron-right</v-icon>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GithubRepo } from '@/api/githubClient'
import { SearchItem } from '@/components/Code/CodeSearch.types'
import { firstMatch, highlightFragment } from '@/components/Code/searchSnippets'

interface Props {
    repo: GithubRepo
    items: SearchItem[]
}

const props = defineProps<Props>()
const emit = defineEmits(['repo-selected'])

const topSnippet = computed(() => props.items[0] ? firstMatch(props.items[0]) : undefined)
</script>

<style scoped>
.result-row {
    cursor: pointer;
    border-left: 2px solid transparent;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.result-row:hover {
    background-color: rgba(100, 255, 218, 0.04);
    border-left-color: rgb(var(--v-theme-primary));
}

.result-row:last-child {
    border-bottom: none;
}

.min-width-0 {
    min-width: 0;
}

.snippet {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.snippet :deep(mark) {
    background-color: rgba(100, 255, 218, 0.25);
    color: rgb(var(--v-theme-primary));
    padding: 0 2px;
    border-radius: 2px;
}
</style>
