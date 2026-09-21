<template>
    <v-dialog
        v-model="dialog"
        scrollable
        transition="dialog-bottom-transition"
        fullscreen
    >
        <v-sheet color="background" class="workspace d-flex flex-column">
            <!-- Toolbar -->
            <div class="d-flex align-center px-2 px-sm-4 workspace-toolbar bg-light-navy">
                <v-btn
                    v-if="isMobile && selectedItem"
                    icon="mdi-arrow-left"
                    variant="text"
                    color="lightest-slate"
                    @click="selectedItem = undefined"
                ></v-btn>
                <v-btn
                    v-else
                    icon="mdi-close"
                    variant="text"
                    color="lightest-slate"
                    @click="closeDialog"
                ></v-btn>

                <div class="ml-2 d-flex align-center flex-wrap ga-2 min-width-0">
                    <span class="font-mono text-body-2 text-lightest-slate text-truncate">
                        {{ selectedItem?.name ?? title }}
                    </span>
                    <v-chip
                        v-if="!isMobile || !selectedItem"
                        size="small"
                        variant="outlined"
                        color="primary"
                        class="font-mono"
                        :href="`https://github.com/robsmitha/${repo.name}`"
                        target="_blank"
                    >
                        <v-icon start size="14">mdi-github</v-icon>{{ repo.name }}
                    </v-chip>
                </div>

                <v-spacer />

                <v-btn
                    v-if="selectedItem"
                    icon="mdi-open-in-new"
                    variant="text"
                    color="slate"
                    :href="selectedItem.html_url"
                    target="_blank"
                ></v-btn>
                <span v-else class="font-mono text-caption text-slate d-none d-sm-block mr-2">
                    {{ results?.length ?? 0 }} file{{ (results?.length ?? 0) === 1 ? '' : 's' }}
                </span>
            </div>

            <!-- Body -->
            <div class="d-flex flex-grow-1 workspace-body">
                <!-- Content pane -->
                <div
                    v-if="!isMobile || selectedItem"
                    class="content-pane d-flex flex-column flex-grow-1 min-width-0"
                >
                    <template v-if="loading">
                        <v-skeleton-loader color="surface" class="pa-4" type="list-item-two-line@5"></v-skeleton-loader>
                    </template>

                    <template v-else-if="selectedItem">
                        <div class="d-flex align-center px-4 py-2 file-path-bar bg-light-navy">
                            <v-icon size="16" color="slate" class="mr-2">mdi-file-outline</v-icon>
                            <span class="font-mono text-caption text-slate text-truncate">{{ selectedItem.path }}</span>
                        </div>
                        <div class="flex-grow-1 code-scroll">
                            <FileContent :repo="repo.name" :path="selectedItem.path" />
                        </div>
                    </template>

                    <div v-else class="d-flex flex-column align-center justify-center flex-grow-1 text-slate">
                        <v-icon size="44" class="mb-3 text-lightest-navy">
                            {{ results && results.length > 0 ? 'mdi-file-code-outline' : 'mdi-file-search-outline' }}
                        </v-icon>
                        <span class="font-mono text-body-2">
                            {{ results && results.length > 0 ? 'Select a file to preview' : 'No results found' }}
                        </span>
                    </div>
                </div>

                <!-- File list pane -->
                <div
                    v-if="!isMobile || !selectedItem"
                    class="file-list-pane bg-light-navy d-flex flex-column"
                >
                    <div class="px-4 py-3 font-mono text-caption text-slate text-uppercase">
                        {{ results?.length ?? 0 }} result{{ (results?.length ?? 0) === 1 ? '' : 's' }}
                    </div>
                    <v-divider color="lightest-navy" />
                    <div class="flex-grow-1 file-list-scroll">
                        <v-skeleton-loader v-if="loading" type="list-item-two-line@5" color="surface" class="pa-2"></v-skeleton-loader>
                        <v-list v-else-if="results && results.length > 0" bg-color="transparent" density="compact" nav class="py-0">
                            <v-list-item
                                v-for="item in results"
                                :key="item.sha"
                                :active="selectedItem?.sha === item.sha"
                                active-color="primary"
                                class="file-list-item"
                                @click="selectedItem = item"
                            >
                                <template v-slot:prepend>
                                    <Devicon :file-name="item.name" />
                                </template>

                                <v-list-item-title class="text-body-2 text-lightest-slate text-truncate">
                                    {{ item.name }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-caption text-truncate">
                                    {{ item.path }}
                                </v-list-item-subtitle>

                                <p
                                    v-if="firstMatch(item)"
                                    class="font-mono text-caption text-slate snippet mt-1 mb-0"
                                    v-html="highlightFragment(firstMatch(item)!)"
                                ></p>

                                <template v-if="matchCount(item) > 0" v-slot:append>
                                    <v-chip size="x-small" variant="tonal" color="primary" class="font-mono">
                                        {{ matchCount(item) }}
                                    </v-chip>
                                </template>
                            </v-list-item>
                        </v-list>
                        <div v-else class="pa-6 text-center">
                            <span class="font-mono text-caption text-slate">No results found</span>
                        </div>
                    </div>
                </div>
            </div>
        </v-sheet>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { SearchItem } from '@/components/Code/CodeSearch.types'
import { firstMatch, matchCount, highlightFragment } from '@/components/Code/searchSnippets'

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

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
</script>

<style scoped>
.workspace {
    height: 100vh;
}

.workspace-toolbar {
    flex: 0 0 auto;
    height: 56px;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.workspace-body {
    min-height: 0;
}

.min-width-0 {
    min-width: 0;
}

.content-pane {
    min-height: 0;
}

.file-path-bar {
    flex: 0 0 auto;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.code-scroll {
    overflow-y: auto;
}

.file-list-pane {
    width: 100%;
    flex: 0 0 auto;
}

@media (min-width: 960px) {
    .file-list-pane {
        width: 340px;
        border-left: 1px solid rgb(var(--v-theme-lightest-navy));
    }
}

.file-list-scroll {
    overflow-y: auto;
}

.file-list-item {
    border-left: 2px solid transparent;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.file-list-item:hover {
    background-color: rgba(100, 255, 218, 0.04);
}

.file-list-item.v-list-item--active {
    border-left-color: rgb(var(--v-theme-primary));
    background-color: rgba(100, 255, 218, 0.06);
}

.snippet {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.snippet :deep(mark) {
    background-color: rgba(100, 255, 218, 0.25);
    color: rgb(var(--v-theme-primary));
    padding: 0 2px;
    border-radius: 2px;
}
</style>
