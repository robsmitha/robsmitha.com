<template>
    <div class="tech-strip">
        <v-container class="landing-width">
            <figure class="quote">
                <span class="quote-mark" aria-hidden="true">&ldquo;</span>
                <blockquote class="quote-text">
                    I work across the stack, from SQL Server and .NET on the back end to Vue and TypeScript in the browser.
                </blockquote>
            </figure>
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

/* A short pull quote that introduces the logo strip below it. */
.quote {
    max-width: 62ch;
    margin: 0 auto 2.25rem;
    text-align: center;
}

.quote-mark {
    display: block;
    height: 2.2rem;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 4rem;
    line-height: 1;
    background: linear-gradient(135deg, #FC801D, #FE2857 55%, #6B57FF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.quote-text {
    margin: 0;
    font-size: clamp(1.1rem, 0.6vw + 0.95rem, 1.3rem);
    line-height: 1.55;
    font-weight: 500;
    color: rgb(var(--v-theme-lightest-slate));
    text-wrap: balance;
}

.quote-cite {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 0.75rem;
    color: rgb(var(--v-theme-slate));
    letter-spacing: 0.04em;
}

.quote-rule {
    width: 24px;
    height: 2px;
    border-radius: 2px;
    background: rgb(var(--v-theme-primary));
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
