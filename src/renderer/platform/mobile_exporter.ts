import type { Exporter } from './interfaces'
import { AndroidFilterWriter, type FilterWriter, IOSFilterWriter } from './filter_writer'
import { CHATBOX_BUILD_PLATFORM } from '@/variables'

export default class MobileExporter implements Exporter {
  private writer: FilterWriter

  constructor() {
    this.writer = CHATBOX_BUILD_PLATFORM === 'ios' ? new IOSFilterWriter() : new AndroidFilterWriter()
  }

  exportBlob(filename: string, blob: Blob, encoding?: 'utf8' | 'ascii' | 'utf16') {
    return this.writer.exportBlob(filename, blob, encoding)
  }

  exportTextFile(filename: string, content: string) {
    return this.writer.exportTextFile(filename, content)
  }

  exportImageFile(basename: string, base64: string) {
    return this.writer.exportImageFile(basename, base64)
  }

  exportByUrl(filename: string, url: string) {
    return this.writer.exportByUrl(filename, url)
  }

  async exportStreamingJson(filename: string, dataCallback: () => AsyncGenerator<string, void, unknown>) {
    let content = ''
    for await (const chunk of dataCallback()) {
      content += chunk
    }
    await this.writer.writeCompleteFile(filename, content)
  }
}
