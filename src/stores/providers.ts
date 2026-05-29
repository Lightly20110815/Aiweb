import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import { loadJSON, saveJSON } from '@/utils/storage'
import type { Provider, RequestFormat } from '@/types/provider'
import { BUILTIN_PROVIDER_TEMPLATES, BUILTIN_DEFAULT_MODELS } from '@/types/provider'

const STORAGE_KEY = 'providers'

export const useProvidersStore = defineStore('providers', () => {
  const providers = ref<Provider[]>(loadJSON<Provider[]>(STORAGE_KEY, []))

  const enabledProviders = computed(() => providers.value.filter((p) => p.enabled))
  const defaultProvider = computed(() => providers.value.find((p) => p.isDefault && p.enabled) ?? enabledProviders.value[0] ?? null)

  function save() {
    saveJSON(STORAGE_KEY, providers.value)
  }

  function getProvider(id: string): Provider | undefined {
    return providers.value.find((p) => p.id === id)
  }

  /** Add a provider from a built-in template, or a blank custom one */
  function addProvider(templateName?: string): Provider {
    const template = templateName
      ? BUILTIN_PROVIDER_TEMPLATES.find((t) => t.name === templateName)
      : undefined

    const provider: Provider = {
      id: nanoid(),
      name: template?.name ?? 'New Provider',
      baseUrl: template?.baseUrl ?? '',
      apiKey: '',
      models: templateName ? [BUILTIN_DEFAULT_MODELS[templateName] ?? ''] : [],
      defaultModel: templateName ? (BUILTIN_DEFAULT_MODELS[templateName] ?? '') : '',
      requestFormat: template?.requestFormat ?? 'openai-compatible',
      enabled: true,
      isDefault: providers.value.length === 0,
      createdAt: Date.now(),
    }
    providers.value.push(provider)
    save()
    return provider
  }

  function updateProvider(id: string, updates: Partial<Provider>) {
    const idx = providers.value.findIndex((p) => p.id === id)
    if (idx === -1) return
    providers.value[idx] = { ...providers.value[idx], ...updates }
    save()
  }

  function removeProvider(id: string) {
    providers.value = providers.value.filter((p) => p.id !== id)
    save()
  }

  function setDefault(id: string) {
    for (const p of providers.value) p.isDefault = false
    const target = providers.value.find((p) => p.id === id)
    if (target) target.isDefault = true
    save()
  }

  function addModel(id: string, model: string) {
    const provider = providers.value.find((p) => p.id === id)
    if (provider && !provider.models.includes(model)) {
      provider.models.push(model)
      save()
    }
  }

  function removeModel(id: string, model: string) {
    const provider = providers.value.find((p) => p.id === id)
    if (provider) {
      provider.models = provider.models.filter((m) => m !== model)
      if (provider.defaultModel === model) {
        provider.defaultModel = provider.models[0] ?? ''
      }
      save()
    }
  }

  return {
    providers,
    enabledProviders,
    defaultProvider,
    getProvider,
    addProvider,
    updateProvider,
    removeProvider,
    setDefault,
    addModel,
    removeModel,
  }
})
