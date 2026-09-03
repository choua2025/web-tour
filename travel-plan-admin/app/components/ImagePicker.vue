<template>
  <div>
    <!-- Chosen file, or the image already saved on the record -->
    <div v-if="previewUrl" class="relative inline-block">
      <img
        :src="previewUrl"
        alt=""
        class="w-full max-w-sm h-44 object-cover rounded-lg border border-line bg-slate-50"
      />
      <button
        type="button"
        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white border border-line shadow-sm flex items-center justify-center text-text-muted hover:text-danger hover:border-danger"
        :title="$t('image.remove')"
        @click="clear"
      >
        <X :size="15" />
      </button>

      <p class="text-xs text-text-muted mt-2">
        <span v-if="file">{{ file.name }} · {{ readableSize(file.size) }}</span>
        <span v-else>{{ $t('image.current') }}</span>
      </p>
    </div>

    <!-- Empty state doubles as the drop zone -->
    <button
      v-else
      type="button"
      class="w-full max-w-sm h-44 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors"
      :class="dragging ? 'border-primary bg-primary-light' : 'border-line bg-slate-50 hover:border-primary/50'"
      @click="open"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <ImageIcon class="text-text-dim" :size="26" />
      <span class="text-sm font-medium text-text-main">{{ $t('image.choose') }}</span>
      <span class="text-xs text-text-muted">{{ $t('image.hint') }}</span>
    </button>

    <div v-if="previewUrl" class="mt-3">
      <button type="button" class="btn-outline-custom" @click="open">
        <Upload :size="15" />
        {{ $t('image.replace') }}
      </button>
    </div>

    <p v-if="error" class="text-sm text-danger mt-2">{{ error }}</p>

    <input
      ref="inputRef"
      type="file"
      :accept="ACCEPTED.join(',')"
      class="hidden"
      @change="onSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Image as ImageIcon, Upload, X } from 'lucide-vue-next'

const { t } = useI18n()

const props = defineProps({
  // URL already stored on the record (edit screens)
  existing: { type: String, default: '' },
})

// `file` is the File to upload; `cleared` says the existing image was dropped.
const emit = defineEmits(['update:file', 'cleared'])

// Mirrors what the API's Cloudinary storage accepts.
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024

const inputRef = ref(null)
const file = ref(null)
const objectUrl = ref('')
const dragging = ref(false)
const error = ref('')
const removedExisting = ref(false)

const previewUrl = computed(() => {
  if (objectUrl.value) return objectUrl.value
  if (props.existing && !removedExisting.value) return props.existing
  return ''
})

const open = () => inputRef.value?.click()

const readableSize = (bytes) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`

const revoke = () => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
}

const accept = (candidate) => {
  error.value = ''

  if (!ACCEPTED.includes(candidate.type)) {
    error.value = t('image.badType')
    return
  }
  if (candidate.size > MAX_BYTES) {
    error.value = t('image.tooLarge')
    return
  }

  revoke()
  file.value = candidate
  objectUrl.value = URL.createObjectURL(candidate)
  removedExisting.value = false
  emit('update:file', candidate)
}

const onSelect = (event) => {
  const chosen = event.target.files?.[0]
  if (chosen) accept(chosen)
  // Reset so picking the same file twice still fires a change event.
  event.target.value = ''
}

const onDrop = (event) => {
  dragging.value = false
  const dropped = event.dataTransfer?.files?.[0]
  if (dropped) accept(dropped)
}

const clear = () => {
  revoke()
  file.value = null
  error.value = ''
  removedExisting.value = true
  emit('update:file', null)
  emit('cleared')
}

watch(() => props.existing, () => { removedExisting.value = false })

// Object URLs leak until revoked.
onBeforeUnmount(revoke)
</script>
