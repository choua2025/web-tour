<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="badge-primary mb-3">🌍 {{ $t('badge.destinations') }}</span>
        <h1 class="section-title mb-3">{{ $t('home.exploreDest') }}</h1>
        <p class="section-subtitle mx-auto">{{ $t('list.destinationsSub') }}</p>
      </div>

      <!-- Country Filter -->
      <div class="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button v-for="country in countries" :key="country" @click="selectedCountry = country"
          :class="['px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
            selectedCountry === country ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200']">
          {{ country }}
        </button>
      </div>

      <!-- Destinations Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="dest in filteredDestinations" :key="dest.id"
          class="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
          <img :src="dest.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'" :alt="dest.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div class="overlay-gradient"></div>
          <div class="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/20 transition-all duration-300"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <span class="badge bg-white/20 backdrop-blur-sm text-white text-xs mb-2">{{ dest.country }}</span>
            <h3 class="font-heading text-xl font-semibold text-white mb-1">{{ dest.name }}</h3>
            <p v-if="dest.city" class="text-dark-200 text-xs mb-2">{{ dest.city }}</p>
            <p class="text-dark-300 text-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              {{ Array.isArray(dest.tours) ? dest.tours.length : (dest.tours || 0) }} tours · {{ Array.isArray(dest.hotels) ? dest.hotels.length : (dest.hotels || 0) }} hotels
            </p>
          </div>
          <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredDestinations.length === 0" class="text-center py-16">
        <p class="text-4xl mb-4">🌏</p>
        <h3 class="font-heading text-xl font-bold text-dark-700 mb-2">{{ $t('list.noDestinations') }}</h3>
        <p class="text-dark-400">{{ $t('list.tryCountry') }}</p>
      </div>

      <!-- CTA -->
      <div class="mt-16 text-center">
        <div class="card p-10 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
          <h2 class="font-heading text-2xl font-bold text-dark-900 mb-3">{{ $t('list.cantFind') }}</h2>
          <p class="text-dark-500 mb-6 max-w-lg mx-auto">{{ $t('list.cantFindSub') }}</p>
          <NuxtLink to="/contact" class="btn-primary">{{ $t('nav.contactUs') }}</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Destinations - TravelPlus' })

const api = useApi()

// Map DB destination to template shape
const mapDestination = (d: any) => ({
  ...d,
  tours: Array.isArray(d.tours) ? d.tours : [],
  hotels: Array.isArray(d.hotels) ? d.hotels : [],
})

const loading = ref(true)
const destinations = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.destinations.getAll()
    destinations.value = api.extractArray(res).map(mapDestination)
  } catch (e) {
    console.error('Failed to fetch destinations:', e)
  } finally {
    loading.value = false
  }
})

const selectedCountry = ref('All')

// Build dynamic country list from loaded data
const countries = computed(() => {
  const countrySet = new Set(destinations.value.map((d: any) => d.country || d.continent))
  return ['All', ...Array.from(countrySet).filter(Boolean)]
})

const filteredDestinations = computed(() => {
  if (selectedCountry.value === 'All') return destinations.value
  return destinations.value.filter((d: any) => (d.country || d.continent) === selectedCountry.value)
})
</script>
