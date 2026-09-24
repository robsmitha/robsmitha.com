<template>
    <v-row>
        <v-col cols="12" md="7" class="text-slate about-copy">
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
            <p>
                I like working across the whole stack, with C# and SQL Server on the back end and Vue
                and TypeScript on the front end. I care about accessibility, performance, and code
                that's easy for the next person to change.
            </p>
        </v-col>

        <v-col cols="12" md="5">
            <div class="font-mono text-primary text-caption text-uppercase mb-4">Tech I work with</div>
            <div v-for="group in skills" :key="group.label" class="mb-4">
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
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
const skills = [
    { label: 'Languages', items: ['C#', 'TypeScript', 'JavaScript', 'SQL', 'HTML/CSS'] },
    { label: 'Frontend', items: ['Vue', 'Vuetify', 'React', 'Vite', 'Razor Pages'] },
    { label: 'Backend', items: ['.NET Web API', 'EF Core', 'SQL Server', 'Hangfire', 'Azure'] },
    { label: 'Tooling', items: ['Azure DevOps', 'GitHub Actions', 'Docker', 'Power BI'] },
]
</script>

<style scoped>
.about-copy {
    font-size: 1.0625rem;
    line-height: 1.7;
}
</style>
