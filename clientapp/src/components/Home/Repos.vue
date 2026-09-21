<template>
    <v-sheet color="background" class="pt-4 pb-16">
        <div class="d-flex align-center mb-8 section-heading">
            <span class="font-mono text-primary text-h6 mr-3">01.</span>
            <h2 class="text-lightest-slate text-h4 font-weight-bold text-nowrap">
                GitHub Repos
            </h2>
            <v-divider class="ml-6 flex-grow-1" color="lightest-navy" thickness="1"></v-divider>
        </div>

        <v-row v-if="loading">
            <v-col v-for="i in 3" :key="i"
                cols="12"
                sm="6"
                md="4"
            >
                <v-skeleton-loader
                    ref="skeleton"
                    :type="type"
                    color="surface"
                    class="mx-auto"
                ></v-skeleton-loader>
            </v-col>
        </v-row>
        <v-data-iterator
            v-else
            :items="filteredRepos"
            :items-per-page="isMobile ? 3 : 9"
        >
            <template v-slot:header>
                <v-row align="center" class="mb-2">
                    <v-col cols="12" md="7" class="d-flex flex-wrap ga-2">
                        <v-chip
                            :variant="activeLanguage === null ? 'flat' : 'outlined'"
                            :color="activeLanguage === null ? 'primary' : 'slate'"
                            class="font-mono"
                            size="small"
                            @click="activeLanguage = null"
                        >
                            All ({{ displayRepos.length }})
                        </v-chip>
                        <v-chip
                            v-for="lang in languages"
                            :key="lang"
                            :variant="activeLanguage === lang ? 'flat' : 'outlined'"
                            :color="activeLanguage === lang ? 'primary' : 'slate'"
                            class="font-mono"
                            size="small"
                            @click="activeLanguage = activeLanguage === lang ? null : lang"
                        >
                            {{ lang }}
                        </v-chip>
                    </v-col>
                    <v-col cols="12" md="5">
                        <v-text-field
                            v-model="search"
                            density="comfortable"
                            placeholder="Filter repos"
                            prepend-inner-icon="mdi-magnify"
                            variant="outlined"
                            color="primary"
                            base-color="slate"
                            class="font-mono"
                            rounded="lg"
                            clearable
                            hide-details
                        ></v-text-field>
                    </v-col>
                </v-row>
            </template>

            <template v-slot:default="{ items }">
                <v-row v-if="items.length">
                    <v-col
                    v-for="repo in items"
                    :key="repo.raw.name"
                    cols="12"
                    sm="6"
                    md="4"
                    >
                        <RepoItem :repo="repo.raw" @repo-selected="repoSelected" />
                    </v-col>
                </v-row>
                <v-row v-else justify="center" class="py-8 text-center">
                    <v-col cols="12" sm="6">
                        <v-icon size="40" class="mb-2 text-lightest-navy">mdi-source-repository-multiple</v-icon>
                        <p class="text-body-2 text-slate">
                            No repos match{{ search ? ` "${search}"` : '' }}{{ activeLanguage ? ` in ${activeLanguage}` : '' }}. Try a different filter.
                        </p>
                    </v-col>
                </v-row>
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
    </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGithubStore } from "@/store/github"
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)
const router = useRouter()

const store = useGithubStore()
store.fetchRepos()

const type = 'article'

const search = ref<string>('')
const activeLanguage = ref<string | null>(null)

const loading = computed(() => store.repos?.length === 0)
const displayRepos = computed(() => {
  const sortedRepos = [...(store.repos || [])].sort((a, b) => {
    return Number(new Date(b.pushed_at)) - Number(new Date(a.pushed_at));
  });

  return sortedRepos.filter(r => r.description?.length > 0);
});

// Language chips are built from whatever's actually in the fetched repos, not a fixed list.
const languages = computed(() => {
  const set = new Set(displayRepos.value.map(r => r.language).filter(Boolean));
  return Array.from(set).sort();
});

const filteredRepos = computed(() => {
  return displayRepos.value.filter(r => {
    const matchesLanguage = !activeLanguage.value || r.language === activeLanguage.value;
    const term = search.value?.toLowerCase();
    const matchesSearch = !term ||
      r.name.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term);
    return matchesLanguage && matchesSearch;
  });
});

function repoSelected(name: string){
    router.push(`repo/${name}`)
}
</script>
