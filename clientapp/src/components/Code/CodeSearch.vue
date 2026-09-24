<template>
    <PageHero eyebrow="> github.com/robsmitha" tone="teal" art="editor">
        <h1 class="hero-title font-weight-bold mb-3">Search Code</h1>
        <p class="hero-text mb-6">
            Search every public repository with GitHub's code search, using full boolean
            syntax and per-language or per-repo scoping.
        </p>

        <SearchField
            :term="term"
            :rate-limited="rateLimited"
            :loading="loading"
            label="Search github.com/robsmitha"
            :dark="true"
            :show-details="true"
            @input="term = $event"
            @search="searchGitHub"
            @clear="clearSearch"
            @authorize="authorizeGitHubApp" />

        <div class="d-flex flex-wrap align-center ga-8 mt-6">
            <div>
                <span class="font-mono text-h5 font-weight-bold d-block">{{ store.repos?.length || '—' }}</span>
                <span class="font-mono text-caption hero-label">Public repos</span>
            </div>
            <div>
                <span class="font-mono text-h5 font-weight-bold d-block">{{ languageCount || '—' }}</span>
                <span class="font-mono text-caption hero-label">Languages</span>
            </div>
            <a
                class="docs-link font-mono text-caption d-inline-flex align-center ga-1"
                href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code"
                target="_blank"
            >
                <v-icon size="14">mdi-book-open-variant</v-icon> GitHub API docs <v-icon size="12">mdi-open-in-new</v-icon>
            </a>
        </div>
    </PageHero>

    <v-container class="search-body py-12">
        <section v-if="hasSearched" ref="resultsSection" class="results mb-16">
            <SectionHeading index="01" title="Results" />

            <div class="d-flex align-center flex-wrap ga-3 mb-8">
                <code class="query-pill font-mono text-caption">{{ term }}</code>
                <span v-if="!loading" class="font-mono text-caption text-slate">
                    {{ items?.length ?? 0 }} result{{ (items?.length ?? 0) === 1 ? '' : 's' }}
                    across {{ repoResults.size }} repositor{{ repoResults.size === 1 ? 'y' : 'ies' }}
                </span>
                <v-spacer />
                <v-btn variant="outlined" color="slate" rounded="pill" size="small" prepend-icon="mdi-close" class="text-none" @click="clearSearch">
                    Clear search
                </v-btn>
            </div>

            <CodeResultsSkeleton v-if="loading" />

            <v-data-iterator
                v-else-if="repoResults.size > 0"
                :items="[...repoResults.keys()]"
                :items-per-page="8"
            >
                <template v-slot:default="{ items }">
                    <div class="d-flex flex-column ga-3">
                        <CodeResultItem
                            v-for="repo in items"
                            :key="repo.raw.name"
                            :repo="repo.raw"
                            :items="repoResults.get(repo.raw) ?? []"
                            @repo-selected="repoSelected"
                        />
                    </div>
                </template>

                <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                    <div v-if="pageCount > 1" class="d-flex align-center justify-center pa-4 mt-4">
                        <v-btn :disabled="page === 1" density="comfortable" icon="mdi-arrow-left" variant="outlined" color="primary" @click="prevPage"></v-btn>
                        <div class="mx-4 text-caption font-mono text-slate">Page {{ page }} of {{ pageCount }}</div>
                        <v-btn :disabled="page >= pageCount" density="comfortable" icon="mdi-arrow-right" variant="outlined" color="primary" @click="nextPage"></v-btn>
                    </div>
                </template>
            </v-data-iterator>

            <div v-else class="empty-state d-flex flex-column align-center py-12 px-4 text-center">
                <v-icon size="40" class="mb-3 text-slate">mdi-file-search-outline</v-icon>
                <p class="text-lightest-slate font-weight-bold mb-1">No matches for <code class="font-mono">{{ term }}</code></p>
                <p class="text-body-2 text-slate mb-0">Try a broader term, or pick one of the searches below.</p>
            </div>
        </section>

        <section>
            <SectionHeading :index="hasSearched ? '02' : '01'" title="Browse" />
            <p class="text-slate text-body-2 mb-8">
                Not sure what to search for? Start with one of these, grouped by the part of the stack they cover.
            </p>
            <SearchCategories
                :rate-limited="rateLimited"
                :loading="loading"
                @category-selected="onCategorySelected"
            />
        </section>

        <CtaPanel
            class="mt-16"
            tone="plum"
            art="arcs"
            eyebrow="Another tool on this site"
            title="Turn JSON into typed code."
            text="Paste a JSON payload and get C# and TypeScript DTOs back, generated with NJsonSchema."
        >
            <v-btn color="white" variant="flat" rounded="pill" size="large" class="text-none" to="/generate-code">
                Generate code
            </v-btn>
            <v-btn color="white" variant="outlined" rounded="pill" size="large" class="text-none" prepend-icon="mdi-github" href="https://github.com/robsmitha?tab=repositories" target="_blank">
                All repos on GitHub
            </v-btn>
        </CtaPanel>
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

const languageCount = computed(() => new Set((store.repos ?? []).map(r => r.language).filter(Boolean)).size)

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
.search-body {
    max-width: 1100px;
}

.results {
    scroll-margin-top: 80px;
}

.hero-title {
    font-size: clamp(1.8rem, 2vw + 1rem, 2.6rem);
    line-height: 1.1;
}

.hero-text {
    max-width: 52ch;
    opacity: 0.82;
}

.hero-label {
    opacity: 0.7;
}

.docs-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
}

.docs-link:hover {
    text-decoration: underline;
}

.query-pill {
    padding: 3px 10px;
    border-radius: 6px;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
    word-break: break-word;
}

.empty-state {
    border-radius: 12px;
    border: 1px dashed rgb(var(--v-theme-lightest-navy));
}

.empty-state code {
    color: rgb(var(--v-theme-primary));
}
</style>
