<template>
    <v-dialog
        v-model="dialog"
        scrollable
        transition="dialog-bottom-transition"
        fullscreen
    >
        <v-toolbar color="grey-darken-4" elevation="0">
            <v-btn
                v-if="selectedItem"
                icon="mdi-arrow-left"
                @click="selectedItem = undefined"
            ></v-btn>
            <v-btn
                v-else
                icon="mdi-close"
                @click="closeDialog"
            ></v-btn>
            <v-toolbar-title>
                <span class="font-weight-bold">{{ selectedItem?.name ?? repo.name }}</span>
            </v-toolbar-title>
            <v-spacer />
            <v-chip label dark class="mr-3 font-weight-medium" :href="`https://github.com/robsmitha/${repo.name}`" target="_blank">
                <v-icon small>mdi-github</v-icon>&nbsp;{{ repo.name }}
            </v-chip>
        </v-toolbar>
        <v-card rounded="0">
            <v-sheet color="grey-darken-4" v-if="selectedItem">
                <a class="text-white pl-3 pb-2 d-block" :href="selectedItem.html_url" target="_blank">
                    {{ selectedItem.path }}
                </a> 
            </v-sheet>
            <v-list class="pt-0">
                <v-skeleton-loader v-if="loading"  type="list-item-two-line@5"></v-skeleton-loader>
                <v-list-item bg-color="grey-darken-4" class="px-0 pb-0" v-else-if="selectedItem">
                    <FileContent :repo="repo.name" :path="selectedItem?.path" />
                </v-list-item>
                <template v-else-if="results && results.length > 0">
                    <v-list-item v-for="item in results" :key="item.sha" :title="item.name" :subtitle="item.path" @click="selectedItem = item">
                        
                        <template v-slot:prepend>
                            <Devicon :file-name="item.name" />
                        </template>

                        <template v-slot:append>
                            <v-badge
                            v-if="false"
                            color="grey-lighten-3"
                            :content="item.text_matches.reduce((total: number, textMatch: TextMatch) => {
                                return total + textMatch.matches.length
                            }, 0)"
                            inline
                            ></v-badge>
                        </template>
                    </v-list-item>
                </template>
                <v-list-item v-else title="No results found">
                </v-list-item>
            </v-list>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { SearchItem, TextMatch } from '@/components/Code/CodeSearch.types'
import { useRouter } from 'vue-router'

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)
const router = useRouter()

const props = defineProps(['open', 'loading', 'repo', 'results', 'title'])
const emit = defineEmits(['close'])

const selectedItem = ref<SearchItem | undefined>()

const dialog = computed({
  get() {
    return props.open
  },
  set(newValue) {
    if(!newValue){
        emit('close')
    }
  }
})

function closeDialog(){
    dialog.value = false
    selectedItem.value = undefined
}

function repoSelected(name: string){
    router.push({ path: `/repo/${name}` })
}
</script>