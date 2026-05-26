import { CapacitorHttp } from '@capacitor/core'
import { createNativeReadableStream } from '@/native/stream-http'
import { ApiError } from '../../shared/models/errors'

interface CapacitorFormDataEntry {
  key: string
  value: string
  type: 'base64File' | 'string'
  contentType?: string
  fileName?: string
}

function isFormDataBody(body: RequestInit['body']): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

function getBlobFileName(value: Blob, key: string): string {
  if (typeof File !== 'undefined' && value instanceof File && value.name) {
    return value.name
  }
  return `${key}.bin`
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }

  return btoa(binary)
}

function convertFormDataForCapacitor(formData: FormData): Promise<CapacitorFormDataEntry[]> {
  const entries: Promise<CapacitorFormDataEntry>[] = []

  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      entries.push(
        Promise.resolve({
          key,
          value,
          type: 'string',
        })
      )
      return
    }

    entries.push(
      blobToBase64(value).then((base64) => ({
        key,
        value: base64,
        type: 'base64File',
        contentType: value.type || 'application/octet-stream',
        fileName: getBlobFileName(value, key),
      }))
    )
  })

  return Promise.all(entries)
}

function createMultipartBoundary(): string {
  return `----ChatboxFormBoundary${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
}

export async function handleMobileRequest(
  url: string,
  method: string,
  headers: Headers,
  body?: RequestInit['body'],
  signal?: AbortSignal
): Promise<Response> {
  // Fix: Convert Headers to plain object without using .entries()
  const headerObj: Record<string, string> = {}
  headers.forEach((value, key) => {
    headerObj[key] = value
  })
  const isStreaming = body && typeof body === 'string' && JSON.parse(body).stream === true

  if (isStreaming) {
    try {
      // Add SSE Accept header for proper content negotiation
      const streamHeaders = {
        ...headerObj,
        Accept: 'text/event-stream',
      }

      const stream = createNativeReadableStream({
        url,
        method,
        headers: streamHeaders,
        body: body as string,
      })

      // Handle abort signal for stream cancellation
      if (signal) {
        const onAbort = () => {
          try {
            void stream.cancel('aborted')
          } catch {}
        }
        if (signal.aborted) onAbort()
        else signal.addEventListener('abort', onAbort, { once: true })
      }

      // TODO: Once native plugin supports returning status/headers,
      // use them instead of hardcoded values
      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      })
    } catch (err) {
      console.warn('Native streaming unavailable, falling back', err)
    }
  }

  let response: Awaited<ReturnType<typeof CapacitorHttp.request>>
  if (isFormDataBody(body)) {
    const formDataHeaders = { ...headerObj }
    delete formDataHeaders['content-type']
    delete formDataHeaders['Content-Type']
    formDataHeaders['Content-Type'] = `multipart/form-data; boundary=${createMultipartBoundary()}`

    response = await CapacitorHttp.request({
      url,
      method,
      headers: formDataHeaders,
      data: await convertFormDataForCapacitor(body),
      dataType: 'formData',
      responseType: 'text',
    })
  } else {
    response = await CapacitorHttp.request({
      url,
      method,
      headers: headerObj,
      data: body,
      responseType: 'text',
    })
  }

  const rawData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
  // Treat status 0 or < 200 as errors, in addition to >= 400
  if (response.status === 0 || response.status < 200 || response.status >= 400) {
    throw new ApiError(`Status Code ${response.status}`, rawData)
  }
  const responseData = rawData

  if (isStreaming) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(responseData))
        controller.close()
      },
    })
    return new Response(stream, {
      status: response.status,
      headers: { ...response.headers, 'Content-Type': 'text/event-stream' },
    })
  }

  return new Response(responseData, {
    status: response.status,
    headers: response.headers,
  })
}
