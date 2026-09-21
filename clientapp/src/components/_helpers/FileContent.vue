<template>
    <div class="file-content-pane">
        <template v-if="loading">
            <v-skeleton-loader color="surface" class="pa-4" type="heading, paragraph@4, article, paragraph@4">
            </v-skeleton-loader>
        </template>
        <div v-else-if="error" class="d-flex flex-column align-center justify-center pa-12 text-slate">
            <v-icon size="32" class="mb-3 text-lightest-navy">mdi-alert-circle-outline</v-icon>
            <span class="font-mono text-caption">Couldn't load this file</span>
        </div>
        <highlightjs
            v-else-if="code"
            autodetect
            :code="code"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import apiClient from '@/api/elysianClient'

const props = defineProps(['repo', 'path'])

const loading = ref(false)
const error = ref(false)
const code = ref('')

onMounted(() => props.path && loadFile())

watch(() => props.path, (val) => val && loadFile(), { immediate: true, deep: true })

async function loadFile(){
    loading.value = true;
    error.value = false
    code.value = ''

    try {
        const response = await apiClient?.getData(`/api/GitHubRepoContents?repo=${encodeURIComponent(props.repo)}&path=${encodeURIComponent(props.path)}`)
        let html = response?.data

        // Remove github markup
        const startPattern = '^<div id="file" class="[^"]*" data-path="' + props.path.replace(/\//g, "\\/") + '"><div class="plain"><pre style="white-space: pre-wrap">'
        const endPattern = '</pre></div></div>$'
        html = html
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, "\"")
                .replace(/&#0?39;/g, "'")
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
        //html = `${commentPrefix} ${props.repo}/${props.path} ${commentSuffix}\n` + html

        if (!html) {
            error.value = true
        }
        code.value = html
    } catch(e) {
        console.error(e)
        error.value = true
    } finally {
        loading.value = false
    }
}

</script>

