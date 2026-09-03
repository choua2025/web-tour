<template>
  <div class="min-h-screen w-full py-16">
    <div class="page-container max-w-2xl">

      <div class="text-center mb-8">
        <div class="w-20 h-20 mx-auto bg-dark-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="font-heading text-3xl font-bold text-dark-900 mb-2">{{ $t('payres.cancelledTitle') }}</h1>
        <p class="text-dark-500">
          {{ $t('payres.cancelledBody') }}
        </p>
      </div>

      <div v-if="booking" class="card p-6 mb-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-heading text-lg font-semibold text-dark-900">Booking #{{ booking.id }}</h2>
          <span class="badge-warning">{{ booking.payment_status }}</span>
        </div>

        <div class="mb-5 pb-5 border-b border-dark-100">
          <h3 class="font-heading font-semibold text-dark-900">{{ booking.tour?.title || $t('common.tour') }}</h3>
          <p v-if="booking.tour?.destination?.name" class="text-sm text-dark-500">
            {{ booking.tour.destination.name }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="p-3 bg-dark-50 rounded-lg">
            <span class="text-dark-400 block text-xs mb-0.5">{{ $t('common.guests') }}</span>
            <span class="font-medium text-dark-900">{{ booking.number_of_people }}</span>
          </div>
          <div class="p-3 bg-dark-50 rounded-lg">
            <span class="text-dark-400 block text-xs mb-0.5">{{ $t('pay.totalDue') }}</span>
            <span class="font-medium text-dark-900">${{ booking.total_price }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <NuxtLink v-if="bookingId" :to="`/payment?booking_id=${bookingId}`" class="btn-primary flex-1 text-center">
          {{ $t('payres.tryAgain') }}
        </NuxtLink>
        <NuxtLink to="/my-bookings" class="btn-ghost flex-1 text-center">{{ $t('payres.goToBookings') }}</NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Payment Cancelled - TravelPlus' })

const route = useRoute()
const api = useApi()

const bookingId = computed(() => route.query.booking_id as string | undefined)
const booking = ref<any>(null)

onMounted(async () => {
  if (!bookingId.value) return
  try {
    const res: any = await api.bookings.getById(bookingId.value)
    booking.value = res?.data ?? res
  } catch (error) {
    // Nothing to show is fine here — the buttons below still work
    console.error('Could not load booking:', error)
  }
})
</script>
