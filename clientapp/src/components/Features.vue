<template>
    <v-row>
        <v-col v-for="f in enabledFeatures" :key="f.title" cols="12" md="4">
            <v-card
                :to="f.to"
                color="surface"
                flat
                rounded="lg"
                class="feature-card d-flex flex-column h-100 pa-6"
                :style="{ '--accent': `var(--v-theme-${f.accent})` }"
            >
                <div class="d-flex align-center justify-space-between mb-6">
                    <v-icon :color="f.accent" size="32">{{ f.icon }}</v-icon>
                    <v-icon color="slate" size="20">mdi-arrow-right</v-icon>
                </div>
                <h3 class="text-lightest-slate text-subtitle-1 font-weight-bold mb-2">{{ f.title }}</h3>
                <p class="text-slate text-body-2 flex-grow-1">{{ f.text }}</p>
                <span class="font-mono text-caption mt-6" :class="`text-${f.accent}`">{{ f.subtitle }}</span>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const features = [
    {
        title: 'Congress Activity',
        subtitle: 'CapitolSharp.Congress',
        text: 'A live feed of the latest bills, actions, and activity from the US Congress.',
        to: '/congress',
        icon: 'mdi-rss',
        accent: 'primary',
        enabled: true
    },
    {
        title: 'Generate Code',
        subtitle: 'NJsonSchema.CodeGeneration',
        text: 'Paste JSON and get fully structured C# and TypeScript DTOs back.',
        to: '/generate-code',
        icon: 'mdi-rocket-launch-outline',
        accent: 'info',
        enabled: true
    },
    {
        title: 'US Bill Tracker',
        subtitle: 'CapitolSharp.Congress',
        text: 'A pageable dataset of US bills for navigation and research.',
        to: '/bills',
        icon: 'mdi-radar',
        accent: 'amber',
        enabled: false
    },
    {
        title: 'Search Code',
        subtitle: 'GitHub REST API',
        text: 'Search the code in my GitHub repos with keywords and a flexible query syntax.',
        to: '/code',
        icon: 'mdi-magnify',
        accent: 'violet',
        enabled: true
    }
    // TODO: Budget Features
]

const enabledFeatures = computed(() => features.filter(f => f.enabled))
</script>

<style scoped>
/* Each card is tinted with its own accent, like the colored product cards on jetbrains.com. */
.feature-card {
    position: relative;
    overflow: hidden;
    background:
        radial-gradient(120% 90% at 100% 0%, rgba(var(--accent), 0.28), transparent 55%),
        linear-gradient(180deg, rgba(var(--accent), 0.08), rgb(var(--v-theme-surface)) 70%) !important;
    border: 1px solid rgba(var(--accent), 0.3);
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(var(--accent), 0.8);
    box-shadow: 0 18px 40px -18px rgba(var(--accent), 0.55);
}
</style>
