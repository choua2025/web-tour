<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('nav.hotels') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.hotelsSub') }}</p>
      </div>
      <NuxtLink to="/hotels/create" class="btn-primary-custom   text-sm rounded-lg shadow-indigo-500/20">
        <Plus :size="18" />
        New Hospitality Node
      </NuxtLink>
    </header>

    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
       <div v-for="item in items" :key="item.id" class="card-premium h-full flex flex-col hover:border-primary/40 transition-colors p-6 gap-6 group relative overflow-hidden">
          <div class="flex items-center justify-between">
             <div class="flex items-center gap-2">
                <Star v-for="i in 5" :key="i" :size="14" :fill="i <= item.rating ? '#6366f1' : 'transparent'" :class="i <= item.rating ? 'text-primary' : 'text-text-main'" />
             </div>
             <span class="text-xs font-semibold text-text-muted uppercase bg-slate-50 py-1 px-3 rounded-full border border-line">ID: HM-{{ item.id }}</span>
          </div>

          <div class="space-y-4 flex-1">
             <div class="flex items-center gap-3">
                <!-- The hotel's own picture when it has one; the icon is the
                     fallback rather than the only option. -->
                <img
                   v-if="item.image"
                   :src="item.image"
                   :alt="item.name"
                   class="w-12 h-12 rounded-lg object-cover border border-line shrink-0 bg-slate-50"
                   loading="lazy"
                />
                <div v-else class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                   <Hotel :size="24" />
                </div>
                <h3 class="text-lg font-semibold text-text-main leading-tight group-hover:text-primary transition-colors truncate">{{ item.name }}</h3>
             </div>
             <p class="text-text-muted text-sm leading-relaxed line-clamp-1 font-medium">{{ item.address }}</p>
             <p v-if="item.destination?.name" class="flex items-center gap-1.5 text-sm text-text-muted">
                <MapPin :size="14" class="shrink-0" />
                {{ item.destination.name }}<span v-if="item.destination.country" class="text-text-dim">, {{ item.destination.country }}</span>
             </p>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-6 border-t border-line items-center">
             <div class="flex flex-col">
                <span class="text-xs font-semibold text-text-muted uppercase">{{ $t('col.nightlyRate') }}</span>
                <span class="text-text-main text-xl font-semibold mt-1">{{ item.price_per_night }} <span class="text-xs font-bold text-text-muted">$</span></span>
             </div>
             <div class="flex gap-2 justify-end">
                <NuxtLink :to="`/hotels/${item.id}`" class="w-12 h-12 rounded-lg glass flex items-center justify-center text-text-dim hover:text-text-main transition-colors border border-line">
                   <Settings2 :size="20" />
                </NuxtLink>
                <button @click="handleDelete(item.id)" class="w-12 h-12 rounded-lg glass flex items-center justify-center text-text-dim hover:text-danger hover:bg-danger/10 transition-colors border border-line">
                   <Trash2 :size="20" />
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
import { Plus, Trash2, Loader2, Hotel, Star, Settings2, MapPin } from 'lucide-vue-next'
import { useHotelsStore } from '~/stores/hotels'

const store = useHotelsStore()
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
