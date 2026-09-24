<template>
    <div
        class="result-card pa-5"
        role="link"
        tabindex="0"
        @click="emit('repo-selected', repo.name)"
        @keydown.enter="emit('repo-selected', repo.name)"
    >
        <div class="d-flex align-start ga-4">
            <v-avatar size="30" color="surface-bright" class="lang-icon flex-shrink-0">
                <Devicon :icon="repo.language" />
            </v-avatar>

            <div class="flex-grow-1 min-width-0">
                <div class="d-flex align-center flex-wrap ga-2 mb-1">
                    <span class="text-lightest-slate text-body-1 font-weight-bold">{{ repo.name }}</span>
                    <span class="file-count font-mono text-caption">
                        {{ items.length }} file{{ items.length === 1 ? '' : 's' }}
                    </span>
                    <span v-if="repo.stargazers_count > 0" class="d-flex align-center ga-1 font-mono text-caption text-amber">
                        <v-icon size="12" color="amber">mdi-star</v-icon>{{ repo.stargazers_count }}
                    </span>
                </div>

                <p v-if="repo.description" class="text-slate text-body-2 description mb-3">
                    {{ repo.description }}
                </p>

                <!-- The best match, framed like an editor tab so it reads as code. -->
                <div v-if="items[0]" class="snippet-frame">
                    <div class="snippet-tab d-flex align-center ga-2 px-3 py-2">
                        <v-icon size="14" color="slate">mdi-file-code-outline</v-icon>
                        <span class="font-mono text-caption text-light-slate text-truncate">{{ items[0].path }}</span>
                    </div>
                    <pre
                        v-if="topSnippet"
                        class="snippet font-mono px-3 py-2"
                        v-html="highlightFragment(topSnippet)"
                    ></pre>
                </div>

                <div v-if="items.length > 1" class="font-mono text-caption text-slate mt-2">
                    + {{ items.length - 1 }} more file{{ items.length - 1 === 1 ? '' : 's' }}
                </div>
            </div>

            <v-icon size="20" class="result-arrow flex-shrink-0">mdi-arrow-right</v-icon>
        </div>
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
.result-card {
    cursor: pointer;
    border-radius: 12px;
    background:
        radial-gradient(90% 120% at 0% 0%, rgba(var(--v-theme-violet), 0.08), transparent 60%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgba(var(--v-theme-violet), 0.6);
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.result-card:hover,
.result-card:focus-visible {
    transform: translateX(4px);
    border-color: rgba(var(--v-theme-violet), 0.6);
    border-left-color: rgb(var(--v-theme-violet));
    box-shadow: 0 16px 36px -20px rgba(var(--v-theme-violet), 0.6);
    outline: none;
}

.result-arrow {
    color: rgb(var(--v-theme-slate));
    transition: color 0.2s ease;
}

.result-card:hover .result-arrow {
    color: rgb(var(--v-theme-violet));
}

.min-width-0 {
    min-width: 0;
}

/* Devicon renders its own 40px avatar; shrink it to sit inside the round badge. */
.lang-icon :deep(.v-avatar) {
    width: 18px !important;
    height: 18px !important;
}

.file-count {
    padding: 1px 9px;
    border-radius: 999px;
    color: rgb(var(--v-theme-violet));
    background: rgba(var(--v-theme-violet), 0.14);
}

.description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.snippet-frame {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-background));
}

.snippet-tab {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgba(var(--v-theme-on-surface), 0.03);
}

.snippet {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: rgb(var(--v-theme-light-slate));
    white-space: pre-wrap;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.snippet :deep(mark) {
    background-color: rgba(var(--v-theme-primary), 0.25);
    color: rgb(var(--v-theme-primary));
    padding: 0 2px;
    border-radius: 3px;
}

@media (prefers-reduced-motion: reduce) {
    .result-card {
        transition: none;
    }

    .result-card:hover {
        transform: none;
    }
}
</style>
