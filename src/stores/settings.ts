import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadJSON, saveJSON } from '@/utils/storage'
import type { AppSettings } from '@/types/settings'

const STORAGE_KEY = 'settings'

export const useSettingsStore = defineStore('settings', () => {
  const defaults: AppSettings = {
    streamEnabled: true,
    saveApiKeys: true,
    advanced: {},
    advancedEnabled: false,
    theme: 'system',
    sidebarCollapsed: false,
  }

  const settings = ref<AppSettings>(loadJSON<AppSettings>(STORAGE_KEY, defaults))

  function save() {
    saveJSON(STORAGE_KEY, settings.value)
  }

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    settings.value[key] = value
    save()
  }

  return {
    settings,
    updateSetting,
  }
})
