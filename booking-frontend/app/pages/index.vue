<template>
  <div class="min-h-screen w-full">
    <!-- Hero Section -->
    <section class="relative h-screen min-h-[600px] flex items-center overflow-hidden">
      <div class="absolute inset-0">
        <img src="https://tse4.mm.bing.net/th/id/OIP.0_9PGIo1gTIvErg5bMCNzQHaFj?w=960&h=720&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Travel Hero" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-r from-dark-900/80 via-dark-900/50 to-transparent"></div>
      </div>
      <div class="relative z-10 page-container">
        <div class="max-w-2xl animate-fade-in">
          <span class="badge-primary mb-4 text-sm">✈️ {{ $t('badge.platform') }}</span>
          <h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Explore the World's <span class="gradient-text">{{ $t('list.mostBeautiful') }}</span> {{ $t('list.places') }}
          </h1>
          <p class="text-lg text-dark-300 mb-8 leading-relaxed">
            Discover unforgettable experiences, handpicked tours, and premium hotels. Your next adventure starts here.
          </p>

          <!-- Search Bar -->
          <div class="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div class="relative">
                <label class="text-xs font-semibold text-dark-500 mb-1 block px-1">{{ $t('common.destination') }}</label>
                <input type="text" :placeholder="$t('home.whereTo')" class="w-full px-4 py-2.5 bg-dark-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
              <div class="relative">
                <label class="text-xs font-semibold text-dark-500 mb-1 block px-1">{{ $t('field.checkIn') }}</label>
                <input type="date" class="w-full px-4 py-2.5 bg-dark-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
              <div class="relative">
                <label class="text-xs font-semibold text-dark-500 mb-1 block px-1">{{ $t('common.guests') }}</label>
                <select class="w-full px-4 py-2.5 bg-dark-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none">
                  <option>{{ $t('booking.guest1') }}</option>
                  <option>{{ $t('booking.guest2') }}</option>
                  <option>{{ $t('booking.guest3') }}</option>
                  <option>{{ $t('booking.guest4plus') }}</option>
                </select>
              </div>
              <div class="flex items-end">
                <NuxtLink to="/tours" class="btn-primary w-full text-sm !rounded-xl">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-12 bg-white border-b border-dark-100">
      <div class="page-container">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-3xl md:text-4xl font-heading font-bold text-primary-500 mb-1">{{ stat.value }}</div>
            <div class="text-sm text-dark-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Destinations -->
    <section class="py-20 bg-dark-50">
      <div class="page-container">
        <div class="text-center mb-12">
          <span class="badge-primary mb-3">🌍 {{ $t('badge.trending') }}</span>
          <h2 class="section-title mb-3">{{ $t('home.popularDest') }}</h2>
          <p class="section-subtitle mx-auto">{{ $t('home.popularDestSub') }}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink v-for="dest in destinations.slice(0, 4)" :key="dest.id" to="/destinations"
            class="group relative h-72 rounded-2xl overflow-hidden cursor-pointer">
            <img :src="dest.image" :alt="dest.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div class="overlay-gradient"></div>
            <div class="absolute bottom-0 left-0 right-0 p-5">
              <h3 class="font-heading text-lg font-semibold text-white mb-1">{{ dest.name }}</h3>
              <p class="text-dark-300 text-sm">{{ dest.tours }} tours available</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Tours -->
    <section class="py-20 bg-white">
      <div class="page-container">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <span class="badge-warning mb-3">🔥 {{ $t('badge.featured') }}</span>
            <h2 class="section-title mb-2">{{ $t('home.topRatedTours') }}</h2>
            <p class="section-subtitle">{{ $t('home.topRatedSub') }}</p>
          </div>
          <NuxtLink to="/tours" class="btn-outline mt-4 md:mt-0 text-sm">{{ $t('home.viewAllTours') }}</NuxtLink>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink v-for="tour in tours.filter(t => t.featured)" :key="tour.id" :to="`/tours/${tour.id}`"
            class="card overflow-hidden group">
            <div class="relative h-56 overflow-hidden">
              <img :src="tour.image" :alt="tour.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute top-4 left-4">
                <span class="badge bg-white/90 backdrop-blur-sm text-dark-700">{{ tour.category }}</span>
              </div>
              <div class="absolute top-4 right-4">
                <span class="badge bg-secondary-500 text-white">-{{ Math.round((1 - tour.price / tour.originalPrice) * 100) }}%</span>
              </div>
            </div>
            <div class="p-5">
              <div class="flex items-center gap-1 mb-2">
                <span class="text-yellow-400 text-sm">★</span>
                <span class="text-sm font-semibold text-dark-700">{{ tour.rating }}</span>
                <span class="text-xs text-dark-400">({{ tour.reviews }} reviews)</span>
              </div>
              <h3 class="font-heading text-lg font-semibold text-dark-900 mb-1 group-hover:text-primary-500 transition-colors">{{ tour.title }}</h3>
              <p class="text-sm text-dark-500 mb-3 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {{ tour.location }}
              </p>
              <div class="flex items-center justify-between pt-3 border-t border-dark-100">
                <div>
                  <span class="text-xs text-dark-400 line-through">${{ tour.originalPrice }}</span>
                  <span class="text-lg font-bold text-primary-600 ml-1">${{ tour.price }}</span>
                </div>
                <span class="text-xs text-dark-500">{{ tour.duration }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div class="page-container">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl md:text-4xl font-bold mb-3">{{ $t('home.whyChoose') }}</h2>
          <p class="text-primary-200 text-lg max-w-2xl mx-auto">{{ $t('home.whyChooseSub') }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
            <div class="text-4xl mb-4">{{ feature.icon }}</div>
            <h3 class="font-heading text-xl font-semibold mb-2">{{ feature.title }}</h3>
            <p class="text-primary-200 text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20 bg-dark-50">
      <div class="page-container">
        <div class="text-center mb-12">
          <span class="badge-success mb-3">💬 {{ $t('badge.testimonials') }}</span>
          <h2 class="section-title mb-3">{{ $t('home.whatTravelersSay') }}</h2>
          <p class="section-subtitle mx-auto">{{ $t('home.realStories') }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="review in reviews.slice(0, 3)" :key="review.id" class="card p-6">
            <div class="flex items-center gap-1 mb-3">
              <span v-for="i in 5" :key="i" class="text-yellow-400 text-sm">{{ i <= review.rating ? '★' : '☆' }}</span>
            </div>
            <p class="text-dark-600 text-sm leading-relaxed mb-4">"{{ review.comment }}"</p>
            <div class="flex items-center gap-3 pt-4 border-t border-dark-100">
              <span class="text-2xl">{{ review.avatar }}</span>
              <div>
                <p class="font-semibold text-dark-800 text-sm">{{ review.user }}</p>
                <p class="text-xs text-dark-400">{{ review.tour }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-white">
      <div class="page-container">
        <div class="relative rounded-3xl overflow-hidden">
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&h=500&fit=crop" alt="Beach CTA" class="w-full h-72 md:h-80 object-cover" />
          <div class="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-600/70 flex items-center">
            <div class="page-container">
              <div class="max-w-lg">
                <h2 class="font-heading text-3xl md:text-4xl font-bold text-white mb-4">{{ $t('home.readyNext') }}</h2>
                <p class="text-primary-200 mb-6">{{ $t('home.readyNextSub') }}</p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <NuxtLink to="/register" class="btn-secondary text-sm">{{ $t('home.getStarted') }}</NuxtLink>
                  <NuxtLink to="/tours" class="btn-outline !border-white !text-white hover:!bg-white hover:!text-primary-600 text-sm">{{ $t('home.browseTours') }}</NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({
  title: 'TravelPlus - Explore the World',
  meta: [
    { name: 'description', content: 'Discover amazing destinations, book tours, hotels, and create unforgettable travel experiences with TravelPlus.' },
  ],
})

const api = useApi()

// Map DB tour to template shape
const mapTour = (t: any) => {
  const avgRating = t.reviews?.length
    ? (t.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / t.reviews.length).toFixed(1)
    : 4.5
  return {
    ...t,
    location: t.destination?.name || t.location || 'Unknown',
    image: t.destination?.image || t.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
    duration: t.duration || `${t.duration_days || 7} Days`,
    rating: t.rating ?? Number(avgRating),
    reviews: t.reviews?.length ?? t.reviews ?? 0,
    category: t.category || 'Adventure',
    originalPrice: t.originalPrice || Math.round(Number(t.price) * 1.2),
    featured: t.featured ?? true,
  }
}

// Map DB review to template shape
const mapReview = (r: any) => ({
  ...r,
  user: typeof r.user === 'object' ? r.user?.name : r.user || 'Traveler',
  tour: typeof r.tour === 'object' ? r.tour?.title : r.tour || 'Tour',
  avatar: r.avatar || '🧑‍💼',
  date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''),
})

// Map DB destination to template shape
const mapDestination = (d: any) => ({
  ...d,
  tours: d.tours?.length ?? 0,
})

const loading = ref(true)
const tours = ref<any[]>([])
const destinations = ref<any[]>([])
const reviews = ref<any[]>([])

// Fetch from API
onMounted(async () => {
  try {
    const [toursRes, destRes, reviewsRes] = await Promise.allSettled([
      api.tours.getAll(),
      api.destinations.getAll(),
      api.reviews.getAll(),
    ])
    if (toursRes.status === 'fulfilled' && toursRes.value) {
      tours.value = api.extractArray(toursRes.value).map(mapTour)
    }
    if (destRes.status === 'fulfilled' && destRes.value) {
      destinations.value = api.extractArray(destRes.value).map(mapDestination)
    }
    if (reviewsRes.status === 'fulfilled' && reviewsRes.value) {
      reviews.value = api.extractArray(reviewsRes.value).map(mapReview)
    }
  } catch (e) {
    console.error('Failed to fetch data:', e)
  } finally {
    loading.value = false
  }
})

const stats = [
  { value: '500+', label: t('nav.destinations') }, 
  { value: '10K+', label: t('home.happyTravelers') },
  { value: '2K+', label: t('list.toursAvailable') },
  { value: '4.9★', label: t('rev.averageRating') },
]

const features = [
  { icon: '🛡️', title: 'Best Price Guarantee', description: 'Find a lower price? We\'ll match it and give you an extra 10% off.' },
  { icon: '🌟', title: 'Handpicked Experiences', description: 'Every tour is vetted by our travel experts for quality and authenticity.' },
  { icon: '💬', title: '24/7 Customer Support', description: 'Our dedicated team is always available to help you plan the perfect trip.' },
]
</script>
