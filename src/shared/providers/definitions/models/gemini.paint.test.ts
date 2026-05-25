import type { ModelDependencies } from 'src/shared/types/adapters'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CustomGemini from './custom-gemini'
import Gemini from './gemini'

const createGoogleGenerativeAIMock = vi.hoisted(() => vi.fn())
const generateTextMock = vi.hoisted(() => vi.fn())

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: createGoogleGenerativeAIMock,
}))

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>()
  return {
    ...actual,
    generateText: generateTextMock,
  }
})

const dependencies = {
  request: {
    apiRequest: vi.fn(),
    fetchWithOptions: vi.fn(),
  },
  storage: {
    saveImage: vi.fn(),
    getImage: vi.fn(),
  },
  sentry: {
    captureException: vi.fn(),
    withScope: vi.fn(),
  },
  getRemoteConfig: vi.fn(),
} satisfies ModelDependencies

describe('Gemini image painting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createGoogleGenerativeAIMock.mockReturnValue({
      chat: vi.fn(() => ({ provider: 'google', modelId: 'gemini-2.5-flash-image' })),
    })
    generateTextMock.mockResolvedValue({
      files: [{ mediaType: 'image/png', base64: 'AAAA' }],
    })
  })

  it('passes reference images to official Gemini image models', async () => {
    const model = new Gemini(
      {
        geminiAPIKey: 'test-key',
        geminiAPIHost: 'https://generativelanguage.googleapis.com',
        model: { modelId: 'gemini-2.5-flash-image', type: 'image' },
      },
      dependencies
    )

    await model.paint({
      prompt: 'make a variation',
      images: [{ imageUrl: 'data:image/png;base64,BBBB' }],
      num: 1,
    })

    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', image: 'data:image/png;base64,BBBB' },
              { type: 'text', text: 'make a variation' },
            ],
          },
        ],
      })
    )
  })

  it('passes reference images to custom Gemini image models', async () => {
    const model = new CustomGemini(
      {
        apiKey: 'test-key',
        apiHost: 'https://generativelanguage.googleapis.com',
        model: { modelId: 'gemini-2.5-flash-image', type: 'image' },
      },
      dependencies
    )

    await model.paint({
      prompt: 'make a variation',
      images: [{ imageUrl: 'https://example.com/reference.png' }],
      num: 1,
    })

    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', image: 'https://example.com/reference.png' },
              { type: 'text', text: 'make a variation' },
            ],
          },
        ],
      })
    )
  })
})
