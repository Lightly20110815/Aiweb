/** Role of a chat message */
export type MessageRole = 'user' | 'assistant' | 'system'

/** Status of a message */
export type MessageStatus = 'normal' | 'streaming' | 'error'

/** A single chat message */
export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: number
  status: MessageStatus
}

/** A chat session */
export interface Session {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  providerId: string
  model: string
  messages: Message[]
}

/** Advanced parameters for API requests — all optional, only sent when explicitly set */
export interface AdvancedParams {
  temperature?: number
  topP?: number
  maxTokens?: number
  presencePenalty?: number
  frequencyPenalty?: number
}

/** Unified request payload passed to the API layer */
export interface ChatRequest {
  provider: import('./provider').Provider
  model: string
  messages: Array<{ role: MessageRole; content: string }>
  stream: boolean
  advanced?: AdvancedParams
}

/** Streaming chunk callback */
export type StreamCallback = (chunk: string) => void

/** Error callback */
export type ErrorCallback = (error: ChatError) => void

/** Structured chat error */
export interface ChatError {
  type: 'auth' | 'rate_limit' | 'network' | 'server' | 'parse' | 'unknown'
  message: string
  statusCode?: number
  raw?: unknown
}
