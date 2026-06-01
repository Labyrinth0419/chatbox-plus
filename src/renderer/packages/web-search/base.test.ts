import { CapacitorHttp } from '@capacitor/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WebSearch from './base'

vi.mock('@capacitor/core', () => ({
  CapacitorHttp: {
    request: vi.fn(),
  },
}))

vi.mock('@/platform', () => ({
  default: {
    type: 'mobile',
    getVersion: vi.fn().mockResolvedValue('test-version'),
  },
}))

class TestSearch extends WebSearch {
  search() {
    return Promise.resolve({ items: [] })
  }

  request(url: string, options: Parameters<WebSearch['fetch']>[1]) {
    return this.fetch(url, options)
  }
}

describe('WebSearch mobile fetch', () => {
  beforeEach(() => {
    vi.mocked(CapacitorHttp.request).mockReset()
    vi.mocked(CapacitorHttp.request).mockResolvedValue({
      data: '<html></html>',
      status: 200,
      headers: {},
      url: '',
    })
  })

  it('uses a modern browser user agent and avoids navigation-only spoofing headers', async () => {
    const search = new TestSearch()

    await search.request('https://www.bing.com/search', {
      method: 'GET',
      query: { q: 'Chatbox' },
    })

    const request = vi.mocked(CapacitorHttp.request).mock.calls[0]?.[0]
    expect(request?.headers?.['User-Agent']).toContain('Chrome/125.0.0.0')
    expect(request?.headers?.origin).toBeUndefined()
    expect(request?.headers?.referer).toBeUndefined()
  })
})
