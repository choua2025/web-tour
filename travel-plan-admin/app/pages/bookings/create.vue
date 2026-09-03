<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('page.newBooking') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.newBookingSub') }}</p>
      </div>
      <NuxtLink to="/bookings" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Analytics
      </NuxtLink>
    </header>

    <div class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.user') }}</label>
             <input v-model="form.user_id" type="number" class="input-custom" :placeholder="$t('field.primaryUserId')" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.tour') }}</label>
             <input v-model="form.tour_id" type="number" class="input-custom" :placeholder="$t('field.targetOpId')" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.priceUsd') }}</label>
             <input v-model="form.total_price" type="number" step="0.01" class="input-custom" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.updatedAt') }}</label>
             <input v-model="form.booking_date" type="datetime-local" class="input-custom" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('common.status') }}</label>
             <div class="flex gap-4">
                <button 
 v-for="status in ['pending', 'confirmed', 'cancelled']" 
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
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.paymentDate') }}</label>
             <div class="flex gap-4">
                <button 
 v-for="pStatus in ['unpaid', 'paid', 'refunded']" 
                  :key="pStatus"
 type="button"
 class="flex-1 py-4 rounded-lg border-2 transition-colors font-semibold uppercase text-[11px]"
                  :class="form.payment_status === pStatus ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-slate-50 text-text-muted hover:border-line'"
                  @click="form.payment_status = pStatus"
                >
                   {{ pStatus }}
                </button>
             </div>
          </div>
        </div>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <NuxtLink to="/bookings" class="btn-outline-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('common.cancel') }}</NuxtLink>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.createBooking') }}</span>
           </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useBookingsStore } from '~/stores/bookings'

const store = useBookingsStore()
const loading = computed(() => store.loading)

const form = ref({
  user_id: '',
  tour_id: '',
  booking_date: new Date().toISOString().slice(0, 16),
  total_price: 0,
  status: 'pending',
  payment_status: 'unpaid'
})

const handleSubmit = async () => {
  try {
    await store.create(form.value)
    navigateTo('/bookings')
  } catch (err) {
    console.error(err)
  }
}
</script>
