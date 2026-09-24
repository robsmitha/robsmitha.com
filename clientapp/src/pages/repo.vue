<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <PageHero :eyebrow="`> github.com/robsmitha/${repoName}`" tone="navy" art="editor">
        <!-- Hero placeholder, laid out like the loaded hero below. -->
        <div v-if="repo.loading" aria-busy="true" aria-label="Loading repository">
            <div class="d-flex ga-2 mb-4">
                <v-skeleton-loader v-for="w in [96, 84, 120]" :key="w" type="chip" class="hero-bone" :style="{ width: `${w}px` }" />
            </div>
            <v-skeleton-loader type="heading" class="hero-bone hero-bone--title mb-4" style="width: 55%" />
            <v-skeleton-loader type="text" class="hero-bone hero-bone--line mb-2" style="width: 85%" />
            <v-skeleton-loader type="text" class="hero-bone hero-bone--line mb-8" style="width: 60%" />
            <div class="d-flex ga-8 mb-8">
                <v-skeleton-loader v-for="i in 4" :key="i" type="heading" class="hero-bone hero-bone--stat" />
            </div>
            <v-skeleton-loader type="image" class="hero-bone hero-bone--field" />
        </div>

        <div v-else-if="!repo.success">
            <h1 class="hero-title font-weight-bold mb-3">{{ repoName }}</h1>
            <p class="hero-text mb-6">
                This repository couldn't be loaded from GitHub. It may be private or renamed, or GitHub's rate limit may have been reached.
            </p>
            <v-btn color="white" variant="flat" rounded="pill" class="text-none" to="/">Back to all projects</v-btn>
        </div>

        <template v-else>
            <div class="d-flex align-center flex-wrap ga-2 mb-4">
                <span v-if="repo.data.language" class="hero-pill font-mono text-caption">
                    <v-avatar size="16" class="pill-icon"><Devicon :icon="repo.data.language" /></v-avatar>
                    {{ repo.data.language }}
                </span>
                <span v-if="repo.data.license?.spdx_id && repo.data.license.spdx_id !== 'NOASSERTION'" class="hero-pill font-mono text-caption">
                    <v-icon size="14">mdi-scale-balance</v-icon>{{ repo.data.license.spdx_id }}
                </span>
                <span class="hero-pill font-mono text-caption">
                    <span class="status-dot" :class="isActive ? 'bg-green' : 'bg-slate'"></span>
                    Updated {{ moment(repo.data.pushed_at).fromNow() }}
                </span>
                <span v-if="repo.data.fork" class="hero-pill font-mono text-caption">Fork</span>
                <span v-if="repo.data.archived" class="hero-pill font-mono text-caption text-amber">Archived</span>
            </div>

            <h1 class="hero-title font-weight-bold mb-3">{{ repo.data.name }}</h1>
            <p v-if="repo.data.description" class="hero-text mb-5">{{ repo.data.description }}</p>

            <div v-if="repo.data.topics?.length" class="d-flex flex-wrap ga-2 mb-6">
                <button
                    v-for="t in repo.data.topics"
                    :key="t"
                    type="button"
                    class="topic-pill font-mono text-caption"
                    @click="searchTopic(t)"
                >
                    #{{ t }}
                </button>
            </div>

            <div class="d-flex flex-wrap ga-8 mb-6">
                <div v-for="s in repoStats" :key="s.label">
                    <span class="font-mono text-h5 font-weight-bold d-block">{{ s.value }}</span>
                    <span class="font-mono text-caption hero-label">{{ s.label }}</span>
                </div>
            </div>

            <div class="d-flex flex-wrap ga-3 mb-8">
                <v-btn color="white" variant="flat" rounded="pill" class="text-none" prepend-icon="mdi-github" :href="repo.data.html_url" target="_blank" rel="noopener noreferrer">
                    View on GitHub
                </v-btn>
                <v-btn v-if="repo.data.homepage" color="white" variant="outlined" rounded="pill" class="text-none" append-icon="mdi-open-in-new" :href="repo.data.homepage" target="_blank" rel="noopener noreferrer">
                    Live site
                </v-btn>
            </div>

            <SearchField
                :label="`Search ${repo.data.name}`"
                :term="term"
                :rate-limited="rateLimited"
                :dark="true"
                :show-details="true"
                :loading="loading"
                @input="term = $event"
                @search="searchGitHub"
                @clear="clearSearch"
                @authorize="authorizeGitHubApp" />
        </template>
    </PageHero>

    <v-container class="repo-body py-12">
        <section class="mb-14">
            <SectionHeading index="01" title="Languages" />
            <div v-if="languages.loading" aria-busy="true" aria-label="Loading languages">
                <v-skeleton-loader type="text" class="bone bone--bar mb-3" />
                <v-skeleton-loader type="text" class="bone bone--caption mb-6" style="width: 260px" />
                <div class="bone-grid">
                    <v-skeleton-loader v-for="i in 4" :key="i" type="image" class="bone bone--card" />
                </div>
            </div>
            <p v-else-if="!languages.success" class="text-slate text-body-2">Couldn't load languages from GitHub.</p>
            <Languages v-else :languages="languages" @language-selected="searchLanguage" />
        </section>

        <section class="mb-14">
            <SectionHeading index="02" title="Activity" />
            <div v-if="commits.loading" class="d-flex flex-wrap ga-8" aria-busy="true" aria-label="Loading activity">
                <div class="d-flex flex-wrap ga-6 flex-grow-1">
                    <v-skeleton-loader v-for="i in 4" :key="i" type="heading" class="bone bone--stat" />
                </div>
                <v-skeleton-loader type="image" class="bone bone--heatmap" />
            </div>
            <p v-else-if="!commits.success" class="text-slate text-body-2">Couldn't load commits from GitHub.</p>
            <CommitActivity v-else :commits="allCommits" />
        </section>

        <section>
            <SectionHeading index="03" title="Commits" />
            <div v-if="commits.loading" aria-busy="true" aria-label="Loading commits">
                <div v-for="g in 2" :key="g" class="bone-day">
                    <v-skeleton-loader type="text" class="bone bone--caption mb-3" style="width: 200px" />
                    <v-skeleton-loader v-for="r in 2" :key="r" type="image" class="bone bone--commit mb-3" />
                </div>
            </div>
            <Commits v-else-if="commits.success" :commits="commits" />
        </section>

        <CtaPanel
            class="mt-12"
            tone="teal"
            art="editor"
            eyebrow="Keep exploring"
            title="Search across every repo."
            text="Code search looks through all of my public repositories at once, with GitHub's full query syntax."
        >
            <v-btn color="white" variant="flat" rounded="pill" size="large" class="text-none" to="/code">
                Search code
            </v-btn>
            <v-btn color="white" variant="outlined" rounded="pill" size="large" class="text-none" to="/">
                All projects
            </v-btn>
        </CtaPanel>
    </v-container>

    <SearchResultsDialog :open="dialog" :loading="loading" :repo="repo.data" :title="`${getWords(term)}`" :results="searchResults" @close="closeDialog" />
