import { ref, watchEffect, type Ref } from 'vue'
import type { AppSettings } from '@/types/settings'

export function useTheme(settings: Ref<AppSettings>) {
  const isDark = ref(false)

  function applyTheme() {
    const theme = settings.value.theme
    if (theme === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = theme === 'dark'
    }
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  watchEffect(applyTheme)

  // Listen for system theme changes when in system mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (settings.value.theme === 'system') applyTheme()
  })

  function toggleTheme() {
    settings.value.theme = isDark.value ? 'light' : 'dark'
  }

  return { isDark, toggleTheme }
}
