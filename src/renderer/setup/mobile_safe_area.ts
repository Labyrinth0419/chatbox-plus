// 这个库解决了移动端异形屏的显示安全区域的问题，比如iPhoneX，iPhone11等
// 这个库引入后，将设置全局的css变量 --mobile-safe-area-inset-top, --mobile-safe-area-inset-bottom, --mobile-safe-area-inset-left, --mobile-safe-area-inset-right
// 通过这些变量，可以在css中设置安全区域的padding，margin等，来规避异形屏的显示问题
// 为了达到最好的效果，在 html 的 meta 标签中设置 viewport-fit=cover

import { SafeArea } from 'capacitor-plugin-safe-area'
import { Keyboard } from '@capacitor/keyboard'

const root = document.documentElement
let keyboardHeight = 0
let viewportHeightBeforeKeyboard = window.innerHeight
let isEditableFocused = false

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function setSafeAreaInsets(insets: Record<string, number>) {
  for (const [key, value] of Object.entries(insets)) {
    root.style.setProperty(`--mobile-safe-area-inset-${key}`, `${value}px`)
  }
}

function setKeyboardOverlap(nextKeyboardHeight = keyboardHeight) {
  keyboardHeight = nextKeyboardHeight

  if (keyboardHeight <= 0) {
    root.style.setProperty('--mobile-keyboard-height', '0px')
    root.style.setProperty('--mobile-keyboard-overlap-bottom', '0px')
    return
  }

  const visualViewport = window.visualViewport
  const visualViewportOcclusion = visualViewport
    ? Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop)
    : 0
  const nativeResizeAmount = Math.max(0, viewportHeightBeforeKeyboard - window.innerHeight)
  const overlapAfterNativeResize = Math.max(0, keyboardHeight - nativeResizeAmount)
  const overlap = Math.round(Math.min(keyboardHeight, Math.max(visualViewportOcclusion, overlapAfterNativeResize)))

  root.style.setProperty('--mobile-keyboard-height', `${Math.round(keyboardHeight)}px`)
  root.style.setProperty('--mobile-keyboard-overlap-bottom', `${overlap}px`)
}

function refreshKeyboardOverlap() {
  if (keyboardHeight > 0) {
    setKeyboardOverlap()
    return
  }
  if (!isEditableFocused) {
    viewportHeightBeforeKeyboard = window.innerHeight
  }
}

function scheduleKeyboardOverlapRefresh() {
  window.requestAnimationFrame(refreshKeyboardOverlap)
  window.setTimeout(refreshKeyboardOverlap, 80)
  window.setTimeout(refreshKeyboardOverlap, 180)
  window.setTimeout(refreshKeyboardOverlap, 320)
}

void SafeArea.getSafeAreaInsets().then(({ insets }) => {
  setSafeAreaInsets(insets)
})

void SafeArea.getStatusBarHeight()

void (async () => {
  // when safe-area changed
  await SafeArea.addListener('safeAreaChanged', (data) => {
    if (keyboardHeight <= 0) {
      setSafeAreaInsets(data.insets)
    }
  })
})()

void Keyboard.addListener('keyboardWillShow', (info) => {
  root.dataset.mobileKeyboardVisible = 'true'
  root.style.setProperty(`--mobile-safe-area-inset-bottom`, `0px`)
  setKeyboardOverlap(info.keyboardHeight)
  scheduleKeyboardOverlapRefresh()
})

void Keyboard.addListener('keyboardWillHide', () => {
  keyboardHeight = 0
  root.dataset.mobileKeyboardVisible = 'false'
  setKeyboardOverlap(0)
  void SafeArea.getSafeAreaInsets().then(({ insets }) => {
    setSafeAreaInsets(insets)
  })
  window.setTimeout(() => {
    viewportHeightBeforeKeyboard = window.innerHeight
  }, 320)
})

window.addEventListener('focusin', (event) => {
  if (!isEditableTarget(event.target)) {
    return
  }
  isEditableFocused = true
  if (keyboardHeight <= 0) {
    viewportHeightBeforeKeyboard = window.innerHeight
  }
})

window.addEventListener('focusout', () => {
  isEditableFocused = false
  if (keyboardHeight <= 0) {
    window.setTimeout(() => {
      viewportHeightBeforeKeyboard = window.innerHeight
    }, 80)
  }
})

window.addEventListener('resize', refreshKeyboardOverlap)
window.visualViewport?.addEventListener('resize', refreshKeyboardOverlap)
window.visualViewport?.addEventListener('scroll', refreshKeyboardOverlap)
