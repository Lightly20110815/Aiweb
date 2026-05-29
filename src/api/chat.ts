import type { ChatRequest, StreamCallback, ErrorCallback } from '@/types/chat'
import { sendOpenAICompatible } from './providers/openai-compatible'
import { sendAnthropic } from './providers/anthropic'
import { sendGemini } from './providers/gemini'

export interface SendOptions {
  signal: AbortSignal
  onChunk: StreamCallback
  onError: ErrorCallback
}

/** Unified message sending — routes to the correct adapter based on provider format */
export async function sendMessage(
  req: ChatRequest,
  options: SendOptions,
): Promise<string> {
  const { provider } = req

  // Fall back to openai-compatible for custom format
  const format = provider.requestFormat || 'openai-compatible'

  switch (format) {
    case 'anthropic':
      return sendAnthropic(req, options.signal, options.onChunk, options.onError)
    case 'gemini':
      return sendGemini(req, options.signal, options.onChunk, options.onError)
    case 'openai-compatible':
    case 'custom':
    default:
      return sendOpenAICompatible(req, options.signal, options.onChunk, options.onError)
  }
}
