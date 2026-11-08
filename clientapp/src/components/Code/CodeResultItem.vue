<template>
    <!-- One repository's matches: a ruled header with the repo name, then the top files as code blocks. -->
    <article class="result">
        <header class="result-header">
            <button type="button" class="result-repo font-display" @click="emit('repo-selected', repo.name)">
                {{ repo.name }} <span class="result-arrow" aria-hidden="true">&rarr;</span>
            </button>
            <span class="font-mono text-caption text-subtle">
                <template v-if="repo.language">{{ repo.language }} · </template>{{ totalMatches }} match{{ totalMatches === 1 ? '' : 'es' }}
            </span>
        </header>

        <div class="d-flex flex-column ga-3">
            <div v-for="file in shownFiles" :key="file.sha + file.path" class="file">
                <div class="file-tab font-mono">
                    <a :href="file.html_url" target="_blank" rel="noopener noreferrer" class="file-path">{{ file.path }}</a>
                    <span class="text-subtle flex-shrink-0">{{ matchCount(file) }} match{{ matchCount(file) === 1 ? '' : 'es' }}</span>
                </div>
                <pre
                    v-if="firstMatch(file)"
                    class="snippet font-mono"
                    v-html="highlightFragment(firstMatch(file)!)"
                ></pre>
            </div>
        </div>

        <button
            v-if="hiddenCount > 0"
            type="button"
            class="more-link font-mono mt-3"
            @click="emit('repo-selected', repo.name)"
        >
            Show {{ hiddenCount }} more file{{ hiddenCount === 1 ? '' : 's' }}
        </button>
    </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GithubRepo } from '@/api/githubClient'
import { SearchItem } from '@/components/Code/CodeSearch.types'
import { firstMatch, highlightFragment, matchCount } from '@/components/Code/searchSnippets'

interface Props {
    repo: GithubRepo
    items: SearchItem[]
}

const props = defineProps<Props>()
const emit = defineEmits(['repo-selected'])

// Two files per repo keep the list scannable; the rest open in the repo's results dialog.
const FILES_SHOWN = 2
const shownFiles = computed(() => props.items.slice(0, FILES_SHOWN))
const hiddenCount = computed(() => Math.max(0, props.items.length - FILES_SHOWN))
const totalMatches = computed(() => props.items.reduce((n, item) => n + Math.max(matchCount(item), 1), 0))
</script>

<style scoped>
.result {
    border-top: 2px solid rgb(var(--v-theme-rule));
}

.result-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    padding: 1rem 0;
}

.result-repo {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-align: left;
    word-break: break-word;
    color: rgb(var(--v-theme-on-background));
}

.result-arrow {
    display: inline-block;
    color: rgb(var(--v-theme-primary));
    transition: transform 0.15s ease;
}

.result-repo:hover .result-arrow,
.result-repo:focus-visible .result-arrow {
    transform: translateX(4px);
}

.file {
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface));
}

.file-tab {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
    border-bottom: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface-raised));
}

.file-path {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgb(var(--v-theme-on-surface));
    text-decoration: none;
}

.file-path:hover,
.file-path:focus-visible {
    text-decoration: underline;
}

.snippet {
    margin: 0;
    padding: 1rem;
    font-size: 0.8125rem;
    line-height: 1.7;
    color: rgb(var(--v-theme-muted));
    white-space: pre-wrap;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.snippet :deep(mark) {
    padding: 0 2px;
    color: rgb(var(--v-theme-on-surface));
    background-color: rgba(var(--v-theme-primary), 0.18);
}

.more-link {
    font-size: 0.8125rem;
    color: rgb(var(--v-theme-on-background));
    text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
    .result-arrow {
        transition: none;
    }
}
</style>
