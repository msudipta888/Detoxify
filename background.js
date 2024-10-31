
chrome.webNavigation.onCompleted.addListener(
  (details) => {
      if (details.url.includes("youtube.com")) {
          chrome.scripting.executeScript({
              target: { tabId: details.tabId },
              files: ['contentScript.js']
          });
      }
  },
  { url: [{ hostContains: "youtube.com" }] }
);
