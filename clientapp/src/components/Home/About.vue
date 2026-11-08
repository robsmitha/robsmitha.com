<template>
    <div class="about">
        <!-- Profile card -->
        <aside class="profile">
            <img
                class="portrait"
                src="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/images/robsmitha-avatar.png"
                alt="Illustrated portrait of Rob Smitha"
                width="220"
                height="220"
                loading="lazy"
            />

            <div class="pa-5">
                <h3 class="font-display text-h6 font-weight-bold mb-1">Rob Smitha</h3>
                <p class="font-mono text-caption text-subtle mb-4">Full-stack software engineer</p>

                <ul class="facts mb-5">
                    <li v-for="f in facts" :key="f.text" class="d-flex align-center ga-3">
                        <v-icon size="16" class="text-subtle">{{ f.icon }}</v-icon>
                        <span class="text-body-2 text-muted">{{ f.text }}</span>
                    </li>
                </ul>

                <div class="d-flex justify-center ga-3">
                    <v-btn
                        v-for="l in links"
                        :key="l.label"
                        :icon="l.icon"
                        :href="l.href"
                        :aria-label="l.label"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="rule"
                        rounded="0"
                    ></v-btn>
                </div>
            </div>
        </aside>

        <!-- Bio and stack -->
        <div class="bio">
            <div class="about-copy mb-12">
                <p class="mb-4">
                    I'm a full-stack software engineer who has been building enterprise web applications
                    since 2016, mostly SaaS products used by state and local governments, law enforcement,
                    and education clients.
                </p>
                <p class="mb-4">
                    Today I'm a <strong>Senior Software Engineer at JustFOIA</strong>,
                    where I own the release process, lead architecture for core platform features like the
                    document processing pipeline that handles 90+ file types, and keep the infrastructure
                    behind it healthy. Before that, I led
                    the web team at <strong>Brandt Information Services</strong>,
                    shipping mobile-first redesigns and point-of-sale integrations for state recreation agencies.
                </p>
                <p class="mb-0">
                    I like working across the whole stack, with C# and SQL Server on the back end and Vue
                    and TypeScript on the front end. I care about accessibility, performance, and code
                    that's easy for the next person to change.
                </p>
            </div>

            <!-- Tech I work with, as a ruled table -->
            <dl class="skills">
                <div v-for="group in skills" :key="group.label" class="skill-row">
                    <dt class="font-mono text-caption text-subtle">{{ group.label }}</dt>
                    <dd>{{ group.items.join(', ') }}</dd>
                </div>
            </dl>
        </div>
    </div>
</template>

<script setup lang="ts">
const facts = [
    { icon: 'mdi-briefcase-outline', text: 'Senior Software Engineer at JustFOIA' },
    { icon: 'mdi-school-outline', text: 'B.A. Computer Science, Florida State' },
    { icon: 'mdi-code-braces', text: 'Building for the web since 2016' },
]

const links = [
    { label: 'GitHub', icon: 'mdi-github', href: 'https://github.com/robsmitha' },
    { label: 'LinkedIn', icon: 'mdi-linkedin', href: 'https://www.linkedin.com/in/robsmitha/' },
    { label: 'Resume', icon: 'mdi-file-document-outline', href: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf' },
]

const skills = [
    { label: 'Languages', items: ['C#', 'TypeScript', 'JavaScript', 'SQL', 'HTML/CSS'] },
    { label: 'Frontend', items: ['Vue', 'Vuetify', 'React', 'Vite', 'Razor Pages'] },
    { label: 'Backend', items: ['.NET Web API', 'EF Core', 'SQL Server', 'Hangfire', 'Azure'] },
    { label: 'Tooling', items: ['Azure DevOps', 'GitHub Actions', 'Docker', 'Power BI'] },
]
</script>

<style scoped>
.about {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 4rem;
    align-items: start;
}

.profile {
    position: sticky;
    top: 88px;
    border: 1px solid rgb(var(--v-theme-rule));
    background: rgb(var(--v-theme-surface));
}

/* The illustration has a white background, so it fills the top of the card edge to edge. */
.portrait {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
    border-bottom: 1px solid rgb(var(--v-theme-rule));
}

.facts {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 0.75rem;
}


.about-copy {
    font-size: 1.0625rem;
    line-height: 1.75;
    max-width: 68ch;
    color: rgb(var(--v-theme-muted));
}

.about-copy strong {
    font-weight: 600;
    color: rgb(var(--v-theme-on-background));
}

.skills {
    margin: 0;
    border-top: 1px solid rgb(var(--v-theme-rule));
}

.skill-row {
    display: grid;
    grid-template-columns: 160px minmax(0, 1fr);
    gap: 1rem;
    padding: 0.875rem 0;
    border-bottom: 1px solid rgb(var(--v-theme-border));
}

.skill-row dd {
    margin: 0;
    color: rgb(var(--v-theme-on-background));
}

@media (max-width: 960px) {
    .about {
        grid-template-columns: 1fr;
        gap: 2.5rem;
    }

    .profile {
        position: static;
        max-width: 360px;
        width: 100%;
    }
}

@media (max-width: 600px) {
    .skill-row {
        grid-template-columns: 1fr;
        gap: 0.25rem;
    }
}
</style>
