<template>
    <v-sheet class="pb-3">
        <v-container v-if="loading" class="mt-3">
            <v-row align="center" justify="center">
                <v-col cols="auto" class="text-center">
                <v-progress-circular
                    indeterminate
                    :size="70"
                    :width="5"    
                ></v-progress-circular>
                <div class="mt-5 text-h5">
                    Searching, please wait..
                </div>
                </v-col>
            </v-row>
        </v-container>
        <v-container v-else>
            <template v-if="!productDetails">
                <v-row>
                    <v-col>
                        Search Product by Serial Number
                    </v-col>
                </v-row>
            </template>
            <template v-else>
                <v-row>
                    <v-col cols="12">
                        <v-card variant="text" rounded="0">
                            <v-card-title>
                                <h2>{{ productDetails.name}}</h2>
                            </v-card-title>
                            <v-card-subtitle class="text-subtitle-1">
                                Serial Number: {{ productDetails.serialNumber }}
                            </v-card-subtitle>
                            <v-card-subtitle class="text-subtitle-2">
                                Grade: {{ productDetails.grade }}
                            </v-card-subtitle>
                            <v-card-text>
                                <p>{{ productDetails.description }}</p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col v-for="(url, index) in productImages" :key="index" cols="6" md="3">    
                        <v-card @click="viewImage(url)">
                            <v-img 
                                :src="url" 
                                :height="!$vuetify.display.mobile ? '300px' : '150px'" 
                                cover
                                :aspect-ratio="1"
                                class="bg-grey-lighten-2">
                                <template v-slot:placeholder>
                                    <v-row
                                        align="center"
                                        class="fill-height ma-0"
                                        justify="center"
                                    >
                                        <v-progress-circular
                                        color="grey-lighten-5"
                                        indeterminate
                                        ></v-progress-circular>
                                    </v-row>
                                </template>
                            </v-img>
                        </v-card>
                    </v-col>
                </v-row>
            </template>
        </v-container>
    </v-sheet>

    <v-dialog
      v-model="dialog"
      transition="dialog-bottom-transition"
      fullscreen
    >
        <v-card>
            <v-toolbar color="black">
                <v-btn
                    icon="mdi-close"
                    :disabled="loading"
                    @click="closeImage"
                ></v-btn>
                <v-toolbar-title>
                    <span class="text-subtitle-1 text-uppercase">{{ productDetails?.name ?? "Product Image" }}</span>
                </v-toolbar-title>

                <v-btn
                    :disabled="loading"
                    :href="selectedImage"
                    target="_blank"
                    icon
                >
                    <v-icon>mdi-download</v-icon>
                </v-btn>
            </v-toolbar>
            <v-img 
                :src="selectedImage" 
                height="100%" 
                cover
                :aspect-ratio="1"
                class="bg-grey-lighten-2">
                <template v-slot:placeholder>
                    <v-row
                        align="center"
                        class="fill-height ma-0"
                        justify="center"
                    >
                        <v-progress-circular
                        color="grey-lighten-5"
                        indeterminate
                        ></v-progress-circular>
                    </v-row>
                </template>
            </v-img>
        </v-card>
    </v-dialog>
</template>
  
<script setup lang="ts">
import { ref, computed } from 'vue'
  
const props = defineProps(['product', 'images', 'loading'])

const productDetails = computed(() => props.product)
const productImages = computed(() => props.images)

const dialog = ref(false)
const selectedImage = ref()

function viewImage(url: string){
    dialog.value = true
    selectedImage.value = url
}

function closeImage(){
    dialog.value = false
    selectedImage.value = null
}

</script>
  