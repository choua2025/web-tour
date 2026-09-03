<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-dark-400 mb-8">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">{{ $t('nav.home') }}</NuxtLink>
        <span>/</span>
        <span class="text-dark-700 font-medium">{{ $t('nav.tours') }}</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 class="section-title mb-2">{{ $t('home.exploreTours') }}</h1>
          <p class="section-subtitle">{{ filteredTours.length }} tours available</p>
        </div>
        <div class="flex items-center gap-3 mt-4 md:mt-0">
          <select v-model="sortBy" class="input-field !w-auto text-sm !py-2.5">
            <option value="featured">{{ $t('home.featured') }}</option>
            <option value="price-low">{{ $t('list.priceLowHigh') }}</option>
            <option value="price-high">{{ $t('list.priceHighLow') }}</option>
            <option value="rating">{{ $t('list.topRated') }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Filters -->
        <aside class="lg:col-span-1">
          <div class="card p-6 sticky top-24">
            <h3 class="font-heading font-semibold text-dark-900 mb-5">{{ $t('common.filters') }}</h3>

            <!-- Price Range -->
            <div class="mb-6">
              <label class="text-sm font-semibold text-dark-700 block mb-3">{{ $t('list.priceRange') }}</label>
              <div class="space-y-2">
                <label v-for="range in priceRanges" :key="range.label" class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="selectedPrice" :value="range.value" class="w-4 h-4 text-primary-500 focus:ring-primary-500" />
                  <span class="text-sm text-dark-600">{{ range.label }}</span>
                </label>
              </div>
            </div>

            <!-- Category -->
            <div class="mb-6">
              <label class="text-sm font-semibold text-dark-700 block mb-3">{{ $t('common.category') }}</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="cat in categories" :key="cat" @click="selectedCategory = selectedCategory === cat ? '' : cat"
                  :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-all', selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200']">
                  {{ cat }}
                </button>
              </div>
            </div>

            <!-- Duration -->
            <div class="mb-6">
              <label class="text-sm font-semibold text-dark-700 block mb-3">{{ $t('common.duration') }}</label>
              <div class="space-y-2">
                <label v-for="dur in durations" :key="dur.label" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="selectedDurations" :value="dur.value" class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                  <span class="text-sm text-dark-600">{{ dur.label }}</span>
                </label>
              </div>
            </div>

            <button @click="resetFilters" class="w-full btn-ghost text-sm border border-dark-200">{{ $t('common.resetFilters') }}</button>
          </div>
        </aside>

        <!-- Tour Grid -->
        <div class="lg:col-span-3">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <NuxtLink v-for="tour in filteredTours" :key="tour.id" :to="`/tours/${tour.id}`"
              class="card overflow-hidden group">
              <div class="relative h-48 overflow-hidden">
                <img :src="tour.image" :alt="tour.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute top-3 left-3">
                  <span class="badge bg-white/90 backdrop-blur-sm text-dark-700 text-xs">{{ tour.category }}</span>
                </div>
                <div class="absolute top-3 right-3">
                  <span class="badge bg-secondary-500 text-white text-xs">-{{ Math.round((1 - tour.price / tour.originalPrice) * 100) }}%</span>
                </div>
              </div>
              <div class="p-4">
                <div class="flex items-center gap-1 mb-1.5">
                  <span class="text-yellow-400 text-xs">★</span>
                  <span class="text-xs font-semibold text-dark-700">{{ tour.rating }}</span>
                  <span class="text-xs text-dark-400">({{ tour.reviews }})</span>
                </div>
                <h3 class="font-heading font-semibold text-dark-900 mb-1 group-hover:text-primary-500 transition-colors">{{ tour.title }}</h3>
                <p class="text-xs text-dark-500 mb-3 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {{ tour.location }}
                </p>
                <div class="flex items-center justify-between pt-3 border-t border-dark-100">
                  <div>
                    <span class="text-xs text-dark-400 line-through">${{ tour.originalPrice }}</span>
                    <span class="text-base font-bold text-primary-600 ml-1">${{ tour.price }}</span>
                  </div>
                  <span class="text-xs text-dark-500">{{ tour.duration }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <div v-if="filteredTours.length === 0" class="text-center py-20">
            <div class="text-5xl mb-4">🔍</div>
            <h3 class="font-heading text-xl font-semibold text-dark-700 mb-2">{{ $t('list.noTours') }}</h3>
            <p class="text-dark-400 mb-4">{{ $t('list.tryFilters') }}</p>
            <button @click="resetFilters" class="btn-primary text-sm">{{ $t('common.resetFilters') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({ title: 'Tours - TravelPlus' })

const api = useApi()

// Map DB tour to template shape
const mapTour = (t: any) => {
  const avgRating = t.reviews?.length
    ? (t.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / t.reviews.length).toFixed(1)
    : 4.5
  return {
    ...t,
    location: t.destination?.name || t.location ,
    image: t.destination?.image,
    duration: t.duration || `${t.duration_days} Days`,
    rating: t.rating ?? Number(avgRating),
    reviews: t.reviews?.length ?? t.reviews ?? 0,
    category: t.category,
    originalPrice: t.originalPrice || Math.round(Number(t.price) * 1.2),
    featured: t.featured ?? true,
  }
}

const loading = ref(true)
const tours = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.tours.getAll()
    tours.value = api.extractArray(res).map(mapTour)
  } catch (e) {
    console.error('Failed to fetch tours:', e)
  } finally {
    loading.value = false
  }
})

const sortBy = ref('featured')
const selectedPrice = ref('all')
const selectedCategory = ref('')
const selectedDurations = ref([])

const categories = ['Adventure', 'Cultural', 'Nature', 'Romantic', 'Wildlife']
const priceRanges = computed(() => [
  { label: t('list.allPrices'), value: 'all' },
  { label: t('list.under1500'), value: 'under-1500' },
  { label: t('list.mid'), value: '1500-2500' },
  { label: t('list.over2500'), value: 'over-2500' },
])
const durations = [
  { label: t('list.days15'), value: 'short' },
  { label: t('list.days68'), value: 'medium' },
  { label: t('list.days9'), value: 'long' },
]

const filteredTours = computed(() => {
  let result = [...tours.value]

  if (selectedCategory.value) {
    result = result.filter(t => t.category === selectedCategory.value)
  }

  if (selectedPrice.value === 'under-1500') result = result.filter(t => t.price < 1500)
  else if (selectedPrice.value === '1500-2500') result = result.filter(t => t.price >= 1500 && t.price <= 2500)
  else if (selectedPrice.value === 'over-2500') result = result.filter(t => t.price > 2500)

  if (sortBy.value === 'price-low') result.sort((a, b) => a.price - b.price)
  else if (sortBy.value === 'price-high') result.sort((a, b) => b.price - a.price)
  else if (sortBy.value === 'rating') result.sort((a, b) => b.rating - a.rating)

  return result
})

const resetFilters = () => {
  sortBy.value = 'featured'
  selectedPrice.value = 'all'
  selectedCategory.value = ''
  selectedDurations.value = []
}
</script>
