<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('page.newTour') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.newTourSub') }}</p>
      </div>
      <NuxtLink to="/tours" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Ops Feed
      </NuxtLink>
    </header>

    <div class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.title') }}</label>
             <input v-model="form.title" type="text" class="input-custom" placeholder="e.g. Alpine Ascent 2026" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.destination') }}</label>
             <select v-model="form.destination_id" class="input-custom" required>
               <option value="" disabled>{{ $t('field.selectDestination') }}</option>
               <option v-for="dest in destinations" :key="dest.id" :value="dest.id">
                 {{ dest.name }}
               </option>
             </select>
          </div>
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.description') }}</label>
           <textarea v-model="form.description" class="input-custom min-h-[100px]" :placeholder="$t('ph.operationalBriefing')"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.priceUsd') }}</label>
             <input v-model="form.price" type="number" step="0.01" class="input-custom" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.durationDays') }}</label>
             <input v-model="form.duration_days" type="number" class="input-custom" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.maxPeople') }}</label>
             <input v-model="form.max_people" type="number" class="input-custom" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.startDate') }}</label>
             <input v-model="form.start_date" type="date" class="input-custom" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.endDate') }}</label>
             <input v-model="form.end_date" type="date" class="input-custom" required />
          </div>
        </div>

        <div class="pt-8 flex gap-6 border-t border-line mt-6">
           <NuxtLink to="/tours" class="btn-outline-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('btn.deleteMission') }}</NuxtLink>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.createTour') }}</span>
           </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useToursStore } from '~/stores/tours'
import { useDestinationsStore } from '~/stores/destinations'

const store = useToursStore()
const destinationsStore = useDestinationsStore()
const loading = computed(() => store.loading)
const destinations = computed(() => destinationsStore.items)

onMounted(() => {
  destinationsStore.getAll()
})

const form = ref({
  title: '',
  destination_id: '',
  description: '',
  price: 0,
  duration_days: 0,
  max_people: 0,
  start_date: '',
  end_date: '',
  status: 'active'
})

const handleSubmit = async () => {
  try {
    await store.create(form.value)
    navigateTo('/tours')
  } catch (err) {
    console.error(err)
  }
}
</script>
