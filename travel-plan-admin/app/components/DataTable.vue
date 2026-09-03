<template>
  <div class="bg-bg-card border border-line rounded-lg overflow-hidden flex flex-col">
    <!-- Toolbar -->
    <div class="panel-header">
      <div class="relative w-full sm:w-72">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" :size="16" />
        <input
          type="text"
          :placeholder="searchPlaceholder || 'Search...'"
          class="input-custom pl-9 pr-8"
          v-model="searchQuery"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-dim hover:text-text-main"
          :title="$t('table.clearSearch')"
        >
          <X :size="14" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <slot name="header-actions"></slot>
        <button class="btn-outline-custom" @click="$emit('refresh')" :title="$t('table.reload')">
          <RefreshCw :size="15" />
          <span class="hidden sm:inline">{{ $t('common.refresh') }}</span>
        </button>
        <button class="btn-outline-custom" @click="exportCsv" :title="$t('table.downloadCsv')">
          <Download :size="15" />
          <span class="hidden sm:inline">{{ $t('common.export') }}</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table-admin">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="col.sortable === false ? '' : 'cursor-pointer select-none hover:text-text-main'"
              @click="col.sortable === false ? null : toggleSort(col.key)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <ChevronUp v-if="sortKey === col.key && sortDir === 'asc'" :size="13" />
                <ChevronDown v-else-if="sortKey === col.key" :size="13" />
              </span>
            </th>
            <th v-if="hasActions" class="text-right w-28">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in pageRows" :key="item.id ?? idx">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
                {{ item[col.key] }}
              </slot>
            </td>
            <td v-if="hasActions" class="text-right">
              <div class="flex items-center justify-end gap-1">
                <slot name="actions" :item="item">
                  <button
                    class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-primary-light hover:text-primary"
                    @click="$emit('edit', item)"
                    :title="$t('common.edit')"
                  >
                    <Edit :size="15" />
                  </button>
                  <button
                    class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-danger"
                    @click="$emit('delete', item)"
                    :title="$t('common.delete')"
                  >
                    <Trash2 :size="15" />
                  </button>
                </slot>
              </div>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td :colspan="columns.length + (hasActions ? 1 : 0)" class="text-center text-text-muted py-10">
              {{ data && data.length ? 'No rows match your search' : 'No records found' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-3 border-t border-line flex flex-col sm:flex-row justify-between items-center gap-3">
      <p class="text-xs text-text-muted">
        {{ footerText || rangeLabel }}
      </p>
      <div v-if="totalPages > 1" class="flex items-center gap-1">
        <button
          class="w-8 h-8 rounded border border-line flex items-center justify-center text-text-muted hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="page === 1"
          @click="page--"
          :title="$t('table.prevPage')"
        >
          <ChevronLeft :size="16" />
        </button>
        <button
          v-for="p in pageNumbers"
          :key="p"
          class="w-8 h-8 rounded border text-sm"
          :class="p === page
            ? 'border-primary bg-primary text-white font-medium'
            : 'border-line text-text-muted hover:bg-slate-50'"
          @click="page = p"
        >
          {{ p }}
        </button>
        <button
          class="w-8 h-8 rounded border border-line flex items-center justify-center text-text-muted hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="page === totalPages"
          @click="page++"
          :title="$t('table.nextPage')"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Search,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-vue-next'

const props = defineProps({
  columns: Array,
  data: Array,
  hasActions: { type: Boolean, default: true },
  searchPlaceholder: String,
  footerText: String,
  pageSize: { type: Number, default: 10 },
  exportName: { type: String, default: 'export' },
})

defineEmits(['edit', 'delete', 'refresh'])

const searchQuery = ref('')
const page = ref(1)
const sortKey = ref(null)
const sortDir = ref('asc')

// Nested records (booking.tour.title) are what the eye sees, so search has to
// look through them too rather than only the top-level scalar fields.
const searchableText = (row) => {
  const seen = new Set()
  const walk = (value, depth = 0) => {
    if (value == null || depth > 2) return ''
    if (typeof value !== 'object') return String(value)
    if (seen.has(value)) return ''
    seen.add(value)
    return Object.values(value).map((v) => walk(v, depth + 1)).join(' ')
  }
  return walk(row).toLowerCase()
}

const filtered = computed(() => {
  const rows = Array.isArray(props.data) ? props.data : []
  const q = searchQuery.value.trim().toLowerCase()
  const matched = q ? rows.filter((row) => searchableText(row).includes(q)) : rows

  if (!sortKey.value) return matched

  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...matched].sort((a, b) => {
    const av = a[sortKey.value]
    const bv = b[sortKey.value]
    if (av == null) return 1
    if (bv == null) return -1
    const an = Number(av)
    const bn = Number(bv)
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return (an - bn) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))

const pageRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

// Keep the window small so a long list does not grow a wall of page buttons.
const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = page.value
  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)
  const out = []
  for (let p = start; p <= end; p++) out.push(p)
  return out
})

const rangeLabel = computed(() => {
  const count = filtered.value.length
  if (!count) return '0 records'
  const start = (page.value - 1) * props.pageSize + 1
  const end = Math.min(count, page.value * props.pageSize)
  return `Showing ${start}–${end} of ${count}`
})

// A filter that leaves you stranded on a page that no longer exists is the
// classic way a table looks "broken".
watch([filtered, totalPages], () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})
watch(searchQuery, () => { page.value = 1 })

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

// Export what the user is actually looking at (filtered + sorted), not the
// whole unfiltered set — that is what makes the button trustworthy.
const csvCell = (value) => {
  if (value == null) return ''
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const exportCsv = () => {
  const cols = props.columns.filter((c) => c.key !== 'actions')
  const header = cols.map((c) => csvCell(c.label)).join(',')
  const body = filtered.value.map((row) => cols.map((c) => csvCell(row[c.key])).join(','))
  const csv = [header, ...body].join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.exportName}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
