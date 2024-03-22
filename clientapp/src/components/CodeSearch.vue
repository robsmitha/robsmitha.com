<template>
    <v-sheet color="grey-lighten-4" class="mb-5">
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
                    <v-alert
                        v-if="rateLimited"
                        border="start"
                        border-color="red-darken-3"
                        color="grey-darken-4"
                        class="mb-2"
                        variant="outlined"
                    >
                        <span class="d-block font-weight-bold">Too many requests. Please try again shortly.</span>
                        <template v-if="!store.signedIn">
                            Sign in with <a class="text-black" href="/.auth/login/github">GitHub</a> 
                            or <a class="text-black" href="/.auth/login/aad">Microsoft</a> and authorize robsmitha.com to access a higher rate limit.
                        </template>
                        <template v-else-if="!store.hasValidAccessToken">
                            Authorize robsmitha.com on GitHub to access a higher rate limit.
                            <v-btn size="small" variant="text" color="outlined" small @click="authorizeGitHubApp">
                                <v-icon size="small">mdi-github</v-icon> Authorize
                            </v-btn>
                        </template>
                    </v-alert>

                    <v-text-field
                        v-if="!rateLimited"
                        v-model="search"
                        append-inner-icon="mdi-magnify"
                        clearable
                        required
                        persistent-hint
                        variant="outlined"
                        @click:append-inner="searchGitHub"
                        @keypress.enter="searchGitHub"
                    >
                        <template v-slot:label>
                            <span>
                                <v-icon icon="mdi-github"></v-icon>/robsmitha
                            </span>
                        </template>
                        <template v-slot:details>
                            <span class="ml-n4">
                                To learn more about the format of the query, see <a target="_blank" href="https://docs.github.com/rest/search/search#constructing-a-search-query">Constructing a search query</a>. 
                                See <a target="_blank" href="https://docs.github.com/search-github/searching-on-github/searching-code">Searching code</a> for a detailed list of qualifiers.
                            </span>
                        </template>
                    </v-text-field>
                </v-col>
            </v-row>
            
            <v-row v-if="items?.length > 0 || (loading && !rateLimited)">
                <v-col cols="12">
                    <v-data-table
                        :items="items"
                        :headers="headers"
                        :group-by="groupBy"
                        :loading="loading"
                        :no-data-text="`Enter a term to search code at github.com/robsmitha`"
                        :items-per-page="100"
                    >
                        <template v-slot:loading>
                            <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
                        </template>
                        <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
                            <tr>
                                <td style="white-space: nowrap;">
                                    <v-btn
                                        :icon="isGroupOpen(item) ? '$expand' : '$next'"
                                        size="small"
                                        variant="text"
                                        @click="toggleGroup(item)"
                                    ></v-btn>
                                    <span class="font-weight-bold">{{ item.value }}</span>
                                </td>
                                <td>
                                    <v-badge class="text-right" color="primary" inline :content="`${items.filter(i => i.repo_name === item.value ).length} Files`">
                                    </v-badge>
                                </td>
                                <td v-if="!$vuetify.display.mobile">
                                    robsmitha/{{ item.value }}
                                </td>
                                <td>
                                    <v-btn :href="`https://robsmitha.github.io/#/repo/${item.value}`" target="_blank" icon flat size="small">
                                        <v-icon>mdi-open-in-new</v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                        </template>
                        <template v-slot:item="{ item }">
                            <tr>
                                <td>
                                    <v-img :aspect-ratio="1" :width="25" :src="getDevicon(item.name)" />
                                </td>
                                <td v-if="!$vuetify.display.mobile">
                                    {{ item.name }}
                                </td>
                                <td>
                                    {{ item.path }}
                                </td>
                                <td>
                                    <v-btn flat size="small" icon="mdi-code-tags" @click="getRepoContents(item)">
                                    </v-btn>
                                </td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>

            <v-row v-else>
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
                    <span class="text-h6 d-block">{{ parentCategory.name }}</span>
                    <span class="text-caption text-grey-darken-1 d-block mb-2">{{ parentCategory.description }}</span>
                    <v-row>
                        <v-col md="3" sm="4" cols="12" v-for="subCategory in store.groupedCategories.get(parentCategory.id)" :key="subCategory.id">
                            <v-card 
                                :title="subCategory.name" 
                                height="100%"
                                :disabled="rateLimited"
                                @click="onSubCategoryClick(subCategory)"
                            >
                                <v-card-text>
                                    <v-chip v-for="w in getWords(subCategory.description)" :key="w" color="primary" class="mr-1 mb-1" size="small" label>{{ w }}</v-chip>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
    <v-dialog
      v-model="dialog"
      width="auto"
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
            <div class="text-h5">
                {{ selectedItem?.name }}
            </div>
            <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="dialog = false"
            ></v-btn>
        </v-card-title>

        <v-card-subtitle>{{ selectedItem?.path }}</v-card-subtitle>

        <v-divider class="mt-2" />

        <v-card-text ><div v-html="dialogContents"></div></v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="my-2 d-flex justify-end">
            
          <v-btn
            :href="selectedItem?.html_url" 
            target="_blank"
            text="GitHub"
            color="black"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

