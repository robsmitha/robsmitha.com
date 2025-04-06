<template>
    <v-breadcrumbs bg-color="grey-darken-4" :items="breadcrumbs"></v-breadcrumbs>
    
    <v-sheet color="grey-darken-4">
        <v-container v-if="repo.loading">
            <v-skeleton-loader
                type="heading, paragraph, heading"
                color="grey-darken-4"
            ></v-skeleton-loader>
        </v-container>
        <v-container v-else>
            <v-row>
                <v-col>
                    <div class="d-flex">
                        <span :class="{
                            'text-h4': !isMobile,
                            'text-h5': isMobile,
                            'font-weight-bold': true
                        }">
                            {{ repo.success ? repo.data.name : "Failed to load repo." }} 
                        </span>
                        <v-spacer />
                        <v-btn v-if="repo.data?.homepage" target="_blank" rel="noopener noreferrer" icon="mdi-web" variant="text" :href="repo.data.homepage"></v-btn>
                        <v-btn target="_blank" rel="noopener noreferrer" icon="mdi-github" variant="text" :href="repo.data?.html_url"></v-btn>
                    </div>
                    <v-divider class="mt-5 mb-2" thickness="5px" length="50px" />
                    <p class="text-body-1 font-weight-light mt-4">
                        {{ repo.data?.description}}
                    </p>
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
            <v-row v-if="repo.success">
                <v-col>
                    <v-chip 
                    v-for="(t, i) in repo.data.topics" 
                    :key="t"
                    color="white" 
                    pill
                    dark
                    :class="{ 'ml-2': i > 0, 'mb-6': true }"
                    @click="searchTopic(t)">
                    {{ t }}
                </v-chip>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
    
    <v-container class="py-7">
        <h3 class="text-body-2 text-grey-darken-2 text-uppercase">
            Breakdown
        </h3>
        <span class="text-h4">
            Code 
        </span>
        <v-divider class="mt-5 mb-6" thickness="5px" length="50px" />
        <template v-if="languages.loading">
            <v-skeleton-loader
            type="heading, list-item-avatar-three-line"
            class="border-sm h-100 rounded-0"
            width="300px"
            ></v-skeleton-loader>
        </template>
        <ErrorMessage  v-else-if="!languages.success" message="Could not load languages" />
        <Languages v-else :languages="languages" @language-selected="searchLanguage" />
    </v-container>

    <v-container class="pt-7 pb-16">
        <h3 class="text-body-2 text-grey-darken-2 text-uppercase">
            Activity
        </h3>
        <span class="text-h4">
            Commits 
        </span>
        <v-divider class="mt-5 mb-6" thickness="5px" length="50px" />
        <v-skeleton-loader v-if="commits.loading"
        type="list-item-avatar-three-line@5"
        class="border-sm h-100 rounded-0"
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
        ["C#", "deep-purple-lighten-1"],
        ["TypeScript", "blue-darken-3"],
        ["Vue", "teal-darken-2"],
        ["HTML", "orange-darken-3"],
        ["JavaScript", "yellow-darken-1"]
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
                color: colors.get(l)
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
            html_url: i.html_url,
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