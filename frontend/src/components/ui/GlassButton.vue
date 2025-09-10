<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label?: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'glass',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false
})

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

const base = 'relative select-none inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden'

const variants: Record<string,string> = {
  primary: 'bg-gradient-to-br from-brand-500 to-emerald-500 text-white shadow-brand hover:shadow-brand-lg hover:brightness-[1.08] hover:-translate-y-[2px]',
  secondary: 'bg-gradient-to-br from-slate-200/70 to-slate-300/60 dark:from-slate-700/60 dark:to-slate-600/50 text-slate-800 dark:text-slate-100 hover:-translate-y-[2px] shadow-soft hover:shadow-soft-lg',
  outline: 'border border-white/40 dark:border-slate-600/60 bg-white/10 dark:bg-slate-800/20 text-slate-800 dark:text-slate-100 hover:bg-white/25 dark:hover:bg-slate-700/40 hover:-translate-y-[2px] shadow-soft',
  danger: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-danger hover:shadow-danger-lg hover:-translate-y-[2px]',
  glass: 'bg-white/15 dark:bg-slate-800/25 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 hover:bg-white/30 dark:hover:bg-slate-700/40 hover:-translate-y-[2px] shadow-glass hover:shadow-glass-lg'
}

const sizes: Record<string,string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2.5'
}

const cls = computed(() => [
  base,
  variants[props.variant],
  sizes[props.size],
  props.block ? 'w-full' : ''
].join(' '))
</script>

<template>
  <button :type="props.type" :class="cls" :disabled="props.disabled || props.loading" @click="(e)=> emit('click', e)">
    <span v-if="props.loading" class="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5">
      <span class="h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></span>
    </span>
    <i v-if="props.icon" :class="[props.icon, 'text-sm', props.label ? '-ml-1' : '']" />
    <span v-if="props.label" class="relative z-10">{{ props.label }}</span>
    <slot />
  </button>
</template>

<style scoped>
</style>
