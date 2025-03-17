<template>
    <v-dialog
        v-model="dialog"
        scrollable
        transition="dialog-bottom-transition"
        :fullscreen="isMobile"
        :max-width="700"
    >
        <v-toolbar color="white" elevation="0">
            <v-btn
                v-if="selectedItem"
                icon="mdi-arrow-left"
                @click="selectedItem = undefined"
            ></v-btn>
            <v-toolbar-title>
                <span class="font-weight-bold">{{ selectedItem?.name ?? title }}</span>
            </v-toolbar-title>
            <v-spacer />
            <v-btn
                icon="mdi-close"
                @click="closeDialog"
            ></v-btn>
        </v-toolbar>
        <v-card rounded="0">
            <v-row>
                <v-col>
                    <RepoItem :repo="repo" variant="flat" elevation="0" @repo-selected="repoSelected" />
                </v-col>
            </v-row>
            <v-list class="py-0">
                <v-list-subheader>{{ selectedItem?.path ?? "Source Code" }}</v-list-subheader>
                <v-skeleton-loader v-if="loading"  type="list-item-two-line@5"></v-skeleton-loader>
                <FileContent v-else-if="selectedItem" :repo="repo.name" :path="selectedItem?.path" />
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