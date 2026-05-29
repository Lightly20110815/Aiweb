import type { ChatRequest, ChatError, StreamCallback, ErrorCallback } from '@/types/chat'

export async function sendGemini(
  req: ChatRequest,
  signal: AbortSignal,
  onChunk: StreamCallback,
  onError: ErrorCallback,
): Promise<string> {
  const { provider, model, messages, stream, advanced } = req

  // Build Gemini contents from messages
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const systemMsg = messages.find((m) => m.role === 'system')

  const body: Record<string, unknown> = {
    contents,
  }

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] }
  }

  const generationConfig: Record<string, unknown> = {}
  if (advanced?.temperature !== undefined) generationConfig.temperature = advanced.temperature
  if (advanced?.topP !== undefined) generationConfig.topP = advanced.topP
  if (advanced?.maxTokens !== undefined) generationConfig.maxOutputTokens = advanced.maxTokens
  if (Object.keys(generationConfig).length > 0) {
    body.generationConfig = generationConfig
  }

  const url = `${provider.baseUrl.replace(/\/+$/, '')}/models/${model}:${stream ? 'streamGenerateContent' : 'generateContent'}?alt=${stream ? 'sse' : 'json'}&key=${encodeURIComponent(provider.apiKey)}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const err: ChatError = { type: 'unknown', message: `Gemini 请求失败 (${response.status}): ${errBody.slice(0, 200)}`, statusCode: response.status }
    onError(err)
    throw new Error(err.message)
  }

  if (stream) {
    const text = await response.text()
    return parseGeminiStream(text, onChunk)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  onChunk(content)
  return content
}

function parseGeminiStream(raw: string, onChunk: StreamCallback): string {
  let fullContent = ''
  const lines = raw.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || !trimmed.startsWith('data: ')) continue
    const dataStr = trimmed.slice(6)
    try {
      const parsed = JSON.parse(dataStr)
      const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        fullContent += text
        onChunk(text)
      }
    } catch {
      // Skip
    }
  }
  return fullContent
}
