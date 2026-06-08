import type { ModelDependencies } from '@shared/types/adapters'
import { describe, expect, it, vi } from 'vitest'
import { convertToModelMessages } from './message-utils'

const getImage = vi.fn()

vi.mock('@/adapters', () => ({
  createModelDependencies: async () =>
    ({
      storage: {
        getImage,
      },
    }) as unknown as ModelDependencies,
}))

describe('convertToModelMessages', () => {
  it('keeps image parts when the selected model supports vision', async () => {
    getImage.mockResolvedValueOnce('data:image/png;base64,AAAA')

    const messages = await convertToModelMessages(
      [
        {
          id: 'msg-1',
          role: 'user',
          contentParts: [
            { type: 'text', text: 'what is this?' },
            { type: 'image', storageKey: 'picture:input-box:1' },
          ],
        },
      ],
      { modelSupportVision: true }
    )

    expect(messages).toEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'what is this?' },
          { type: 'image', image: 'AAAA', mediaType: 'image/png' },
        ],
      },
    ])
  })

  it('throws instead of silently dropping an unreadable attached image', async () => {
    getImage.mockResolvedValueOnce('')

    await expect(
      convertToModelMessages(
        [
          {
            id: 'msg-1',
            role: 'user',
            contentParts: [
              { type: 'text', text: 'what is this?' },
              { type: 'image', storageKey: 'picture:input-box:missing' },
            ],
          },
        ],
        { modelSupportVision: true }
      )
    ).rejects.toThrow('Failed to read attached image')
  })

  it('drops assistant reasoning parts by default', async () => {
    const messages = await convertToModelMessages([
      {
        id: 'msg-1',
        role: 'assistant',
        contentParts: [
          { type: 'reasoning', text: 'private chain of thought' },
          { type: 'text', text: 'final answer' },
        ],
      },
    ])

    expect(messages).toEqual([
      {
        role: 'assistant',
        content: [{ type: 'text', text: 'final answer' }],
      },
    ])
  })

  it('preserves assistant reasoning parts when explicitly enabled', async () => {
    const messages = await convertToModelMessages(
      [
        {
          id: 'msg-1',
          role: 'assistant',
          contentParts: [
            { type: 'reasoning', text: 'deepseek thinking' },
            { type: 'text', text: 'final answer' },
          ],
        },
      ],
      { preserveReasoning: true }
    )

    expect(messages).toEqual([
      {
        role: 'assistant',
        content: [
          { type: 'reasoning', text: 'deepseek thinking' },
          { type: 'text', text: 'final answer' },
        ],
      },
    ])
  })
})
