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
            
            <v-row v-if="repos?.size > 0 || (loading && !rateLimited)">
                <v-col cols="12">
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
                                    }">{{ repo }}</span>
                                </template>
                                <template v-slot:actions="{ expanded }">
                                    <v-badge class="text-right" :color="expanded ? 'primary' : 'grey-lighten-2'" inline :content="`${repos?.get(repo)?.length} Files`">
                                    </v-badge>
                                </template>
                            </v-expansion-panel-title>
                            
                            <v-expansion-panel-text>
                                <v-list class="py-0">
                                    <v-divider />
                                    <v-list-subheader>Source Code</v-list-subheader>
                                    <v-list-item v-for="item in repos.get(repo)" :key="item.sha" :title="item.name" :subtitle="item.path" @click="getRepoContents(item)">
                                        
                                        <template v-slot:prepend>
                                            <v-avatar tile>
                                                <v-img :src="getDevicon(item.name)" />
                                            </v-avatar>
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
                                    <v-list-item density="compact" :href="`https://github.com/robsmitha/${repo}`" target="_blank">
                                        <template v-slot:prepend>
                                            <v-avatar color="black"><v-icon size="small">mdi-github</v-icon></v-avatar>
                                        </template>
                                        <v-list-item-title>
                                            GitHub
                                        </v-list-item-title>
                                        <v-list-item-subtitle>
                                            See <span class="font-weight-medium">{{ repo }}</span> repository on GitHub
                                        </v-list-item-subtitle>
                                        <template v-slot:append>
                                            <v-icon size="small" class="mr-1">mdi-open-in-new</v-icon>
                                        </template>
                                    </v-list-item>
                                    <v-list-item density="compact" :href="`https://robsmitha.github.io/#/repo/${repo}`" target="_blank">
                                        <template v-slot:prepend>
                                            <v-avatar color="primary">
                                                <v-icon size="small">mdi-desktop-classic</v-icon>
                                            </v-avatar>
                                        </template>
                                        <v-list-item-title>
                                            robsmitha.github.io
                                        </v-list-item-title>
                                        <v-list-item-subtitle>
                                            See <span class="font-weight-medium">{{ repo }}</span> project on robsmitha.github.io
                                        </v-list-item-subtitle>
                                        <template v-slot:append>
                                            <v-icon size="small" class="mr-1">mdi-open-in-new</v-icon>
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
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
      scrollable
      transition="dialog-bottom-transition"
      fullscreen
    >
      <v-card>
        <v-toolbar color="white">
            <v-btn
                icon="mdi-close"
                @click="dialog = false"
            ></v-btn>
            <v-toolbar-title>
                <span class="font-weight-medium">{{ selectedItem?.name }}</span>
            </v-toolbar-title>
            <template v-if="!$vuetify.display.mobile">
                <v-spacer />
                <v-toolbar-items>
                    <v-chip label class="mt-3 mr-3 font-weight-medium" :href="`https://github.com/robsmitha/${selectedItem?.repo_name}`" target="_blank">
                        <v-icon small>mdi-github</v-icon>&nbsp;{{ selectedItem?.repo_name }}
                    </v-chip>
                </v-toolbar-items>
            </template>
        </v-toolbar>
        <v-card-text class="bg-grey-lighten-4 pa-0">
            <template v-if="dialogLoading">
                <v-skeleton-loader color="grey-lighten-4 pa-0" v-for="i in 7" :key="i" type="paragraph">
                </v-skeleton-loader>
            </template>
            <highlightjs
                v-else
                autodetect
                :code="dialogContents"
            />
        </v-card-text>
        <v-card-title class="pa-0">
            <v-list density="compact" class="py-0">
                <v-list-item :href="selectedItem?.html_url" target="_blank">
                    <v-list-item-subtitle>
                        See {{ selectedItem?.name }} on GitHub
                    </v-list-item-subtitle>
                    <template v-slot:append>
                        <v-icon size="small">mdi-github</v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-card-title>
      </v-card>
    </v-dialog>
</template>

<style scoped>
:deep(.v-expansion-panel-text__wrapper) {
    padding: 0px;
}
</style>

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

const store = useAppStore()

// Search
const loading = ref(false)
const search = ref('')
const rateLimited = ref(false)
const repos = ref<Map<string, SearchItem[]>>(new Map<string, SearchItem[]>())

// Dialog
const dialog = ref(false)
const dialogLoading = ref(false)
const dialogContents = ref('')
const selectedItem = ref<SearchItem | undefined>()

watch(search, async (newSearch: string) => {
    if(!newSearch || newSearch.length === 0){
        repos.value = new Map<string, SearchItem[]>()
        selectedItem.value = undefined
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

        repos.value = data.result.items.reduce((map: Map<string, SearchItem[]>, i: any) => {
            const searchItem: SearchItem = {
                sha: i.sha,
                name: i.name,
                path: i.path,
                html_url: i.html_url,
                repo_name: i.repository.name,
                repo_description: i.repository.description,
                language_icon: getDevicon(i.name),
                text_matches: i.text_matches
            }

            if (!map.has(searchItem.repo_name)) {
                map.set(searchItem.repo_name, [searchItem])
            } else {
                map.get(searchItem.repo_name)?.push(searchItem)
            }

            return map
        }, new Map<string, SearchItem[]>())
    }
    
    loading.value = false
}

async function getRepoContents(item: SearchItem){
    selectedItem.value = item
    dialogLoading.value = true;
    dialog.value = true

    const response = await fetch(`/api/GitHubRepoContents?repo=${encodeURIComponent(item.repo_name)}&path=${encodeURIComponent(item.path)}`)
    let html = await response.text()

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
        case 'py':
            path = 'python/python-original';
            break;
    }
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`
}
</script>
  