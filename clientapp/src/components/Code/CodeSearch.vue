<template>
    <PageHero eyebrow="github.com/robsmitha">
        <!-- Big title with the description beside it, then the full-width search bar and a stats row -->
        <div class="hero-head">
            <h1 class="hero-title">Search Code<span class="text-primary">.</span></h1>
            <p class="hero-text">
                Search every public repository with GitHub's code search, using full boolean
                syntax and per-language or per-repo scoping.
            </p>
        </div>

        <SearchField
            ref="searchField"
            class="mt-10"
            :term="term"
            :rate-limited="rateLimited"
            :loading="loading"
            label="Search github.com/robsmitha"
            @input="term = $event"
            @search="searchGitHub"
            @clear="clearSearch"
            @authorize="authorizeGitHubApp" />

        <div class="hero-stats mt-7">
            <div>
                <span class="hero-stat font-display">{{ store.repos?.length || '—' }}</span>
                <span class="font-mono text-body-2 text-subtle">public repos</span>
            </div>
            <div>
                <span class="hero-stat font-display">{{ languageCount || '—' }}</span>
                <span class="font-mono text-body-2 text-subtle">languages</span>
            </div>
            <a
                class="docs-link font-mono text-body-2"
                href="https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code"
                target="_blank"
                rel="noopener noreferrer"
            >GitHub API docs &nearr;</a>
        </div>
    </PageHero>

    <!-- Query syntax: a grey band of qualifiers you can click to add to the query -->
    <section class="syntax-band" aria-labelledby="syntax-title">
        <v-container class="search-body syntax-layout">
            <div class="side-head">
                <span class="font-mono text-primary text-body-2">{{ sectionIndex('syntax') }}</span>
                <h2 id="syntax-title" class="side-title font-display">Query syntax</h2>
                <p class="text-body-2 text-subtle mt-2 mb-0">Click one to add it to your search.</p>
            </div>
            <div class="syntax-grid">
                <button
                    v-for="ex in syntaxExamples"
                    :key="ex.query"
                    type="button"
                    class="syntax-item"
                    @click="addToQuery(ex.query)"
                >
                    <code class="font-mono">{{ ex.query }}</code>
                    <span class="text-body-2 text-subtle">{{ ex.text }}</span>
                </button>
            </div>
        </v-container>
    </section>

    <v-container class="search-body py-14">
        <!-- Results: counts and repos on the left, matches on the right -->
        <section v-if="hasSearched" ref="resultsSection" class="results results-layout mb-16" aria-labelledby="results-title">
            <aside class="side-head">
                <span class="font-mono text-primary text-body-2">{{ sectionIndex('results') }}</span>
                <h2 id="results-title" class="side-title font-display mb-4">Results</h2>

                <code class="query-pill font-mono">{{ term }}</code>

                <template v-if="!loading">
                    <p class="font-mono text-body-2 text-subtle mt-4 mb-1">
                        {{ items?.length ?? 0 }} result{{ (items?.length ?? 0) === 1 ? '' : 's' }}
                    </p>
                    <p class="font-mono text-body-2 text-subtle mb-5">
                        across {{ repoResults.size }} repositor{{ repoResults.size === 1 ? 'y' : 'ies' }}
                    </p>

                    <nav v-if="repoResults.size" class="repo-list" aria-label="Repositories with matches">
                        <button
                            v-for="[repo, repoItems] in repoResults"
                            :key="repo.name"
                            type="button"
                            class="repo-list-item"
                            @click="repoSelected(repo.name)"
                        >
                            <span class="text-truncate">{{ repo.name }}</span>
                            <span class="font-mono text-subtle">{{ repoItems.length }}</span>
                        </button>
                    </nav>
                </template>

                <v-btn variant="outlined" color="rule" class="mt-5" append-icon="mdi-close" @click="clearSearch">
                    Clear search
                </v-btn>
            </aside>

            <div class="results-main">
                <CodeResultsSkeleton v-if="loading" />

                <v-data-iterator
                    v-else-if="repoResults.size > 0"
                    :items="[...repoResults.keys()]"
                    :items-per-page="8"
                >
                    <template v-slot:default="{ items }">
                        <div class="d-flex flex-column ga-10">
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
                        <div v-if="pageCount > 1" class="pager font-mono">
                            <span class="text-subtle text-body-2">Page {{ page }} of {{ pageCount }}</span>
                            <span class="d-flex">
                                <v-btn :disabled="page === 1" variant="outlined" color="rule" prepend-icon="mdi-arrow-left" @click="prevPage">Prev</v-btn>
                                <v-btn :disabled="page >= pageCount" variant="flat" color="rule" append-icon="mdi-arrow-right" class="pager-next" @click="nextPage">Next</v-btn>
                            </span>
                        </div>
                    </template>
                </v-data-iterator>

                <div v-else class="empty-state">
                    <p class="font-display empty-title mb-2">No matches for <code class="font-mono">{{ term }}</code></p>
                    <p class="text-body-2 text-subtle mb-0">Try a broader term, add a qualifier from the syntax list, or pick one of the searches below.</p>
                </div>
            </div>
        </section>

        <section aria-labelledby="browse-title">
            <div class="browse-head">
                <span class="font-mono text-primary text-body-2">{{ sectionIndex('browse') }}</span>
                <h2 id="browse-title" class="side-title font-display">Browse</h2>
                <p class="text-body-2 text-subtle mb-0">
                    Not sure what to search for? Start with one of these, grouped by the part of the stack they cover.
                </p>
            </div>
            <SearchCategories
                :rate-limited="rateLimited"
                :loading="loading"
                @category-selected="onCategorySelected"
            />
        </section>

        <CtaPanel
            class="mt-16"
            eyebrow="Another tool on this site"
            title="Turn JSON into typed code."
            text="Paste a JSON payload and get C# and TypeScript DTOs back, generated with NJsonSchema."
        >
            <v-btn color="inverse-ink" variant="flat" size="x-large" to="/generate-code">
                Generate code
            </v-btn>
            <v-btn color="inverse-ink" variant="outlined" size="x-large" prepend-icon="mdi-github" href="https://github.com/robsmitha?tab=repositories" target="_blank">
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
const searchField = ref<{ focus: () => void } | null>(null)

