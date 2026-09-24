<template>
    <PageHero eyebrow="> admin / access control" tone="navy" art="arcs" compact>
        <h1 class="hero-title font-weight-bold mb-2">Users</h1>
        <p class="hero-text mb-5">Everyone who has signed in, and what each person is allowed to read, change or delete.</p>
        <div class="d-flex flex-wrap ga-8">
            <div v-for="s in stats" :key="s.label">
                <span class="font-mono text-h6 font-weight-bold d-block">{{ s.value }}</span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
        </div>
    </PageHero>

    <v-container class="admin-body py-10">
        <div class="d-flex align-center flex-wrap ga-3 mb-6">
            <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                placeholder="Filter by name"
                clearable
                hide-details
                density="comfortable"
                variant="outlined"
                color="primary"
                base-color="slate"
                class="font-mono filter-field"
                rounded="lg"
            ></v-text-field>
            <div class="d-flex flex-wrap ga-2">
                <v-chip
                    :variant="provider === null ? 'flat' : 'outlined'"
                    :color="provider === null ? 'lightest-slate' : 'slate'"
                    size="small"
                    class="font-mono"
                    @click="provider = null"
                >
                    All ({{ items.length }})
                </v-chip>
                <v-chip
                    v-for="p in providers"
                    :key="p.name"
                    :variant="provider === p.name ? 'flat' : 'outlined'"
                    :color="provider === p.name ? 'primary' : 'slate'"
                    size="small"
                    class="font-mono"
                    :prepend-icon="providerIcon(p.name)"
                    @click="provider = provider === p.name ? null : p.name"
                >
                    {{ providerName(p.name) }} ({{ p.count }})
                </v-chip>
            </div>
        </div>

        <!-- Placeholder cards laid out like the user cards below. -->
        <div v-if="loading && items.length === 0" class="user-grid" aria-busy="true" aria-label="Loading users">
            <div v-for="i in 6" :key="i" class="user-card pa-5">
                <div class="d-flex align-center ga-3 mb-5">
                    <v-skeleton-loader type="avatar" class="bone bone--avatar" />
                    <div class="flex-grow-1">
                        <v-skeleton-loader type="text" class="bone bone--line mb-2" style="width: 60%" />
                        <v-skeleton-loader type="text" class="bone bone--small" style="width: 35%" />
                    </div>
                </div>
                <v-skeleton-loader type="image" class="bone bone--matrix" />
            </div>
        </div>

        <div v-else-if="filteredUsers.length" class="user-grid">
            <div v-for="u in filteredUsers" :key="u.userId" class="user-card pa-5 d-flex flex-column">
                <div class="d-flex align-center ga-3 mb-5">
                    <span class="initials font-weight-bold flex-shrink-0">{{ initials(u.userName) }}</span>
                    <div class="min-width-0 flex-grow-1">
                        <span class="text-lightest-slate font-weight-bold d-block text-truncate">{{ u.userName }}</span>
                        <span class="font-mono text-caption text-slate d-flex align-center ga-1">
                            <v-icon size="14">{{ providerIcon(u.identityProvider) }}</v-icon>{{ providerName(u.identityProvider) }}
                        </span>
                    </div>
                    <span class="access-pill font-mono text-caption" :class="`text-${accessLevel(u).color}`">
                        {{ accessLevel(u).label }}
                    </span>
                </div>

                <!-- Compact read / write / delete grid for each resource. -->
                <div class="matrix mb-5" role="table" :aria-label="`Permissions for ${u.userName}`">
                    <div class="matrix-row matrix-head font-mono" role="row">
                        <span role="columnheader"></span>
                        <span v-for="a in actions" :key="a" role="columnheader">{{ a[0].toUpperCase() }}</span>
                    </div>
                    <div v-for="r in resources" :key="r" class="matrix-row" role="row">
                        <span class="font-mono text-caption text-light-slate" role="rowheader">{{ capitalize(r) }}</span>
                        <span v-for="a in actions" :key="a" role="cell" :aria-label="`${a}: ${has(u, r, a) ? 'allowed' : 'not allowed'}`">
                            <span class="dot" :class="has(u, r, a) ? `dot--on dot--${a}` : ''"></span>
                        </span>
                    </div>
                </div>

                <v-btn
                    variant="outlined"
                    color="primary"
                    rounded="pill"
                    class="text-none mt-auto align-self-start"
                    prepend-icon="mdi-key-variant"
                    @click="editUser(u)"
                >
                    Manage access
                </v-btn>
            </div>
        </div>

        <div v-else class="empty-state d-flex flex-column align-center py-12 text-center">
            <v-icon size="40" class="mb-3 text-slate">mdi-account-group-outline</v-icon>
            <p class="text-body-2 text-slate mb-0">{{ items.length ? 'No users match this filter.' : 'No users to display.' }}</p>
        </div>
    </v-container>

    <v-dialog v-model="dialog" persistent max-width="640">
        <v-card color="surface" class="dialog-card" rounded="lg">
            <div class="d-flex align-center ga-3 pa-5">
                <span class="initials font-weight-bold flex-shrink-0">{{ initials(selectedUser?.userName ?? '') }}</span>
                <div class="min-width-0 flex-grow-1">
                    <span class="text-lightest-slate text-h6 font-weight-bold d-block text-truncate">{{ selectedUser?.userName }}</span>
                    <span class="font-mono text-caption text-slate">{{ providerName(selectedUser?.identityProvider ?? '') }} &middot; {{ selectedUser?.accessControl.policies.length ?? 0 }} of {{ resources.length * actions.length }} permissions</span>
                </div>
                <v-btn icon="mdi-close" variant="text" color="slate" @click="dialog = false"></v-btn>
            </div>
            <v-divider color="lightest-navy" />

            <div class="pa-5">
                <table class="policy-table w-100">
                    <thead>
                        <tr>
                            <th class="text-left font-mono text-caption text-slate">Resource</th>
                            <th v-for="a in actions" :key="a" class="font-mono text-caption text-slate">{{ capitalize(a) }}</th>
                            <th class="font-mono text-caption text-slate">All</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="r in resources" :key="r">
                            <td class="text-lightest-slate text-body-2">{{ capitalize(r) }}</td>
                            <td v-for="a in actions" :key="a" class="text-center">
                                <v-checkbox-btn
                                    class="d-inline-flex"
                                    :color="actionColor(a)"
                                    :model-value="getPolicy(r, a)"
                                    :aria-label="`${capitalize(a)} ${r}`"
                                    @update:model-value="val => setPolicy(r, a, val)"
                                />
                            </td>
                            <td class="text-center">
                                <v-btn
                                    size="x-small"
                                    variant="text"
                                    color="slate"
                                    class="font-mono text-none"
                                    @click="toggleResource(r)"
                                >
                                    {{ actions.every(a => getPolicy(r, a)) ? 'None' : 'All' }}
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <v-divider color="lightest-navy" />
            <div class="d-flex justify-end ga-2 pa-4">
                <v-btn class="text-none" variant="text" color="slate" rounded="pill" @click="dialog = false">
                    Cancel
                </v-btn>
                <v-btn class="text-none" color="primary" variant="flat" rounded="pill" :loading="loading" @click="saveAccessPolicy">
                    Save access
                </v-btn>
            </div>
        </v-card>
    </v-dialog>

    <v-dialog
        v-model="snackbar"
        :max-width="500"
    >
        <v-card color="surface" class="dialog-card" rounded="lg">
            <v-card-title class="d-flex justify-space-between align-center">
                <div>
                    <v-icon color="error" size="small">mdi-alert</v-icon>
                    <span class="ml-2 text-lightest-slate">Request Failed</span>
                </div>

                <v-btn
                  icon="mdi-close"
                  variant="text"
                  color="slate"
                  @click="snackbar = false"
                ></v-btn>
              </v-card-title>
              <v-divider color="lightest-navy" />
              <v-card-text class="pt-2 text-slate">
                {{ errorMessage }}
              </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import elysianClient from '@/api/elysianClient'

