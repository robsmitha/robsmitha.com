<template>
    <div class="tech-strip">
        <v-container class="landing-width">
            <p class="text-light-slate tech-strip-intro">
                I work across the stack, from SQL Server and .NET on the back end to Vue and TypeScript in the browser.
            </p>
        </v-container>
        <div class="marquee" aria-label="Technologies I use">
            <ul class="marquee-track">
                <!-- The list is rendered twice so the scroll can loop seamlessly. -->
                <li v-for="(t, i) in [...tech, ...tech]" :key="`${t.name}-${i}`" :aria-hidden="i >= tech.length">
                    <img :src="iconUrl(t.icon)" alt="" width="40" height="40" loading="lazy" />
                    <span class="font-mono text-caption">{{ t.name }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
const tech = [
    { name: 'C#', icon: 'csharp/csharp-original' },
    { name: '.NET', icon: 'dotnetcore/dotnetcore-original' },
    { name: 'SQL Server', icon: 'microsoftsqlserver/microsoftsqlserver-original' },
    { name: 'TypeScript', icon: 'typescript/typescript-original' },
    { name: 'JavaScript', icon: 'javascript/javascript-original' },
    { name: 'Vue', icon: 'vuejs/vuejs-original' },
    { name: 'Vuetify', icon: 'vuetify/vuetify-original' },
    { name: 'React', icon: 'react/react-original' },
    { name: 'Vite', icon: 'vitejs/vitejs-original' },
    { name: 'Azure', icon: 'azure/azure-original' },
    { name: 'Azure DevOps', icon: 'azuredevops/azuredevops-original' },
    { name: 'GitHub Actions', icon: 'githubactions/githubactions-original' },
    { name: 'Docker', icon: 'docker/docker-original' },
    { name: 'HTML', icon: 'html5/html5-original' },
    { name: 'CSS', icon: 'css3/css3-original' },
    { name: 'Android', icon: 'android/android-original' },
]

const iconUrl = (path: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`
</script>

<style scoped>
.tech-strip {
    padding: 3.5rem 0 1rem;
}

.landing-width {
    max-width: 1100px;
}

.tech-strip-intro {
    max-width: 52ch;
    font-size: 1.0625rem;
    line-height: 1.6;
    margin-bottom: 2rem;
}

.marquee {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

.marquee-track {
    display: flex;
    gap: 3.5rem;
    width: max-content;
    list-style: none;
    padding: 0.5rem 0;
    animation: marquee 50s linear infinite;
}

.marquee:hover .marquee-track {
    animation-play-state: paused;
}

.marquee-track li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    min-width: 72px;
    color: rgb(var(--v-theme-light-slate));
}

.marquee-track img {
    width: 40px;
    height: 40px;
}

@keyframes marquee {
    to { transform: translateX(calc(-50% - 1.75rem)); }
}

@media (prefers-reduced-motion: reduce) {
    .marquee-track {
        animation: none;
        flex-wrap: wrap;
        width: auto;
        justify-content: center;
    }

    .marquee-track li[aria-hidden="true"] {
        display: none;
    }
}
</style>