// Dialog
const dialog = ref(false)
const selectedRepo = ref<GithubRepo>()

// Qualifier examples. Clicking one adds it to the query, so they can be combined.
const syntaxExamples = [
    { query: 'language:csharp', text: 'Only files in one language' },
    { query: 'repo:robsmitha/CapitolSharp', text: 'Scope to a single repository' },
    { query: '"exact phrase"', text: 'Match words in order' },
    { query: 'NOT test', text: 'Boolean AND, OR, NOT' },
    { query: 'path:src/components', text: 'Limit to a folder' },
    { query: 'extension:vue', text: 'Match by file extension' },
]

function addToQuery(query: string) {
    const current = term.value.trim()
    term.value = current ? `${current} ${query}` : query
    searchField.value?.focus()
}

// Sections are numbered in order, so the numbers shift once results appear above Browse.
function sectionIndex(section: 'syntax' | 'results' | 'browse') {
    const order = ['syntax', ...(hasSearched.value ? ['results'] : []), 'browse']
    return String(order.indexOf(section) + 1).padStart(2, '0')
}

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

/* Header */
.hero-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1.5rem 4rem;
}

.hero-title {
    flex: 2 1 480px;
    margin: 0;
    font-size: clamp(3rem, 7vw + 0.5rem, 6.5rem);
    line-height: 0.92;
}

.hero-text {
    flex: 1 1 300px;
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.55;
    color: rgb(var(--v-theme-muted));
}

.hero-stats {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 1rem 3rem;
}

.hero-stat {
    margin-right: 0.5rem;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.03em;
}

.docs-link {
    margin-left: auto;
    color: inherit;
    text-decoration: underline;
}

/* Section headings that sit in a left column */
.side-head {
    min-width: 0;
}

.side-title {
    margin: 0.25rem 0 0;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
}

/* Query syntax band */
.syntax-band {
    background: rgb(var(--v-theme-surface-raised));
    border-bottom: 1px solid rgb(var(--v-theme-rule));
}

.syntax-layout,
.results-layout {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 2rem 4rem;
}

.syntax-layout {
    padding-top: 3.5rem;
    padding-bottom: 3.5rem;
}

.syntax-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    border-top: 1px solid rgb(var(--v-theme-rule));
    border-left: 1px solid rgb(var(--v-theme-rule));
}

.syntax-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.125rem 1.25rem;
    text-align: left;
    border-right: 1px solid rgb(var(--v-theme-rule));
    border-bottom: 1px solid rgb(var(--v-theme-rule));
    background: rgb(var(--v-theme-surface));
    color: inherit;
    transition: background-color 0.15s ease;
}

.syntax-item code {
    font-size: 0.875rem;
    word-break: break-word;
}

.syntax-item:hover,
.syntax-item:focus-visible {
    background: rgb(var(--v-theme-background));
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
}

/* Results */
.results {
    scroll-margin-top: 80px;
}

.query-pill {
    display: inline-block;
    padding: 4px 10px;
    font-size: 0.8125rem;
    word-break: break-word;
    background: rgba(var(--v-theme-primary), 0.12);
}

.repo-list {
    border-top: 1px solid rgb(var(--v-theme-rule));
}

.repo-list-item {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 0;
    font-size: 0.875rem;
    text-align: left;
    border-bottom: 1px solid rgb(var(--v-theme-border));
    color: inherit;
}

.repo-list-item:hover,
.repo-list-item:focus-visible {
    color: rgb(var(--v-theme-primary));
    outline: none;
}

.pager {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    margin-top: 2.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgb(var(--v-theme-rule));
}

.pager-next {
    margin-left: -1px;
}

.empty-state {
    padding: 2.5rem 2rem;
    border: 1px dashed rgb(var(--v-theme-rule));
}

.empty-title {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.empty-state code {
    color: rgb(var(--v-theme-primary));
    word-break: break-word;
}

/* Browse */
.browse-head {
    display: grid;
    gap: 0.5rem;
    margin-bottom: 2rem;
    padding-top: 1.25rem;
    border-top: 2px solid rgb(var(--v-theme-rule));
}

@media (max-width: 960px) {
    .syntax-layout,
    .results-layout {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .docs-link {
        margin-left: 0;
    }
}
</style>
