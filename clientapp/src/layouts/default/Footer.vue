<template>
    <!-- Solid inverse block (black in light mode) with ruled link columns. -->
    <v-footer color="inverse" class="footer d-block pa-0">
        <v-container class="footer-inner">
            <div class="footer-grid">
                <div>
                    <span class="footer-brand font-display">Rob Smitha<span class="footer-accent">.</span></span>
                    <p class="footer-muted text-body-2 mt-2">Building things on the web since 2016.</p>
                </div>

                <nav aria-label="Pages">
                    <p class="footer-label font-mono">Pages</p>
                    <router-link v-for="l in pages" :key="l.to" :to="l.to" class="footer-link">{{ l.title }}</router-link>
                </nav>

                <nav aria-label="External links">
                    <p class="footer-label font-mono">External links</p>
                    <a v-for="l in external" :key="l.href" :href="l.href" target="_blank" rel="noopener" class="footer-link">{{ l.title }} &nearr;</a>
                </nav>

                <nav :aria-label="auth.signedIn ? 'Admin' : 'Sign in'">
                    <template v-if="!auth.signedIn">
                        <p class="footer-label font-mono">Sign in</p>
                        <a href="/.auth/login/aad" class="footer-link">Microsoft</a>
                    </template>
                    <template v-else>
                        <p class="footer-label font-mono text-truncate">{{ auth.userDetails }}</p>
                        <router-link v-for="l in admin" :key="l.to" :to="l.to" class="footer-link">{{ l.title }}</router-link>
                    </template>
                </nav>
            </div>

            <div class="footer-base font-mono">
                <span>&copy; {{ new Date().getFullYear() }} Rob Smitha</span>
                <span class="footer-muted">robsmitha.com</span>
            </div>
        </v-container>
    </v-footer>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/store/auth"
const auth = useAuthStore()

const pages = [
    { title: 'Home', to: '/' },
    { title: 'Search Code', to: '/code' },
    { title: 'Generate Code', to: '/generate-code' },
    { title: 'Congress Feed', to: '/congress' },
]

const external = [
    { title: 'GitHub', href: 'https://github.com/robsmitha' },
    { title: 'LinkedIn', href: 'https://www.linkedin.com/in/robsmitha/' },
    { title: 'Resume', href: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf' },
]

const admin = [
    { title: 'Users', to: '/users' },
    { title: 'Products', to: '/products' },
    { title: 'Dashboard', to: '/dashboard' },
    { title: 'Accounts', to: '/accounts' },
]
</script>

<style scoped>
.footer {
    color: rgb(var(--v-theme-inverse-ink));
}

.footer-inner {
    max-width: 1280px;
    padding: 4rem 2rem 2rem;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2.5rem 2rem;
}

.footer-brand {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.03em;
}

.footer-accent {
    color: rgb(var(--v-theme-inverse-accent));
}

.footer-muted {
    color: rgb(var(--v-theme-inverse-muted));
}

.footer-label {
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    font-size: 0.75rem;
    color: rgb(var(--v-theme-inverse-muted));
    border-bottom: 1px solid rgba(var(--v-theme-inverse-muted), 0.4);
}

.footer-link {
    display: block;
    padding: 0.3rem 0;
    color: rgb(var(--v-theme-inverse-ink));
    text-decoration: none;
}

.footer-link:hover,
.footer-link:focus-visible {
    color: rgb(var(--v-theme-inverse-accent));
}

.footer-base {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 4rem;
    padding-top: 1.25rem;
    font-size: 0.8125rem;
    border-top: 1px solid rgba(var(--v-theme-inverse-muted), 0.4);
}

@media (max-width: 600px) {
    .footer-inner {
        padding: 3rem 1rem 1.5rem;
    }
}
</style>
