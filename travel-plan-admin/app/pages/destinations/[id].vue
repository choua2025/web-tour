<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">Destination {{ $route.params.id }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.editDestinationSub') }}</p>
      </div>
      <NuxtLink to="/destinations" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Global Feed
      </NuxtLink>
    </header>

    <div v-if="!fetching" class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.name') }}</label>
             <input v-model="form.name" type="text" class="input-custom" :placeholder="$t('field.destinationName')" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.country') }}</label>
             <input v-model="form.country" type="text" class="input-custom" placeholder="e.g. France" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.city') }}</label>
             <input v-model="form.city" type="text" class="input-custom" placeholder="e.g. Paris" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.image') }}</label>
             <ImagePicker
               :existing="form.image"
               @update:file="imageFile = $event"
               @cleared="imageCleared = true"
             />
          </div>
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.description') }}</label>
           <textarea v-model="form.description" class="input-custom min-h-[150px]" :placeholder="$t('ph.nodeMetrics')"></textarea>
        </div>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <button @click="handleDelete" type="button" class="btn-outline-custom !border-danger/30 text-danger hover:!bg-danger/10 flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('common.delete') }}</button>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.saveLogistics') }}</span>
           </button>
        </div>
      </form>
    </div>
    <div v-else class="flex justify-center items-center py-40">
       <Loader2 class="animate-spin text-primary" :size="48" />
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { ref, onMounted, computed } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useDestinationsStore } from '~/stores/destinations'

const route = useRoute()
const store = useDestinationsStore()
const loading = computed(() => store.loading)
const fetching = ref(true)

const form = ref({
  name: '',
  country: '',
  city: '',
  description: '',
  image: ''
})

onMounted(async () => {
  try {
    const item = await store.getById(route.params.id)
    if (item) {
      form.value = { ...item }
    }
  } catch (err) {
    console.error(err)
  } finally {
    fetching.value = false
  }
})

const imageFile = ref(null)
const imageCleared = ref(false)
const error = ref('')

// Multipart, because the route runs multer. Omitting `image` entirely leaves
// the stored one untouched; sending an empty string clears it.
const buildPayload = () => {
  const payload = new FormData()
  for (const key of ['name', 'country', 'city', 'description']) {
    payload.append(key, form.value[key] ?? '')
  }
  if (imageFile.value) {
    payload.append('image', imageFile.value)
  } else if (imageCleared.value) {
    payload.append('image', '')
  }
  return payload
}

const handleSubmit = async () => {
  error.value = ''
  try {
    await store.update(route.params.id, buildPayload())
    navigateTo('/destinations')
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Could not save this destination'
    console.error(err)
  }
}

const handleDelete = async () => {
  if (!confirm(t('confirm.deleteGeneric'))) return
  try {
    await store.remove(route.params.id)
    navigateTo('/destinations')
  } catch (err) {
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
