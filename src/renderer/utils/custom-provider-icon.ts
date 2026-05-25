import storage from '@/storage'
import { StorageKeyGenerator } from '@/storage/StoreStorage'

const CUSTOM_PROVIDER_ICON_STORAGE_PREFIX = 'storage://custom-provider-icon/'
const CUSTOM_PROVIDER_ICON_MAX_BYTES = 5 * 1024 * 1024
const CUSTOM_PROVIDER_ICON_MIME_TYPES = new Set(['image/png', 'image/jpeg'])

export function createCustomProviderIconStorageUrl(storageKey: string): string {
  return `${CUSTOM_PROVIDER_ICON_STORAGE_PREFIX}${encodeURIComponent(storageKey)}`
}

export function isCustomProviderIconStorageUrl(iconUrl?: string): boolean {
  return !!iconUrl?.startsWith(CUSTOM_PROVIDER_ICON_STORAGE_PREFIX)
}

export function getCustomProviderIconStorageKey(iconUrl?: string): string | undefined {
  if (!iconUrl?.startsWith(CUSTOM_PROVIDER_ICON_STORAGE_PREFIX)) {
    return undefined
  }
  return decodeURIComponent(iconUrl.slice(CUSTOM_PROVIDER_ICON_STORAGE_PREFIX.length))
}

export function isSupportedCustomProviderIconFile(file: File): boolean {
  return CUSTOM_PROVIDER_ICON_MIME_TYPES.has(file.type) && file.size <= CUSTOM_PROVIDER_ICON_MAX_BYTES
}

export async function saveCustomProviderIconFile(file: File, providerId: string): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read image'))
      }
    }
    reader.onerror = () => reject(reader.error || new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })

  const storageKey = StorageKeyGenerator.picture(`custom-provider-icon:${providerId}`)
  await storage.setBlob(storageKey, base64)
  return createCustomProviderIconStorageUrl(storageKey)
}
