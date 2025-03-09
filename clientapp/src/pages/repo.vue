<template>
    <v-breadcrumbs bg-color="grey-darken-4" :items="breadcrumbs"></v-breadcrumbs>
    <v-container class="py-7">
        <v-skeleton-loader v-if="repo.loading"
            type="heading, article, list-item-avatar@3"
            class="border-sm h-100 rounded-0"
        ></v-skeleton-loader>
        <template v-else>
            <v-row>
                <v-col>
                    <h3 class="text-body-2 text-grey-darken-2 text-uppercase">
                        Repository
                    </h3>
                    <div :class="{
                        'text-h4': !isMobile,
                        'text-h5': isMobile
                    }">
                        {{ repo.success ? repo.data.name : "Failed to load repo." }} 
                    </div>
                    <v-divider class="mt-5 mb-0" thickness="5px" length="50px" />
                </v-col>
                <v-col md="3" cols="12">
                    <CodeSearchField 
                        v-if="repo.success"
                        :label="`Search`"
                        :term="term"
                        :rate-limited="rateLimited"
                        :loading="loading"
                        :dark="false"
                        @input="term = $event"
                        @search="searchGitHub"
                        @clear="clearSearch"
                        @authorize="authorizeGitHubApp" />
                </v-col>
            </v-row>
            <v-row v-if="!isMobile">
                <v-col>
                    <v-chip 
                    v-for="(t, i) in repo.data.topics" 
                    :key="t"
                    color="primary" 
                    :class="{ 'ml-2': i > 0, 'mb-6': true }">
                    {{ t }}
                </v-chip>
                </v-col>
            </v-row>
            <v-card v-if="repo.success" variant="flat" class="mx-auto pb-0 border-sm h-100 rounded-0">
                <v-card-text>
                    <p class="text-body-2 font-weight-light text-grey-darken-2">
                        Description
                    </p>
                    <p class="text-body-1 my-4">
                        {{repo.data.description}}
                    </p>
                </v-card-text>
                <v-list class="pb-0" density="compact">
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-icon icon="mdi-rocket-launch-outline"></v-icon>
                        </template>
                        <v-list-item-subtitle>Created on</v-list-item-subtitle>
                        <v-list-item-title class="text-caption">{{ formatter.format(new Date(repo.data.created_at)) }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="repo.data.homepage" target="_blank" rel="noopener noreferrer" :href="repo.data.homepage">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-web"></v-icon>
                        </template>
                        <v-list-item-subtitle>Website</v-list-item-subtitle>
                        <v-list-item-title class="text-caption">{{ repo.data.homepage }}</v-list-item-title>
                        <template v-slot:append>
                            <v-icon icon="mdi-open-in-new" size="small"></v-icon>
                        </template>
                    </v-list-item>
                    <v-list-item target="_blank" rel="noopener noreferrer" :href="repo.data.html_url">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-github"></v-icon>
                        </template>
                        <v-list-item-subtitle>GitHub</v-list-item-subtitle>
                        <v-list-item-title class="text-caption">robsmitha/{{ repo.data.name }}</v-list-item-title>
                        <template v-slot:append>
                            <v-icon icon="mdi-open-in-new" size="small"></v-icon>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card>
            
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
        <template v-if="languages.loading">
            <v-skeleton-loader v-for="i in 3" :key="i"
            type="heading, list-item-avatar-three-line"
            class="border-sm h-100 rounded-0"
            width="300px"
            ></v-skeleton-loader>
        </template>
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
            <v-skeleton-loader v-if="commits.loading"
            type="list-item-avatar-three-line@5"
            class="border-sm h-100 rounded-0"
            width="300px"
            ></v-skeleton-loader>
            <ErrorMessage  v-else-if="!commits.success" message="Could not load commits" />
            <Commits v-else :commits="commits" />
      </v-container>

      <v-dialog v-model="dialog" persistent fullscreen>
        <v-card>
            <v-toolbar color="grey-darken-4">
                <v-toolbar-title>
                    <span class="font-weight-medium">Results for: "{{ term }}"</span>
                </v-toolbar-title>
                <v-spacer />
                <v-btn
                    icon="mdi-close"
                    @click="dialog = false"
                ></v-btn>
            </v-toolbar>
            <v-card-text>
                <v-row>
                    <v-col md="3" cols="12">
                        <template v-if="loading">
                            <v-skeleton-loader
                            type="text"
                            ></v-skeleton-loader>
                        </template>
                        <p v-else-if="fileTree?.length === 0">
                            No results found
                        </p>
                        <template v-else v-for="(item, index) in fileTree" :key="index">
                            <FileItem 
                                :item="item" 
                                :indent="0" 
                                @file-click="selectedItem = $event"
                            />
                        </template>
                    </v-col>
                    <v-col md="9" cols="12" class="pa-0">
                        <FileContent :repo="repo.data.name" :path="selectedItem?.path" />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
      </v-dialog>
</template>

<script setup lang="ts">
import githubClient from '@/api/githubClient'
import elysianClient from '@/api/elysianClient'
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { SearchItem, TreeNode, TreeMap } from '@/components/Code/CodeSearch.types'

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
const fileTree = ref<TreeNode[]>()


// File Dialog
const dialog = ref(false)
const selectedItem = ref<SearchItem | undefined>()

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
        const files = response.data.items.map((i: any) => ({
            sha: i.sha,
            name: i.name,
            path: i.path,
            html_url: i.html_url,
            repo_name: i.repository.name,
            repo_description: i.repository.description,
            text_matches: i.textMatches
        }) as SearchItem);
        fileTree.value = buildFileTree(files)

    }
    
    loading.value = false
}

function clearSearch(){
    fileTree.value = []
    selectedItem.value = undefined
}

async function searchTopic(topic: string) {
    term.value = topic
    await searchGitHub()
}

const buildFileTree = (files: SearchItem[]): TreeNode[] => {
    const tree: TreeNode[] = [];
    const map: TreeMap = {};

    // First pass: create folder structure
    files.forEach(file => {
        const pathParts: string[] = file.path.split('/');
        let currentLevel: TreeNode[] = tree;
        let currentPath: string = '';

        // Process each part of the path
        pathParts.forEach((part: string, index: number) => {
            const isLastPart: boolean = index === pathParts.length - 1;
            currentPath += (index > 0 ? '/' : '') + part;
            
            // Check if this path segment already exists
            let existingNode: TreeNode | undefined = currentLevel.find(item => item.name === part);
            
            if (!existingNode) {
                const newNode: TreeNode = {
                    name: part,
                    path: currentPath,
                    type: isLastPart ? 'file' : 'directory',
                    children: isLastPart ? null : [],
                    fileData: isLastPart ? file : null
                };
                
                currentLevel.push(newNode);
                map[currentPath] = newNode;
                existingNode = newNode;
            } else if (isLastPart && existingNode.type === 'directory') {
                // Edge case: if we have a directory and a file with the same name
                existingNode.type = 'file';
                existingNode.fileData = file;
            }
            
            if (!isLastPart && existingNode.children) {
                currentLevel = existingNode.children;
            }
        });
    });

    return tree;
}
</script>