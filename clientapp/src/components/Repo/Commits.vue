<template>
    <div v-if="commits.success && commits.data.length">
        <div v-for="c in visibleGroups" :key="c.date" class="day-group">
            <h3 class="day-label font-mono text-caption text-uppercase mb-3">
                <span class="d-sr-only">Commits on </span>{{ dayLabel(c.date) }}
                <span class="text-slate"> &middot; {{ c.commits.length }} commit{{ c.commits.length === 1 ? '' : 's' }}</span>
            </h3>

            <div class="d-flex flex-column ga-3">
                <a
                    v-for="gc in c.commits"
                    :key="gc.sha"
                    :href="gc.html_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="commit-card pa-4 d-flex align-start ga-4"
                    :style="{ '--kind': `var(--v-theme-${commitKind(gc.commit.message)?.color ?? 'lightest-navy'})` }"
                >
                    <v-avatar size="32" color="surface-bright" class="flex-shrink-0">
                        <v-img v-if="gc.author?.avatar_url" :src="gc.author.avatar_url" :alt="gc.author.login"></v-img>
                        <v-icon v-else size="18">mdi-account</v-icon>
                    </v-avatar>

                    <div class="flex-grow-1 min-width-0">
                        <div class="d-flex align-start ga-2 mb-1">
                            <span v-if="commitKind(gc.commit.message)" class="kind-pill font-mono text-caption flex-shrink-0">
                                {{ commitKind(gc.commit.message)!.label }}
                            </span>
                            <span class="text-lightest-slate font-weight-bold text-body-2 commit-title">{{ subject(gc.commit.message) }}</span>
                        </div>
                        <p v-if="body(gc.commit.message)" class="text-slate text-body-2 commit-body mb-1">{{ body(gc.commit.message) }}</p>
                        <span class="font-mono text-caption text-slate">
                            {{ gc.author?.login ?? gc.commit.author.name }} &middot; {{ moment(gc.commit.author.date).format('h:mm A') }}
                        </span>
                    </div>

                    <span class="sha font-mono text-caption flex-shrink-0">{{ gc.sha.slice(0, 7) }}</span>
                </a>
            </div>
        </div>

        <v-btn
            v-if="commits.data.length > groupLimit"
            variant="outlined"
            color="primary"
            class="font-mono text-none ml-8"
            @click="showAll = !showAll"
        >
            {{ showAll ? 'Show recent days' : `Show all ${commits.data.length} days` }}
        </v-btn>
    </div>
    <p v-else-if="commits.success" class="text-slate text-body-2">No commits yet.</p>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import moment from 'moment'

const props = defineProps({
    commits: {
        type: Object,
        default: () => ({
            loading: true,
            success: false,
            data: null
        })
    }
})

const groupLimit = 5
const showAll = ref(false)
const visibleGroups = computed(() => showAll.value ? props.commits.data : props.commits.data.slice(0, groupLimit))

function dayLabel(date: string) {
    const day = moment(date).startOf('day')
    const today = moment().startOf('day')
    if (day.isSame(today)) return 'Today'
    if (day.isSame(today.clone().subtract(1, 'day'))) return 'Yesterday'
    return day.format('dddd, MMM D, YYYY')
}

const subject = (message: string) => message.split('\n')[0].replace(/^\w+(\([^)]*\))?!?:\s*/, '')
const body = (message: string) => message.split('\n').slice(1).join(' ').trim()

// Conventional-commit prefixes (feat:, fix(ui): ...) get a colored pill.
function commitKind(message: string): { label: string, color: string } | undefined {
    const type = /^(\w+)(\([^)]*\))?!?:/.exec(message)?.[1]?.toLowerCase()
    switch (type) {
        case 'feat': return { label: 'feat', color: 'green' }
        case 'fix': return { label: 'fix', color: 'error' }
        case 'refactor': return { label: 'refactor', color: 'violet' }
        case 'docs': return { label: 'docs', color: 'info' }
        case 'style': return { label: 'style', color: 'info' }
        case 'test': return { label: 'test', color: 'amber' }
        case 'chore':
        case 'build':
        case 'ci': return { label: type, color: 'amber' }
        default: return undefined
    }
}
</script>

<style scoped>
/* Same timeline rail as the Congress pages. */
.day-group {
    position: relative;
    margin-left: 6px;
    padding-left: 1.75rem;
    padding-bottom: 2rem;
    border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.day-group::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0.35rem;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 4px rgb(var(--v-theme-background));
}

.day-label {
    color: rgb(var(--v-theme-light-slate));
    letter-spacing: 0.08em;
}

.commit-card {
    text-decoration: none;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgb(var(--kind));
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.commit-card:hover,
.commit-card:focus-visible {
    transform: translateX(4px);
    border-color: rgb(var(--v-theme-primary));
    outline: none;
}

.min-width-0 {
    min-width: 0;
}

.kind-pill {
    padding: 0 8px;
    border-radius: 999px;
    color: rgb(var(--kind));
    background: rgba(var(--kind), 0.14);
}

.commit-title {
    line-height: 1.5;
    word-break: break-word;
}

.commit-body {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.sha {
    padding: 2px 8px;
    border-radius: 6px;
    color: rgb(var(--v-theme-info));
    background: rgba(var(--v-theme-info), 0.1);
}

@media (prefers-reduced-motion: reduce) {
    .commit-card {
        transition: none;
    }

    .commit-card:hover {
        transform: none;
    }
}
</style>
