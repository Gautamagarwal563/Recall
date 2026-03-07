import { defineConfig } from 'wxt'

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Recall',
    description: 'Save any page to read later with AI summaries',
    version: '1.0.0',
    permissions: ['activeTab', 'storage'],
    action: {
      default_popup: 'popup.html',
      default_title: 'Recall',
    },
  },
})
