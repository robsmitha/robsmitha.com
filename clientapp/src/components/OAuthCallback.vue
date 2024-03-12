<template>
    <v-container>
        <v-row>
            <v-col md="6" offset-md="3" cols="12">
                <h1 class="text-xs-center">{{ message }}</h1>
                <v-progress-linear
                    v-if="loading"
                    color="yellow-darken-2"
                    indeterminate
                ></v-progress-linear>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from "@/store/app"

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const message = ref('Requesting access token..')
const loading = ref(true)

watch(store.hasValidAccessToken, async (token: string) => {
    if(token?.length > 0){
        message.value = "Successfully retreived GitHub Access Token!"
    }
})

const code = route.query['code']?.toString()
const state = route.query['state']?.toString()
if (code && state) {
    store.requestGitHubAccessToken(code, state)
        .then(_ => router.push('/code'))
        .catch(_ => {
            message.value = "There was a problem getting the access token. Please try again."
            loading.value = false
        })
} else {
    message.value = "There was a problem with your request. Please try again."
    loading.value = false
}
</script>
  