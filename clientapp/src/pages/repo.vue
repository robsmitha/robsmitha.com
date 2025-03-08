<template>
    <v-breadcrumbs bg-color="grey-darken-4" :items="breadcrumbs"></v-breadcrumbs>
    <v-container class="py-7">
        <v-skeleton-loader v-if="repo.loading"
            type="card"
        ></v-skeleton-loader>
        <template v-else>
            <h3 class="text-body-2 text-grey-darken-2 text-uppercase">
                Repository
            </h3>
            <span :class="{
                'text-h4': !isMobile,
                'text-h5': isMobile
            }">
                {{ repo.success ? repo.data.name : "Failed to load repo." }} 
            </span>
            <v-divider class="mt-5 mb-6" thickness="5px" length="50px" />
            
            <template v-if="repo.success">
                <v-chip v-for="(t, i) in repo.data.topics" :key="t" size="small" color="primary" :class="{ 'ml-2': i > 0}">{{ t }}</v-chip>
                <p class="text-body-1 my-4">
                    {{repo.data.description}}
                </p>
                <v-list class="mb-3" density="compact">
                    <v-list-item v-if="repo.data.homepage" target="_blank" rel="noopener noreferrer" :href="repo.data.homepage" rounded="xl">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-open-in-new"></v-icon>
                        </template>
                        <v-list-item-subtitle>Website</v-list-item-subtitle>
                        <v-list-item-title class="text-caption">{{ repo.data.homepage }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item target="_blank" rel="noopener noreferrer" :href="repo.data.html_url" rounded="xl">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-github"></v-icon>
                        </template>
                        <v-list-item-subtitle>GitHub</v-list-item-subtitle>
                        <v-list-item-title class="text-caption">robsmitha/{{ repo.data.name }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon icon="mdi-rocket-launch-outline"></v-icon>
                        </template>
                        <v-list-item-subtitle>Last commit</v-list-item-subtitle>
                        <v-list-item-title class="text-caption">{{ formatter.format(new Date(repo.data.pushed_at)) }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon icon="mdi-rocket-outline"></v-icon>
                        </template>
                        <v-list-item-subtitle>First commit</v-list-item-subtitle>
                        <v-list-item-title class="text-caption">{{ formatter.format(new Date(repo.data.created_at)) }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </template>
            
        </template>
      </v-container>
      <v-container class="py-7">
        <h3 class="text-body-2 text-grey-darken-2 text-uppercase">
            Breakdown
        </h3>
        <span class="text-h4">
            Code 
        </span>
        <v-divider class="mt-5 mb-6" thickness="5px" length="50px" />
        <v-skeleton-loader v-if="repo.loading"
          type="list-item-avatar-three-line"
          width="300px"
        ></v-skeleton-loader>
        <ErrorMessage  v-else-if="!languages.success" message="Could not load languages" />
        <Languages v-else :languages="languages" />
      </v-container>
      <v-container class="pt-7 pb-16">
            <h3 class="text-body-2 text-grey-darken-2 text-uppercase">
                Activity
            </h3>
            <span class="text-h4">
                Commits 
            </span>
            <v-divider class="mt-5 mb-6" thickness="5px" length="50px" />
            <v-skeleton-loader v-if="repo.loading"
            type="list-item-avatar-three-line"
            width="300px"
            ></v-skeleton-loader>
            <ErrorMessage  v-else-if="!commits.success" message="Could not load commits" />
            <Commits v-else :commits="commits" />
      </v-container>
</template>

<script setup lang="ts">
import githubClient from '@/api/githubClient'
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

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
    title: repoName,
    disabled: true
  }
]

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
        ["C#", "deep-purple"],
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
</script>