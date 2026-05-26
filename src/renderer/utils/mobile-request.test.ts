import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleMobileRequest } from './mobile-request'

const requestMock = vi.hoisted(() => vi.fn())

vi.mock('@capacitor/core', () => ({
  CapacitorHttp: {
    request: requestMock,
  },
}))

vi.mock('@/native/stream-http', () => ({
  createNativeReadableStream: vi.fn(),
}))

describe('handleMobileRequest', () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({
      status: 200,
      data: '{}',
      headers: {},
    })
  })

  it('serializes FormData for CapacitorHttp native requests', async () => {
    const body = new FormData()
    body.append('prompt', 'edit this image')
    body.append('image', new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }), 'input.png')

    await handleMobileRequest(
      'https://example.com/v1/images/edits',
      'POST',
      new Headers({
        Authorization: 'Bearer test-key',
        'content-type': 'application/json',
      }),
      body
    )

    const options = requestMock.mock.calls[0][0]

    expect(options.dataType).toBe('formData')
    expect(options.headers.authorization).toBe('Bearer test-key')
    expect(options.headers['content-type']).toBeUndefined()
    expect(options.headers['Content-Type']).toMatch(/^multipart\/form-data; boundary=/)
    expect(options.data).toEqual(
      expect.arrayContaining([
        {
          key: 'prompt',
          value: 'edit this image',
          type: 'string',
        },
        expect.objectContaining({
          key: 'image',
          type: 'base64File',
          value: 'AQID',
          contentType: 'image/png',
          fileName: 'input.png',
        }),
      ])
    )
  })
})
