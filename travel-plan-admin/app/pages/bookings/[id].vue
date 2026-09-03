<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">Booking {{ $route.params.id }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.editBookingSub') }}</p>
      </div>
      <NuxtLink to="/bookings" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Back to bookings
      </NuxtLink>
    </header>

    <!-- Who booked and what they booked: read-only, since it comes from the
         storefront order rather than being something an admin edits here. -->
    <div v-if="!fetching && booking" class="card-premium p-6 max-w-5xl">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h2 class="text-xs font-semibold text-text-muted uppercase mb-2">{{ $t('field.customer') }}</h2>
          <p class="font-medium text-text-main">{{ contactName }}</p>
          <p v-if="contactEmail" class="text-sm text-text-muted mt-0.5">
            <a :href="`mailto:${contactEmail}`" class="hover:text-primary">{{ contactEmail }}</a>
          </p>
          <p v-if="contactPhone" class="text-sm text-text-muted">
            <a :href="`tel:${contactPhone}`" class="hover:text-primary">{{ contactPhone }}</a>
          </p>
          <p v-if="booking.user?.email && booking.user.email !== contactEmail" class="text-xs text-text-dim mt-1.5">
            Booked from account {{ booking.user.email }}
          </p>
        </div>
        <div>
          <h2 class="text-xs font-semibold text-text-muted uppercase mb-2">{{ $t('col.booked') }}</h2>
          <p class="font-medium text-text-main">
            {{ booking.tour?.title || booking.hotel?.name || $t('notif.tourRemoved') }}
          </p>
          <p v-if="bookedPlace?.destination?.name" class="text-sm text-text-muted mt-0.5">
            {{ bookedPlace.destination.name }}
          </p>
          <p v-if="booking.hotel" class="text-sm text-text-muted mt-0.5">
            {{ booking.check_in }} &rarr; {{ booking.check_out }}
          </p>
          <p class="text-sm text-text-muted mt-1.5">
            {{ booking.number_of_people }} {{ $t('field.people') }} &middot; {{ booking.total_price }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="!fetching" class="card-premium p-6 max-w-5xl">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('common.status') }}</label>
             <div class="flex gap-4">
                <button 
 v-for="status in ['pending', 'confirmed', 'cancelled']" 
                  :key="status"
 type="button"
 class="flex-1 py-4 rounded-lg border-2 transition-colors"
                  :class="form.status === status ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-slate-50 text-text-muted hover:border-line'"
                  @click="form.status = status"
                >
                   {{ status }}
                </button>
             </div>
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('common.status') }}</label>
             <div class="flex gap-4">
                <button 
 v-for="pStatus in ['unpaid', 'paid', 'refunded']" 
                  :key="pStatus"
 type="button"
 class="flex-1 py-4 rounded-lg border-2 transition-colors"
                  :class="form.payment_status === pStatus ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-slate-50 text-text-muted hover:border-line'"
                  @click="form.payment_status = pStatus"
                >
                   {{ pStatus }}
                </button>
             </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.totalUsd') }}</label>
             <input v-model="form.total_price" type="number" step="0.01" class="input-custom" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.createdAt') }}</label>
             <input v-model="form.booking_date" type="datetime-local" class="input-custom" required />
          </div>
        </div>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <button @click="handleDelete" type="button" class="btn-outline-custom !border-danger/30 text-danger hover:!bg-danger/10 flex-1 justify-center rounded-lg ">{{ $t('common.delete') }}</button>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('common.save') }}</span>
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
import { useBookingsStore } from '~/stores/bookings'

const route = useRoute()
const store = useBookingsStore()
const loading = computed(() => store.loading)
const fetching = ref(true)

const form = ref({
  booking_date: '',
  total_price: 0,
  status: 'pending',
  payment_status: 'unpaid'
})

const booking = ref(null)

// A booking is a tour or a hotel stay.
const bookedPlace = computed(() => booking.value?.tour || booking.value?.hotel || null)

const contactName = computed(
  () => booking.value?.contact_name || booking.value?.user?.name || 'Unknown customer'
)
const contactEmail = computed(
  () => booking.value?.contact_email || booking.value?.user?.email || ''
)
const contactPhone = computed(
  () => booking.value?.contact_phone || booking.value?.user?.phone || ''
)

onMounted(async () => {
  try {
    const item = await store.getById(route.params.id)
    if (item) {
      // keep the untouched record for the read-only summary
      booking.value = { ...item }
      // Fix date format for input
      const date = new Date(item.booking_date)
      item.booking_date = date.toISOString().slice(0, 16)
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
    navigateTo('/bookings')
  } catch (err) {
    console.error(err)
  }
}

const handleDelete = async () => {
  if (!confirm(t('confirm.deleteBooking'))) return
  try {
    await store.remove(route.params.id)
    navigateTo('/bookings')
  } catch (err) {
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
