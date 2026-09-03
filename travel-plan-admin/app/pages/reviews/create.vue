<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('page.newReview') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.newReviewSub') }}</p>
      </div>
      <NuxtLink to="/reviews" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Cluster
      </NuxtLink>
    </header>

    <div class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.user') }}</label>
             <input v-model="form.user_id" type="number" class="input-custom" :placeholder="$t('field.referenceUserId')" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.tour') }}</label>
             <input v-model="form.tour_id" type="number" class="input-custom" :placeholder="$t('field.referenceOpId')" required />
          </div>
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.rating') }}</label>
           <div class="flex gap-4">
              <button 
 v-for="r in [1, 2, 3, 4, 5]" 
                :key="r"
 type="button"
 class="w-12 h-12 rounded-lg border-2 transition-colors flex items-center justify-center text-sm font-semibold"
                :class="form.rating === r ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-slate-50 text-text-muted hover:border-line'"
                @click="form.rating = r"
              >
                 {{ r }}
              </button>
           </div>
        </div>

        <div class="space-y-1.5">
           <label class="label">{{ $t('field.comment') }}</label>
           <textarea v-model="form.comment" class="input-custom min-h-[120px]" :placeholder="$t('ph.feedbackTextAlt')" required></textarea>
        </div>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <NuxtLink to="/reviews" class="btn-outline-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('btn.deletePayload') }}</NuxtLink>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.createReview') }}</span>
           </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useReviewsStore } from '~/stores/reviews'

const store = useReviewsStore()
const loading = computed(() => store.loading)

const form = ref({
  user_id: '',
  tour_id: '',
  rating: 5,
  comment: ''
})

const handleSubmit = async () => {
  try {
    await store.create(form.value)
    navigateTo('/reviews')
  } catch (err) {
    console.error(err)
  }
}
</script>
