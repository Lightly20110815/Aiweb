import type { ChatRequest, ChatError, StreamCallback, ErrorCallback } from '@/types/chat'

function buildError(status: number, body: string): ChatError {
  if (status === 401 || status === 403) return { type: 'auth', message: 'API Key 无效或无权访问。', statusCode: status }
  if (status === 429) return { type: 'rate_limit', message: '请求过于频繁，请稍后再试。', statusCode: status }
  if (status >= 500) return { type: 'server', message: `服务器错误 (${status})，请稍后重试。`, statusCode: status }
  return { type: 'unknown', message: `请求失败 (${status}): ${body.slice(0, 200)}`, statusCode: status }
}

export async function sendOpenAICompatible(
  req: ChatRequest,
  signal: AbortSignal,
  onChunk: StreamCallback,
  onError: ErrorCallback,
): Promise<string> {
  const { provider, model, messages, stream, advanced } = req

  const body: Record<string, unknown> = {
    model,
    messages,
    stream,
  }

  // Only add advanced params when explicitly provided
  if (advanced) {
    if (advanced.temperature !== undefined) body.temperature = advanced.temperature
    if (advanced.topP !== undefined) body.top_p = advanced.topP
    if (advanced.maxTokens !== undefined) body.max_tokens = advanced.maxTokens
    if (advanced.presencePenalty !== undefined) body.presence_penalty = advanced.presencePenalty
    if (advanced.frequencyPenalty !== undefined) body.frequency_penalty = advanced.frequencyPenalty
  }

  const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
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
    const err = buildError(response.status, errBody)
    onError(err)
    throw new Error(err.message)
  }

  if (stream && response.body) {
    return handleStream(response.body, onChunk, onError)
  }

  // Non-streaming response
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  onChunk(content)
  return content
}

async function handleStream(
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
        if (dataStr === '[DONE]') continue

        try {
          const parsed = JSON.parse(dataStr)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            fullContent += delta
            onChunk(delta)
          }
        } catch {
          // Skip malformed SSE lines
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
