<template>
    <div class="about">
        <!-- Profile card -->
        <aside class="profile pa-6">
            <div class="portrait-wrap mb-5">
                <span class="portrait-glow" aria-hidden="true"></span>
                <img
                    class="portrait"
                    src="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/images/robsmitha.png"
                    alt="Illustrated portrait of Rob Smitha"
                    width="220"
                    height="220"
                    loading="lazy"
                />
            </div>

            <h3 class="text-lightest-slate text-h6 font-weight-bold text-center mb-1">Rob Smitha</h3>
            <p class="font-mono text-caption text-slate text-center mb-5">Full-stack software engineer</p>

            <ul class="facts mb-5">
                <li v-for="f in facts" :key="f.text" class="d-flex align-center ga-3">
                    <span class="fact-icon flex-shrink-0" :style="{ '--accent': `var(--v-theme-${f.color})` }">
                        <v-icon size="16">{{ f.icon }}</v-icon>
                    </span>
                    <span class="text-body-2 text-light-slate">{{ f.text }}</span>
                </li>
            </ul>

            <div class="d-flex justify-center ga-2">
                <v-btn
                    v-for="l in links"
                    :key="l.label"
                    :icon="l.icon"
                    :href="l.href"
                    :aria-label="l.label"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    color="slate"
                    size="small"
                    class="profile-link"
                ></v-btn>
            </div>
        </aside>

        <!-- Bio and stack -->
        <div class="bio">
            <div class="text-slate about-copy mb-8">
                <p class="mb-4">
                    I'm a full-stack software engineer who has been building enterprise web applications
                    since 2017, mostly SaaS products used by state and local governments, law enforcement,
                    and education clients.
                </p>
                <p class="mb-4">
                    Today I'm a <span class="text-lightest-slate">Senior Software Engineer at JustFOIA</span>,
                    where I own the release process, lead architecture for core platform features like the
                    document processing pipeline that handles 90+ file types, and keep the infrastructure
                    behind it healthy. Before that, I led
                    the web team at <span class="text-lightest-slate">Brandt Information Services</span>,
                    shipping mobile-first redesigns and point-of-sale integrations for state recreation agencies.
                </p>
                <p class="mb-0">
                    I like working across the whole stack, with C# and SQL Server on the back end and Vue
                    and TypeScript on the front end. I care about accessibility, performance, and code
                    that's easy for the next person to change.
                </p>
            </div>

            <div class="font-mono text-primary text-caption text-uppercase mb-4">Tech I work with</div>
            <div class="skills">
                <div v-for="group in skills" :key="group.label">
                    <div class="font-mono text-caption text-light-slate mb-2">{{ group.label }}</div>
                    <div class="d-flex flex-wrap ga-2">
                        <v-chip
                            v-for="s in group.items"
                            :key="s"
                            size="small"
                            variant="outlined"
                            color="slate"
                            class="font-mono"
                        >
                            {{ s }}
                        </v-chip>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const facts = [
    { icon: 'mdi-briefcase-outline', text: 'Senior Software Engineer at JustFOIA', color: 'primary' },
    { icon: 'mdi-school-outline', text: 'B.A. Computer Science, Florida State', color: 'violet' },
    { icon: 'mdi-code-braces', text: 'Building for the web since 2017', color: 'info' },
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
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 3rem;
    align-items: start;
}

.profile {
    position: sticky;
    top: 88px;
    border-radius: 16px;
    background:
        radial-gradient(120% 70% at 50% 0%, rgba(var(--v-theme-violet), 0.16), transparent 60%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

.portrait-wrap {
    position: relative;
    width: 180px;
    height: 180px;
    margin-inline: auto;
}

/* Soft brand-colored glow behind the portrait. */
.portrait-glow {
    position: absolute;
    inset: -18px;
    border-radius: 50%;
    background: conic-gradient(from 200deg, #FC801D, #FE2857, #6B57FF, #56A8F5, #FC801D);
    filter: blur(28px);
    opacity: 0.45;
}

/* The illustration has a white square background, so it's cropped to a circle
   inside the same gradient ring used for the account avatar in the app bar. */
.portrait {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid transparent;
    background:
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-violet)), rgb(var(--v-theme-info))) border-box;
}


.facts {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 0.75rem;
}

.fact-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: rgb(var(--accent));
    background: rgba(var(--accent), 0.14);
}

.profile-link {
    transition: color 0.15s ease, border-color 0.15s ease;
}

.profile-link:hover {
    color: rgb(var(--v-theme-primary)) !important;
}

.about-copy {
    font-size: 1.0625rem;
    line-height: 1.7;
    max-width: 68ch;
}

.skills {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem 2rem;
}

@media (max-width: 960px) {
    .about {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .profile {
        position: static;
        max-width: 420px;
        width: 100%;
        margin-inline: auto;
    }
}

@media (max-width: 600px) {
    .skills {
        grid-template-columns: 1fr;
    }
}
</style>
