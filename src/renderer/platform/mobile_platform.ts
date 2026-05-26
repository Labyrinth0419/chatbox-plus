/** biome-ignore-all lint/suspicious/noExplicitAny: <any> */

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Device } from '@capacitor/device'
import * as defaults from '@shared/defaults'
import type { Config, Settings, ShortcutSetting } from '@shared/types'
import { v4 as uuidv4 } from 'uuid'
import { parseLocale } from '@/i18n/parser'
import type { ImageGenerationStorage } from '@/storage/ImageGenerationStorage'
import { SQLiteImageGenerationStorage } from '@/storage/SQLiteImageGenerationStorage'
import type { KnowledgeBaseController } from './knowledge-base/interface'
import type { Platform, PlatformType } from './interfaces'
import MobileExporter from './mobile_exporter'
import { MobileSQLiteStorage } from './storages'
import { parseTextFileLocally } from './web_platform_utils'
import webLogger from './web_logger'

export default class MobilePlatform extends MobileSQLiteStorage implements Platform {
  public type: PlatformType = 'mobile'

  public exporter = new MobileExporter()

  private imageGenerationStorage: ImageGenerationStorage | null = null

  constructor() {
    super()
    webLogger.init().catch((e) => console.error('Failed to init mobile logger:', e))
  }

  public async getVersion(): Promise<string> {
    try {
      return (await App.getInfo()).version
    } catch {
      return 'mobile'
    }
  }

  public async getPlatform(): Promise<string> {
    try {
      return (await Device.getInfo()).platform
    } catch {
      return 'mobile'
    }
  }

  public async getArch(): Promise<string> {
    try {
      const info = await Device.getInfo()
      return info.model || info.platform
    } catch {
      return 'mobile'
    }
  }

  public async shouldUseDarkColors(): Promise<boolean> {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  public onSystemThemeChange(callback: () => void): () => void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', callback)
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', callback)
    }
  }

  public onWindowShow(callback: () => void): () => void {
    let removed = false
    let removeListener: (() => void) | null = null
    App.addListener('resume', callback)
      .then((handle) => {
        removeListener = () => {
          void handle.remove()
        }
        if (removed) {
          removeListener()
        }
      })
      .catch((e) => console.error('Failed to add app resume listener:', e))
    return () => {
      removed = true
      removeListener?.()
    }
  }

  public onWindowFocused(callback: () => void): () => void {
    return this.onWindowShow(callback)
  }

  public onUpdateDownloaded(callback: () => void): () => void {
    return () => null
  }

  public async openLink(url: string): Promise<void> {
    await Browser.open({ url })
  }

  public async getDeviceName(): Promise<string> {
    const info = await Device.getInfo()
    return info.name || info.model || info.platform
  }

  public async getInstanceName(): Promise<string> {
    const info = await Device.getInfo()
    return `${info.name || info.model || 'Mobile'} / ${info.operatingSystem}`
  }

  public async getLocale() {
    try {
      const lang = await Device.getLanguageTag()
      return parseLocale(lang.value)
    } catch {
      return parseLocale(window.navigator.language)
    }
  }

  public async ensureShortcutConfig(config: ShortcutSetting): Promise<void> {
    return
  }

  public async ensureProxyConfig(config: { proxy?: string }): Promise<void> {
    return
  }

  public async relaunch(): Promise<void> {
    location.reload()
  }

  public async getConfig(): Promise<Config> {
    let value: Config = await this.getStoreValue('configs')
    if (value === undefined || value === null) {
      value = defaults.newConfigs()
      await this.setStoreValue('configs', value)
    }
    return value
  }

  public async getSettings(): Promise<Settings> {
    let value: Settings = await this.getStoreValue('settings')
    if (value === undefined || value === null) {
      value = defaults.settings()
      await this.setStoreValue('settings', value)
    }
    return value
  }

  public async getStoreBlob(key: string): Promise<string | null> {
    return this.getStoreValue(key)
  }

  public async setStoreBlob(key: string, value: string): Promise<void> {
    await this.setStoreValue(key, value)
  }

  public async delStoreBlob(key: string): Promise<void> {
    await this.delStoreValue(key)
  }

  public async listStoreBlobKeys(): Promise<string[]> {
    return this.getAllStoreKeys()
  }

  public initTracking(): void {
    setTimeout(() => {
      this.trackingEvent('user_engagement', {})
    }, 4000)
  }

  public trackingEvent(name: string, params: { [key: string]: string }): void {
    try {
      window.gtag?.('event', name, params)
    } catch (e) {
      console.error(e)
    }
  }

  public async shouldShowAboutDialogWhenStartUp(): Promise<boolean> {
    return false
  }

  public async appLog(level: string, message: string): Promise<void> {
    webLogger.log(level, message)
  }

  public async exportLogs(): Promise<string> {
    return webLogger.exportLogs()
  }

  public async clearLogs(): Promise<void> {
    return webLogger.clearLogs()
  }

  public async ensureAutoLaunch(enable: boolean): Promise<void> {
    return
  }

  public async parseFileLocally(file: File): Promise<{ key?: string; isSupported: boolean }> {
    const result = await parseTextFileLocally(file)
    if (!result.isSupported) {
      return { isSupported: false }
    }
    const key = `parseFile-${uuidv4()}`
    await this.setStoreBlob(key, result.text)
    return { key, isSupported: true }
  }

  public async isFullscreen(): Promise<boolean> {
    return true
  }

  public async setFullscreen(enabled: boolean): Promise<void> {
    return
  }

  public async installUpdate(): Promise<void> {
    throw new Error('Updates are managed by the Android package installer.')
  }

  public getKnowledgeBaseController(): KnowledgeBaseController {
    throw new Error('Knowledge base is not available on mobile.')
  }

  public getImageGenerationStorage(): ImageGenerationStorage {
    if (!this.imageGenerationStorage) {
      this.imageGenerationStorage = new SQLiteImageGenerationStorage()
    }
    return this.imageGenerationStorage
  }

  public async minimize(): Promise<void> {
    try {
      await App.minimizeApp()
    } catch {
      return
    }
  }

  public async maximize(): Promise<void> {
    return
  }

  public async unmaximize(): Promise<void> {
    return
  }

  public async closeWindow(): Promise<void> {
    await App.exitApp()
  }

  public async isMaximized(): Promise<boolean> {
    return true
  }

  public onMaximizedChange(callback: (isMaximized: boolean) => void): () => void {
    return () => null
  }
}
