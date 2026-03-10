export default defineBackground(() => {
  const API_BASE = 'https://rekawl.live'

  function getToken(): Promise<string | null> {
    return new Promise(resolve => {
      chrome.storage.local.get('rekawlToken', result => {
        resolve(result.rekawlToken ?? null)
      })
    })
  }

  function clearToken(): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.local.remove('rekawlToken', resolve)
    })
  }

  function flashBadge() {
    chrome.action.setBadgeText({ text: '✓' })
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1' })
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' })
    }, 2500)
  }

  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'save-image',
      title: 'Save image to Rekawl',
      contexts: ['image'],
    })

    chrome.contextMenus.create({
      id: 'save-selection',
      title: 'Save selection to Rekawl',
      contexts: ['selection'],
    })
  })

  chrome.contextMenus.onClicked.addListener(async (info, _tab) => {
    const token = await getToken()
    if (!token) {
      chrome.action.openPopup()
      return
    }

    let body: Record<string, string>

    if (info.menuItemId === 'save-image') {
      const imageUrl = info.srcUrl
      if (!imageUrl) return
      body = {
        type: 'image',
        imageUrl,
        sourceUrl: info.pageUrl ?? '',
      }
    } else if (info.menuItemId === 'save-selection') {
      const snippet = info.selectionText
      if (!snippet) return
      body = {
        type: 'text',
        snippet,
        sourceUrl: info.pageUrl ?? '',
      }
    } else {
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/saves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        await clearToken()
        chrome.action.openPopup()
        return
      }

      if (res.ok) {
        flashBadge()
      }
    } catch (err) {
      console.error('Rekawl save failed', err)
    }
  })
})
