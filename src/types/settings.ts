import type { AdvancedParams } from './chat'

/** Global app settings persisted to localStorage */
export interface AppSettings {
  /** Whether streaming is enabled by default */
  streamEnabled: boolean
  /** Whether to save API keys to localStorage */
  saveApiKeys: boolean
  /** Advanced parameters — empty/undefined means "use model defaults" */
  advanced: AdvancedParams
  /** Whether advanced params are enabled */
  advancedEnabled: boolean
  /** UI theme */
  theme: 'light' | 'dark' | 'system'
  /** Sidebar collapsed on desktop */
  sidebarCollapsed: boolean
}
