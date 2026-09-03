<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-dark-400 mb-8">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">{{ $t('nav.home') }}</NuxtLink>
        <span>/</span>
        <NuxtLink to="/booking" class="hover:text-primary-500 transition-colors">{{ $t('nav.booking') }}</NuxtLink>
        <span>/</span>
        <span class="text-dark-700 font-medium">{{ $t('pay.title') }}</span>
      </nav>

      <h1 class="section-title mb-8">{{ $t('pay.secure') }}</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Payment Form -->
        <div class="lg:col-span-2">
          <div class="card p-6">
            <h2 class="font-heading text-xl font-semibold text-dark-900 mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Payment Details
            </h2>

            <!-- Payment Methods -->
            <div class="flex gap-3 mb-6">
              <button v-for="method in paymentMethods" :key="method.id" @click="selectedMethod = method.id"
                :class="['flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                  selectedMethod === method.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-dark-200 text-dark-600 hover:border-dark-300']">
                <span class="text-lg">{{ method.icon }}</span>
                {{ method.label }}
              </button>
            </div>

            <!-- Card Form -->
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('pay.cardholderName') }}</label>
                <input v-model="payment.name" type="text" placeholder="John Doe" class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('pay.cardNumber') }}</label>
                <div class="relative">
                  <input v-model="payment.cardNumber" type="text" placeholder="1234 5678 9012 3456" maxlength="19" class="input-field !pr-16" />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <span class="text-lg">💳</span>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('pay.expiryDate') }}</label>
                  <input v-model="payment.expiry" type="text" placeholder="MM/YY" maxlength="5" class="input-field" />
                </div>
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('pay.cvv') }}</label>
                  <input v-model="payment.cvv" type="text" placeholder="123" maxlength="4" class="input-field" />
                </div>
              </div>

              <div class="flex items-center gap-2 pt-2">
                <input type="checkbox" v-model="payment.saveCard" id="saveCard" class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                <label for="saveCard" class="text-sm text-dark-600">{{ $t('pay.saveCard') }}</label>
              </div>
            </div>

            <!-- Security Note -->
            <div class="mt-6 p-4 bg-accent-50 rounded-xl flex items-start gap-3">
              <svg class="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <div>
                <p class="text-sm font-medium text-accent-800">{{ $t('pay.secureNote') }}</p>
                <p class="text-xs text-accent-600 mt-0.5">{{ $t('pay.encrypted') }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-6">
            <NuxtLink to="/booking" class="btn-ghost border border-dark-200">{{ $t('booking.backToBooking') }}</NuxtLink>
            <button @click="processPayment" :disabled="isLoading" class="btn-primary flex items-center justify-center min-w-[150px]">
              <span v-if="isLoading">{{ $t('common.processing') }}</span>
              <span v-else>Pay {{ bookingDetails?.total_price ? `$${Number(bookingDetails.total_price).toLocaleString()}` : `$${calculatedTotal.toLocaleString()}` }} →</span>
            </button>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24">
            <h3 class="font-heading font-semibold text-dark-900 mb-4">{{ $t('pay.orderSummary') }}</h3>
            
            <template v-if="bookingDetails || tourDetails">
              <div class="flex items-center gap-3 p-3 bg-dark-50 rounded-xl mb-4">
                <img :src="tourImage" :alt="$t('common.tour')" class="w-16 h-14 rounded-lg object-cover" />
                <div>
                  <h4 class="font-semibold text-dark-900 text-sm line-clamp-1">{{ tourTitle }}</h4>
                  <p class="text-xs text-dark-500">{{ tourDuration }} • {{ guestsCount }} Guest(s)</p>
                </div>
              </div>
              <div class="space-y-2.5 text-sm">
                <div class="flex justify-between text-dark-600">
                  <span>{{ $t('booking.tourPrice') }} <span v-if="guestsCount > 1">× {{ guestsCount }}</span></span>
                  <span>${{ (tourPrice * guestsCount).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-dark-600">
                  <span>{{ $t('booking.serviceFee') }}</span>
                  <span>$49</span>
                </div>
                <div class="flex justify-between text-dark-600">
                  <span>{{ $t('booking.taxes') }}</span>
                  <span>${{ Math.round(tourPrice * guestsCount * 0.08).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between font-semibold text-dark-900 pt-3 border-t border-dark-100 text-base">
                  <span>{{ $t('common.total') }}</span>
                  <span class="text-primary-600">{{ bookingDetails?.total_price ? `$${Number(bookingDetails.total_price).toLocaleString()}` : `$${calculatedTotal.toLocaleString()}` }}</span>
                </div>
              </div>
            </template>
            <template v-else-if="isLoadingData">
              <div class="py-10 text-center text-dark-500 flex flex-col items-center justify-center">
                <div class="w-8 h-8 border-4 border-dark-200 border-t-primary-500 rounded-full animate-spin mb-3"></div>
                Loading order details...
              </div>
            </template>
            <template v-else>
              <div class="py-8 text-center text-dark-500 bg-dark-50 rounded-xl">
                Order details unavailable
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Payment - TravelPlus' })

const { payments, bookings, tours } = useApi()
const route = useRoute()
const bookingId = route.query.booking_id || null

const selectedMethod = ref('card')
const paymentMethods = [
  { id: 'card', icon: '💳', label: t('pay.creditCard') },
  { id: 'paypal', icon: '🅿️', label: t('pay.paypal') },
  { id: 'bank', icon: '🏦', label: t('pay.bankTransfer') },
]

const payment = reactive({
  name: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  saveCard: false,
})

const isLoading = ref(false)
const isLoadingData = ref(true)
const bookingDetails = ref(null)
const tourDetails = ref(null)

onMounted(async () => {
  if (bookingId) {
    try {
      const response = await bookings.getById(bookingId)
      if (response && response.data) {
        bookingDetails.value = response.data
        
        // Fetch tour details to populate the order summary
        if (bookingDetails.value.tour) {
          tourDetails.value = bookingDetails.value.tour
        } else if (bookingDetails.value.tour_id) {
          const tRes = await tours.getById(bookingDetails.value.tour_id)
          if (tRes && tRes.data) {
             tourDetails.value = tRes.data
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error)
    } finally {
      isLoadingData.value = false
    }
  } else {
    isLoadingData.value = false
  }
})

const guestsCount = computed(() => Number(bookingDetails.value?.guests || bookingDetails.value?.number_of_people || bookingDetails.value?.num_guests || 2))
const tourTitle = computed(() => tourDetails.value?.title || 'Tour Booking')
const tourImage = computed(() => {
  const t = tourDetails.value
  return t?.destination?.image || t?.image || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=120&h=90&fit=crop'
})
const tourDuration = computed(() => tourDetails.value?.duration || `${tourDetails.value?.duration_days || 7} Days`)
const tourPrice = computed(() => Number(tourDetails.value?.price || 1299))
const calculatedTotal = computed(() => {
  const base = tourPrice.value * guestsCount.value
  const tax = Math.round(base * 0.08)
  return base + 49 + tax // base + service fee + tax
})

const processPayment = async () => {
  if (selectedMethod.value === 'card') {
    if (!bookingId) {
      alert('Booking ID is missing. Cannot process payment.');
      return;
    }
    
    try {
      isLoading.value = true
      const response = await payments.createCheckoutSession({ booking_id: bookingId })
      
      if (response && response.success && response.url) {
        window.location.href = response.url
      } else {
        alert(response?.message || 'Failed to initialize payment session')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert(error?.data?.message || error?.message || 'An error occurred while processing your payment. Please try again.')
    } finally {
      isLoading.value = false
    }
  } else {
    alert(`${selectedMethod.value} payment is currently not implemented. Please use Credit Card (Stripe).`)
  }
}
</script>
