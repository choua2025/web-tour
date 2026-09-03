<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="badge-success mb-3">⭐ {{ $t('badge.reviews') }}</span>
        <h1 class="section-title mb-3">{{ $t('tour.travelerReviews') }}</h1>
        <p class="section-subtitle mx-auto">{{ $t('rev.sub') }}</p>
      </div>

      <!-- Overall Rating -->
      <div class="card p-8 mb-10">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="text-center">
            <div class="text-5xl font-heading font-bold text-dark-900 mb-1">4.8</div>
            <div class="flex items-center gap-0.5 mb-1">
              <span v-for="i in 5" :key="i" class="text-yellow-400 text-xl">{{ i <= 4 ? '★' : '★' }}</span>
            </div>
            <p class="text-sm text-dark-500">Based on {{ reviews.length }} reviews</p>
          </div>
          <div class="flex-1 w-full space-y-2">
            <div v-for="bar in ratingBars" :key="bar.stars" class="flex items-center gap-3">
              <span class="text-sm text-dark-600 w-8">{{ bar.stars }}★</span>
              <div class="flex-1 h-2.5 bg-dark-100 rounded-full overflow-hidden">
                <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" :style="{ width: bar.percentage + '%' }"></div>
              </div>
              <span class="text-xs text-dark-400 w-8">{{ bar.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Write Review Form -->
      <div class="card p-6 mb-10">
        <h2 class="font-heading text-xl font-semibold text-dark-900 mb-4">{{ $t('rev.writeAReview') }}</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.selectTour') }}</label>
            <select v-model="newTourId" class="input-field">
              <option value="">{{ $t('booking.selectTour') }}</option>
              <option v-for="t in tours" :key="t.id" :value="t.id">{{ t.title }}</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-dark-700 block mb-2">{{ $t('common.rating') }}</label>
            <div class="flex gap-1">
              <button v-for="i in 5" :key="i" @click="newRating = i"
                :class="['text-3xl transition-transform hover:scale-110', i <= newRating ? 'text-yellow-400' : 'text-dark-200']">
                ★
              </button>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('rev.yourReview') }}</label>
            <textarea rows="4" :placeholder="$t('rev.shareExperience')" class="input-field"></textarea>
          </div>
          <button class="btn-primary text-sm">{{ $t('rev.submit') }}</button>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="space-y-4">
        <div v-for="review in reviews" :key="review.id" class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-2xl">
                {{ review.avatar }}
              </div>
              <div>
                <p class="font-semibold text-dark-800">{{ review.user }}</p>
                <p class="text-xs text-dark-400">{{ review.date }} • {{ review.tour }}</p>
              </div>
            </div>
            <div class="flex items-center gap-0.5">
              <span v-for="i in 5" :key="i" :class="['text-sm', i <= review.rating ? 'text-yellow-400' : 'text-dark-200']">★</span>
            </div>
          </div>
          <p class="text-dark-600 leading-relaxed">{{ review.comment }}</p>
          <div class="flex items-center gap-4 mt-4 pt-4 border-t border-dark-100">
            <button class="text-sm text-dark-400 hover:text-primary-500 transition-colors flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              Helpful
            </button>
            <button class="text-sm text-dark-400 hover:text-primary-500 transition-colors flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Reviews - TravelPlus' })

const api = useApi()

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
const tours = ref<any[]>([])
const newRating = ref(0)
const newTourId = ref('')

onMounted(async () => {
  try {
    const [reviewRes, tourRes] = await Promise.all([
      api.reviews.getAll(),
      // The picker used to list four invented tours; offer the real catalogue.
      api.tours.getAll(),
    ])
    reviews.value = api.extractArray(reviewRes).map(mapReview)
    tours.value = api.extractArray(tourRes)
  } catch (e) {
    console.error('Failed to load reviews page:', e)
  } finally {
    loading.value = false
  }
})

const ratingBars = [
  { stars: 5, percentage: 72 },
  { stars: 4, percentage: 20 },
  { stars: 3, percentage: 5 },
  { stars: 2, percentage: 2 },
  { stars: 1, percentage: 1 },
]
</script>
