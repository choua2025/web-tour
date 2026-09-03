<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">Destination {{ $route.params.id }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.editTourSub') }}</p>
      </div>
      <NuxtLink to="/tours" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Ops Center
      </NuxtLink>
    </header>

    <div v-if="!fetching" class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.title') }}</label>
             <input v-model="form.title" type="text" class="input-custom" placeholder="e.g. Alpine Ascent" required />
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
          <div class="space-y-1.5">
             <label class="label">{{ $t('common.status') }}</label>
             <div class="flex gap-4">
                <button 
 v-for="status in ['active', 'inactive']" 
                  :key="status"
 type="button"
 class="flex-1 py-4 rounded-lg border-2 transition-colors font-semibold uppercase text-[11px]"
                  :class="form.status === status ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-slate-50 text-text-muted hover:border-line'"
                  @click="form.status = status"
                >
                   {{ status }}
                </button>
             </div>
          </div>
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.description') }}</label>
           <textarea v-model="form.description" class="input-custom min-h-[100px]" :placeholder="$t('ph.briefing')"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.amount') }}</label>
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

        <div class="pt-8 flex gap-6 border-t border-line mt-6">
           <button @click="handleDelete" type="button" class="btn-outline-custom !border-danger/30 text-danger hover:!bg-danger/10 flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('btn.deleteOperation') }}</button>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.saveMission') }}</span>
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
import { useToursStore } from '~/stores/tours'
import { useDestinationsStore } from '~/stores/destinations'

const route = useRoute()
const store = useToursStore()
const destinationsStore = useDestinationsStore()
const loading = computed(() => store.loading)
const fetching = ref(true)
const destinations = computed(() => destinationsStore.items)

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

onMounted(async () => {
  try {
    await destinationsStore.getAll()
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

const handleSubmit = async () => {
  try {
    await store.update(route.params.id, form.value)
    navigateTo('/tours')
  } catch (err) {
    console.error(err)
  }
}

const handleDelete = async () => {
  if (!confirm(t('confirm.deleteGeneric'))) return
  try {
    await store.remove(route.params.id)
    navigateTo('/tours')
  } catch (err) {
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
