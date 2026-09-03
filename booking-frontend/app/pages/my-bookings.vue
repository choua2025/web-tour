<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Header -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 class="section-title mb-2">{{ $t('nav.myBookings') }}</h1>
          <p class="section-subtitle">{{ $t('mine.sub') }}</p>
        </div>
        <NuxtLink to="/tours" class="btn-primary text-sm mt-4 md:mt-0">{{ $t('mine.bookNewTrip') }}</NuxtLink>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-dark-100 p-1 rounded-xl mb-8 max-w-md">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          :class="['flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            activeTab === tab.id ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700']">
          {{ tab.label }} ({{ getCount(tab.id) }})
        </button>
      </div>

      <!-- Bookings List -->
      <div class="space-y-4">
        <div v-for="booking in filteredBookings" :key="booking.id"
          class="card overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-4">
            <div class="relative h-48 md:h-full">
              <img :src="booking.image" :alt="booking.tour" class="w-full h-full object-cover" />
              <div class="absolute top-3 left-3">
                <span :class="['badge text-xs', statusClass(booking.status)]">
                  {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                </span>
              </div>
            </div>
            <div class="md:col-span-3 p-5">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 class="font-heading text-lg font-semibold text-dark-900 mb-1">{{ booking.tour }}</h3>
                  <p class="text-sm text-dark-500 flex items-center gap-1 mb-3">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {{ booking.destination }}
                  </p>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span class="text-dark-400 block text-xs">{{ $t('mine.bookingId') }}</span>
                      <span class="font-mono font-medium text-dark-800">{{ booking.id }}</span>
                    </div>
                    <div>
                      <span class="text-dark-400 block text-xs">{{ $t('common.date') }}</span>
                      <span class="font-medium text-dark-800">{{ booking.date }}</span>
                    </div>
                    <div>
                      <span class="text-dark-400 block text-xs">{{ $t('common.guests') }}</span>
                      <span class="font-medium text-dark-800">{{ booking.guests }}</span>
                    </div>
                    <div>
                      <span class="text-dark-400 block text-xs">{{ $t('common.total') }}</span>
                      <span class="font-bold text-primary-600">${{ booking.total.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <NuxtLink :to="`/confirmation?booking_id=${booking.id}`" class="btn-outline text-xs !px-3 !py-2">
                    {{ $t('confirm.viewReceipt') }}
                  </NuxtLink>
                  <button v-if="booking.status === 'upcoming'" class="btn-outline text-xs !px-3 !py-2">{{ $t('mine.modify') }}</button>
                  <button v-if="booking.status === 'completed'" class="btn-primary text-xs !px-3 !py-2">
                    <NuxtLink to="/reviews" class="text-white">{{ $t('mine.writeReview') }}</NuxtLink>
                  </button>
                  <button v-if="booking.status === 'upcoming'" class="btn-ghost text-xs !px-3 !py-2 border border-red-200 text-red-500 hover:bg-red-50">{{ $t('common.cancel') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredBookings.length === 0" class="text-center py-20">
        <div class="text-5xl mb-4">📅</div>
        <h3 class="font-heading text-xl font-semibold text-dark-700 mb-2">{{ $t('mine.noBookings') }}</h3>
        <p class="text-dark-400 mb-4">You don't have any {{ activeTab }} bookings yet.</p>
        <NuxtLink to="/tours" class="btn-primary text-sm">{{ $t('home.exploreTours') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
definePageMeta({ middleware: 'auth' })
useHead({ title: 'My Bookings - TravelPlus' })

const api = useApi()

// Map DB booking to template shape
const mapBooking = (b: any) => {
  // Map DB status to UI status
  const statusMap: Record<string, string> = {
    pending: 'upcoming',
    confirmed: 'completed',
    cancelled: 'cancelled',
  }
  // A booking is a tour or a hotel stay; the card shows whichever it is.
  const booked = (typeof b.tour === 'object' && b.tour) || (typeof b.hotel === 'object' && b.hotel) || null
  return {
    ...b,
    tour: booked?.title || booked?.name || b.tour || 'Booking',
    destination: booked?.destination?.name || booked?.destination?.city || b.destination || '',
    total: (b.total ?? Number(b.total_price)) || 0,
    date: b.date || (b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''),
    guests: b.guests ?? 1,
    status: b.status ? (statusMap[b.status] || b.status) : 'upcoming',
    image: b.image || booked?.image || booked?.destination?.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
  }
}

const loading = ref(true)
const bookings = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.bookings.getAll({ limit: 100 })
    bookings.value = api.extractArray(res).map(mapBooking)
    console.log("bookings.value===>",bookings.value)
  } catch (e) {
    console.error('Failed to fetch bookings:', e)
  } finally {
    loading.value = false
  }
})

const activeTab = ref('upcoming')
const tabs = computed(() => [
  { id: 'upcoming', label: t('mine.upcoming') },
  { id: 'completed', label: t('mine.past') },
  { id: 'cancelled', label: t('mine.cancelled') },
])

const getCount = (status: string) => bookings.value.filter((b: any) => b.status === status).length

const filteredBookings = computed(() => {
  return bookings.value.filter((b: any) => b.status === activeTab.value)
})

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    upcoming: 'bg-primary-100 text-primary-700',
    completed: 'bg-accent-100 text-accent-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return classes[status] || ''
}
</script>
