<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('page.newDestination') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.newDestinationSub') }}</p>
      </div>
      <NuxtLink to="/destinations" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Network Feed
      </NuxtLink>
    </header>

    <div class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.location') }}</label>
             <input v-model="form.name" type="text" class="input-custom" :placeholder="$t('field.destinationName')" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.country') }}</label>
             <input v-model="form.country" type="text" class="input-custom" placeholder="e.g. Switzerland" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.city') }}</label>
             <input v-model="form.city" type="text" class="input-custom" placeholder="e.g. Zurich" required />
          </div>
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.image') }}</label>
           <ImagePicker @update:file="imageFile = $event" />
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.description') }}</label>
           <textarea v-model="form.description" class="input-custom min-h-[150px]" :placeholder="$t('ph.destinationLogistics')"></textarea>
        </div>

        <p v-if="error" class="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {{ error }}
        </p>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <NuxtLink to="/destinations" class="btn-outline-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('common.cancel') }}</NuxtLink>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.createDestination') }}</span>
           </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useDestinationsStore } from '~/stores/destinations'

const store = useDestinationsStore()
const loading = computed(() => store.loading)

const form = ref({
  name: '',
  country: '',
  city: '',
  description: '',
})

const imageFile = ref(null)
const error = ref('')

// The API route runs multer, so the picked file has to travel as multipart
// rather than JSON.
const buildPayload = () => {
  const payload = new FormData()
  for (const [key, value] of Object.entries(form.value)) {
    payload.append(key, value ?? '')
  }
  if (imageFile.value) payload.append('image', imageFile.value)
  return payload
}

const handleSubmit = async () => {
  error.value = ''
  try {
    await store.create(buildPayload())
    navigateTo('/destinations')
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Could not save this destination'
    console.error(err)
  }
}
</script>
