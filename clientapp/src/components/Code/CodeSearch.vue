<template>
    <v-sheet color="grey-lighten-4">
        <v-container>
            <v-row>
                <v-col>
                    <div class="text-h5 font-weight-medium">
                        Search code<span v-if="!$vuetify.display.mobile"> at github.com/robsmitha</span>
                    </div>
                    <span class="text-grey-darken-1">
                        Powered by GitHub
                        <span v-if="!$vuetify.display.mobile">REST API <a href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code" target="_blank">Search Code</a> endpoint</span>
                    </span>
                </v-col>
                <v-col class="text-right">
                    <v-btn variant="text" icon href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code" target="_blank">
                        <v-icon>mdi-book-open</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <CodeSearchField 
                        :term="term"
                        :rate-limited="rateLimited"
                        :loading="loading"
                        @input="term = $event"
                        @search="searchGitHub"
                        @clear="clearSearch"
                        @authorize="authorizeGitHubApp" />
                </v-col>
            </v-row>
            
            <v-row>
                <v-col cols="12">
                    <template  v-if="(items && items?.length > 0) || (loading && !rateLimited)">
                        <CodeSearchRepos
                            :rate-limited="rateLimited"
                            :loading="loading"
                            :term="term"
                            :items="items"
                            @file-selected="onFileSelected"
                        />
                    </template>
                    <template v-else>
                        <CodeSearchCategories 
                            :rate-limited="rateLimited"
                            :loading="loading"
                            @category-selected="onCategorySelected"
                        />
                    </template>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
    
    <FileContentDialog
        :open="dialog"
        :loading="dialogLoading"
        :item="selectedItem"
        :dialogContents="dialogContents"
        @close="dialog = false"
    />
</template>

<style scoped>
:deep(.v-expansion-panel-text__wrapper) {
    padding: 0px;
}
</style>

<script setup lang="ts">
import { WpCategory } from '@/store/types'
import { ref } from 'vue'
import { SearchItem } from '@/components/Code/CodeSearch.types'
import apiClient from '@/api/elysianClient'

// Search
const loading = ref(false)
const term = ref('')
const rateLimited = ref(false)
const items = ref<SearchItem[]>()

// Dialog
const dialog = ref(false)
const dialogLoading = ref(false)
const dialogContents = ref('')
const selectedItem = ref<SearchItem | undefined>()

async function authorizeGitHubApp(): Promise<void> {
    loading.value = true
    const response = await apiClient?.getData(`/api/GitHubOAuthUrl`);
    if (!response?.success){
        throw new Error();
    }
    window.location = response.data.oAuthUrl
    loading.value = false;
}

async function searchGitHub(): Promise<void> {
    loading.value = true
    const response = await apiClient?.getData(`/api/githubSearch?term=${encodeURIComponent(term.value)}`)
    if (!response?.success) {
        rateLimited.value = response?.errors?.has('RATE_LIMIT') ?? false
    } else {
        items.value = response.data.items.map((i: any) => ({
            sha: i.sha,
            name: i.name,
            path: i.path,
            html_url: i.html_url,
            repo_name: i.repository.name,
            repo_description: i.repository.description,
            text_matches: i.textMatches
        }) as SearchItem)
    }
    
    loading.value = false
}

function clearSearch(){
    items.value = []
    selectedItem.value = undefined
}

async function onFileSelected(item: SearchItem){
    selectedItem.value = item
    dialogLoading.value = true;
    dialog.value = true

    const response = await apiClient?.getData(`/api/GitHubRepoContents?repo=${encodeURIComponent(item.repo_name)}&path=${encodeURIComponent(item.path)}`)
    let html = response?.data

    // Remove github markup
    const startPattern = '^<div id="file" class="[^"]*" data-path="' + item.path.replace(/\//g, "\\/") + '"><div class="plain"><pre style="white-space: pre-wrap">'
    const endPattern = '</pre></div></div>$'
    html = html
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(new RegExp(startPattern, 'g'), '')
            .replace(new RegExp(endPattern, 'g'), '')

    let commentPrefix = ''
    let commentSuffix = ''
    const extension = item.name.split('.').pop() || ''
    switch(extension.toLowerCase()){
        case 'py':
            commentPrefix = '#'
            break
        case 'sql':
            commentPrefix = '--'
            break
        case 'html':
            commentPrefix = '<!--'
            commentSuffix = '-->'
        break
        case 'css':
            commentPrefix = '/*'
            commentSuffix = '*/'
            break
        default:
            commentPrefix = '//'
            break
    }
    html = `${commentPrefix} ${item.repo_name}/${item.path} ${commentSuffix}\n` + html

    dialogContents.value = html
    dialogLoading.value = false;
}

async function onCategorySelected(subCategory: WpCategory) {
    term.value = subCategory.description
    await searchGitHub()
}
</script>