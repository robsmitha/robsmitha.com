<template>
    <v-row>
        <v-col v-if="store.parentCategories.size === 0">
            <template v-for="i in 3" :key="i">
                <v-skeleton-loader type="subtitle" color="transparent" width="200px"></v-skeleton-loader>
                <v-skeleton-loader type="text" color="transparent" width="300px" class="mt-n5"></v-skeleton-loader>
                <v-row>
                    <v-col md="3" sm="4" cols="12" v-for="j in Math.floor(Math.random() * (4 - 1 + 1)) + 1" :key="j">
                        <v-skeleton-loader type="paragraph"></v-skeleton-loader>
                    </v-col>
                </v-row>
            </template>
        </v-col>
        <v-col v-for="parentCategory in store.parentCategories" :key="parentCategory.id" cols="12">
            <span class="text-caption text-grey-darken-3 d-block">{{ parentCategory.name }}</span>
            <span class="text-caption text-grey-darken-1 d-block mb-2">{{ parentCategory.description }}</span>
            <v-row class="mb-4">
                <v-col md="3" sm="4" cols="12" v-for="subCategory in store.groupedCategories.get(parentCategory.id)" :key="subCategory.id">
                    <v-card 
                        :title="subCategory.name" 
                        height="100%"
                        class="mx-auto pb-3 border-sm h-100 rounded-0 mt-1"
                        flat
                        :disabled="rateLimited"
                        @click="emit('category-selected', subCategory)"
                    >
                        <v-card-text>
                            <v-chip v-for="w in getWords(subCategory.description)" :key="w" color="grey-darken-4" class="mr-1 mb-1" size="small" label>{{ w }}</v-chip>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
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
