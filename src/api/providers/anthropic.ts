import type { ChatRequest, ChatError, StreamCallback, ErrorCallback } from '@/types/chat'

export async function sendAnthropic(
  req: ChatRequest,
  signal: AbortSignal,
  onChunk: StreamCallback,
  onError: ErrorCallback,
): Promise<string> {
  const { provider, model, messages, stream, advanced } = req

  // Convert messages to Anthropic format
  const systemMsg = messages.find((m) => m.role === 'system')
  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }))

  const body: Record<string, unknown> = {
    model,
    messages: chatMessages,
    stream,
  }

  if (systemMsg) body.system = systemMsg.content
  if (advanced?.maxTokens !== undefined) body.max_tokens = advanced.maxTokens
  if (advanced?.temperature !== undefined) body.temperature = advanced.temperature
  if (advanced?.topP !== undefined) body.top_p = advanced.topP

  const url = `${provider.baseUrl.replace(/\/+$/, '')}/messages`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal,
    })
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    const err: ChatError = { type: 'network', message: '网络请求失败，请检查网络连接和 API 地址。' }
    onError(err)
    throw new Error(err.message)
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    if (response.status === 401 || response.status === 403) {
      const err: ChatError = { type: 'auth', message: 'API Key 无效或无权访问。', statusCode: response.status }
      onError(err)
      throw new Error(err.message)
    }
    const err: ChatError = { type: 'unknown', message: `请求失败 (${response.status}): ${errBody.slice(0, 200)}`, statusCode: response.status }
    onError(err)
    throw new Error(err.message)
  }

  if (stream && response.body) {
    return handleAnthropicStream(response.body, onChunk, onError)
  }

  const data = await response.json()
  const content = data.content?.[0]?.text ?? ''
  onChunk(content)
  return content
}

async function handleAnthropicStream(
  body: ReadableStream<Uint8Array>,
  onChunk: StreamCallback,
  onError: ErrorCallback,
): Promise<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const dataStr = trimmed.slice(6)

        try {
          const parsed = JSON.parse(dataStr)
          if (parsed.type === 'content_block_delta') {
            const delta = parsed.delta?.text
            if (delta) {
              fullContent += delta
              onChunk(delta)
            }
          }
        } catch {
          // Skip malformed lines
        }
      }
    }
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    const err: ChatError = { type: 'parse', message: '流式响应中断，请重试。' }
    onError(err)
    throw new Error(err.message)
  } finally {
    reader.releaseLock()
  }

  return fullContent
}
