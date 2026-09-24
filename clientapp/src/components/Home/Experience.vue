<template>
    <div class="experience">
        <div v-for="job in jobs" :key="job.company" class="job">
            <div class="d-flex flex-wrap align-baseline justify-space-between ga-2 mb-1">
                <h3 class="text-lightest-slate text-h6 font-weight-bold">{{ job.company }}</h3>
                <span class="font-mono text-caption text-slate">{{ job.dates }}</span>
            </div>
            <p class="text-slate text-body-2 mb-6">{{ job.blurb }}</p>

            <div v-for="role in job.roles" :key="role.title" class="role mb-6">
                <div class="d-flex flex-wrap align-baseline ga-3 mb-2">
                    <span class="role-title font-weight-medium">{{ role.title }}</span>
                    <span class="font-mono text-caption text-slate">{{ role.dates }}</span>
                </div>
                <p v-if="role.summary" class="text-light-slate text-body-2 mb-2">{{ role.summary }}</p>
                <ul class="highlights text-slate text-body-2">
                    <li v-for="h in role.highlights" :key="h">{{ h }}</li>
                </ul>
            </div>

            <div class="d-flex flex-wrap ga-2">
                <span v-for="t in job.tech" :key="t" class="font-mono text-caption text-light-slate tech">{{ t }}</span>
            </div>
        </div>

        <div class="job">
            <div class="d-flex flex-wrap align-baseline justify-space-between ga-2 mb-1">
                <h3 class="text-lightest-slate text-h6 font-weight-bold">Florida State University</h3>
                <span class="font-mono text-caption text-slate">2018</span>
            </div>
            <p class="text-slate text-body-2">B.A. in Computer Science</p>
        </div>

        <v-btn
            variant="outlined"
            color="primary"
            class="font-mono text-none mt-2"
            append-icon="mdi-open-in-new"
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
    max-width: 820px;
}

.job {
    position: relative;
    padding-left: 1.75rem;
    padding-bottom: 2.5rem;
    border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.job::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0.55rem;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 4px rgb(var(--v-theme-background));
}

.role-title {
    color: rgb(var(--v-theme-info));
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
    padding: 2px 8px;
    border-radius: 4px;
    background: rgb(var(--v-theme-surface));
}
</style>
