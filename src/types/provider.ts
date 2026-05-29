/** API request format types supported by different providers */
export type RequestFormat = 'openai-compatible' | 'anthropic' | 'gemini' | 'custom'

/** A configured API provider */
export interface Provider {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  models: string[]
  defaultModel: string
  requestFormat: RequestFormat
  enabled: boolean
  isDefault: boolean
  createdAt: number
}

/** Template for creating a new provider */
export interface ProviderTemplate {
  name: string
  baseUrl: string
  requestFormat: RequestFormat
}

/** Built-in provider templates that users can quickly set up */
export const BUILTIN_PROVIDER_TEMPLATES: ProviderTemplate[] = [
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', requestFormat: 'openai-compatible' },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', requestFormat: 'openai-compatible' },
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', requestFormat: 'openai-compatible' },
  { name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', requestFormat: 'anthropic' },
  { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', requestFormat: 'gemini' },
  { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', requestFormat: 'openai-compatible' },
  { name: 'Mistral', baseUrl: 'https://api.mistral.ai/v1', requestFormat: 'openai-compatible' },
  { name: 'Ollama', baseUrl: 'http://localhost:11434/v1', requestFormat: 'openai-compatible' },
  { name: 'Custom OpenAI-Compatible', baseUrl: '', requestFormat: 'openai-compatible' },
]

/** Default model names for built-in providers */
export const BUILTIN_DEFAULT_MODELS: Record<string, string> = {
  'OpenAI': 'gpt-4o',
  'OpenRouter': 'openai/gpt-4o',
  'DeepSeek': 'deepseek-chat',
  'Anthropic': 'claude-sonnet-4-6',
  'Google Gemini': 'gemini-2.5-flash',
  'Groq': 'llama-4-scout-17b-16e-instruct',
  'Mistral': 'mistral-large-latest',
  'Ollama': 'llama3.2',
}
