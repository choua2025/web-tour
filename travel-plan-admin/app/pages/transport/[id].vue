<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">Transport {{ $route.params.id }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.editTransportSub') }}</p>
      </div>
      <NuxtLink to="/transport" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Logistic Feed
      </NuxtLink>
    </header>

    <div v-if="!fetching" class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.company') }}</label>
             <input v-model="form.company_name" type="text" class="input-custom" :placeholder="$t('field.companyName')" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.type') }}</label>
             <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button 
 v-for="type in ['bus', 'flight', 'car', 'boat']" 
                  :key="type"
 type="button"
 class="py-4 rounded-lg border-2 transition-colors font-semibold uppercase text-[11px]"
                  :class="form.type === type ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-slate-50 text-text-muted hover:border-line'"
                  @click="form.type = type"
                >
                   {{ type }}
                </button>
             </div>
          </div>
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.priceUsd') }}</label>
           <input v-model="form.price" type="number" step="0.01" class="input-custom" required />
        </div>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <button @click="handleDelete" type="button" class="btn-outline-custom !border-danger/30 text-danger hover:!bg-danger/10 flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('common.delete') }}</button>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.saveVector') }}</span>
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
import { useTransportStore } from '~/stores/transport'

const route = useRoute()
const store = useTransportStore()
const loading = computed(() => store.loading)
const fetching = ref(true)

const form = ref({
  type: 'bus',
  company_name: '',
  price: 0
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

const handleSubmit = async () => {
  try {
    await store.update(route.params.id, form.value)
    navigateTo('/transport')
  } catch (err) {
    console.error(err)
  }
}

const handleDelete = async () => {
  if (!confirm('Permanently deprovision this transport vector?')) return
  try {
    await store.remove(route.params.id)
    navigateTo('/transport')
  } catch (err) {
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
