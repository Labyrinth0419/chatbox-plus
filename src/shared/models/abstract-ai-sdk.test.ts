import type { LanguageModelV3 } from '@ai-sdk/provider'
import type { ImageModel, Provider } from 'ai'
import type { ModelDependencies } from 'src/shared/types/adapters'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AbstractAISDKModel from './abstract-ai-sdk'
import type { CallChatCompletionOptions } from './types'

const generateImageMock = vi.hoisted(() => vi.fn())

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>()
  return {
    ...actual,
    experimental_generateImage: generateImageMock,
  }
})

class TestAISDKModel extends AbstractAISDKModel {
  protected getProvider(): Pick<Provider, 'languageModel'> {
    return {
      languageModel: vi.fn(),
    }
  }

  protected getChatModel(_options: CallChatCompletionOptions): LanguageModelV3 {
    throw new Error('not used')
  }

  protected getImageModel(): ImageModel {
    return {
      specificationVersion: 'v3',
      provider: 'test',
      modelId: 'test-image-model',
      maxImagesPerCall: 1,
      doGenerate: vi.fn(),
    }
  }
}

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

describe('AbstractAISDKModel.paint', () => {
  beforeEach(() => {
    generateImageMock.mockReset()
    generateImageMock.mockResolvedValue({
      images: [{ mediaType: 'image/png', base64: 'AAAA' }],
    })
  })

  it('passes reference images through to AI SDK image models', async () => {
    const model = new TestAISDKModel({ model: { modelId: 'test-image-model' } }, dependencies)

    await model.paint({
      prompt: 'make a variation',
      images: [{ imageUrl: 'https://example.com/reference.png' }, { imageUrl: 'data:image/png;base64,BBBB' }],
      num: 1,
    })

    expect(generateImageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: {
          text: 'make a variation',
          images: ['https://example.com/reference.png', 'data:image/png;base64,BBBB'],
        },
      })
    )
  })
})
