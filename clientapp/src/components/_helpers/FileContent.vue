<template>
    <v-card variant="flat">
        <v-card-text class="bg-grey-lighten-4 pa-0">
            <template v-if="loading">
                <v-skeleton-loader color="grey-lighten-4 pa-0" type="heading, paragraph@4, article, paragraph@4">
                </v-skeleton-loader>
            </template>
            <highlightjs
                v-else-if="code"
                autodetect
                :code="code"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import apiClient from '@/api/elysianClient'

const props = defineProps(['repo', 'path'])

const loading = ref(false)
const code = ref('')

onMounted(() => props.path && loadFile())

watch(() => props.path, (val) => val && loadFile(), { immediate: true, deep: true })

async function loadFile(){
    loading.value = true;
    
    try {
        const response = await apiClient?.getData(`/api/GitHubRepoContents?repo=${encodeURIComponent(props.repo)}&path=${encodeURIComponent(props.path)}`)
        let html = response?.data
        
        // Remove github markup
        const startPattern = '^<div id="file" class="[^"]*" data-path="' + props.path.replace(/\//g, "\\/") + '"><div class="plain"><pre style="white-space: pre-wrap">'
        const endPattern = '</pre></div></div>$'
        html = html
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(new RegExp(startPattern, 'g'), '')
                .replace(new RegExp(endPattern, 'g'), '')

        let commentPrefix = ''
        let commentSuffix = ''
        const extension = props.path.split('.').pop() || ''
        switch(extension.toLowerCase()){
            case 'py':
                commentPrefix = '#'
                break
            case 'sql':
                commentPrefix = '--'
                break
            case 'html':
                commentPrefix = '<!--'
                commentSuffix = '-->'
            break
            case 'css':
                commentPrefix = '/*'
                commentSuffix = '*/'
                break
            default:
                commentPrefix = '//'
                break
        }
        html = `${commentPrefix} ${props.repo}/${props.path} ${commentSuffix}\n` + html
        
        code.value = html
    } catch(e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

</script>