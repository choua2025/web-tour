<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('nav.reviews') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.reviewsSub') }}</p>
      </div>
      <NuxtLink to="/reviews/create" class="btn-primary-custom   text-sm rounded-lg shadow-indigo-500/20 font-semibold uppercase text-[11px]">
        <Star :size="18" class="mr-2" />
        New Review Node
      </NuxtLink>
    </header>

    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
       <div v-for="item in items" :key="item.id" class="card-premium h-full flex flex-col hover:border-primary/40 transition-colors p-6 gap-6 group">
          <div class="flex items-center justify-between">
             <div class="flex items-center gap-1">
                <Star v-for="i in 5" :key="i" :size="12" :fill="i <= item.rating ? '#6366f1' : 'transparent'" :class="i <= item.rating ? 'text-primary' : 'text-text-main'" />
             </div>
             <span class="text-xs font-semibold text-text-muted uppercase bg-slate-50 py-1 px-3 rounded-full border border-line">NODE: FB-{{ item.id }}</span>
          </div>

          <div class="space-y-4 flex-1">
             <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                   #{{ item.rating }}
                </div>
                <div class="flex flex-col">
                   <span class="text-xs font-semibold text-text-muted uppercase">{{ $t('col.userToken') }}</span>
                   <span class="text-text-main text-sm font-semibold">{{ item.user_id }}</span>
                </div>
             </div>
             <p class="text-text-dim text-sm leading-relaxed line-clamp-3 font-medium opacity-80 border-l-2 border-primary/20 pl-4">"{{ item.comment }}"</p>
          </div>

          <div class="pt-6 border-t border-line flex gap-3 items-center justify-between">
             <span class="text-xs font-semibold text-text-muted uppercase">SYNC CODE: {{ item.tour_id }}</span>
             <div class="flex gap-2">
                <NuxtLink :to="`/reviews/${item.id}`" class="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-dim hover:text-text-main transition-colors border border-line">
                   <Edit :size="18" />
                </NuxtLink>
                <button @click="handleDelete(item.id)" class="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-dim hover:text-danger hover:bg-danger/10 transition-colors border border-line">
                   <Trash2 :size="18" />
                </button>
             </div>
          </div>
       </div>
    </div>
    <div v-else class="flex justify-center items-center py-40">
       <Loader2 class="animate-spin text-primary" :size="48" />
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { onMounted, computed } from 'vue'
import { Star, Trash2, Edit, Loader2 } from 'lucide-vue-next'
import { useReviewsStore } from '~/stores/reviews'

const store = useReviewsStore()
const items = computed(() => store.items)
const loading = computed(() => store.loading)

onMounted(() => store.getAll())

const handleDelete = async (id) => {
  if (!confirm(t('confirm.deleteGeneric'))) return
  try {
    await store.remove(id)
  } catch (err) {
    // A 409 here means the record still has history attached.
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
