<template>
    <v-avatar tile>
        <v-img :src="src" />
    </v-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { map, DeviconDeviconOriginalWordmark } from '@/components/_helpers/Devicons/Devicons'
const props = defineProps(['fileName', 'icon'])


const devicon = computed(() => {
    if(map && props.icon) {
        const key = props.icon.toLowerCase()
        if(map.has(key)) {
            return map.get(key)
        }
    }
    
    return '';
})

const src = computed(() => {
    if(props.fileName){
        return getDevicon(props.fileName)
    }

    const baseUrl = 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/vendor/devicons/'
    switch(devicon.value){
        case undefined:
        case null: 
        case '': 
        return baseUrl + DeviconDeviconOriginalWordmark + ".svg"
    }
    return baseUrl + devicon.value + ".svg"
})




function getDevicon(fileName: string){
    const extension = fileName?.split('.')?.pop() || ''
    let path = 'devicon/devicon-original'
    switch(extension.toLowerCase()){
        case "cs":
        case "csproj":
            path = 'dotnetcore/dotnetcore-original'
            break;  
        case "css":
            path = 'css3/css3-original'
            break;  
        case 'php':
            path = 'php/php-original';
            break;
        case 'java':
            path = 'java/java-original';
            break;
        case 'cshtml':
            path = 'dot-net/dot-net-original-wordmark';
            break;
        case 'less':
            path = 'less/less-plain-wordmark';
            break;
        case 'scss':
            path = 'sass/sass-original';
            break;
        case 'html':
            path = 'html5/html5-original';
            break;
        case 'js':
            path = 'javascript/javascript-original';
            break;
        case 'sh':
            path = 'linux/linux-original';
            break;
        case 'sql':
            path = 'azuresqldatabase/azuresqldatabase-original';
            break;
        case 'yaml':
            path = 'yaml/yaml-original';
            break;
        case 'json':
            path = 'json/json-original';
            break;
        case 'xml':
            path = 'xml/xml-original';
            break;
        case 'vue':
            path = 'vuejs/vuejs-original';
            break;
        case 'py':
            path = 'python/python-original';
            break;
    }
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`
}
</script>