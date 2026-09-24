<template>
    <PageHero eyebrow="> finance / linked accounts" tone="teal" art="ribbon" compact>
        <h1 class="hero-title font-weight-bold mb-2">Accounts</h1>
        <p class="hero-text mb-5">Banks linked through Plaid. Each one feeds its own income and spending dashboard.</p>
        <div class="d-flex flex-wrap align-center ga-8">
            <div v-for="s in stats" :key="s.label">
                <span class="font-mono text-h6 font-weight-bold d-block">{{ s.value }}</span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
            <v-btn
                color="white"
                variant="flat"
                rounded="pill"
                class="text-none"
                prepend-icon="mdi-plus"
                :loading="!plaidLink"
                @click="triggerPlaidLinkClick"
            >
                Link an account
            </v-btn>
        </div>
    </PageHero>

    <v-container class="admin-body py-10">
        <AccountList :access-items="store.accessItems" :show-income="true">
            <template #empty-action>
                <v-btn variant="outlined" color="primary" rounded="pill" class="text-none" prepend-icon="mdi-plus" :disabled="!plaidLink" @click="triggerPlaidLinkClick">
                    Link an account
                </v-btn>
            </template>
        </AccountList>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import moment from 'moment'
import accessItemService from "@/services/accessItem.service"
import { useBudgetStore } from "@/store/budget"

const store = useBudgetStore()

const linkToken = ref<any>()
const plaidLink = ref<any>()

const stats = computed(() => {
    const items: any[] | undefined = store.accessItems
    if (!items) return [{ label: 'Institutions', value: '—' }, { label: 'Accounts', value: '—' }, { label: 'Last sync', value: '—' }]
    const latest = items.map(a => a.item?.lastSuccessfulUpdate).filter(Boolean).sort().pop()
    return [
        { label: 'Institutions', value: items.length },
        { label: 'Accounts', value: items.reduce((n, a) => n + (a.accounts?.length ?? 0), 0) },
        { label: 'Last sync', value: latest ? moment(latest).fromNow() : '—' },
    ]
})

watch(() => linkToken.value, async (newLinkToken: string) => {
    if(newLinkToken){
        initializePlaidLink()
    }
})

onMounted(async () =>{
    // Load the account list right away; it doesn't depend on Plaid being ready.
    store.fetchAccessItems()
    await getLinkToken()
    await loadPlaidScript()
    initializePlaidLink()
})

onBeforeUnmount(() => {
    unloadPlaidScript()
    if (plaidLink.value) {
        plaidLink.value.destroy();
    }
})

function loadPlaidScript() : Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Plaid script'));
        document.body.appendChild(script);
      });
}

function initializePlaidLink(){
    if ((window as any).Plaid){
        plaidLink.value =(window as any).Plaid.create({
            token: linkToken.value,
            onSuccess: (public_token: string, metadata: any) => { exchangePublicToken(public_token) },
            onLoad: () => {},
            onExit: (err: any, metadata: any) => {},
            onEvent: (eventName: string, metadata: any) => {},
        })
    }
    
}
function unloadPlaidScript() {
    const script = document.querySelector('script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]')
    if (script) {
        script.remove()
    }
}

function triggerPlaidLinkClick() {
    if (plaidLink.value) {
        plaidLink.value.open()
    }
}

async function getLinkToken(){
    const response = await accessItemService.createLinkToken()
    linkToken.value = response.data.link_token
}

async function exchangePublicToken(public_token: string) {
    await accessItemService.setAccessToken(public_token)
    store.fetchAccessItems()
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
</style>
