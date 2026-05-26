import { ModelProviderEnum, ModelProviderType } from '../../types'
import { createOAuthCredentialManager, createOpenAIOAuthFetch } from '../../oauth'
import { defineProvider } from '../registry'
import OpenAI from './models/openai'
import OpenAIResponses from './models/openai-responses'

export const openaiProvider = defineProvider({
  id: ModelProviderEnum.OpenAI,
  name: 'OpenAI',
  type: ModelProviderType.OpenAI,
  description: 'openai',
  modelsDevProviderId: 'openai',
  curatedModelIds: ['gpt-image-2', 'gpt-5.4', 'gpt-5.5', 'gpt-5.5-pro'],
  urls: {
    website: 'https://openai.com',
  },
  defaultSettings: {
    apiHost: 'https://api.openai.com',
    // https://platform.openai.com/docs/models
    models: [
      {
        modelId: 'gpt-image-2',
        type: 'image',
        capabilities: ['vision'],
      },
      {
        modelId: 'gpt-5.4',
        capabilities: ['vision', 'tool_use', 'reasoning'],
        contextWindow: 1_050_000,
        maxOutput: 128_000,
      },
      {
        modelId: 'gpt-5.5',
        capabilities: ['vision', 'tool_use', 'reasoning'],
        contextWindow: 1_050_000,
        maxOutput: 128_000,
      },
      {
        modelId: 'gpt-5.5-pro',
        capabilities: ['vision', 'tool_use', 'reasoning'],
        contextWindow: 1_050_000,
        maxOutput: 128_000,
      },
    ],
  },
  createModel: (config) => {
    const isOAuth = config.providerSetting.activeAuthMode === 'oauth' && !!config.providerSetting.oauth?.accessToken
    const credentialManager = createOAuthCredentialManager(
      ModelProviderEnum.OpenAI,
      config.providerSetting,
      config.dependencies
    )
    const oauthFetch =
      isOAuth && credentialManager ? createOpenAIOAuthFetch(config.dependencies, credentialManager) : undefined

    if (isOAuth) {
      return new OpenAIResponses(
        {
          apiKey: 'oauth-placeholder',
          apiHost: config.formattedApiHost,
          apiPath: '/responses',
          model: config.model,
          temperature: config.settings.temperature,
          topP: config.settings.topP,
          maxOutputTokens: config.settings.maxTokens,
          stream: config.settings.stream,
          useProxy: config.providerSetting.useProxy || false,
          customFetch: oauthFetch,
          listModelsFallback: config.providerSetting.models || openaiProvider.defaultSettings?.models,
          skipRemoteModelList: true,
          forceStatelessResponses: true,
        },
        config.dependencies
      )
    }

    return new OpenAI(
      {
        apiKey: config.effectiveApiKey,
        apiHost: config.formattedApiHost,
        model: config.model,
        dalleStyle: config.settings.dalleStyle || 'vivid',
        temperature: config.settings.temperature,
        topP: config.settings.topP,
        maxOutputTokens: config.settings.maxTokens,
        injectDefaultMetadata: config.globalSettings.injectDefaultMetadata,
        useProxy: config.providerSetting.useProxy || false,
        stream: config.settings.stream,
      },
      config.dependencies
    )
  },
  getDisplayName: (modelId, providerSettings, sessionType) => {
    if (sessionType === 'picture') {
      return 'OpenAI API (DALL-E-3)'
    }
    return `OpenAI API (${providerSettings?.models?.find((m) => m.modelId === modelId)?.nickname || modelId})`
  },
})
