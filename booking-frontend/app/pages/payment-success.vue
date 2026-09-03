<template>
  <div class="min-h-screen w-full py-16">
    <div class="page-container max-w-2xl">

      <!-- Waiting for Stripe's webhook to mark the booking paid -->
      <div v-if="state === 'checking'" class="text-center py-12">
        <svg class="w-12 h-12 mx-auto text-primary-500 animate-spin mb-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <h1 class="font-heading text-2xl font-bold text-dark-900 mb-2">{{ $t('payres.confirming') }}</h1>
        <p class="text-dark-500">{{ $t('payres.confirmingSub') }}</p>
      </div>

      <template v-else>
        <div class="text-center mb-8">
          <div
            class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
            :class="state === 'paid' ? 'bg-accent-100' : 'bg-amber-100'"
          >
            <svg v-if="state === 'paid'" class="w-10 h-10 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
          </div>

          <h1 class="font-heading text-3xl font-bold text-dark-900 mb-2">
            {{ state === 'paid' ? $t('payres.successTitle') : $t('payres.receivedTitle') }}
          </h1>
          <p class="text-dark-500">
            <template v-if="state === 'paid'">
              {{ $t('payres.successBody') }}
            </template>
            <template v-else-if="state === 'pending'">
              {{ $t('payres.receivedBody') }}
            </template>
            <template v-else>
              {{ $t('payres.unknownBody') }}
            </template>
          </p>
        </div>

        <!-- Booking details -->
        <div v-if="booking" class="card p-6 mb-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-heading text-lg font-semibold text-dark-900">Booking #{{ booking.id }}</h2>
            <span :class="state === 'paid' ? 'badge-success' : 'badge-warning'">
              {{ booking.payment_status }}
            </span>
          </div>

          <div class="mb-5 pb-5 border-b border-dark-100">
            <h3 class="font-heading font-semibold text-dark-900">{{ booking.tour?.title || $t('common.tour') }}</h3>
            <p v-if="booking.tour?.destination?.name" class="text-sm text-dark-500">
              {{ booking.tour.destination.name }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('booking.travelDate') }}</span>
              <span class="font-medium text-dark-900">{{ formatDate(booking.booking_date) }}</span>
            </div>
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('common.guests') }}</span>
              <span class="font-medium text-dark-900">{{ booking.number_of_people }}</span>
            </div>
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('common.total') }}</span>
              <span class="font-medium text-dark-900">${{ booking.total_price }}</span>
            </div>
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('mine.bookingStatus') }}</span>
              <span class="font-medium text-dark-900 capitalize">{{ booking.status }}</span>
            </div>
          </div>

          <p v-if="sessionId" class="text-xs text-dark-400 mt-5 font-mono break-all">
            Stripe reference: {{ sessionId }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink
            v-if="bookingId"
            :to="`/confirmation?booking_id=${bookingId}`"
            class="btn-primary flex-1 text-center"
          >{{ $t('confirm.viewReceipt') }}</NuxtLink>
          <NuxtLink to="/my-bookings" class="btn-ghost flex-1 text-center">{{ $t('payres.viewMyBookings') }}</NuxtLink>
          <NuxtLink to="/tours" class="btn-ghost flex-1 text-center">{{ $t('payres.browseMore') }}</NuxtLink>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Payment Successful - TravelPlus' })

const route = useRoute()
const api = useApi()

const bookingId = computed(() => route.query.booking_id as string | undefined)
const sessionId = computed(() => route.query.session_id as string | undefined)

const booking = ref<any>(null)
const state = ref<'checking' | 'paid' | 'pending' | 'unknown'>('checking')

// Stripe confirms the payment to our webhook, not to the browser, so the
// booking can still read `unpaid` for a moment after landing here. Poll briefly
// rather than claiming either outcome too early.
const POLL_INTERVAL = 2000
const MAX_ATTEMPTS = 5

const loadBooking = async () => {
  const res: any = await api.bookings.getById(bookingId.value as string)
  booking.value = res?.data ?? res
  return booking.value
}

// The webhook can land after the customer is already looking at this page, so
// listen for it. Polling stays as the fallback: the stream may be blocked by a
// proxy, and the webhook may simply be slow.
const events = useServerEvents({
  'payment.paid': async (payload) => {
    if (String(payload?.id) !== String(bookingId.value)) return
    await loadBooking().catch(() => {})
    state.value = 'paid'
  },
})

onMounted(async () => {
  if (!bookingId.value) {
    state.value = 'unknown'
    return
  }

  events.open()

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // The stream may have resolved it while we were waiting.
    if (state.value === 'paid') return

    try {
      const current = await loadBooking()
      if (current?.payment_status === 'paid') {
        state.value = 'paid'
        return
      }
    } catch (error) {
      console.error('Could not load booking:', error)
      state.value = 'unknown'
      return
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
    }
  }

  // Money was taken by Stripe; only our own record has not caught up. The
  // stream can still flip this to 'paid' while the page stays open.
  if (state.value !== 'paid') state.value = 'pending'
})

const formatDate = (value: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>
