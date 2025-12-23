// Content script for mdBook theme modification
export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',

  main() {
    // Custom themes (Mintlify-inspired + mdBook built-in)
    const CUSTOM_THEMES = ['mintlify', 'mintlify-dark'] as const;
    const MDBOOK_THEMES = ['light', 'rust', 'coal', 'navy', 'ayu'] as const;
    const ALL_THEMES = [...CUSTOM_THEMES, ...MDBOOK_THEMES] as const;
    type Theme = (typeof ALL_THEMES)[number];

    let isMdBook = false;
    let styleElement: HTMLStyleElement | null = null;

    // Check if current page is an mdBook site by looking for the comment
    function checkMdBookComment(): boolean {
      // Check for <!-- Book generated using mdBook --> comment at document start
      const html = document.documentElement.outerHTML;
      return html.includes('<!-- Book generated using mdBook -->');
    }

    // Get current mdBook theme from page
    function getCurrentMdBookTheme(): string | null {
      const html = document.documentElement;
      for (const theme of MDBOOK_THEMES) {
        if (html.classList.contains(theme)) {
          return theme;
        }
      }
      return null;
    }

    // Mintlify-inspired theme CSS
    const mintlifyLightCSS = `
      /* Mintlify-inspired Light Theme for mdBook */
      :root {
        --bg: #ffffff;
        --fg: #0a0d0d;
        --sidebar-bg: #f8faf9;
        --sidebar-fg: #374151;
        --sidebar-active: #166e3f;
        --sidebar-active-bg: rgba(22, 110, 63, 0.1);
        --links: #166e3f;
        --links-hover: #26bd6c;
        --inline-code-bg: #f3f6f4;
        --code-bg: #0a0d0d;
        --code-fg: #e5e7eb;
        --quote-bg: #f3f6f4;
        --quote-border: #26bd6c;
        --table-border: #e5e7eb;
        --table-header-bg: #f3f6f4;
        --search-bg: #ffffff;
        --search-border: #e5e7eb;
        --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        --scrollbar: #d1d5db;
        --scrollbar-hover: #9ca3af;
      }

      html {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg);
        color: var(--fg);
        scroll-behavior: smooth;
      }

      body {
        background: var(--bg);
        color: var(--fg);
      }

      /* Sidebar */
      .sidebar {
        background: var(--sidebar-bg);
        border-right: 1px solid var(--table-border);
      }

      .sidebar .sidebar-scrollbox {
        background: var(--sidebar-bg);
      }

      .sidebar ol.chapter li a {
        color: var(--sidebar-fg);
        padding: 8px 16px;
        border-radius: 8px;
        margin: 2px 8px;
        transition: all 0.15s ease;
      }

      .sidebar ol.chapter li a:hover {
        background: var(--sidebar-active-bg);
        color: var(--sidebar-active);
        text-decoration: none;
      }

      .sidebar ol.chapter li.chapter-item.expanded > a,
      .sidebar ol.chapter li a.active {
        background: var(--sidebar-active-bg);
        color: var(--sidebar-active);
        font-weight: 600;
      }

      /* Main content */
      .content {
        max-width: 800px;
        padding: 24px 48px;
      }

      .content main {
        max-width: 100%;
      }

      /* Typography */
      h1, h2, h3, h4, h5, h6 {
        color: var(--fg);
        font-weight: 600;
        margin-top: 2em;
        margin-bottom: 0.5em;
        line-height: 1.3;
      }

      h1 { font-size: 2.25rem; margin-top: 0; }
      h2 { font-size: 1.75rem; border-bottom: 1px solid var(--table-border); padding-bottom: 0.5rem; }
      h3 { font-size: 1.375rem; }
      h4 { font-size: 1.125rem; }

      p {
        line-height: 1.75;
        margin: 1em 0;
      }

      /* Links */
      a {
        color: var(--links);
        text-decoration: none;
        transition: color 0.15s ease;
      }

      a:hover {
        color: var(--links-hover);
        text-decoration: underline;
      }

      /* Code */
      code {
        font-family: 'Geist Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.875em;
      }

      :not(pre) > code {
        background: var(--inline-code-bg);
        padding: 0.2em 0.4em;
        border-radius: 6px;
        color: var(--sidebar-active);
      }

      pre {
        background: var(--code-bg) !important;
        color: var(--code-fg);
        padding: 16px 20px;
        border-radius: 12px;
        overflow-x: auto;
        margin: 1.5em 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      pre code {
        background: transparent;
        padding: 0;
        color: inherit;
      }

      /* Blockquotes */
      blockquote {
        background: var(--quote-bg);
        border-left: 4px solid var(--quote-border);
        margin: 1.5em 0;
        padding: 16px 20px;
        border-radius: 0 12px 12px 0;
      }

      blockquote p {
        margin: 0;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1.5em 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--table-border);
      }

      th {
        background: var(--table-header-bg);
        font-weight: 600;
        text-align: left;
      }

      th, td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--table-border);
      }

      tr:last-child td {
        border-bottom: none;
      }

      /* Menu bar */
      #menu-bar {
        background: var(--bg);
        border-bottom: 1px solid var(--table-border);
      }

      #menu-bar i {
        color: var(--fg);
      }

      /* Search */
      #searchbar {
        background: var(--search-bg);
        border: 1px solid var(--search-border);
        border-radius: 8px;
        padding: 8px 12px;
        box-shadow: var(--searchbar-shadow);
      }

      /* Navigation buttons */
      .nav-chapters {
        color: var(--links);
        opacity: 0.8;
        transition: opacity 0.15s ease;
      }

      .nav-chapters:hover {
        color: var(--links-hover);
        opacity: 1;
      }

      /* Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: var(--scrollbar);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-hover);
      }

      /* Theme toggle - hide original */
      #theme-list {
        background: var(--sidebar-bg);
        border: 1px solid var(--table-border);
        border-radius: 8px;
      }

      #theme-list li {
        color: var(--fg);
      }

      #theme-list li:hover {
        background: var(--sidebar-active-bg);
      }
    `;

    const mintlifyDarkCSS = `
      /* Mintlify-inspired Dark Theme for mdBook */
      :root {
        --bg: #0a0d0d;
        --fg: #e5e7eb;
        --sidebar-bg: #111414;
        --sidebar-fg: #9ca3af;
        --sidebar-active: #26bd6c;
        --sidebar-active-bg: rgba(38, 189, 108, 0.15);
        --links: #26bd6c;
        --links-hover: #4ade80;
        --inline-code-bg: #1f2424;
        --code-bg: #161a1a;
        --code-fg: #e5e7eb;
        --quote-bg: #1f2424;
        --quote-border: #26bd6c;
        --table-border: #2d3333;
        --table-header-bg: #1f2424;
        --search-bg: #161a1a;
        --search-border: #2d3333;
        --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        --scrollbar: #3d4343;
        --scrollbar-hover: #4d5555;
      }

      html {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg);
        color: var(--fg);
        scroll-behavior: smooth;
      }

      body {
        background: var(--bg);
        color: var(--fg);
      }

      /* Sidebar */
      .sidebar {
        background: var(--sidebar-bg);
        border-right: 1px solid var(--table-border);
      }

      .sidebar .sidebar-scrollbox {
        background: var(--sidebar-bg);
      }

      .sidebar ol.chapter li a {
        color: var(--sidebar-fg);
        padding: 8px 16px;
        border-radius: 8px;
        margin: 2px 8px;
        transition: all 0.15s ease;
      }

      .sidebar ol.chapter li a:hover {
        background: var(--sidebar-active-bg);
        color: var(--sidebar-active);
        text-decoration: none;
      }

      .sidebar ol.chapter li.chapter-item.expanded > a,
      .sidebar ol.chapter li a.active {
        background: var(--sidebar-active-bg);
        color: var(--sidebar-active);
        font-weight: 600;
      }

      /* Main content */
      .content {
        max-width: 800px;
        padding: 24px 48px;
      }

      .content main {
        max-width: 100%;
      }

      /* Typography */
      h1, h2, h3, h4, h5, h6 {
        color: #ffffff;
        font-weight: 600;
        margin-top: 2em;
        margin-bottom: 0.5em;
        line-height: 1.3;
      }

      h1 { font-size: 2.25rem; margin-top: 0; }
      h2 { font-size: 1.75rem; border-bottom: 1px solid var(--table-border); padding-bottom: 0.5rem; }
      h3 { font-size: 1.375rem; }
      h4 { font-size: 1.125rem; }

      p {
        line-height: 1.75;
        margin: 1em 0;
      }

      /* Links */
      a {
        color: var(--links);
        text-decoration: none;
        transition: color 0.15s ease;
      }

      a:hover {
        color: var(--links-hover);
        text-decoration: underline;
      }

      /* Code */
      code {
        font-family: 'Geist Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.875em;
      }

      :not(pre) > code {
        background: var(--inline-code-bg);
        padding: 0.2em 0.4em;
        border-radius: 6px;
        color: var(--sidebar-active);
      }

      pre {
        background: var(--code-bg) !important;
        color: var(--code-fg);
        padding: 16px 20px;
        border-radius: 12px;
        overflow-x: auto;
        margin: 1.5em 0;
        border: 1px solid var(--table-border);
      }

      pre code {
        background: transparent;
        padding: 0;
        color: inherit;
      }

      /* Blockquotes */
      blockquote {
        background: var(--quote-bg);
        border-left: 4px solid var(--quote-border);
        margin: 1.5em 0;
        padding: 16px 20px;
        border-radius: 0 12px 12px 0;
      }

      blockquote p {
        margin: 0;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1.5em 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--table-border);
      }

      th {
        background: var(--table-header-bg);
        font-weight: 600;
        text-align: left;
      }

      th, td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--table-border);
      }

      tr:last-child td {
        border-bottom: none;
      }

      /* Menu bar */
      #menu-bar {
        background: var(--bg);
        border-bottom: 1px solid var(--table-border);
      }

      #menu-bar i {
        color: var(--fg);
      }

      /* Search */
      #searchbar {
        background: var(--search-bg);
        border: 1px solid var(--search-border);
        border-radius: 8px;
        padding: 8px 12px;
        box-shadow: var(--searchbar-shadow);
        color: var(--fg);
      }

      /* Navigation buttons */
      .nav-chapters {
        color: var(--links);
        opacity: 0.8;
        transition: opacity 0.15s ease;
      }

      .nav-chapters:hover {
        color: var(--links-hover);
        opacity: 1;
      }

      /* Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: var(--scrollbar);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-hover);
      }

      /* Theme toggle */
      #theme-list {
        background: var(--sidebar-bg);
        border: 1px solid var(--table-border);
        border-radius: 8px;
      }

      #theme-list li {
        color: var(--fg);
      }

      #theme-list li:hover {
        background: var(--sidebar-active-bg);
      }
    `;

    // Get CSS for theme
    function getThemeCSS(theme: Theme): string | null {
      switch (theme) {
        case 'mintlify':
          return mintlifyLightCSS;
        case 'mintlify-dark':
          return mintlifyDarkCSS;
        default:
          return null; // Use mdBook built-in themes
      }
    }

    // Inject or update custom theme CSS
    function injectThemeCSS(css: string | null) {
      if (!css) {
        // Remove custom styles, use mdBook built-in
        if (styleElement) {
          styleElement.remove();
          styleElement = null;
        }
        return;
      }

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'mdbook-theme-extension';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = css;
    }

    // Apply theme to page
    function applyTheme(theme: Theme) {
      const html = document.documentElement;
      const isCustomTheme = CUSTOM_THEMES.includes(theme as any);

      if (isCustomTheme) {
        // For custom themes, set base mdBook theme and inject CSS
        MDBOOK_THEMES.forEach((t) => html.classList.remove(t));
        html.classList.add(theme === 'mintlify' ? 'light' : 'coal');
        injectThemeCSS(getThemeCSS(theme));
      } else {
        // For mdBook built-in themes
        MDBOOK_THEMES.forEach((t) => html.classList.remove(t));
        html.classList.add(theme);
        injectThemeCSS(null);

        try {
          localStorage.setItem('mdbook-theme', theme);
        } catch (e) {
          // Ignore
        }
      }

      // Notify popup about theme change
      browser.runtime.sendMessage({ type: 'themeChanged', theme }).catch(() => {
        // Ignore errors when popup is not open
      });
    }

    // Initialize theme from storage
    async function initTheme() {
      try {
        const result = await browser.storage.local.get(['mdbookTheme', 'enabled']);

        if (result.enabled === false) {
          return; // Extension disabled
        }

        const theme = result.mdbookTheme || 'mintlify'; // Default to mintlify
        if (ALL_THEMES.includes(theme)) {
          applyTheme(theme);
        }
      } catch (e) {
        // Default to mintlify on error
        applyTheme('mintlify');
      }
    }

    // Listen for theme change messages from popup
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'setTheme' && ALL_THEMES.includes(message.theme)) {
        applyTheme(message.theme);
      } else if (message.type === 'getStatus') {
        return Promise.resolve({
          isMdBook,
          currentTheme: getCurrentMdBookTheme(),
        });
      }
    });

    // Main initialization
    function init() {
      isMdBook = checkMdBookComment();
      if (isMdBook) {
        initTheme();
      }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  },
});
