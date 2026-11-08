<template>
    <div class="experience">
        <div v-for="job in jobs" :key="job.company" class="job">
            <div class="d-flex flex-wrap align-baseline justify-space-between ga-2 mb-1">
                <h3 class="job-company font-display">{{ job.company }}</h3>
                <span class="font-mono text-body-2">{{ job.dates }}</span>
            </div>
            <p class="text-subtle mb-6">{{ job.blurb }}</p>

            <!-- Each role is a row: dates on the left, title and highlights on the right -->
            <div v-for="role in job.roles" :key="role.title" class="role">
                <span class="font-mono text-body-2 text-subtle">{{ role.dates }}</span>
                <div>
                    <p class="role-title mb-1">{{ role.title }}</p>
                    <p v-if="role.summary" class="text-muted text-body-2 mb-2">{{ role.summary }}</p>
                    <ul class="highlights text-muted text-body-2">
                        <li v-for="h in role.highlights" :key="h">{{ h }}</li>
                    </ul>
                </div>
            </div>

            <p class="tech font-mono text-caption text-subtle">{{ job.tech.join(' · ') }}</p>
        </div>

        <div class="job">
            <div class="d-flex flex-wrap align-baseline justify-space-between ga-2 mb-1">
                <h3 class="job-company font-display">Florida State University</h3>
                <span class="font-mono text-body-2">2018</span>
            </div>
            <p class="text-subtle">B.A. in Computer Science</p>
        </div>

        <v-btn
            variant="outlined"
            color="rule"
            size="large"
            append-icon="mdi-arrow-top-right"
            href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf"
            target="_blank"
        >
            Full resume
        </v-btn>
    </div>
</template>

<script setup lang="ts">
const jobs = [
    {
        company: 'JustFOIA',
        dates: '2020 – Present',
        blurb: 'Public records request SaaS platform for local and state governments, special districts, law enforcement, and education.',
        roles: [
            {
                title: 'Senior Software Engineer',
                dates: '2025 – Present',
                summary: 'Technical lead across release engineering, platform architecture, and infrastructure reliability, working between development, QA, operations, and business stakeholders.',
                highlights: [
                    'Own the end-to-end release process, including deployment pipelines, branch strategy, feature flags for controlled rollouts, and onboarding new applications into the deployment process.',
                    'Review and merge pull requests in line with the release schedule, coordinate QA testing windows, and set delivery expectations with stakeholders.',
                    'Lead architecture and technology decisions for core platform features, including the Hangfire job scheduler behind document conversion, redaction, and manipulation workflows.',
                    'Keep the document processing servers healthy by monitoring performance, diagnosing memory and resource issues, and responding to incidents.',
                ]
            },
            {
                title: 'Software Engineer III',
                dates: '2024 – 2025',
                highlights: [
                    'Own the concurrent document processing jobs that redact, extract, convert, and combine 90+ file types. They have generated ~2.5M files and handled ~1M conversions.',
                    'Synchronized ~450 production database schemas with EF Core models, so migration scripts are generated automatically and are fully idempotent.',
                    'Key contributor to refactoring core business applications for a multitenant architecture.',
                ]
            },
            {
                title: 'Software Engineer II',
                dates: '2020 – 2024',
                highlights: [
                    'Worked with a third-party auditor to bring the customer-facing site to Section 508 and WCAG 2.0 AA compliance, securing a VPAT.',
                    'Built a data warehouse spanning 500 client databases, plus 15 Power BI dashboards used by sales, marketing, and leadership.',
                    'Added automated testing and code-coverage reporting to the CI pipeline.',
                ]
            }
        ],
        tech: ['C#', '.NET', 'EF Core', 'SQL Server', 'Hangfire', 'Vue', 'TypeScript', 'Azure DevOps', 'Power BI']
    },
    {
        company: 'Brandt Information Services',
        dates: '2017 – 2020',
        blurb: 'Outdoor recreation licensing and reservations SaaS for state agencies and private clients.',
        roles: [
            {
                title: 'Web Team Lead',
                dates: '2019 – 2020',
                highlights: [
                    'Led a 5-person web team, and recruited, trained, and mentored interns.',
                    'Owned an Android POS integration that replaced a cash-only system at 10 campgrounds with real-time cloud transactions and reporting.',
                    'Produced demos and proposal material that contributed to 5+ new $1M+ contracts.',
                ]
            },
            {
                title: 'Web Developer',
                dates: '2017 – 2019',
                highlights: [
                    'Redesigned the licensing, vehicle registration, and harvest reporting apps mobile-first, cutting UI-related support calls by ~50%.',
                    'Built an e-commerce platform that opened new revenue streams, and automated decal printing to cut labor time by ~90%.',
                ]
            }
        ],
        tech: ['C#', 'ASP.NET MVC', 'SQL Server', 'JavaScript', 'jQuery', 'Bootstrap', 'Android']
    }
]
</script>

<style scoped>
.experience {
    max-width: 900px;
}

.job {
    padding-top: 1.25rem;
    margin-bottom: 3.5rem;
    border-top: 2px solid rgb(var(--v-theme-rule));
}

.job-company {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.role {
    display: grid;
    grid-template-columns: 140px minmax(0, 1fr);
    gap: 1rem;
    padding: 1.125rem 0;
    border-top: 1px solid rgb(var(--v-theme-border));
}

.role-title {
    font-weight: 600;
    color: rgb(var(--v-theme-on-background));
}

.highlights {
    padding-left: 1.1rem;
    line-height: 1.65;
}

.highlights li {
    margin-bottom: 0.35rem;
}

.highlights li::marker {
    color: rgb(var(--v-theme-primary));
}

.tech {
    padding-top: 1rem;
    border-top: 1px solid rgb(var(--v-theme-border));
}

@media (max-width: 600px) {
    .role {
        grid-template-columns: 1fr;
        gap: 0.25rem;
    }
}
</style>
