<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('nav.tours') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.toursSub') }}</p>
      </div>
      <NuxtLink to="/tours/create" class="btn-primary-custom   text-sm rounded-lg shadow-indigo-500/20">
        <Plus :size="18" />
        New Operation
      </NuxtLink>
    </header>

    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
       <div v-for="item in items" :key="item.id" class="card-premium h-full flex flex-col hover:border-primary/40 transition-colors p-6 gap-6 group">
          <div class="flex items-center justify-between">
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="item.status === 'active' ? 'bg-success' : 'bg-slate-200'"></div>
                <span class="text-xs font-semibold uppercase" :class="item.status === 'active' ? 'text-success' : 'text-text-muted'">{{ item.status }}</span>
             </div>
             <span class="text-xs font-semibold text-text-muted uppercase bg-slate-50 py-1 px-3 rounded-full border border-line">Op Code: TR-{{ item.id }}</span>
          </div>

          <div class="space-y-4 flex-1">
             <h3 class="text-lg font-semibold text-text-main leading-tight group-hover:text-primary transition-colors">{{ item.title }}</h3>
             <p class="text-text-muted text-sm leading-relaxed line-clamp-2 font-medium">{{ item.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-6 border-t border-line">
             <div class="flex flex-col">
                <span class="text-xs font-semibold text-text-muted uppercase">{{ $t('field.price') }}</span>
                <span class="text-text-main text-sm font-semibold mt-1">{{ item.price }} <span class="text-xs font-bold text-text-muted">$</span></span>
             </div>
             <div class="flex flex-col">
                <span class="text-xs font-semibold text-text-muted uppercase">{{ $t('field.duration') }}</span>
                <span class="text-text-main text-sm font-semibold mt-1">{{ item.duration_days }} <span class="text-xs font-bold text-text-muted">{{ $t('misc.days') }}</span></span>
             </div>
          </div>

          <div class="pt-6 flex gap-3">
             <NuxtLink :to="`/tours/${item.id}`" class="flex-1 btn-outline-custom justify-center  rounded-xl font-semibold text-xs uppercase">{{ $t('col.operationalMods') }}</NuxtLink>
             <button @click="handleDelete(item.id)" class="w-14 rounded-xl glass flex items-center justify-center text-text-dim hover:text-danger hover:bg-danger/10 transition-colors border border-line">
                <Trash2 :size="18" />
             </button>
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
import { Plus, Trash2, Loader2 } from 'lucide-vue-next'
import { useToursStore } from '~/stores/tours'

const store = useToursStore()
const items = computed(() => store.items)
const loading = computed(() => store.loading)

onMounted(() => store.getAll())

const handleDelete = async (id) => {
  if (!confirm('Permanently terminate this tour operation?')) return
  try {
    await store.remove(id)
  } catch (err) {
    // A 409 here means the record still has history attached.
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
