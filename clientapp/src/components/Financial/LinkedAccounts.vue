<template>
    <v-row>
        <v-col>
            <span class="text-h5 font-weight-medium d-block">Accounts</span>
            <span class="text-caption text-grey-darken-1 d-block">
                Linked Institutions
            </span>
        </v-col>
        <v-col class="text-right">
            <v-btn
                color="primary"
                rounded="xl"
                variant="flat"
                @click="triggerPlaidLinkClick"
            >
            <v-icon>mdi-plus</v-icon> <span v-if="!$vuetify.display.mobile">New</span>
        </v-btn>
        </v-col>
    </v-row>
    
    <AccountList :access-items="store.accessItems" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import accessItemService from "@/services/accessItem.service"
import { useBudgetStore } from "@/store/budget"

const store = useBudgetStore()

const linkToken = ref<any>()
const plaidLink = ref<any>()

watch(() => linkToken.value, async (newLinkToken: string) => {
    if(newLinkToken){
        initializePlaidLink()
    }
})

onMounted(async () =>{
    await getLinkToken()
    await loadPlaidScript()
    initializePlaidLink()
    store.fetchAccessItems()
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