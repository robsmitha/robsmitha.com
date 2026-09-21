<template>
    <template v-if="languages.success">
        <p class="text-slate text-body-2 mb-6 font-mono">
            {{ totalLines.toLocaleString() }} lines across {{ languages.data.length }}
            language{{ languages.data.length === 1 ? '' : 's' }}
        </p>
        <v-row>
            <v-col v-for="l in languages.data" :key="l.language" xl="3" lg="4" md="6" cols="12">
                <v-card
                    class="mx-auto h-100 lang-card"
                    color="surface"
                    rounded="lg"
                    flat
                    @click="emit('language-selected', l.language)"
                >
                    <v-card-text class="d-flex align-center pa-4">
                        <v-avatar size="44" rounded="lg" class="mr-4">
                            <Devicon :icon="l.language" />
                        </v-avatar>
                        <div class="flex-grow-1 min-width-0">
                            <span class="text-lightest-slate text-body-1 font-weight-bold d-block">{{ l.language }}</span>
                            <span class="font-mono text-caption text-slate">{{ l.lines.toLocaleString() }} lines</span>
                        </div>
                        <v-progress-circular size="52" width="4" :model-value="l.percent" :color="l.color">
                            <span class="font-mono text-caption text-lightest-slate">{{ l.percent }}%</span>
                        </v-progress-circular>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </template>
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

const totalLines = computed(() => {
    if (!props.languages.success) return 0
    return props.languages.data.reduce((sum: number, l: any) => sum + l.lines, 0)
})
</script>

<style scoped>
.lang-card {
    cursor: pointer;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.lang-card:hover {
    transform: translateY(-4px);
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 16px 24px -14px rgba(2, 12, 27, 0.7);
}

.min-width-0 {
    min-width: 0;
}
</style>
