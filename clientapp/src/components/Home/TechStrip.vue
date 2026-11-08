<template>
    <div class="tech-strip">
        <v-container class="landing-width">
            <figure class="quote">
                <blockquote class="quote-text font-display">
                    I work across the stack, from SQL Server and .NET on the back end to Vue and TypeScript in the browser.
                </blockquote>
            </figure>
        </v-container>
        <div class="marquee" aria-label="Technologies I use">
            <ul class="marquee-track">
                <!-- The list is rendered twice so the scroll can loop seamlessly. -->
                <li v-for="(t, i) in [...tech, ...tech]" :key="`${t.name}-${i}`" :aria-hidden="i >= tech.length">
                    <img :src="iconUrl(t.icon)" alt="" width="32" height="32" loading="lazy" />
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
    border-bottom: 1px solid rgb(var(--v-theme-rule));
}

.landing-width {
    max-width: 1280px;
    padding: 4rem 2rem 3rem;
}

/* A large pull quote across the full content width. */
.quote {
    margin: 0;
}

.quote-text {
    margin: 0;
    font-size: clamp(1.75rem, 3vw + 0.75rem, 3.5rem);
    line-height: 1.15;
    font-weight: 600;
    letter-spacing: -0.025em;
    color: rgb(var(--v-theme-on-background));
    text-wrap: balance;
}

.marquee {
    overflow: hidden;
    border-top: 1px solid rgb(var(--v-theme-border));
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}

.marquee-track {
    display: flex;
    gap: 3.5rem;
    width: max-content;
    list-style: none;
    padding: 1.5rem 0;
    margin: 0;
    animation: marquee 50s linear infinite;
}

.marquee:hover .marquee-track {
    animation-play-state: paused;
}

.marquee-track li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: rgb(var(--v-theme-subtle));
}

/* Logos are greyscale to keep the page to one accent; they get their color back on hover */
.marquee-track img {
    width: 32px;
    height: 32px;
    filter: grayscale(1);
    opacity: 0.75;
    transition: filter 0.2s ease, opacity 0.2s ease;
}

.marquee-track li:hover img {
    filter: none;
    opacity: 1;
}

@keyframes marquee {
    to { transform: translateX(calc(-50% - 1.75rem)); }
}

@media (max-width: 600px) {
    .landing-width {
        padding: 3rem 1rem 2rem;
    }
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
