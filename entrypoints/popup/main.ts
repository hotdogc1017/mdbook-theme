const CUSTOM_THEMES = ["mintlify", "mintlify-dark"] as const;
const MDBOOK_THEMES = ["light", "rust", "coal", "navy", "ayu"] as const;
const ALL_THEMES = [...CUSTOM_THEMES, ...MDBOOK_THEMES] as const;
type Theme = (typeof ALL_THEMES)[number];

const statusEl = document.getElementById("status")!;
const themeSectionEl = document.getElementById("theme-section")!;
const enabledToggle = document.getElementById(
  "enabled-toggle",
) as HTMLInputElement;
const themeButtons = document.querySelectorAll(".theme-btn");

let currentTab: Browser.tabs.Tab | null = null;

// Initialize popup
async function init() {
  statusEl.textContent = "Detecting...";
  statusEl.className = "status detecting";

  // Load enabled state
  const { enabled = true } = (await browser.storage.local.get(
    "enabled",
  )) as Awaited<{ enabled: boolean }>;
  enabledToggle.checked = enabled;

  // Get current tab
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (!tab?.id) {
    showNotMdBook("No active tab");
    return;
  }

  // Check if it's an mdBook site
  try {
    const response = await browser.tabs.sendMessage(tab.id, {
      type: "getStatus",
    });

    if (response?.isMdBook) {
      showMdBook();
    } else {
      showNotMdBook("Not an mdBook site");
    }
  } catch {
    showNotMdBook("Not an mdBook site");
  }
}

function showNotMdBook(message: string) {
  statusEl.textContent = message;
  statusEl.className = "status not-mdbook";
  themeSectionEl.classList.add("hidden");
}

function showMdBook() {
  statusEl.textContent = "mdBook detected";
  statusEl.className = "status mdbook";
  themeSectionEl.classList.remove("hidden");

  // Load saved theme or default to mintlify
  browser.storage.local.get("mdbookTheme").then(({ mdbookTheme }) => {
    const theme = mdbookTheme || "mintlify";
    setActiveTheme(theme);
  });
}

function setActiveTheme(theme: string) {
  themeButtons.forEach((btn) => {
    const btnTheme = btn.getAttribute("data-theme");
    btn.classList.toggle("active", btnTheme === theme);
  });
}

// Handle theme button clicks
themeButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const theme = btn.getAttribute("data-theme") as Theme;
    if (!theme || !currentTab?.id) return;

    // Save to storage
    await browser.storage.local.set({ mdbookTheme: theme });

    // Update UI
    setActiveTheme(theme);

    // Send to content script
    await browser.tabs.sendMessage(currentTab.id, { type: "setTheme", theme });
  });
});

// Handle enable toggle
enabledToggle.addEventListener("change", async () => {
  await browser.storage.local.set({ enabled: enabledToggle.checked });

  // Reload current tab to apply changes
  if (currentTab?.id) {
    browser.tabs.reload(currentTab.id);
  }
});

// Listen for theme changes from content script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === "themeChanged") {
    setActiveTheme(message.theme);
  }
});

init();
