<template>
    <v-sheet color="grey-lighten-4" class="mb-5">
        <v-container>
            <v-row>
                <v-col cols="12">
                    <v-card>
                        <v-card-text class="pb-0">
                            <v-row>
                                <v-col md="6" cols="12">
                                    <div class="text-h6 font-weight-bold">
                                        Search Code
                                    </div>
                                    <template v-if="!store.signedIn">
                                        <v-icon color="warning">mdi-alert</v-icon>
                                        Please sign in with <a :href="gitHubLoginUrl">GitHub</a> or <a :href="microsoftLoginUrl">Microsoft</a> to access search
                                    </template>
                                    <template v-else-if="!store.hasValidAccessToken">
                                        <v-icon color="info">mdi-information</v-icon>
                                        Authorize the OAuth App to access the GitHub REST API <a href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code" target="_blank">Search Code</a> endpoint
                                    </template>
                                    <template v-else>
                                        <span class="text-grey-darken-1">
                                            Powered by GitHub REST API <a href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code" target="_blank">Search Code</a> endpoint
                                        </span>
                                    </template>
                                </v-col>
                                <v-col md="6" cols="12" class="text-right">
                                    <v-text-field
                                        v-if="store.hasValidAccessToken"
                                        v-model="search" 
                                        label="Search github.com/robsmitha"
                                        append-inner-icon="mdi-magnify"
                                        clearable
                                        required
                                        :loading="loading"
                                        @click:append-inner="searchGitHub"
                                        @keypress.enter="searchGitHub"
                                    ></v-text-field>
                                    <v-btn v-else-if="store.signedIn" @click="authorizeGitHubApp" color="black">
                                        <v-icon>mdi-github</v-icon>  Authorize App
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        
                        <v-data-table
                            :items="items"
                            :headers="headers"
                            :group-by="groupBy"
                            :no-data-text="`Enter a term to search code at github.com/robsmitha`"
                            :items-per-page="100"
                        >
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
                                    <td>
                                        {{ item.name }}
                                    </td>
                                    <td v-if="!$vuetify.display.mobile">
                                        {{ item.path }}
                                    </td>
                                    <td>
                                        <v-btn :href="item.html_url" target="_blank" icon flat size="small">
                                            <v-icon>mdi-github</v-icon>
                                        </v-btn>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </v-card>
                    
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
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
}

import { useAppStore } from '@/store/app'
import { ref, watch } from 'vue'
import type { VDataTable } from 'vuetify/components'

const loading = ref(false)
const search = ref('')
const store = useAppStore()
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
]
const gitHubLoginUrl = `/.auth/login/github?post_login_redirect_uri=${encodeURIComponent(document.referrer)}`
const microsoftLoginUrl = `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(document.referrer)}`

// TODO: get Sample Terms from WP. ex. Stripe, Congress, Stocks, Plaid, Google, etc.
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
    const response = await fetch(`/api/githubSearch?term=${encodeURIComponent(search.value)}`)
    if (!response.ok){
        throw new Error();
    }


    const data = await response.json()
    const searchItems = data.result.Items.map((i: any) => ({
            sha: i.Sha,
            name: i.Name,
            path: i.Path,
            html_url: i.HtmlUrl,
            repo_name: i.Repository.Name,
            repo_description: i.Repository.Description,
            language_icon: getDevicon(i.Name)
        }))
    items.value = searchItems
    
    loading.value = false;
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
    }
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`
}
</script>
  