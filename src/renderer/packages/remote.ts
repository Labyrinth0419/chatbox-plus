import platform from '@/platform'
import { createAfetch } from '../../shared/request/request'
import type { ModelProvider, ProviderModelInfo } from '../../shared/types'
import { getOS } from './navigator'

let _afetch: ReturnType<typeof createAfetch> | null = null
let afetchPromise: Promise<ReturnType<typeof createAfetch>> | null = null

async function initAfetch(): Promise<ReturnType<typeof createAfetch>> {
  if (afetchPromise) return afetchPromise

  afetchPromise = (async () => {
    _afetch = createAfetch({
      type: platform.type,
      platform: await platform.getPlatform(),
      os: getOS(),
      version: await platform.getVersion(),
    })
    return _afetch
  })()

  return afetchPromise
}

async function getAfetch() {
  if (!_afetch) {
    return await initAfetch()
  }
  return _afetch
}

const getChatboxHeaders = async () => {
  return {
    'CHATBOX-PLATFORM': await platform.getPlatform(),
    'CHATBOX-PLATFORM-TYPE': platform.type,
    'CHATBOX-VERSION': await platform.getVersion(),
    'CHATBOX-OS': getOS(),
  }
}

export async function getModelManifest(params: {
  aiProvider: ModelProvider
}): Promise<{ groupName: string; models: ProviderModelInfo[] }> {
  void params
  return { groupName: '', models: [] }
}

export async function parseUserLinkFree(params: { url: string }) {
  type Response = {
    title: string
    text: string
  }
  const afetch = await getAfetch()
  const res = await afetch(`https://cors-proxy.chatboxai.app/api/fetch-webpage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getChatboxHeaders()),
    },
    body: JSON.stringify(params),
  })
  const json: Response = await res.json()
  return json
}
