<template>
    <section class="search-hero bg-light-navy">
        <v-container class="py-10">
            <v-row align="start" justify="space-between">
                <v-col cols="12" md="8">
                    <p class="font-mono text-primary text-body-2 mb-2">
                        <span aria-hidden="true">&gt;</span> github.com/robsmitha
                    </p>
                    <h1 class="text-lightest-slate text-h4 font-weight-bold mb-3">
                        Search Code
                    </h1>
                    <p class="text-slate" style="max-width: 560px;">
                        Search across every public repository using GitHub's code search &mdash;
                        full boolean syntax with per-language and per-repo scoping.
                    </p>
                </v-col>
                <v-col cols="12" md="auto">
                    <v-btn
                        variant="outlined"
                        color="primary"
                        class="font-mono text-none"
                        prepend-icon="mdi-book-open-variant"
                        href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code"
                        target="_blank"
                    >
                        API Docs
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
    </section>

    <v-container class="py-10">
        <div class="d-flex align-center mb-6 section-heading">
            <span class="font-mono text-primary text-body-2 mr-3">01.</span>
            <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">
                Browse
            </h3>
            <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
        </div>
        <p class="text-slate text-body-2 mb-8">
            Use the categories below to run a canned search.
        </p>
        <SearchCategories
            :rate-limited="rateLimited"
            :loading="loading"
            @category-selected="onCategorySelected"
        />

        <template v-if="hasSearched">
            <v-divider color="lightest-navy" class="my-14"></v-divider>

            <div ref="resultsSection" class="d-flex align-center mb-6 section-heading">
                <span class="font-mono text-primary text-body-2 mr-3">02.</span>
                <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">
                    Results
                </h3>
                <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
                <v-btn
                    variant="outlined"
                    color="slate"
                    prepend-icon="mdi-close"
                    class="font-mono text-none"
                    size="small"
                    @click="clearSearch"
                >
                    Clear search
                </v-btn>
            </div>
            <p v-if="!loading" class="font-mono text-slate text-body-2 mb-8">
                {{ items?.length ?? 0 }} result{{ (items?.length ?? 0) === 1 ? '' : 's' }} across {{ repoResults.size }} repositor{{ repoResults.size === 1 ? 'y' : 'ies' }}
            </p>

            <v-skeleton-loader
                v-if="loading"
                type="list-item-two-line@5"
                color="surface"
            ></v-skeleton-loader>

            <v-data-iterator
                v-else-if="repoResults.size > 0"
                :items="[...repoResults.keys()]"
                :items-per-page="8"
            >
                <template v-slot:default="{ items }">
                    <v-sheet color="surface" rounded="lg" class="result-list">
                        <CodeResultItem
                            v-for="repo in items"
                            :key="repo.raw.name"
                            :repo="repo.raw"
                            :items="repoResults.get(repo.raw) ?? []"
                            @repo-selected="repoSelected"
                        />
                    </v-sheet>
                </template>

                <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                    <div v-if="pageCount > 1" class="d-flex align-center justify-center pa-4 mt-4">
                        <v-btn
                            :disabled="page === 1"
                            density="comfortable"
                            icon="mdi-arrow-left"
                            variant="outlined"
                            color="primary"
                            @click="prevPage"
                        ></v-btn>

                        <div class="mx-4 text-caption font-mono text-slate">
                            Page {{ page }} of {{ pageCount }}
                        </div>

                        <v-btn
                            :disabled="page >= pageCount"
                            density="comfortable"
                            icon="mdi-arrow-right"
                            variant="outlined"
                            color="primary"
                            @click="nextPage"
                        ></v-btn>
                    </div>
                </template>
            </v-data-iterator>

            <div v-else class="d-flex flex-column align-center py-12 text-center">
                <v-icon size="40" class="mb-3 text-lightest-navy">mdi-file-search-outline</v-icon>
                <p class="text-body-2 text-slate">
                    No results found for "{{ term }}". Try a different query or qualifier.
                </p>
            </div>
        </template>
    </v-container>

    <SearchResultsDialog :open="dialog" :loading="loading" :repo="selectedRepo" :title="`${getWords(term)}`" :results="selectedResults" @close="dialog = false" />
</template>

<script setup lang="ts">
import { WpCategory } from '@/store/types'
import { ref, computed, nextTick } from 'vue'
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
const hasSearched = ref(false)
const resultsSection = ref<HTMLElement | null>(null)

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
    hasSearched.value = true
    items.value = []

    await nextTick()
    resultsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })

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
    hasSearched.value = false
    term.value = ''
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

<style scoped>
.result-list {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    overflow: hidden;
}

:deep(.v-expansion-panel-text__wrapper) {
    padding: 0px;
}
</style>