</template>

<script setup lang="ts">
import githubClient from '@/api/githubClient'
import elysianClient from '@/api/elysianClient'
import { ref, computed, onMounted } from 'vue'
import { SearchItem } from '@/components/Code/CodeSearch.types'
import moment from 'moment'

const props = defineProps({
  name: { type: String }
})

const repoName: string = props.name as string;
const breadcrumbs = [
  {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: repoName.toUpperCase(),
    disabled: true
  }
]

// Repository info
const repo = ref<any>({
    loading: true,
    success: false,
    data: null
})

const languages = ref<any>({
    loading: true,
    success: false,
    data: null
})

const commits = ref<any>({
    loading: true,
    success: false,
    data: null
})

// Stat strip driven entirely by the fetched repo, echoing the homepage's hero stats.
const repoStats = computed(() => {
    if (!repo.value.success) return []
    const d = repo.value.data
    return [
        { value: d.stargazers_count ?? 0, label: 'Stars' },
        { value: d.forks_count ?? 0, label: 'Forks' },
        { value: d.open_issues_count ?? 0, label: 'Open issues' },
        { value: new Date(d.created_at).getFullYear(), label: 'Created' },
    ]
})

// Pushed to in the last 30 days.
const isActive = computed(() => repo.value.success && moment().diff(moment(repo.value.data.pushed_at), 'days') <= 30)

