<template>
    <div class="d-flex flex-column ga-10">
        <section
            v-for="(parentCategory, g) in store.parentCategories"
            :key="parentCategory.id"
            :style="{ '--accent': `var(--v-theme-${accentFor(g)})` }"
        >
            <h3 class="group-label font-mono text-caption text-uppercase mb-1">{{ parentCategory.name }}</h3>
            <p v-if="parentCategory.description" class="text-slate text-body-2 mb-4">{{ parentCategory.description }}</p>

            <div class="category-grid mt-3">
                <button
                    v-for="subCategory in store.groupedCategories.get(parentCategory.id)"
                    :key="subCategory.id"
                    type="button"
                    class="category-card pa-5 text-left"
                    :disabled="rateLimited || loading"
                    @click="emit('category-selected', subCategory)"
                >
                    <div class="d-flex align-center justify-space-between mb-4">
                        <v-avatar size="30" color="surface-bright" class="category-icon">
                            <Devicon v-if="iconFor(subCategory.description).icon" :icon="iconFor(subCategory.description).icon" />
                            <Devicon v-else :file-name="iconFor(subCategory.description).fileName" />
                        </v-avatar>
                        <v-icon size="18" class="category-arrow">mdi-arrow-right</v-icon>
                    </div>
                    <span class="text-lightest-slate text-body-1 font-weight-bold d-block mb-3">{{ subCategory.name }}</span>
                    <code class="query font-mono text-caption">{{ subCategory.description }}</code>
                </button>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app'

const store = useAppStore()
defineProps(['rateLimited', 'loading'])
const emit = defineEmits(['category-selected'])

// Each group gets its own accent, like the tinted feature cards on the landing page.
const accents = ['primary', 'info', 'violet', 'green']
const accentFor = (index: number) => accents[index % accents.length]

// Pick a logo from the query's qualifiers: language:vue -> Vue, extension:cshtml -> Razor.
function iconFor(query: string): { icon?: string, fileName?: string } {
    if (/React/.test(query)) return { icon: 'react' }
    const language = /language:(\S+)/.exec(query)?.[1]
    if (language) return { icon: language === 'csharp' ? 'c#' : language }
    const extension = /extension:(\S+)/.exec(query)?.[1]
    return { fileName: `file.${extension ?? 'txt'}` }
}
</script>

<style scoped>
.group-label {
    color: rgb(var(--accent));
    letter-spacing: 0.08em;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

.category-card {
    cursor: pointer;
    border-radius: 12px;
    background:
        radial-gradient(120% 90% at 100% 0%, rgba(var(--accent), 0.22), transparent 55%),
        linear-gradient(180deg, rgba(var(--accent), 0.06), rgb(var(--v-theme-surface)) 70%);
    border: 1px solid rgba(var(--accent), 0.28);
    color: inherit;
    font: inherit;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover:not(:disabled),
.category-card:focus-visible {
    transform: translateY(-4px);
    border-color: rgba(var(--accent), 0.8);
    box-shadow: 0 18px 40px -18px rgba(var(--accent), 0.55);
    outline: none;
}

.category-card:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.category-arrow {
    color: rgb(var(--v-theme-slate));
    transition: color 0.2s ease, transform 0.2s ease;
}

.category-card:hover:not(:disabled) .category-arrow {
    color: rgb(var(--accent));
    transform: translateX(3px);
}

/* Devicon renders its own 40px avatar; shrink it to sit inside the round badge. */
.category-icon :deep(.v-avatar) {
    width: 18px !important;
    height: 18px !important;
}

.query {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    color: rgb(var(--accent));
    background: rgba(var(--accent), 0.12);
    word-break: break-word;
}

@media (prefers-reduced-motion: reduce) {
    .category-card,
    .category-arrow {
        transition: none;
    }

    .category-card:hover:not(:disabled) {
        transform: none;
    }
}
</style>
