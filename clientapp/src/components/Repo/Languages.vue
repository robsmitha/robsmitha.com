<template>
    <div v-if="languages.success && languages.data.length">
        <!-- GitHub-style stacked bar, one segment per language. -->
        <div class="language-bar mb-3" role="img" :aria-label="summary">
            <span
                v-for="l in languages.data"
                :key="l.language"
                :style="{ flexGrow: l.bytes, background: languageColor(l.language) }"
                :title="`${l.language} ${l.percent}%`"
            ></span>
        </div>
        <p class="font-mono text-caption text-slate mb-6">
            {{ formatBytes(totalBytes) }} of code across {{ languages.data.length }}
            language{{ languages.data.length === 1 ? '' : 's' }} &middot; click one to search it
        </p>

        <div class="language-grid">
            <button
                v-for="l in languages.data"
                :key="l.language"
                type="button"
                class="language-card pa-4 text-left"
                :style="{ '--lang': languageColor(l.language) }"
                @click="emit('language-selected', l.language)"
            >
                <div class="d-flex align-center ga-3 mb-3">
                    <v-avatar size="30" color="surface-bright" class="lang-icon flex-shrink-0">
                        <Devicon :icon="l.language" />
                    </v-avatar>
                    <span class="text-lightest-slate font-weight-bold flex-grow-1 text-truncate">{{ l.language }}</span>
                    <span class="font-mono text-body-2 text-lightest-slate">{{ l.percent < 1 ? '<1' : l.percent }}%</span>
                </div>
                <div class="percent-track mb-2">
                    <span :style="{ width: `${Math.max(l.percent, 1)}%` }"></span>
                </div>
                <span class="font-mono text-caption text-slate">{{ formatBytes(l.bytes) }}</span>
            </button>
        </div>
    </div>
    <p v-else-if="languages.success" class="text-slate text-body-2">No language data for this repo yet.</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    languages: {
        type: Object,
        default: () => ({
            loading: true,
            success: false,
            data: null
        })
    }
})

const emit = defineEmits(['language-selected'])

// GitHub's own language colors (from linguist), so the bar reads like the one on github.com.
const colors: Record<string, string> = {
    'C#': '#178600',
    'TypeScript': '#3178c6',
    'JavaScript': '#f1e05a',
    'Vue': '#41b883',
    'HTML': '#e34c26',
    'CSS': '#663399',
    'SCSS': '#c6538c',
    'Python': '#3572A5',
    'Java': '#b07219',
    'PHP': '#4F5D95',
    'C++': '#f34b7d',
    'Shell': '#89e051',
    'PowerShell': '#5391fe',
    'Dockerfile': '#384d54',
    'Bicep': '#519aba',
    'TSQL': '#e38c00',
    'Kotlin': '#A97BFF',
}
const languageColor = (language: string) => colors[language] ?? '#8a8a93'

const totalBytes = computed(() =>
    props.languages.success ? props.languages.data.reduce((sum: number, l: any) => sum + l.bytes, 0) : 0
)

const summary = computed(() =>
    props.languages.success ? props.languages.data.map((l: any) => `${l.language} ${l.percent}%`).join(', ') : ''
)

// The languages API reports bytes of code, not lines.
function formatBytes(bytes: number) {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
    if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`
    return `${bytes} B`
}
</script>

<style scoped>
.language-bar {
    display: flex;
    gap: 2px;
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
}

.language-bar span {
    min-width: 3px;
}

.language-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
}

.language-card {
    cursor: pointer;
    border-radius: 12px;
    color: inherit;
    font: inherit;
    background:
        radial-gradient(120% 100% at 100% 0%, color-mix(in srgb, var(--lang) 18%, transparent), transparent 60%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.language-card:hover,
.language-card:focus-visible {
    transform: translateY(-3px);
    border-color: var(--lang);
    box-shadow: 0 16px 36px -20px var(--lang);
    outline: none;
}

.percent-track {
    height: 4px;
    border-radius: 999px;
    background: rgba(var(--v-theme-on-surface), 0.08);
    overflow: hidden;
}

.percent-track span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--lang);
}

/* Devicon renders its own 40px avatar; shrink it to sit inside the round badge. */
.lang-icon :deep(.v-avatar) {
    width: 18px !important;
    height: 18px !important;
}

@media (prefers-reduced-motion: reduce) {
    .language-card {
        transition: none;
    }

    .language-card:hover {
        transform: none;
    }
}
</style>
