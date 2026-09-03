<template>
  <div class="min-h-screen w-full py-8">
    <div v-if="tour" class="page-container">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-dark-400 mb-8">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">{{ $t('nav.home') }}</NuxtLink>
        <span>/</span>
        <NuxtLink to="/tours" class="hover:text-primary-500 transition-colors">{{ $t('nav.tours') }}</NuxtLink>
        <span>/</span>
        <span class="text-dark-700 font-medium">{{ tour.title }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Image Gallery -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 rounded-2xl overflow-hidden">
            <div class="md:row-span-2 h-64 md:h-full">
              <img :src="tour.gallery ? tour.gallery[0] : tour.image" :alt="tour.title" class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
            </div>
            <div class="h-48" v-if="tour.gallery">
              <img :src="tour.gallery[1]" :alt="$t('tour.gallery')" class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
            </div>
            <div class="h-48 relative" v-if="tour.gallery">
              <img :src="tour.gallery[2]" :alt="$t('tour.gallery')" class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
              <div v-if="tour.gallery.length > 3" class="absolute inset-0 bg-dark-900/60 flex items-center justify-center cursor-pointer hover:bg-dark-900/70 transition-colors">
                <span class="text-white font-semibold">+{{ tour.gallery.length - 3 }} Photos</span>
              </div>
            </div>
          </div>

          <!-- Tour Info -->
          <div class="mb-8">
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span class="badge-primary">{{ tour.category }}</span>
              <div class="flex items-center gap-1">
                <span class="text-yellow-400">★</span>
                <span class="font-semibold text-dark-700">{{ tour.rating }}</span>
                <span class="text-dark-400 text-sm">({{ tour.reviews }} reviews)</span>
              </div>
            </div>
            <h1 class="font-heading text-3xl md:text-4xl font-bold text-dark-900 mb-3">{{ tour.title }}</h1>
            <div class="flex flex-wrap items-center gap-4 text-dark-500 text-sm mb-6">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {{ tour.location }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ tour.duration }}
              </span>
            </div>
            <p class="text-dark-600 leading-relaxed">{{ tour.description }}</p>
          </div>

          <!-- Itinerary -->
          <div v-if="tour.itinerary" class="mb-8">
            <h2 class="font-heading text-2xl font-bold text-dark-900 mb-6">{{ $t('tour.itinerary') }}</h2>
            <div class="space-y-4">
              <div v-for="item in tour.itinerary" :key="item.day"
                class="relative pl-8 pb-6 border-l-2 border-primary-200 last:border-l-0 last:pb-0">
                <div class="absolute -left-3 top-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ item.day }}
                </div>
                <div class="card p-5">
                  <h3 class="font-heading font-semibold text-dark-900 mb-1">{{ item.title }}</h3>
                  <p class="text-sm text-dark-500">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Included / Excluded -->
          <div v-if="tour.included" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="card p-6">
              <h3 class="font-heading font-semibold text-dark-900 mb-4 flex items-center gap-2">
                <span class="w-6 h-6 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center text-sm">✓</span>
                What's Included
              </h3>
              <ul class="space-y-2.5">
                <li v-for="item in tour.included" :key="item" class="flex items-center gap-2 text-sm text-dark-600">
                  <svg class="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="card p-6">
              <h3 class="font-heading font-semibold text-dark-900 mb-4 flex items-center gap-2">
                <span class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm">✕</span>
                Not Included
              </h3>
              <ul class="space-y-2.5">
                <li v-for="item in tour.excluded" :key="item" class="flex items-center gap-2 text-sm text-dark-600">
                  <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Reviews Section -->
          <div>
            <h2 class="font-heading text-2xl font-bold text-dark-900 mb-6">{{ $t('tour.travelerReviews') }}</h2>
            <div class="space-y-4">
              <div v-for="review in reviews.slice(0, 3)" :key="review.id" class="card p-5">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ review.avatar }}</span>
                    <div>
                      <p class="font-semibold text-dark-800 text-sm">{{ review.user }}</p>
                      <p class="text-xs text-dark-400">{{ review.date }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-0.5">
                    <span v-for="i in 5" :key="i" class="text-yellow-400 text-sm">{{ i <= review.rating ? '★' : '☆' }}</span>
                  </div>
                </div>
                <p class="text-sm text-dark-600 leading-relaxed">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar - Booking Card -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24">
            <div class="mb-4">
              <span class="text-sm text-dark-400 line-through">${{ tour.originalPrice }}</span>
              <span class="text-3xl font-heading font-bold text-primary-600 ml-2">${{ tour.price }}</span>
              <span class="text-dark-500 text-sm"> {{ $t('common.perPerson') }}</span>
            </div>

            <div class="space-y-3 mb-6">
              <div>
                <label class="text-xs font-semibold text-dark-500 mb-1 block">{{ $t('booking.travelDate') }}</label>
                <input type="date" class="input-field text-sm" />
              </div>
              <div>
                <label class="text-xs font-semibold text-dark-500 mb-1 block">{{ $t('common.guests') }}</label>
                <select class="input-field text-sm">
                  <option>{{ $t('booking.guest1') }}</option>
                  <option>{{ $t('booking.guest2') }}</option>
                  <option>{{ $t('booking.guest3') }}</option>
                  <option>{{ $t('booking.guest4plus') }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-2 mb-6 text-sm">
              <div class="flex justify-between text-dark-600">
                <span>{{ $t('booking.tourPrice') }}</span>
                <span>${{ tour.price }}</span>
              </div>
              <div class="flex justify-between text-dark-600">
                <span>{{ $t('booking.serviceFee') }}</span>
                <span>$49</span>
              </div>
              <div class="flex justify-between font-semibold text-dark-900 pt-2 border-t border-dark-100">
                <span>{{ $t('common.total') }}</span>
                <span>${{ Number(tour.price) + 49 }}</span>
              </div>
            </div>

            <NuxtLink :to="`/booking?tour_id=${route.params.id}`" class="btn-primary w-full text-center">{{ $t('tour.bookingNow') }}</NuxtLink>
            <p class="text-xs text-dark-400 text-center mt-3">{{ $t('tour.freeCancellation') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()

// Map DB tour to template shape
const mapTour = (t: any) => {
  const avgRating = t.reviews?.length
    ? (t.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / t.reviews.length).toFixed(1)
    : 4.5
  return {
    ...t,
    location: t.destination?.name || t.location || 'Unknown',
    image: t.destination?.image || t.image,
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

const loading = ref(true)
const reviews = ref<any[]>([])
const tour = ref<any>(null)

onMounted(async () => {
  try {
    const [tourRes, reviewsRes] = await Promise.allSettled([
      api.tours.getById(route.params.id as string),
      api.reviews.getAll(),
    ])
    if (tourRes.status === 'fulfilled' && tourRes.value) {
      const res = tourRes.value as any
      const raw = res?.data || res
      tour.value = mapTour(raw)
    }
    if (reviewsRes.status === 'fulfilled' && reviewsRes.value) {
      reviews.value = api.extractArray(reviewsRes.value).map(mapReview)
    }
  } catch (e) {
    console.error('Failed to fetch tour detail:', e)
  } finally {
    loading.value = false
  }
})

useHead({ title: () => `${tour.value?.title ?? 'Tour'} - TravelPlus` })
</script>
