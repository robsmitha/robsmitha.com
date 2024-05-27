<template>
    <template v-if="loading">
        <v-skeleton-loader type="list-item" v-for="i in 8" :key="i"></v-skeleton-loader>
    </template>
    <v-expansion-panels v-else>
        <v-expansion-panel
            v-for="repo in repos.keys()"
            :key="repo"
        >
            <v-expansion-panel-title>
                <template v-slot:default="{ expanded }">
                    <span :class="{
                        'font-weight-medium': expanded
                    }">
                        {{ repo }}
                    </span>
                </template>
                <template v-slot:actions="{ expanded }">
                    <v-badge 
                        class="text-right"
                        inline
                        :color="expanded ? 'primary' : 'grey-lighten-2'"
                        :content="`${repos?.get(repo)?.length} Files`"
                    ></v-badge>
                </template>
            </v-expansion-panel-title>
            
            <v-expansion-panel-text>
                <v-list class="py-0">
                    <v-divider />
                    <v-list-subheader>Source Code</v-list-subheader>

                    <v-list-item v-for="item in repos.get(repo)" :key="item.sha" :title="item.name" :subtitle="item.path" @click="emit('file-selected', item)">
                        
                        <template v-slot:prepend>
                            <Devicon :file-name="item.name" />
                        </template>

                        <template v-slot:append>
                            <v-badge
                            color="grey-lighten-3"
                            :content="item.text_matches.reduce((total: number, textMatch: TextMatch) => {
                                return total + textMatch.matches.length
                            }, 0)"
                            inline
                            ></v-badge>
                        </template>
                    </v-list-item>

                    <v-divider class="mt-3" />
                    <v-list-subheader>External Links</v-list-subheader>

                    <v-list-item 
                        density="compact" 
                        :href="`https://github.com/robsmitha/${repo}`" 
                        target="_blank"
                        title="github.com"
                        :subtitle="`See ${repo} repository on GitHub`">
                        <template v-slot:prepend>
                            <v-avatar color="black"><v-icon size="small">mdi-github</v-icon></v-avatar>
                        </template>
                        <template v-slot:append>
                            <v-icon size="small" class="mr-1">mdi-open-in-new</v-icon>
                        </template>
                    </v-list-item>

                    <v-list-item 
                        density="compact"
                        :href="`https://robsmitha.github.io/#/repo/${repo}`"
                        target="_blank"
                        title="robsmitha.github.io"
                        :subtitle="`See ${repo} project on robsmitha.github.io`">
                        <template v-slot:prepend>
                            <v-avatar color="primary">
                                <v-icon size="small">mdi-desktop-classic</v-icon>
                            </v-avatar>
                        </template>
                        <template v-slot:append>
                            <v-icon size="small" class="mr-1">mdi-open-in-new</v-icon>
                        </template>
                    </v-list-item>
                </v-list>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SearchItem, TextMatch } from '@/components/Code/CodeSearch.types'

const props = defineProps(['rateLimited', 'loading', 'term', 'items'])
const emit = defineEmits(['file-selected'])

const repos = computed(() => {
    return props.items.reduce((map: Map<string, SearchItem[]>, searchItem: SearchItem) => {

        if (!map.has(searchItem.repo_name)) {
            map.set(searchItem.repo_name, [searchItem])
        } else {
            map.get(searchItem.repo_name)?.push(searchItem)
        }

        return map
    }, new Map<string, SearchItem[]>())
})
</script>