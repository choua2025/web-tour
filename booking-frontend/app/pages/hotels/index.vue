<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-dark-400 mb-8">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">{{ $t('nav.home') }}</NuxtLink>
        <span>/</span>
        <span class="text-dark-700 font-medium">{{ $t('nav.hotels') }}</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 class="section-title mb-2">{{ $t('list.findStay') }}</h1>
          <p class="section-subtitle">{{ filteredHotels.length }} hotels available</p>
        </div>
        <div class="flex items-center gap-3 mt-4 md:mt-0">
          <select v-model="sortBy" class="input-field !w-auto text-sm !py-2.5">
            <option value="recommended">{{ $t('list.recommended') }}</option>
            <option value="price-low">{{ $t('list.priceLowHigh') }}</option>
            <option value="price-high">{{ $t('list.priceHighLow') }}</option>
            <option value="rating">{{ $t('list.topRated') }}</option>
          </select>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button v-for="star in [5, 4, 3]" :key="star" @click="selectedStars = selectedStars === star ? 0 : star"
          :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all border',
            selectedStars === star ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-dark-600 border-dark-200 hover:border-primary-300']">
          {{ star }} Stars {{ '⭐'.repeat(star) }}
        </button>
      </div>

      <!-- Hotel Grid -->
      <div class="space-y-6">
        <div v-for="hotel in filteredHotels" :key="hotel.id"
          class="card overflow-hidden group">
          <div class="grid grid-cols-1 md:grid-cols-3">
            <div class="relative h-56 md:h-full overflow-hidden">
              <img :src="hotel.image" :alt="hotel.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute top-3 left-3">
                <span class="badge bg-white/90 backdrop-blur-sm text-dark-700 text-xs">{{ hotel.stars }}⭐ Hotel</span>
              </div>
            </div>
            <div class="md:col-span-2 p-6 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-heading text-xl font-semibold text-dark-900 group-hover:text-primary-500 transition-colors">{{ hotel.name }}</h3>
                  <div class="flex items-center gap-1 bg-primary-50 px-2.5 py-1 rounded-lg">
                    <span class="font-bold text-primary-600 text-sm">{{ hotel.rating }}</span>
                    <span class="text-xs text-primary-500">/ 5</span>
                  </div>
                </div>
                <p class="text-sm text-dark-500 flex items-center gap-1 mb-3">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {{ hotel.location }}
                </p>
                <p class="text-sm text-dark-600 mb-4">{{ hotel.description }}</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="amenity in hotel.amenities" :key="amenity"
                    class="px-3 py-1 bg-dark-50 text-dark-600 rounded-lg text-xs">
                    {{ amenity }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-between pt-4 mt-4 border-t border-dark-100">
                <div>
                  <span class="text-2xl font-heading font-bold text-primary-600">{{ hotel.price }}</span>
                  Kip
                  <span class="text-dark-400 text-sm"> {{ $t('common.perNight') }}</span>
                </div>
                <NuxtLink :to="`/booking?hotel_id=${hotel.id}`" class="btn-primary text-sm">{{ $t('tour.bookNow') }}</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Hotels - TravelPlus' })

const api = useApi()

// Map DB hotel to template shape
const mapHotel = (h: any) => ({
  ...h,
  price: h.price ?? h.price_per_night,
  location: h.location || h.address || h.destination?.name || 'Unknown',
  image: h.image || h.destination?.image,
  stars: h.stars ?? Math.round(h.rating || 4),
  rating: h.rating,
  reviews: h.reviews,
  amenities: h.amenities || ['WiFi', 'Restaurant'],
  description: h.description || '',
})

const loading = ref(true)
const hotels = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.hotels.getAll()
    hotels.value = api.extractArray(res).map(mapHotel)
  } catch (e) {
    console.error('Failed to fetch hotels:', e)
  } finally {
    loading.value = false
  }
})

const sortBy = ref('recommended')
const selectedStars = ref(0)

const filteredHotels = computed(() => {
  let result = [...hotels.value]
  if (selectedStars.value > 0) {
    result = result.filter((h: any) => h.stars === selectedStars.value)
  }

  if (sortBy.value === 'price-low') result.sort((a: any, b: any) => a.price - b.price)
  else if (sortBy.value === 'price-high') result.sort((a: any, b: any) => b.price - a.price)
  else if (sortBy.value === 'rating') result.sort((a: any, b: any) => b.rating - a.rating)

  return result
})
</script>
