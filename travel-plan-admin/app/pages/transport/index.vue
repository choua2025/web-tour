<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('nav.transport') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.transportSub') }}</p>
      </div>
      <NuxtLink to="/transport/create" class="btn-primary-custom   text-sm rounded-lg shadow-indigo-500/20">
        <Plus :size="18" />
        Provision Vector
      </NuxtLink>
    </header>

    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
       <div v-for="item in items" :key="item.id" class="card-premium h-full flex flex-col hover:border-primary/40 transition-colors p-6 gap-6 group">
          <div class="flex items-center justify-between">
             <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                   <Bus v-if="item.type === 'bus'" :size="24" />
                   <Plane v-else-if="item.type === 'flight'" :size="24" />
                   <Car v-else-if="item.type === 'car'" :size="24" />
                   <Ship v-else-if="item.type === 'boat'" :size="24" />
                </div>
                <div class="flex flex-col">
                   <span class="text-xs font-semibold text-text-muted uppercase">{{ item.type }}</span>
                   <h3 class="text-xl font-semibold text-text-main truncate">{{ item.company_name }}</h3>
                </div>
             </div>
          </div>

          <div class="flex-1 flex flex-col justify-center">
             <span class="text-xs font-semibold text-text-muted uppercase">{{ $t('col.logisticValue') }}</span>
             <span class="text-xl font-semibold text-text-main mt-2">{{ item.price }} <span class="text-xs font-bold text-text-muted">$</span></span>
          </div>

          <div class="pt-6 border-t border-line flex gap-3">
             <NuxtLink :to="`/transport/${item.id}`" class="flex-1 btn-outline-custom justify-center  rounded-xl font-semibold text-xs uppercase">{{ $t('btn.reconfigVector') }}</NuxtLink>
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
import { Plus, Trash2, Loader2, Bus, Plane, Car, Ship } from 'lucide-vue-next'
import { useTransportStore } from '~/stores/transport'

const store = useTransportStore()
const items = computed(() => store.items)
const loading = computed(() => store.loading)

onMounted(() => store.getAll())

const handleDelete = async (id) => {
  if (!confirm('Permanently deprovision this transport vector?')) return
  try {
    await store.remove(id)
  } catch (err) {
    // A 409 here means the record still has history attached.
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
