<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">Review {{ $route.params.id }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.editReviewSub') }}</p>
      </div>
      <NuxtLink to="/reviews" class="btn-outline-custom   text-sm rounded-lg flex-shrink-0">
        <ArrowLeft :size="18" />
        Return to Cluster Feed
      </NuxtLink>
    </header>

    <div v-if="!fetching" class="card-premium p-6 max-w-5xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
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
           <textarea v-model="form.comment" class="input-custom min-h-[150px]" :placeholder="$t('ph.feedbackText')" required></textarea>
        </div>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <button @click="handleDelete" type="button" class="btn-outline-custom !border-danger/30 text-danger hover:!bg-danger/10 flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px]">{{ $t('common.delete') }}</button>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold uppercase text-[11px] shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin mr-3" :size="20" />
              <span>{{ $t('btn.saveSentiment') }}</span>
           </button>
        </div>
      </form>
    </div>
    <div v-else class="flex justify-center items-center py-40">
       <Loader2 class="animate-spin text-primary" :size="48" />
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { ref, onMounted, computed } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useReviewsStore } from '~/stores/reviews'

const route = useRoute()
const store = useReviewsStore()
const loading = computed(() => store.loading)
const fetching = ref(true)

const form = ref({
  rating: 5,
  comment: ''
})

onMounted(async () => {
  try {
    const item = await store.getById(route.params.id)
    if (item) {
      form.value = { ...item }
    }
  } catch (err) {
    console.error(err)
  } finally {
    fetching.value = false
  }
})

const handleSubmit = async () => {
  try {
    await store.update(route.params.id, form.value)
    navigateTo('/reviews')
  } catch (err) {
    console.error(err)
  }
}

const handleDelete = async () => {
  if (!confirm(t('confirm.deleteGeneric'))) return
  try {
    await store.remove(route.params.id)
    navigateTo('/reviews')
  } catch (err) {
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
