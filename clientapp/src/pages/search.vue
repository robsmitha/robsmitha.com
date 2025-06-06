<template>
    <v-breadcrumbs bg-color="grey-darken-4" :items="breadcrumbs"></v-breadcrumbs>

    <FindProduct 
        :term="term"
        :loading="loading"
        @input="term = $event"
        @search="searchBySerialNumber" 
        @clear="clear"
    />

    <ViewProduct
        :product="product" 
        :images="sasUris" 
        :loading="loading" 
    />
    
    <v-dialog
        v-model="snackbar"
        :max-width="500"
    >
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <div>
                    <v-icon color="blue-darken-3" size="small">mdi-information</v-icon>
                    <span class="ml-2">Product Not Found</span>
                </div>

                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="snackbar = false"
                ></v-btn>
              </v-card-title>
              <v-divider />
              <v-card-text class="pt-2">
                {{ errorMessage }}
              </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/elysianClient'

const router = useRouter()

const props = defineProps({
  serialNumber: { type: String }
})

const term = ref(props.serialNumber)
const sasUris = ref([])
const product = ref()
const loading = ref(false)
const snackbar = ref(false)
const errorMessage = ref('')
const breadcrumbs = [
    {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'PRODUCTS',
    disabled: false,
    to: '/products',
  },
  {
    title: props.serialNumber!.toUpperCase(),
    disabled: true
  }
]

onMounted(async () => {
    if(props?.serialNumber != null && props.serialNumber.length > 0){
        await searchBySerialNumber()
    }
})

async function searchBySerialNumber(){
    if(props.serialNumber !== term.value){
        router.replace({ path: '/search' })
    }
    loading.value = true
    const response = await apiClient.getData(`/api/GetProductBySerialNumber?serialNumber=${term.value}`)
    if(!response.success){
        if(response.errorMessage){
            errorMessage.value = response.errorMessage
        } else {
            errorMessage.value = 'An error occurred searching. Please try again later.'
        }
        snackbar.value = true
    }

    product.value = response?.data?.product
    sasUris.value = response?.data?.imageUris
    loading.value = false
}

function clear(){
    product.value = null
    sasUris.value = []
}
</script>
  