<template>
    <v-sheet class="pt-4 pb-16">
        <v-row v-if="loading">
            <v-col v-for="i in 3" :key="i"
                cols="12"
                xl="3"
                md="4"
                sm="6"
            >
                <v-skeleton-loader
                    ref="skeleton"
                    :type="type"
                    class="mx-auto"
                ></v-skeleton-loader>
            </v-col>
        </v-row>
        <v-data-iterator
        :items="displayRepos"
        :items-per-page="isMobile ? 2 : 6"
        :search="search"
        >
        <template v-slot:header>
            <v-row class="mb-6">
                <v-col>
                    <h3 class="text-body-2 text-grey-darken-2 text-uppercase">
                        GitHub
                    </h3>
                    <span class="text-h4 d-block">
                        Repos
                    </span>
                    <v-divider class="mt-4" thickness="5px" length="50px" />
                </v-col>
                <v-col sm="3" cols="12">
                    <v-text-field
                        v-model="search"
                        density="comfortable"
                        placeholder="Filter"
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        rounded
                        clearable
                        hide-details
                    ></v-text-field>
                </v-col>
            </v-row>
        </template>

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
                    <RepoItem :repo="repo.raw" />
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
        <!-- <v-row v-else>
            <v-col
                v-for="repo in displayRepos"
                :key="repo.name"
                cols="12"
                xl="3"
                md="4"
                sm="6"
            >
                <RepoItem :repo="repo" />
            </v-col>
        </v-row> -->
    </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGithubStore } from "@/store/github"
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const store = useGithubStore()
store.fetchRepos()

const type = 'article'

const search = ref<string>('')

const loading = computed(() => store.repos?.length === 0)
const displayRepos = computed(() => {
  const sortedRepos = [...(store.repos || [])].sort((a, b) => {
    return Number(new Date(b.pushed_at)) - Number(new Date(a.pushed_at));
  });
  
  return sortedRepos.filter(r => r.description?.length > 0);
});
</script>