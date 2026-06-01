import { CapacitorHttp } from '@capacitor/core'
import type { SearchResult } from '@shared/types'
import { type FetchOptions, ofetch } from 'ofetch'
import platform from '@/platform'

const CHATBOX_OFFICIAL_PROXY_URL = 'https://cors-proxy.chatboxai.app/proxy-api/completions'
const MOBILE_WEB_SEARCH_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

type WebSearchFetchOptions = FetchOptions & {
  useOfficialProxy?: boolean
}

export interface ParseLinkResult {
  url: string
  title: string
  content: string
}

function appendQuery(url: string, query?: FetchOptions['query']) {
  if (!query) return url

  const normalizedUrl = new URL(url)
  const params = new URLSearchParams(query as Record<string, string>)
  params.forEach((value, key) => {
    normalizedUrl.searchParams.set(key, value)
  })
  return normalizedUrl.toString()
}

function toPlainHeaders(headers?: WebSearchFetchOptions['headers']) {
  const plainHeaders: Record<string, string> = {}
  if (!headers) return plainHeaders

  new Headers(headers as HeadersInit).forEach((value, key) => {
    plainHeaders[key] = value
  })
  return plainHeaders
}

abstract class WebSearch {
  abstract search(query: string, signal?: AbortSignal): Promise<SearchResult>

  supportsParseLink = false

  /**
   * Parse/extract readable content from a URL.
   * Override in subclasses that support this capability.
   */
  parseLink(_url: string, _signal?: AbortSignal): Promise<ParseLinkResult | null> {
    return Promise.resolve(null)
  }

  async fetch(url: string, options: WebSearchFetchOptions) {
    const targetUrl = appendQuery(url, options.query)
    const requestUrl = options.useOfficialProxy ? CHATBOX_OFFICIAL_PROXY_URL : url
    const headers = {
      ...toPlainHeaders(options.headers),
      ...(options.useOfficialProxy
        ? {
            'CHATBOX-TARGET-URI': targetUrl,
            'CHATBOX-PLATFORM': platform.type,
            'CHATBOX-VERSION': await platform.getVersion().catch(() => 'unknown'),
          }
        : {}),
    }

    if (platform.type === 'mobile') {
      const { data } = await CapacitorHttp.request({
        url: requestUrl,
        method: options.method,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          ...headers,
          'User-Agent': MOBILE_WEB_SEARCH_USER_AGENT,
        },
        params: options.useOfficialProxy ? undefined : options.query,
        data: options.body,
      })

      return data
    } else {
      return ofetch(requestUrl, {
        ...options,
        headers,
        query: options.useOfficialProxy ? undefined : options.query,
      })
    }
  }
}

export default WebSearch
