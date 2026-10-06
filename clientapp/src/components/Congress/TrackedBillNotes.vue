<template>
    <!-- Clicks and Enter stop here, since on the saved list this sits inside a clickable bill row. -->
    <div v-if="editing" class="notes-editor" :class="`notes--${variant}`" @click.stop @keydown.enter.stop>
        <v-textarea
            v-model="draft"
            placeholder="Why you're following this bill, what to watch for…"
            variant="outlined"
            :base-color="variant === 'hero' ? 'white' : 'slate'"
            :color="variant === 'hero' ? 'white' : 'primary'"
            rows="2"
            auto-grow
            counter="4000"
            maxlength="4000"
            autofocus
            :error-messages="error"
            @keydown.esc="cancel"
        ></v-textarea>
        <div class="d-flex ga-2">
            <v-btn size="small" :color="variant === 'hero' ? 'white' : 'primary'" variant="flat" class="text-none" :loading="saving" @click="save">
                Save note
            </v-btn>
            <v-btn size="small" variant="text" class="text-none" @click="cancel">Cancel</v-btn>
        </div>
    </div>

    <!-- On the bill page the note gets a labelled box with its own edit button. -->
    <div v-else-if="variant === 'hero'" class="notes-hero">
        <div v-if="bill.notes" class="notes-hero-box">
            <div class="d-flex align-center justify-space-between ga-2 mb-1">
                <span class="font-mono text-caption text-uppercase notes-hero-label">
                    Your note &middot; saved {{ moment(bill.savedAt).format('MMM D, YYYY') }}
                </span>
                <v-btn size="x-small" variant="text" class="text-none" prepend-icon="mdi-pencil-outline" @click="start">Edit</v-btn>
            </div>
            <p class="notes-text mb-0">{{ bill.notes }}</p>
        </div>
        <v-btn v-else size="small" variant="text" class="text-none notes-add" prepend-icon="mdi-note-plus-outline" @click="start">
            Add a note
        </v-btn>
    </div>

    <!-- Notes are the reader's own text, so never v-html. -->
    <p v-else-if="bill.notes" class="notes-card notes-text text-body-2 text-light-slate mb-0">{{ bill.notes }}</p>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import moment from 'moment'
import { useCongressStore, TrackedBill } from '@/store/congress'

const props = defineProps({
    bill: { type: Object as () => TrackedBill, required: true },
    // "card" on the saved list, "hero" in the bill page's header.
    variant: { type: String as () => 'card' | 'hero', default: 'card' },
    editing: { type: Boolean, default: false }
})

const emit = defineEmits<{ 'update:editing': [value: boolean] }>()

const congressStore = useCongressStore()

const draft = ref('')
const saving = ref(false)
const error = ref('')

// Start each edit from the saved note, whoever opened the editor.
watch(() => props.editing, editing => {
    if (editing) {
        draft.value = props.bill.notes ?? ''
        error.value = ''
    }
}, { immediate: true })

function start() {
    emit('update:editing', true)
}

function cancel() {
    emit('update:editing', false)
}

async function save() {
    saving.value = true
    error.value = ''
    try {
        if (await congressStore.saveNotes(props.bill.billTrackingId, draft.value)) {
            emit('update:editing', false)
        } else {
            error.value = "Couldn't save your note. Try again."
        }
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.notes-text {
    white-space: pre-wrap;
}

.notes-card {
    padding: 8px 12px;
    border-left: 2px solid rgb(var(--v-theme-lightest-navy));
}

.notes-editor {
    cursor: default;
}

.notes--hero {
    max-width: 60ch;
}

/* Matches the latest action box above it, with the saved-bill amber. */
.notes-hero-box {
    padding: 0.9rem 1.1rem;
    border-radius: 10px;
    border-left: 3px solid rgb(var(--v-theme-amber));
    background: rgba(255, 255, 255, 0.06);
    max-width: 60ch;
    font-size: 0.9375rem;
}

.notes-hero-label {
    letter-spacing: 0.06em;
    opacity: 0.7;
}

.notes-add {
    opacity: 0.8;
    margin-left: -8px;
}
</style>
