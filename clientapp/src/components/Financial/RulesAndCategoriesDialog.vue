<template>
    <v-dialog :model-value="open" max-width="640" scrollable @update:model-value="v => { if (!v) $emit('close') }">
        <v-card color="surface" rounded="lg">
            <v-tabs v-model="tab" color="primary" class="px-2">
                <v-tab value="rules" class="text-none">Rules ({{ store.rules.length }})</v-tab>
                <v-tab value="categories" class="text-none">Categories</v-tab>
            </v-tabs>
            <v-divider />

            <v-card-text style="max-height: 60vh">
                <template v-if="tab === 'rules'">
                    <p class="text-body-2 text-muted mb-4">Rules run on every new transaction. Changes you make by hand always win.</p>
                    <p v-if="!store.rules.length" class="text-body-2 text-subtle">No rules yet. Tick “Always do this” on a transaction to make one.</p>
                    <ul class="list">
                        <li v-for="r in store.rules" :key="r.categoryRuleId" class="d-flex align-center ga-3 py-2">
                            <div class="min-width-0 flex-grow-1">
                                <span class="d-block text-body-2 text-high-emphasis text-truncate">
                                    {{ fieldLabel[r.field] }} {{ r.match === 'Equals' ? 'is' : 'contains' }} “{{ r.value }}”
                                </span>
                                <span class="font-mono text-caption text-subtle">
                                    → {{ [r.setCategoryName, r.setTreatment && treatmentLabel[r.setTreatment]].filter(Boolean).join(' · ') || 'nothing' }}
                                    <template v-if="r.direction !== 'Any'"> · money {{ r.direction === 'Out' ? 'out' : 'in' }}</template>
                                </span>
                            </div>
                            <v-btn icon="mdi-delete-outline" variant="text" size="small" :aria-label="`Delete rule for ${r.value}`" @click="store.deleteRule(r.categoryRuleId)" />
                        </li>
                    </ul>
                </template>

                <template v-else>
                    <p class="text-body-2 text-muted mb-4">Archiving hides a category from pickers. Merge moves its transactions, rules and budget lines into another one first.</p>
                    <ul class="list">
                        <li v-for="c in store.categories" :key="c.financialCategoryId" class="d-flex flex-wrap align-center ga-2 py-2">
                            <v-icon size="18" class="text-subtle">{{ c.icon ?? 'mdi-tag-outline' }}</v-icon>
                            <template v-if="editing === c.financialCategoryId">
                                <v-text-field v-model="editName" density="compact" variant="outlined" hide-details class="flex-grow-1" aria-label="Category name" @keyup.enter="rename(c)" />
                                <v-btn size="small" color="primary" variant="flat" class="text-none" :loading="busy" @click="rename(c)">Save</v-btn>
                                <v-btn size="small" variant="text" class="text-none" @click="editing = null">Cancel</v-btn>
                            </template>
                            <template v-else-if="archiving === c.financialCategoryId">
                                <span class="text-body-2 text-high-emphasis">{{ c.name }} →</span>
                                <v-select v-model="mergeInto" :items="mergeTargets(c)" item-title="name" item-value="financialCategoryId"
                                    placeholder="Don’t merge" clearable density="compact" variant="outlined" hide-details class="flex-grow-1" aria-label="Merge into" />
                                <v-btn size="small" color="error" variant="flat" class="text-none" :loading="busy" @click="archive(c)">Archive</v-btn>
                                <v-btn size="small" variant="text" class="text-none" @click="archiving = null">Cancel</v-btn>
                            </template>
                            <template v-else>
                                <span class="flex-grow-1 text-body-2 text-high-emphasis">{{ c.name }}</span>
                                <span class="font-mono text-caption text-subtle">{{ groupLabel[c.group] }}</span>
                                <v-btn icon="mdi-pencil-outline" variant="text" size="small" :aria-label="`Rename ${c.name}`" @click="startRename(c)" />
                                <v-btn icon="mdi-archive-outline" variant="text" size="small" :aria-label="`Archive ${c.name}`" @click="archiving = c.financialCategoryId; mergeInto = null" />
                            </template>
                        </li>
                    </ul>
                    <div class="d-flex ga-2 mt-4">
                        <v-text-field v-model="newName" placeholder="New category" density="compact" variant="outlined" hide-details aria-label="New category name" @keyup.enter="add" />
                        <v-btn color="primary" variant="outlined" class="text-none" :disabled="!newName.trim()" :loading="busy" @click="add">Add</v-btn>
                    </div>
                    <p v-if="error" class="text-caption text-error mt-2" role="alert">{{ error }}</p>
                </template>
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn variant="text" class="text-none" @click="$emit('close')">Done</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import transactionService, { type Category } from '@/services/transaction.service'
import { useTransactionsStore } from '@/store/transactions'

const props = defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const store = useTransactionsStore()
const tab = ref<'rules' | 'categories'>('rules')
const editing = ref<number | null>(null)
const editName = ref('')
const archiving = ref<number | null>(null)
const mergeInto = ref<number | null>(null)
const newName = ref('')
const busy = ref(false)
const error = ref<string | null>(null)

watch(() => props.open, open => {
    if (open) {
        store.fetchRules()
        store.fetchCategories()
    }
})

const fieldLabel: Record<string, string> = { Merchant: 'Merchant', Description: 'Description', PlaidCategory: 'Plaid category' }
const treatmentLabel: Record<string, string> = { Spending: 'Spending', Refund: 'Refund', Transfer: 'Transfer', CardPayment: 'Card payment', Income: 'Income', Hidden: 'Hidden' }
const groupLabel: Record<string, string> = { Fixed: 'fixed', Flexible: 'flexible', NonMonthly: 'non-monthly' }

const mergeTargets = (c: Category) => store.categories.filter(x => x.financialCategoryId !== c.financialCategoryId)

function startRename (c: Category) {
    editing.value = c.financialCategoryId
    editName.value = c.name
}

async function run (action: () => Promise<{ success: boolean, errorMessage?: string }>) {
    busy.value = true
    error.value = null
    const response = await action()
    busy.value = false
    if (!response.success) {
        error.value = response.errorMessage?.replace(/^[A-Za-z.]+: /, '') ?? 'That change couldn’t be saved.'
        return false
    }
    await store.fetchCategories()
    await store.search()
    return true
}

async function rename (c: Category) {
    if (await run(() => transactionService.saveCategory({ ...c, name: editName.value.trim() }))) editing.value = null
}

async function archive (c: Category) {
    if (await run(() => transactionService.archiveCategory(c.financialCategoryId, mergeInto.value))) archiving.value = null
}

async function add () {
    if (await run(() => transactionService.saveCategory({ financialCategoryId: 0, name: newName.value.trim(), group: 'Flexible' }))) newName.value = ''
}
</script>

<style scoped>
.list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.list > li + li {
    border-top: 1px solid rgb(var(--v-theme-border));
}

.min-width-0 {
    min-width: 0;
}
</style>
