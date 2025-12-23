// Background script - handles extension icon and badge
export default defineBackground(() => {
  // Listen for tab updates to show badge on mdBook sites
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      try {
        const response = await browser.tabs.sendMessage(tabId, { type: 'getStatus' });
        if (response?.isMdBook) {
          browser.action.setBadgeText({ tabId, text: 'M' });
          browser.action.setBadgeBackgroundColor({ tabId, color: '#6c63ff' });
        } else {
          browser.action.setBadgeText({ tabId, text: '' });
        }
      } catch {
        browser.action.setBadgeText({ tabId, text: '' });
      }
    }
  });
});