// Flat list of fetched commits, newest first, for the activity summary.
const allCommits = computed(() => commits.value.success ? commits.value.data.flatMap((g: any) => g.commits) : [])

// Search
const loading = ref(false)
const term = ref('')
const rateLimited = ref(false)
const searchResults = ref<SearchItem[]>()


// File Dialog
const dialog = ref(false)

onMounted(() => {
    getRepo()
    getLanguages()
    getCommits()
})

async function getRepo() {
    const data = await githubClient.getRepo(repoName)
    repo.value =  {
        loading: false,
        success: data !== null,
        data: data
    };
}

async function getLanguages(){
    const data = await githubClient?.getLanguages(repoName)
    const cards: Array<any> = []
    if (data) {
        // GitHub reports bytes of code per language; show the largest first.
        const keys = Object.keys(data).sort((a, b) => data[b] - data[a])
        const sum = keys.reduce((s, l) => s + data[l], 0)
        keys.forEach(l => {
            cards.push({
                language: l,
                bytes: data[l],
                percent: Math.round((data[l] / sum) * 100)
            })
        })
    }

    languages.value = {
        loading: false,
        success: data !== null,
        data: cards
    }
}

async function getCommits(){
    const data = await githubClient?.getCommits(repoName)
    const dates = data !== null ? data.reduce((groups: any, group: any) => {
        const date = moment(group.commit.committer.date).format('YYYY-MM-DD');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(group);
        return groups;
    }, {})
    : [];

    const commitGroups = Object.keys(dates).map((date) => {
        return {
            date,
            commits: dates[date]
        };
    });

    commits.value = {
        loading: false,
        success: commitGroups !== null,
        data: commitGroups
    }
}

async function authorizeGitHubApp(): Promise<void> {
    loading.value = true
    const response = await elysianClient?.getData(`/api/GitHubOAuthUrl`);
    if (!response?.success){
        throw new Error();
    }
    window.location = response.data.oAuthUrl
    loading.value = false;
}

async function searchGitHub(): Promise<void> {
    dialog.value = true
    loading.value = true
    const scopedTerm = `${term.value} repo:robsmitha/${repo.value.data.name}`;
    const response = await elysianClient?.getData(`/api/githubSearch?term=${encodeURIComponent(scopedTerm)}`)
    if (!response?.success) {
        rateLimited.value = response?.errors?.has('RATE_LIMIT') ?? false
    } else {
        const files = response.data.items?.map((i: any) => ({
            sha: i.sha,
            name: i.name,
            path: i.path,
            html_url: i.htmlUrl,
            repo_name: i.repository.name,
            repo_description: i.repository.description,
            text_matches: i.textMatches
        }) as SearchItem);

        searchResults.value = files;
    }

    loading.value = false
}

async function searchTopic(topic: string) {
    const map = new Map<string, string>([
        ["azure-functions", "HttpTrigger"],
        ["api-wrapper", "HttpClient"],
        ["dotnetcore", "language:csharp"],
        ["dotnet-core", "language:csharp"],
        ["dotnet", "language:csharp"],
        ["cqrs", "MediatR language:csharp"],
        ["reactjs", "React language:javascript"],
        ["entity-framework-core", "EntityFrameworkCore language:csharp"]
    ])
    term.value = `${map.has(topic) ? map.get(topic) : topic}`
    await searchGitHub()
}

