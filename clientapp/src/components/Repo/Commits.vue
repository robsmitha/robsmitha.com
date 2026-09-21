<template>
    <v-timeline v-if="commits.success" density="compact" line-color="lightest-navy" side="end">
        <v-timeline-item
            v-for="c in commits.data"
            :key="c.date"
            dot-color="primary"
            icon="mdi-source-commit"
            icon-color="navy"
            size="small"
            width="100%"
        >
            <v-card variant="flat" color="surface" class="mx-auto commit-card" rounded="lg">
                <v-list density="compact" bg-color="surface" class="pb-2">
                    <v-list-subheader class="d-flex align-center justify-space-between">
                        <span class="font-mono text-caption text-slate text-uppercase">
                            <span class="d-sr-only">Commits on </span>{{ relativeDate(c.date) }}
                        </span>
                        <v-chip size="x-small" variant="tonal" color="primary" class="font-mono">
                            {{ c.commits.length }} commit{{ c.commits.length === 1 ? '' : 's' }}
                        </v-chip>
                    </v-list-subheader>
                    <v-list-item
                        v-for="gc in c.commits"
                        :key="gc.sha"
                        target="_blank"
                        rel="noopener noreferrer"
                        :href="gc.html_url"
                        :title="gc.commit.message"
                        :subtitle="`${gc.author?.login} at ${new Date(gc.commit.author.date).toLocaleTimeString()}`"
                        class="commit-item"
                    >
                        <template v-slot:prepend>
                            <v-avatar size="40">
                                <v-img :src="gc.author !== null ? gc.author.avatar_url : ''"></v-img>
                            </v-avatar>
                        </template>
                        <template v-slot:append>
                            <v-icon icon="mdi-open-in-new" size="small" color="slate"></v-icon>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-timeline-item>
    </v-timeline>
</template>

<script setup lang="ts">

defineProps({
    commits: {
        type: Object,
        default: () => ({
            loading: true,
            success: false,
            data: null
        })
    }
})

const today = new Date()
today.setHours(0, 0, 0, 0)

function relativeDate(dateStr: string): string {
    const date = new Date(dateStr)
    const days = Math.round((today.getTime() - date.getTime()) / 86_400_000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days > 1 && days < 7) return `${days} days ago`
    return date.toDateString()
}

</script>

<style scoped>
.commit-card {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: border-color 0.2s ease;
}

.commit-card:hover {
    border-color: rgb(var(--v-theme-primary));
}

.commit-item:hover {
    background-color: rgba(100, 255, 218, 0.04);
}
</style>
