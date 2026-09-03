<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('nav.destinations') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.destinationsSub') }}</p>
      </div>
      <NuxtLink to="/destinations/create" class="btn-primary-custom   text-sm rounded-lg shadow-indigo-500/20">
        <MapPin :size="18" />
        {{ $t('page.newDestination') }}
      </NuxtLink>
    </header>

    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
       <div v-for="item in items" :key="item.id" class="card-premium group overflow-hidden border border-line hover:border-primary/30 transition-colors">
          <div class="h-56 relative overflow-hidden">
             <img :src="item.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover" />
             <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
             <div class="absolute bottom-6 left-6 flex flex-col">
                <span class="text-xs font-semibold text-primary uppercase mb-1">{{ $t('field.location') }}</span>
                <h3 class="text-lg font-semibold text-text-main truncate">{{ item.name }}</h3>
             </div>
          </div>
          <div class="p-6 space-y-6">
             <div class="flex items-center gap-2 text-text-muted">
                <Globe :size="14" class="text-primary" />
                <span class="text-[11px] font-medium uppercase">{{ item.city }}, {{ item.country }}</span>
             </div>
             <p class="text-text-dim text-sm leading-relaxed line-clamp-2 font-medium opacity-80">{{ item.description }}</p>
             <div class="pt-6 border-t border-line flex items-center justify-between">
                <div class="flex items-center gap-2">
                   <div class="w-2 h-2 rounded-full bg-success"></div>
                   <span class="text-xs font-semibold text-text-muted uppercase">{{ $t('misc.active') }}</span>
                </div>
                <div class="flex gap-3">
                   <NuxtLink :to="`/destinations/${item.id}`" class="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-dim hover:text-text-main transition-colors">
                      <Settings2 :size="18" />
                   </NuxtLink>
                   <button @click="handleDelete(item.id)" class="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-dim hover:text-danger transition-colors">
                      <Trash2 :size="18" />
                   </button>
                </div>
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
import { MapPin, Globe, Trash2, Settings2, Loader2 } from 'lucide-vue-next'
import { useDestinationsStore } from '~/stores/destinations'

const store = useDestinationsStore()
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
