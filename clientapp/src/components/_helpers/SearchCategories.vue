<template>
    <div class="d-flex flex-column ga-12">
        <section v-for="parentCategory in store.parentCategories" :key="parentCategory.id">
            <div class="group-head">
                <h3 class="group-label font-mono text-primary">{{ parentCategory.name }}</h3>
                <p v-if="parentCategory.description" class="text-subtle text-body-2 mb-0">{{ parentCategory.description }}</p>
            </div>

            <!-- A ruled grid of ready-made searches -->
            <div class="category-grid">
                <button
                    v-for="subCategory in store.groupedCategories.get(parentCategory.id)"
                    :key="subCategory.id"
                    type="button"
                    class="category-card text-left"
                    :disabled="rateLimited || loading"
                    @click="emit('category-selected', subCategory)"
                >
                    <span class="d-flex align-center justify-space-between mb-6">
                        <v-avatar size="28" color="surface-raised" rounded="0" class="category-icon">
                            <Devicon v-if="iconFor(subCategory.description).icon" :icon="iconFor(subCategory.description).icon" />
                            <Devicon v-else :file-name="iconFor(subCategory.description).fileName" />
                        </v-avatar>
                        <span class="category-arrow" aria-hidden="true">&rarr;</span>
                    </span>
                    <span class="category-name font-display d-block mb-2">{{ subCategory.name }}</span>
                    <code class="query font-mono">{{ subCategory.description }}</code>
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
.group-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 1rem;
    margin-bottom: 1rem;
}

.group-label {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    border-top: 1px solid rgb(var(--v-theme-rule));
    border-left: 1px solid rgb(var(--v-theme-rule));
}

.category-card {
    display: flex;
    flex-direction: column;
    padding: 1.25rem 1.5rem 1.5rem;
    border-right: 1px solid rgb(var(--v-theme-rule));
    border-bottom: 1px solid rgb(var(--v-theme-rule));
    background: rgb(var(--v-theme-surface));
    color: inherit;
    font: inherit;
    cursor: pointer;
    transition: background-color 0.15s ease;
}

.category-card:hover:not(:disabled),
.category-card:focus-visible {
    background: rgb(var(--v-theme-surface-raised));
    outline: none;
}

.category-card:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.category-arrow {
    color: rgb(var(--v-theme-primary));
    transition: transform 0.15s ease;
}

.category-card:hover:not(:disabled) .category-arrow {
    transform: translateX(4px);
}

/* Devicon renders its own 40px avatar; shrink it to sit inside the badge. */
.category-icon :deep(.v-avatar) {
    width: 16px !important;
    height: 16px !important;
}

.category-name {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.query {
    font-size: 0.8125rem;
    color: rgb(var(--v-theme-subtle));
    word-break: break-word;
}

@media (prefers-reduced-motion: reduce) {
    .category-card,
    .category-arrow {
        transition: none;
    }
}
</style>
