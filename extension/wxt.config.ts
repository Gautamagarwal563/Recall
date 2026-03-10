import { defineConfig } from 'wxt'

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Rekawl',
    description: 'Save any page, image, or text snippet — AI reads it and tags it instantly.',
    version: '1.0.0',
    permissions: ['activeTab', 'storage', 'contextMenus', 'tabs'],
    host_permissions: [
      'https://rekawl.live/*',
    ],
    action: {
      default_popup: 'popup.html',
      default_title: 'Rekawl',
      default_icon: {
        '16': 'icon/16.png',
        '48': 'icon/48.png',
        '128': 'icon/128.png',
      },
    },
    icons: {
      '16': 'icon/16.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png',
    },
  },
})
