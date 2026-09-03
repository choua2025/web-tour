<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-dark-400 mb-8">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">{{ $t('nav.home') }}</NuxtLink>
        <span>/</span>
        <span class="text-dark-700 font-medium">{{ $t('nav.booking') }}</span>
      </nav>

      <h1 class="section-title mb-8">{{ $t('booking.title') }}</h1>

      <!-- Steps Indicator -->
      <div class="flex items-center justify-between mb-10 relative">
        <div class="absolute top-5 left-0 right-0 h-0.5 bg-dark-200"></div>
        <div v-for="(step, index) in steps" :key="step.label"
          class="relative z-10 flex flex-col items-center">
          <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
            currentStep >= index + 1 ? 'bg-primary-500 text-white shadow-md' : 'bg-dark-200 text-dark-500']">
            {{ currentStep > index + 1 ? '✓' : index + 1 }}
          </div>
          <span :class="['text-xs mt-2 font-medium', currentStep >= index + 1 ? 'text-primary-600' : 'text-dark-400']">{{ step.label }}</span>
        </div>
      </div> 

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Form Area -->
        <div class="lg:col-span-2">
          <!-- Step 1: Traveler Info -->
          <div v-if="currentStep === 1" class="card p-6 animate-fade-in">
            <h2 class="font-heading text-xl font-semibold text-dark-900 mb-6">{{ $t('booking.travelerInfo') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.firstName') }}</label>
                <input v-model="form.firstName" type="text" placeholder="John" class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.lastName') }}</label>
                <input v-model="form.lastName" type="text" placeholder="Doe" class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('common.email') }}</label>
                <input v-model="form.email" type="email" placeholder="john@example.com" class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('common.phone') }}</label>
                <input v-model="form.phone" type="tel" placeholder="+1 (555) 123-4567" class="input-field" />
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.specialRequests') }}</label>
                <textarea v-model="form.requests" rows="3" :placeholder="$t('booking.specialRequestsPh')" class="input-field"></textarea>
              </div>
            </div>
          </div>

          <!-- Step 2: Trip Details -->
          <div v-if="currentStep === 2" class="card p-6 animate-fade-in">
            <h2 class="font-heading text-xl font-semibold text-dark-900 mb-6">{{ $t('booking.tripDetails') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <template v-if="isHotel">
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('field.checkIn') }}</label>
                  <input v-model="form.checkIn" type="date" class="input-field" :min="today" required />
                </div>
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.checkOut') }}</label>
                  <input v-model="form.checkOut" type="date" class="input-field" :min="form.checkIn || today" required />
                  <p v-if="form.checkIn && form.checkOut && nights < 1" class="text-sm text-red-600 mt-1">
                    {{ $t('booking.atLeastOneNight') }}
                  </p>
                  <p v-else-if="nights > 0" class="text-sm text-dark-500 mt-1">
                    {{ nights }} {{ $t('booking.nights') }}
                  </p>
                </div>
              </template>
              <div v-else>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.travelDate') }}</label>
                <input v-model="form.travelDate" type="date" class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.numberOfGuests') }}</label>
                <select v-model="form.guests" class="input-field">
                  <option value="1">{{ $t('booking.guest1') }}</option>
                  <option value="2">{{ $t('booking.guest2') }}</option>
                  <option value="3">{{ $t('booking.guest3') }}</option>
                  <option value="4">{{ $t('booking.guest4') }}</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('list.roomType') }}</label>
                <select v-model="form.roomType" class="input-field">
                  <option>{{ $t('list.standard') }}</option>
                  <option>{{ $t('list.deluxe') }}</option>
                  <option>{{ $t('list.suite') }}</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.insurance') }}</label>
                <select v-model="form.insurance" class="input-field">
                  <option value="none">{{ $t('booking.noInsurance') }}</option>
                  <option value="basic">Basic ($29)</option>
                  <option value="premium">Premium ($59)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Step 3: Summary -->
          <div v-if="currentStep === 3" class="card p-6 animate-fade-in">
            <h2 class="font-heading text-xl font-semibold text-dark-900 mb-6">{{ $t('booking.summary') }}</h2>
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 bg-dark-50 rounded-xl">
                <img :src="tourImage" :alt="$t('common.tour')" class="w-20 h-16 rounded-lg object-cover" />
                <div>
                  <h3 class="font-semibold text-dark-900">{{ tourTitle }}</h3>
                  <p class="text-sm text-dark-500">{{ tourDuration }} • {{ form.guests }} Guest(s)</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="p-3 bg-dark-50 rounded-lg">
                  <span class="text-dark-500 block">{{ $t('common.name') }}</span>
                  <span class="font-medium text-dark-900">{{ form.firstName }} {{ form.lastName }}</span>
                </div>
                <div class="p-3 bg-dark-50 rounded-lg">
                  <span class="text-dark-500 block">{{ $t('common.email') }}</span>
                  <span class="font-medium text-dark-900">{{ form.email }}</span>
                </div>
                <div class="p-3 bg-dark-50 rounded-lg">
                  <span class="text-dark-500 block">
                    {{ isHotel ? $t('booking.stay') : $t('booking.travelDate') }}
                  </span>
                  <span class="font-medium text-dark-900">
                    <template v-if="isHotel">{{ form.checkIn || '—' }} → {{ form.checkOut || '—' }}</template>
                    <template v-else>{{ form.travelDate || '—' }}</template>
                  </span>
                </div>
                <div v-if="isHotel" class="p-3 bg-dark-50 rounded-lg">
                  <span class="text-dark-500 block">{{ $t('list.roomType') }}</span>
                  <span class="font-medium text-dark-900">{{ form.roomType }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex items-center justify-between mt-6">
            <button v-if="currentStep > 1" @click="currentStep--" class="btn-ghost border border-dark-200">
              ← Previous
            </button>
            <div v-else></div>
            <button v-if="currentStep < 3" @click="currentStep++" class="btn-primary">
              Continue →
            </button>
            <button v-else @click="submitBooking" :disabled="isSubmitting" class="btn-primary flex items-center justify-center min-w-[150px]">
              <span v-if="isSubmitting">{{ $t('common.processing') }}</span>
              <span v-else>{{ $t('booking.proceedToPayment') }}</span>
            </button>
          </div>
        </div>

        <!-- Pricing Sidebar -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24">
            <h3 class="font-heading font-semibold text-dark-900 mb-4">{{ $t('booking.priceBreakdown') }}</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-dark-600">
                <span>Tour price × {{ form.guests }}</span>
                <span>${{ baseTotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-dark-600">
                <span>{{ $t('booking.serviceFee') }}</span>
                <span>$49</span>
              </div>
              <div v-if="form.insurance !== 'none'" class="flex justify-between text-dark-600">
                <span>{{ $t('booking.travelInsurance') }}</span>
                <span>${{ form.insurance === 'basic' ? 29 : 59 }}</span>
              </div>
              <div class="flex justify-between text-dark-600">
                <span>{{ $t('booking.taxes') }}</span>
                <span>${{ Math.round(baseTotal * 0.08).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between font-semibold text-dark-900 pt-3 border-t border-dark-100 text-base">
                <span>{{ $t('common.total') }}</span>
                <span class="text-primary-600">${{ total.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Booking - TravelPlus' })

const route = useRoute()
const router = useRouter()
const api = useApi()
const auth = useAuth()

// This page books one of two things. `hotel_id` arrives from a hotel card,
// `tour_id` from a tour card.
const tourId = route.query.tour_id || null
const hotelId = route.query.hotel_id || null
const isHotel = computed(() => Boolean(hotelId))

const tour = ref(null)
const hotel = ref(null)
const isLoadingTour = ref(false)

onMounted(async () => {
  if (!tourId && !hotelId) return
  isLoadingTour.value = true
  try {
    if (hotelId) {
      const res = await api.hotels.getById(hotelId)
      hotel.value = res?.data ?? res
    } else {
      const res = await api.tours.getById(tourId)
      tour.value = res?.data ?? res
    }
  } catch (e) {
    console.error('Failed to load what is being booked:', e)
  } finally {
    isLoadingTour.value = false
  }
})

// Whole nights, which is what a hotel is billed by.
// Stops anyone picking yesterday in the date widget.
const today = new Date().toISOString().slice(0, 10)

const nights = computed(() => {
  if (!form.checkIn || !form.checkOut) return 0
  const from = new Date(form.checkIn)
  const to = new Date(form.checkOut)
  if (Number.isNaN(from) || Number.isNaN(to)) return 0
  return Math.max(0, Math.round((to - from) / 86400000))
})

// A tour is priced per guest; a hotel per night. `baseTotal` is whichever
// applies, so the summary and the fees below stay in one place.
const unitPrice = computed(() =>
  isHotel.value ? Number(hotel.value?.price_per_night || 0) : Number(tour.value?.price || 0)
)
const baseTotal = computed(() =>
  isHotel.value ? unitPrice.value * nights.value : unitPrice.value * Number(form.guests || 0)
)

const tourPrice = unitPrice
const tourTitle = computed(() =>
  isHotel.value ? hotel.value?.name || t('nav.hotels') : tour.value?.title || t('common.tour')
)
const tourImage = computed(() => {
  const item = isHotel.value ? hotel.value : tour.value
  return item?.image || item?.destination?.image ||
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=120&h=90&fit=crop'
})
const tourDuration = computed(() => {
  if (isHotel.value) return `${nights.value} ${t('booking.nights')}`
  return tour.value?.duration || `${tour.value?.duration_days || 7} ${t('confirm.days')}`
})

const currentStep = ref(1)
const steps = [
  { label: t('booking.travelerInfoShort') },
  { label: t('booking.tripDetails') },
  { label: t('common.summary') },
]

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  requests: '',
  travelDate: '',
  checkIn: '',
  checkOut: '',
  guests: '',
  roomType: 'Standard',
  insurance: 'none',
})

const total = computed(() => {
  let price = baseTotal.value
  price += 49 // service fee
  if (form.insurance === 'basic') price += 29
  else if (form.insurance === 'premium') price += 59
  price += Math.round(baseTotal.value * 0.08) // taxes
  return price
})

const isSubmitting = ref(false)
const submitBooking = async () => {
  if (isHotel.value && nights.value < 1) {
    alert(t('booking.atLeastOneNight'))
    return
  }

  let createdBookingId = null
  try {
    isSubmitting.value = true
    
    // Create actual booking record
    // The auth middleware guarantees a session here; bail rather than fall
    // back to a hard-coded id, which silently filed bookings under user 1.
    if (!auth.user.value?.id) {
      await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
      return
    }

    const bookingData = {
      user_id: auth.user.value.id,
      // Exactly one of these; the API rejects both or neither.
      ...(isHotel.value
        ? { hotel_id: hotelId, check_in: form.checkIn, check_out: form.checkOut }
        : { tour_id: tourId, booking_date: form.travelDate || new Date().toISOString().split('T')[0] }),
      total_price: total.value,
      number_of_people: Number(form.guests),
      status: 'pending',
      payment_status: 'pending',
      // Send traveler data if the backend model expects it
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone
    }
    
    const res = await api.bookings.create(bookingData)
    
    // Check if response contains the new booking ID (assuming backend returns { success: true, data: { id: X } })
    createdBookingId = res?.data?.id || res?.id
    console.log("createdBookingId===>",createdBookingId)
    if (createdBookingId) {
      router.push(`/payment?booking_id=${createdBookingId}`)
    } else {
      console.warn('Booking ID missing from response:', res)
      alert('Failed to extract booking ID. Please check console.')
    }
  } catch (error) {
    console.error('Submission error:', error)
    alert(error?.data?.message || error?.message || 'Failed to create booking. Please make sure you are logged in.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
