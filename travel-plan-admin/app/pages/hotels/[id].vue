<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title"> Hotel {{ $route.params.id }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.editHotelSub') }}</p>
      </div>
      <NuxtLink to="/hotels" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Service Hub
      </NuxtLink>
    </header>

    <div v-if="!fetching" class="card-premium p-6 max-w-5xl border border-line">
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
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="label">{{ $t('field.address') }}</label>
          <input v-model="form.address" type="text" class="input-custom" :placeholder="$t('field.fullAddress')" required />
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.image') }}</label>
           <ImagePicker
             :existing="form.image"
             @update:file="imageFile = $event"
             @cleared="imageCleared = true"
           />
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
           <button @click="handleDelete" type="button" class="btn-outline-custom !border-danger/30 text-danger hover:!bg-danger/10 flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('common.delete') }}</button>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.saveService') }}</span>
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
import { useHotelsStore } from '~/stores/hotels'
import { useDestinationsStore } from '~/stores/destinations'

const route = useRoute()
const store = useHotelsStore()
const destinationsStore = useDestinationsStore()
const destinations = computed(() => destinationsStore.items)
const loading = computed(() => store.loading)
const fetching = ref(true)

const form = ref({
  name: '',
  destination_id: '',
  address: '',
  price_per_night: 0,
  rating: 5,
  image: ''
})

const imageFile = ref(null)
const imageCleared = ref(false)
const error = ref('')

// Omitting `image` leaves the stored one alone; an empty string clears it.
const buildPayload = () => {
  const payload = new FormData()
  for (const key of ['name', 'destination_id', 'address', 'price_per_night', 'rating']) {
    payload.append(key, form.value[key] ?? '')
  }
  if (imageFile.value) {
    payload.append('image', imageFile.value)
  } else if (imageCleared.value) {
    payload.append('image', '')
  }
  return payload
}

onMounted(async () => {
  try {
    // Both are needed before the picker can show the hotel's current choice.
    const [item] = await Promise.all([
      store.getById(route.params.id),
      destinationsStore.getAll(),
    ])
    if (item) {
      form.value = { ...item }
      // getById returns the nested `destination` record but strips nothing, so
      // fall back to it when the raw foreign key is not on the payload.
      form.value.destination_id = item.destination_id ?? item.destination?.id ?? ''
    }
  } catch (err) {
    console.error(err)
  } finally {
    fetching.value = false
  }
})

const handleSubmit = async () => {
  try {
    await store.update(route.params.id, buildPayload())
    navigateTo('/hotels')
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Could not save this hotel'
    console.error(err)
  }
}

const handleDelete = async () => {
  if (!confirm(t('confirm.deleteGeneric'))) return
  try {
    await store.remove(route.params.id)
    navigateTo('/hotels')
  } catch (err) {
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
