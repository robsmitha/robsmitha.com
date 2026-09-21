<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <section class="repo-hero bg-light-navy">
        <v-container v-if="repo.loading" class="py-10">
            <v-skeleton-loader
                type="heading, paragraph, heading"
                color="surface"
            ></v-skeleton-loader>
        </v-container>
        <v-container v-else class="py-10">
            <v-row>
                <v-col>
                    <div class="d-flex align-center flex-wrap ga-3">
                        <v-icon color="primary" size="28">mdi-folder-outline</v-icon>
                        <span :class="titleClass" class="text-lightest-slate">
                            {{ repo.success ? repo.data.name : "Failed to load repo." }}
                        </span>
                        <v-chip v-if="repo.data?.language" size="small" variant="outlined" color="primary" class="font-mono">
                            <v-avatar start size="16" tile><Devicon :icon="repo.data.language" /></v-avatar>
                            {{ repo.data.language }}
                        </v-chip>
                        <v-spacer />
                        <div class="d-flex ga-1">
                            <v-btn v-if="repo.data?.homepage" target="_blank" rel="noopener noreferrer" icon="mdi-web" variant="text" color="lightest-slate" :href="repo.data.homepage"></v-btn>
                            <v-btn target="_blank" rel="noopener noreferrer" icon="mdi-github" variant="text" color="lightest-slate" :href="repo.data?.html_url"></v-btn>
                        </div>
                    </div>
                    <v-divider class="mt-5 mb-4" thickness="4" length="48" color="primary" />
                    <p class="text-body-1 text-slate" style="max-width: 640px;">
                        {{ repo.data?.description}}
                    </p>

                    <div v-if="repo.success" class="d-flex flex-wrap ga-8 mt-10 repo-stats">
                        <div v-for="s in repoStats" :key="s.label">
                            <span class="font-mono text-h5 text-lightest-slate font-weight-bold d-block">{{ s.value }}</span>
                            <span class="font-mono text-caption text-slate text-uppercase">{{ s.label }}</span>
                        </div>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <SearchField
                        v-if="repo.success"
                        :label="`Search ${repo.data?.name}`"
                        :term="term"
                        :rate-limited="rateLimited"
                        :dark="true"
                        :show-details="true"
                        :loading="loading"
                        @input="term = $event"
                        @search="searchGitHub"
                        @clear="clearSearch"
                        @authorize="authorizeGitHubApp" />
                </v-col>
            </v-row>
            <v-row v-if="repo.success && repo.data.topics?.length">
                <v-col>
                    <v-chip
                    v-for="t in repo.data.topics"
                    :key="t"
                    variant="outlined"
                    color="slate"
                    size="small"
                    class="font-mono mr-2 mb-2 topic-chip"
                    @click="searchTopic(t)">
                    {{ t }}
                </v-chip>
                </v-col>
            </v-row>
        </v-container>
    </section>

    <v-container class="py-10">
        <div class="d-flex align-center mb-6 section-heading">
            <span class="font-mono text-primary text-body-2 mr-3">01.</span>
            <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">
                Code Breakdown
            </h3>
            <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
        </div>
        <template v-if="languages.loading">
            <v-skeleton-loader
            type="heading, list-item-avatar-three-line"
            color="surface"
            class="rounded-lg"
            width="300px"
            ></v-skeleton-loader>
        </template>
        <ErrorMessage  v-else-if="!languages.success" message="Could not load languages" />
        <Languages v-else :languages="languages" @language-selected="searchLanguage" />
    </v-container>

    <v-container class="pt-2 pb-16">
        <div class="d-flex align-center mb-6 section-heading">
            <span class="font-mono text-primary text-body-2 mr-3">02.</span>
            <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">
                Recent Activity
            </h3>
            <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
        </div>
        <v-skeleton-loader v-if="commits.loading"
        type="list-item-avatar-three-line@5"
        color="surface"
        class="rounded-lg"
        width="300px"
        ></v-skeleton-loader>
        <ErrorMessage  v-else-if="!commits.success" message="Could not load commits" />
        <Commits v-else :commits="commits" />
    </v-container>

    <SearchResultsDialog :open="dialog" :loading="loading" :repo="repo.data" :title="`${getWords(term)}`" :results="searchResults" @close="closeDialog" />
</template>

<script setup lang="ts">
import githubClient from '@/api/githubClient'
import elysianClient from '@/api/elysianClient'
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { SearchItem, TextMatch } from '@/components/Code/CodeSearch.types'

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const titleClass = computed(() => ({
    'text-h4': !isMobile.value,
    'text-h5': isMobile.value,
    'font-weight-bold': true
}))

const props = defineProps({
  name: { type: String }
})

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
});

const repoName: string = props.name as string;
const breadcrumbs = [
  {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'REPO',
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
        { value: new Date(d.created_at).getFullYear(), label: 'Since' },
    ]
})

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
    const colors = new Map<string, string>([
        ["C#", "violet"],
        ["TypeScript", "info"],
        ["Vue", "primary"],
        ["HTML", "orange"],
        ["JavaScript", "amber"],
        ["CSS", "secondary"],
        ["SCSS", "secondary"]
    ]);
    const cards: Array<any> = []
    if (data) {
        const keys = Object.keys(data)
        const sum = keys.reduce((s, l) => s + data[l], 0)
        keys.map(l => {
            cards.push({
                language: l,
                lines: data[l],
                percent: Math.round((data[l] / sum) * 100),
                color: colors.get(l) ?? 'secondary'
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
        const date = group.commit.committer.date.split('T')[0];
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
.repo-hero {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.repo-stats > div {
    padding-left: 2rem;
    border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.repo-stats > div:first-child {
    padding-left: 0;
    border-left: none;
}

.topic-chip {
    transition: border-color 0.2s ease, color 0.2s ease;
}

.topic-chip:hover {
    border-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-primary));
}

@media (max-width: 600px) {
    .repo-stats {
        gap: 1.5rem !important;
    }

    .repo-stats > div {
        padding-left: 0;
        border-left: none;
        min-width: 40%;
    }
}
</style>
