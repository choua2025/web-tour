<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('page.newHotel') }}</h1>
        <p class="text-text-muted mt-2 font-medium text-sm font-semibold uppercase">{{ $t('page.newHotelSub') }}</p>
      </div>
      <NuxtLink to="/hotels" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Service Hub
      </NuxtLink>
    </header>

    <div class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.name') }}</label>
             <input v-model="form.name" type="text" class="input-custom" :placeholder="$t('field.hotelName')" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.destination') }}</label>
             <select v-model="form.destination_id" class="input-custom" required>
               <option value="" disabled>{{ $t('field.selectDestination') }}</option>
               <option v-for="dest in destinations" :key="dest.id" :value="dest.id">
                 {{ dest.name }}<span v-if="dest.country"> — {{ dest.country }}</span>
               </option>
             </select>
             <p v-if="!destinations.length && !destinationsStore.loading" class="hint">
               {{ $t('field.noDestinations') }}
             </p>
          </div>
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.address') }}</label>
           <input v-model="form.address" type="text" class="input-custom" :placeholder="$t('field.fullAddressAlt')" required />
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.image') }}</label>
           <ImagePicker @update:file="imageFile = $event" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.pricePerNight') }}</label>
             <input v-model="form.price_per_night" type="number" step="0.01" class="input-custom" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.rating') }}</label>
             <input v-model="form.rating" type="number" step="0.1" min="1" max="5" class="input-custom" required />
          </div>
        </div>

        <p v-if="error" class="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {{ error }}
        </p>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <NuxtLink to="/hotels" class="btn-outline-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('common.cancel') }}</NuxtLink>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.createHotel') }}</span>
           </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useHotelsStore } from '~/stores/hotels'
import { useDestinationsStore } from '~/stores/destinations'

const store = useHotelsStore()
// A hotel belongs to a destination, so offer the real list by name rather than
// asking an admin to remember numeric ids.
const destinationsStore = useDestinationsStore()
const destinations = computed(() => destinationsStore.items)
const loading = computed(() => store.loading)

onMounted(() => destinationsStore.getAll())

const form = ref({
  name: '',
  destination_id: '',
  address: '',
  price_per_night: 0,
  rating: 5
})

const imageFile = ref(null)
const error = ref('')

// The hotel route runs multer now, so the picked file has to travel as
// multipart rather than JSON.
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
    navigateTo('/hotels')
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Could not save this hotel'
    console.error(err)
  }
}
</script>
