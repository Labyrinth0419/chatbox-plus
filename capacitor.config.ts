import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'io.labyrinth.chatboxplus',
  appName: 'ChatPlus',
  webDir: 'release/app/dist/renderer',
  backgroundColor: '#ffffff',
  loggingBehavior: 'debug',
  android: {
    path: 'android',
    adjustMarginsForEdgeToEdge: 'auto',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
}

export default config
