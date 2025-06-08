<template>
    <v-sheet color="grey-darken-4">
        <v-container>
            <v-row>
                <v-col>
                    <div class="text-h5 font-weight-medium">
                        Search code<span v-if="!$vuetify.display.mobile"> at github.com/robsmitha</span>
                    </div>
                    <span class="text-grey-darken-1">
                        Powered by GitHub
                        <span v-if="!$vuetify.display.mobile">REST API <a class="text-white" href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code" target="_blank">Search Code</a> endpoint</span>
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
                    <SearchField 
                        :term="term"
                        :rate-limited="rateLimited"
                        :loading="loading"
                        label="/robsmitha"
                        :dark="true"
                        :show-details="true"
                        @input="term = $event"
                        @search="searchGitHub"
                        @clear="clearSearch"
                        @authorize="authorizeGitHubApp" />
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
    <v-sheet class="py-5">
        <v-container>
            <v-row class="mb-3">
                <v-col>
                    <ContentHeader
                        title="Code Search"
                        :subtitle="!items ? 'Use the categories below to search code' : `Found ${ items?.length } results in ${ repoResults.size } repositories`"
                    />
                </v-col>
                <v-col v-if="items?.length" cols="auto" class="text-right">
                    <v-btn
                        flat
                        icon="mdi-cancel"
                        small
                        size="large"
                        @click="clearSearch"
                    ></v-btn>
                </v-col>
            </v-row>
            <v-divider class="mt-3 mb-8" thickness="5px" length="50px" />

            
            <v-row v-if="loading">
                <v-col v-for="i in 3" :key="i"
                    cols="12"
                    xl="3"
                    md="4"
                    sm="6"
                >
                    <v-skeleton-loader
                        ref="skeleton"
                        :type="'article'"
                        class="mx-auto"
                    ></v-skeleton-loader>
                </v-col>
            </v-row>
                
            <v-data-iterator
                v-else-if="repoResults && repoResults.size > 0"
                :items="[...repoResults.keys()]"
                :items-per-page="6"
            >
                <template v-slot:default="{ items }">
                    <v-row dense>
                        <v-col
                        v-for="repo in items"
                        :key="repo.raw.name"
                        cols="12"
                        xl="2"
                        lg="4"
                        md="4"
                        sm="6"
                        >
                            <RepoItem :repo="repo.raw" @repo-selected="repoSelected" />
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                    <div class="d-flex align-center justify-center pa-4 mt-4">
                        <v-btn
                            :disabled="page === 1"
                            density="comfortable"
                            icon="mdi-arrow-left"
                            variant="tonal"
                            rounded
                            @click="prevPage"
                        ></v-btn>

                        <div class="mx-2 text-caption">
                            Page {{ page }} of {{ pageCount }}
                        </div>

                        <v-btn
                            :disabled="page >= pageCount"
                            density="comfortable"
                            icon="mdi-arrow-right"
                            variant="tonal"
                            rounded
                            @click="nextPage"
                        ></v-btn>
                    </div>
                </template>
            </v-data-iterator>
            
            <SearchCategories
                v-else
                :rate-limited="rateLimited"
                :loading="loading"
                @category-selected="onCategorySelected"
            />
        </v-container>
    </v-sheet>
    <SearchResultsDialog :open="dialog" :loading="loading" :repo="selectedRepo" :title="`${getWords(term)}`" :results="selectedResults" @close="dialog = false" />
</template>

<style scoped>
:deep(.v-expansion-panel-text__wrapper) {
    padding: 0px;
}
</style>

<script setup lang="ts">
import { WpCategory } from '@/store/types'
import { ref, computed } from 'vue'
import { SearchItem } from '@/components/Code/CodeSearch.types'
import apiClient from '@/api/elysianClient'
import { useGithubStore } from "@/store/github"
import { GitHubRepoMap, GithubRepo } from '@/api/githubClient'
const store = useGithubStore()

// Search
const loading = ref(false)
const term = ref('')
const rateLimited = ref(false)
const items = ref<SearchItem[]>()

// Dialog
const dialog = ref(false)
const selectedRepo = ref<GithubRepo>()

const repoResults = computed(() => {
    if(!items.value || !store.repoLookup){
        return new GitHubRepoMap<SearchItem[]>()
    }
    return items.value.reduce((map: GitHubRepoMap<SearchItem[]>, searchItem: SearchItem) => {
        const repo = store.repoLookup.get(searchItem.repo_name)!
        
        if (!repo) {
            console.warn(`Repo could not be found in global repo lookup [Name: ${searchItem.repo_name}]`)
            return map;
        }
        
        if (!map.has(repo)) {
            map.set(repo, [searchItem]);
        } else {
            map.get(repo)?.push(searchItem);
        }
        
        return map;
    }, new GitHubRepoMap<SearchItem[]>())
})

const selectedResults = computed(() => {
    if(!selectedRepo.value){
        return [];
    }
    return repoResults.value.get(selectedRepo.value!)
})


function repoSelected(name: string){
    const repo = store.repoLookup.get(name)!
    selectedRepo.value = repo
    dialog.value = true
}

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
    items.value = []
    const response = await apiClient?.getData(`/api/githubSearch?term=${encodeURIComponent(term.value)}`)
    if (!response?.success) {
        rateLimited.value = response?.errors?.has('RATE_LIMIT') ?? false
    } else {
        const searchResults = response.data.items.map((i: any) => ({
            sha: i.sha,
            name: i.name,
            path: i.path,
            html_url: i.html_url,
            repo_name: i.repository.name,
            repo_description: i.repository.description,
            text_matches: i.textMatches
        }) as SearchItem)

        items.value = searchResults
    }
    
    loading.value = false
}

async function onCategorySelected(subCategory: WpCategory) {
    term.value = subCategory.description
    await searchGitHub()
}

function clearSearch(){
    items.value = []
}

function getWords(str: string){
    if(!str) return ''
    // Extracting words using regular expression
    let words = str.split(/\s+OR\s+|(?=language:)|(?=extension:)/);

    // Removing "language:" and "extension:" tokens and their values
    words = words.map(word => word.replace(/(language|extension):/, '').replace(/\s+.+$/, ''));
    return words;
}
</script>