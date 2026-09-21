<template>
    <div v-if="store.parentCategories.size === 0">
        <template v-for="i in 3" :key="i">
            <v-skeleton-loader type="subtitle" color="surface" width="200px" class="mb-2"></v-skeleton-loader>
            <v-row class="mb-4">
                <v-col md="3" sm="4" cols="12" v-for="j in Math.floor(Math.random() * (4 - 1 + 1)) + 1" :key="j">
                    <v-skeleton-loader type="paragraph" color="surface"></v-skeleton-loader>
                </v-col>
            </v-row>
        </template>
    </div>
    <template v-else>
    <template v-for="parentCategory in store.parentCategories" :key="parentCategory.id">
        <span class="font-mono text-primary text-caption text-uppercase d-block mb-2">
            {{ parentCategory.name }}
        </span>
        <p v-if="parentCategory.description" class="text-slate text-body-2 mb-4">{{ parentCategory.description }}</p>
        <v-row class="mb-6">
            <v-col md="3" sm="4" cols="12" v-for="subCategory in store.groupedCategories.get(parentCategory.id)" :key="subCategory.id">
                <v-card
                    color="surface"
                    rounded="lg"
                    flat
                    class="category-card h-100"
                    :disabled="rateLimited"
                    @click="emit('category-selected', subCategory)"
                >
                    <v-card-text class="pa-4">
                        <span class="text-lightest-slate text-body-1 font-weight-bold d-block mb-3">{{ subCategory.name }}</span>
                        <div class="d-flex flex-wrap ga-1">
                            <v-chip
                                v-for="w in getWords(subCategory.description)"
                                :key="w"
                                variant="outlined"
                                color="slate"
                                class="font-mono"
                                size="small"
                            >
                                {{ w }}
                            </v-chip>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </template>
    </template>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app'

const store = useAppStore()
defineProps(['rateLimited', 'loading'])
const emit = defineEmits(['category-selected'])

function getWords(str: string){
    // Extracting words using regular expression
    let words = str.split(/\s+OR\s+|(?=language:)|(?=extension:)/);

    // Removing "language:" and "extension:" tokens and their values
    words = words.map(word => word.replace(/(language|extension):/, '').replace(/\s+.+$/, ''));
    return words;
}
</script>

<style scoped>
.category-card {
    cursor: pointer;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover {
    transform: translateY(-4px);
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 16px 24px -14px rgba(2, 12, 27, 0.7);
}
</style>
