import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWithProxy } from './request'

vi.mock('./mobile-request', () => ({
  handleMobileRequest: vi.fn(),
}))

describe('request utils', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not set a JSON content type for FormData bodies', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    const body = new FormData()
    body.append('prompt', 'test')

    await fetchWithProxy('http://localhost/images/edits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    const headers = fetchMock.mock.calls[0][1]?.headers

    expect(headers).toBeInstanceOf(Headers)
    expect((headers as Headers).has('Content-Type')).toBe(false)
  })

  it('keeps the default JSON content type for non-FormData requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

    await fetchWithProxy('http://localhost/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    })

    const headers = fetchMock.mock.calls[0][1]?.headers

    expect(headers).toBeInstanceOf(Headers)
    expect((headers as Headers).get('Content-Type')).toBe('application/json')
  })
})