interface User {
    userName: string,
    userId: number,
    identityProvider: string,
    accessControl: AccessControl
}

interface SaveAccessPolicyCommand {
    userId: number,
    accessControl: AccessControl
}

interface AccessControl {
    policies: string[]
}

const items = ref<User[]>([])

const resources = ['user', 'product', 'budget', 'code', 'income'];
const actions = ['read', 'write', 'delete'];

const loading = ref(false)
const dialog = ref(false)
const selectedUser = ref<User | null>(null)
const search = ref('')
const provider = ref<string | null>(null)
const snackbar = ref(false)
const errorMessage = ref('')

onMounted(() => {
    getUsers()
})

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const initials = (name: string) => {
    const parts = name.split(/[\s@._-]+/).filter(Boolean)
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

const providerName = (p: string) => {
    if (p === 'aad') return 'Microsoft'
    if (p === 'github') return 'GitHub'
    return p
}

const providerIcon = (p: string) => {
    if (p === 'aad') return 'mdi-microsoft'
    if (p === 'github') return 'mdi-github'
    return 'mdi-account-circle-outline'
}

const actionColor = (a: string) => a === 'delete' ? 'error' : a === 'write' ? 'primary' : 'info'

const has = (u: User, resource: string, action: string) => u.accessControl?.policies?.includes(`${resource}.${action}`) ?? false

// A one-word summary of how much a user can do.
function accessLevel(u: User): { label: string, color: string } {
    const policies = u.accessControl?.policies ?? []
    if (policies.length === resources.length * actions.length) return { label: 'Full access', color: 'green' }
    if (policies.some(p => p.endsWith('.delete') || p.endsWith('.write'))) return { label: 'Editor', color: 'primary' }
    if (policies.length) return { label: 'Read only', color: 'info' }
    return { label: 'No access', color: 'slate' }
}

const providers = computed(() => {
    const counts = new Map<string, number>()
    for (const u of items.value) counts.set(u.identityProvider, (counts.get(u.identityProvider) ?? 0) + 1)
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
})

const filteredUsers = computed(() => {
    const term = search.value?.toLowerCase() ?? ''
    return items.value.filter(u =>
        (!provider.value || u.identityProvider === provider.value) &&
        (!term || u.userName.toLowerCase().includes(term))
    )
})

const stats = computed(() => [
    { label: 'Users', value: loading.value && !items.value.length ? '—' : items.value.length },
    { label: 'Can edit', value: items.value.filter(u => accessLevel(u).label !== 'Read only' && accessLevel(u).label !== 'No access').length },
    { label: 'Sign-in providers', value: providers.value.length },
])

const getPolicy = (resource: string, action: string) => {
  return selectedUser.value?.accessControl.policies.includes(`${resource}.${action}`) || false;
};

const setPolicy = (resource: string, action: string, value: boolean | null) => {
  setPolicies(value, `${resource}.${action}`);
};

function toggleResource(resource: string) {
    const allOn = actions.every(a => getPolicy(resource, a))
    actions.forEach(a => setPolicy(resource, a, !allOn))
}

function setPolicies(value: boolean | null, key: string) {
    if (!selectedUser.value) {
        return
    }

    const policies = selectedUser.value.accessControl.policies
    const index = policies.indexOf(key)
    if (value && index === -1) {
      policies.push(key)
    } else if (!value && index !== -1) {
      policies.splice(index, 1)
    }
}

function editUser(user: User) {
    // Edit a copy so Cancel doesn't leave half-made changes on the card.
    selectedUser.value = { ...user, accessControl: { ...user.accessControl, policies: [...(user.accessControl?.policies ?? [])] } }
    dialog.value = true
}

async function getUsers(): Promise<void> {
    loading.value = true
    const response = await elysianClient?.getData(`/api/Users`);
    if (!response.success) {
        if(response.errorMessage){
            errorMessage.value = response.errorMessage
        } else {
            errorMessage.value = 'An error occurred. Please try again later.'
        }
        snackbar.value = true
    } else {
        items.value = response.data;
    }
    loading.value = false;

}

async function saveAccessPolicy(): Promise<void> {
    loading.value = true
    const request: SaveAccessPolicyCommand = {
        userId: selectedUser.value!.userId,
        accessControl: selectedUser.value!.accessControl
    }

    const response = await elysianClient?.postData(`/api/SaveAccessPolicy`, request);

    if (!response?.success){
        if(response.errorMessage){
            errorMessage.value = response.errorMessage
        } else {
            errorMessage.value = 'An error occurred. Please try again later.'
        }
        snackbar.value = true
    } else {
        await getUsers()
    }


    loading.value = false
    dialog.value = false
    selectedUser.value = null
}
</script>

<style scoped>
.admin-body {
    max-width: 1100px;
}

.hero-title {
    font-size: clamp(1.6rem, 1.5vw + 1rem, 2.2rem);
    line-height: 1.1;
}

.hero-text {
    max-width: 52ch;
    opacity: 0.82;
}

.hero-label {
    opacity: 0.7;
}

.filter-field {
    flex: 1 1 260px;
    max-width: 360px;
}

.user-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.user-card {
    border-radius: 12px;
    background:
        radial-gradient(120% 90% at 100% 0%, rgba(var(--v-theme-info), 0.1), transparent 55%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: border-color 0.2s ease;
}

.user-card:hover {
    border-color: rgba(var(--v-theme-info), 0.6);
}

.min-width-0 {
    min-width: 0;
}

.initials {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: rgb(var(--v-theme-info));
    background: rgba(var(--v-theme-info), 0.15);
    box-shadow: 0 0 0 2px rgba(var(--v-theme-info), 0.5);
}

.access-pill {
    flex-shrink: 0;
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(var(--v-theme-on-surface), 0.06);
}

.matrix {
    display: grid;
    gap: 6px;
}

.matrix-row {
    display: grid;
    grid-template-columns: 1fr repeat(3, 28px);
    align-items: center;
    justify-items: center;
}

.matrix-row > :first-child {
    justify-self: start;
}

.matrix-head {
    font-size: 0.6875rem;
    color: rgb(var(--v-theme-slate));
}

.dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 4px;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.dot--on.dot--read {
    background: rgb(var(--v-theme-info));
}

.dot--on.dot--write {
    background: rgb(var(--v-theme-primary));
}

.dot--on.dot--delete {
    background: rgb(var(--v-theme-error));
}

.empty-state {
    border-radius: 12px;
    border: 1px dashed rgb(var(--v-theme-lightest-navy));
}

.dialog-card {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

.policy-table {
    border-collapse: collapse;
}

.policy-table th,
.policy-table td {
    padding: 4px 6px;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.policy-table th {
    font-weight: 400;
    padding-bottom: 10px;
}

.policy-table tr:last-child td {
    border-bottom: none;
}

/* Placeholder bones: strip Vuetify's built-in margins and tone the color down
   (the theme's border-opacity of 1 would otherwise make every bone solid white). */
.bone {
    background: transparent;
}

.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__image),
.bone :deep(.v-skeleton-loader__avatar) {
    margin: 0;
    max-width: none;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__image) {
    width: 100%;
}

.bone--avatar :deep(.v-skeleton-loader__avatar) {
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
}

.bone--line :deep(.v-skeleton-loader__text) {
    height: 14px;
}

.bone--small :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.bone--matrix :deep(.v-skeleton-loader__image) {
    height: 130px;
    border-radius: 8px;
}
</style>