async function searchLanguage(language: string) {
    const map = new Map<string, string>([
        ["C#", "csharp"]
    ])
    term.value = `language:${map.has(language) ? map.get(language) : language}`
    await searchGitHub()
}

function clearSearch(){
    searchResults.value = []
}

function closeDialog(){
    dialog.value = false
    clearSearch()
}

function getWords(str: string){
    if(!str) {
        return '';
    }

    // Extracting words using regular expression
    let words = str.split(/\s+OR\s+|(?=language:)|(?=extension:)/);

    // Removing "language:" and "extension:" tokens and their values
    words = words.map(word => word.replace(/(language|extension):/, '').replace(/\s+.+$/, ''));
    return words;
}

</script>

<style scoped>
.repo-body {
    max-width: 1100px;
}

.hero-title {
    font-size: clamp(1.8rem, 2vw + 1rem, 2.6rem);
    line-height: 1.1;
    word-break: break-word;
}

.hero-text {
    max-width: 56ch;
    opacity: 0.82;
}

.hero-label {
    opacity: 0.7;
}

.hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.85);
}

/* Devicon renders its own 40px avatar; shrink it to fit the pill. */
.pill-icon :deep(.v-avatar) {
    width: 14px !important;
    height: 14px !important;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.topic-pill {
    padding: 3px 10px;
    border-radius: 999px;
    color: rgb(var(--v-theme-info));
    background: rgba(var(--v-theme-info), 0.14);
    border: 1px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.topic-pill:hover,
.topic-pill:focus-visible {
    border-color: rgb(var(--v-theme-info));
    outline: none;
}

/* Placeholder bones: strip Vuetify's built-in margins and tone the color down
   (the theme's border-opacity of 1 would otherwise make every bone solid white). */
.bone,
.hero-bone {
    background: transparent;
}

.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__heading),
.bone :deep(.v-skeleton-loader__image) {
    margin: 0;
    max-width: none;
    width: 100%;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.hero-bone :deep(.v-skeleton-loader__chip),
.hero-bone :deep(.v-skeleton-loader__heading),
.hero-bone :deep(.v-skeleton-loader__text),
.hero-bone :deep(.v-skeleton-loader__image) {
    margin: 0;
    max-width: none;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
}

.hero-bone :deep(.v-skeleton-loader__chip) {
    height: 24px;
}

.hero-bone--title :deep(.v-skeleton-loader__heading) {
    height: 36px;
    border-radius: 8px;
}

.hero-bone--line :deep(.v-skeleton-loader__text) {
    height: 14px;
}

.hero-bone--stat {
    width: 64px;
}

.hero-bone--stat :deep(.v-skeleton-loader__heading) {
    height: 44px;
    border-radius: 8px;
}

.hero-bone--field :deep(.v-skeleton-loader__image) {
    height: 56px;
    border-radius: 12px;
}

.bone--bar :deep(.v-skeleton-loader__text) {
    height: 10px;
    border-radius: 999px;
}

.bone--caption :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.bone-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
}

.bone--card :deep(.v-skeleton-loader__image) {
    height: 96px;
    border-radius: 12px;
}

.bone--stat {
    width: 110px;
}

.bone--stat :deep(.v-skeleton-loader__heading) {
    height: 52px;
    border-radius: 8px;
}

.bone--heatmap {
    width: 212px;
}

.bone--heatmap :deep(.v-skeleton-loader__image) {
    height: 150px;
    border-radius: 8px;
}

.bone-day {
    margin-left: 6px;
    padding-left: 1.75rem;
    padding-bottom: 2rem;
    border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.bone--commit :deep(.v-skeleton-loader__image) {
    height: 72px;
    border-radius: 12px;
}
</style>