export type SearchItem = {
    sha: string;
    name: string;
    path: string;
    html_url: string;
    repo_name: string;
    repo_description: string | null;
    language_icon: string | null;
    text_matches: TextMatch[];
}

export type TextMatch = {
    fragment: string
    object_url: string
    object_type: string
    property: string
    matches: Match[]
}

export type Match = {
    indices: number[]
    text: string
}

import { useAppStore } from '@/store/app'
import { WpCategory } from '@/store/types';
import { ref, watch } from 'vue'
import type { VDataTable } from 'vuetify/components'

const store = useAppStore()

// Search
const loading = ref(false)
const search = ref('')
const rateLimited = ref(false)
const dialog = ref(false)
const dialogContents = ref('')
const selectedItem = ref<SearchItem | undefined>()

// DataTable
const items = ref<SearchItem[]>([])
const groupBy = [
    {
        key: 'repo_name',
        order: 'asc',
    },
] as VDataTable['$props']['groupBy']
const headers = [
    { title: 'Repo', key: 'data-table-group' },
    { title: 'File', key: 'name' },
    { title: 'Path', key: 'path' },
    { title: '' },
] as VDataTable['$props']['headers']

watch(search, async (newSearch: string) => {
    if(!newSearch || newSearch.length === 0){
        items.value = []
    }
})

async function authorizeGitHubApp(): Promise<void> {
    loading.value = true;
    const response = await fetch(`/api/GitHubOAuthUrl`);
    if (!response.ok){
        throw new Error();
    }
    const data = await response.json();
    window.location = data.oAuthUrl
    loading.value = false;
}

async function searchGitHub(): Promise<void> {
    loading.value = true;

    const response = await fetch(`/api/githubSearch?term=${encodeURIComponent(search.value)}`);

    if (!response.ok) {
        rateLimited.value = response.status === 429
    } else {
        const data = await response.json()
        
        const searchItems = data.result.items.map((i: any) => ({
                sha: i.sha,
                name: i.name,
                path: i.path,
                html_url: i.html_url,
                repo_name: i.repository.name,
                repo_description: i.repository.description,
                language_icon: getDevicon(i.name),
                text_matches: i.text_matches
            }))
            
        items.value = searchItems
    }
    
    loading.value = false
}

async function getRepoContents(item: SearchItem){
    const response = await fetch(`/api/GitHubRepoContents?repo=${encodeURIComponent(item.repo_name)}&path=${encodeURIComponent(item.path)}`)
    const html = await response.text()
    selectedItem.value = item
    dialogContents.value = html
    dialog.value = true
}

function getWords(str: string){
    // Extracting words using regular expression
    let words = str.split(/\s+OR\s+|(?=language:)|(?=extension:)/);

    // Removing "language:" and "extension:" tokens and their values
    words = words.map(word => word.replace(/(language|extension):/, '').replace(/\s+.+$/, ''));
    return words;
}

async function onSubCategoryClick(subCategory: WpCategory) {
    search.value = subCategory.description
    await searchGitHub()
}

function getDevicon(fileName: string){
    const extension = fileName.split('.').pop() || ''
    let path = 'devicon/devicon-original'
    switch(extension.toLowerCase()){
        case "cs":
        case "csproj":
            path = 'dotnetcore/dotnetcore-original'
            break;  
        case "css":
            path = 'css3/css3-original'
            break;  
        case 'php':
            path = 'php/php-original';
            break;
        case 'java':
            path = 'java/java-original';
            break;
        case 'cshtml':
            path = 'dot-net/dot-net-original-wordmark';
            break;
        case 'less':
            path = 'less/less-plain-wordmark';
            break;
        case 'scss':
            path = 'sass/sass-original';
            break;
        case 'html':
            path = 'html5/html5-original';
            break;
        case 'js':
            path = 'javascript/javascript-original';
            break;
        case 'sh':
            path = 'linux/linux-original';
            break;
        case 'sql':
            path = 'azuresqldatabase/azuresqldatabase-original';
            break;
        case 'yaml':
            path = 'yaml/yaml-original';
            break;
        case 'json':
            path = 'json/json-original';
            break;
        case 'xml':
            path = 'xml/xml-original';
            break;
        case 'vue':
            path = 'vuejs/vuejs-original';
            break;
    }
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`
}
</script>
  