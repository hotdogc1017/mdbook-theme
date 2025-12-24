import mintlify from "../assets/themes/mintlify.css?raw";
// import mintlifyLightCSS from "../assets/themes/mintlify-light.css?raw";
// import mintlifyDarkCSS from "../assets/themes/mintlify-dark.css?raw";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",

  main(ctx) {
    // Custom themes (Mintlify-inspired + mdBook built-in)
    const CUSTOM_THEMES = ["mintlify", "mintlify-dark"] as const;
    const MDBOOK_THEMES = ["light", "rust", "coal", "navy", "ayu"] as const;
    const ALL_THEMES = [...CUSTOM_THEMES, ...MDBOOK_THEMES] as const;
    type Theme = (typeof ALL_THEMES)[number];

    let isMdBook = false;
    let styleElement: HTMLStyleElement | null = null;

    // Check if current page is an mdBook site by looking for the comment
    function checkMdBookComment() {
      // Check for <!-- Book generated using mdBook --> comment at document start
      const nodes = document.head.childNodes;
      return Array.from(nodes || [])
        .filter((node) => node.nodeType === Node.COMMENT_NODE)
        .some((node) =>
          node.nodeValue?.trim().includes("Book generated using mdBook"),
        );
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

    // Get CSS for theme
    function getThemeCSS(theme: Theme): string | null {
      switch (theme) {
        case "mintlify":
          return mintlify;
        // case "mintlify-dark":
        //   return mintlifyDarkCSS;
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
        styleElement = document.createElement("style");
        styleElement.id = "mdbook-theme-extension";
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
        html.classList.add(theme === "mintlify" ? "light" : "coal");
        injectThemeCSS(getThemeCSS(theme));
      } else {
        // For mdBook built-in themes
        MDBOOK_THEMES.forEach((t) => html.classList.remove(t));
        html.classList.add(theme);
        injectThemeCSS(null);

        try {
          localStorage.setItem("mdbook-theme", theme);
        } catch (e) {
          // Ignore
        }
      }

      // Notify popup about theme change
      browser.runtime.sendMessage({ type: "themeChanged", theme }).catch(() => {
        // Ignore errors when popup is not open
      });
    }

    // Initialize theme from storage
    async function initTheme() {
      try {
        const localConfig = ["mdbookTheme", "enabled"] as const;
        type LocalConfig = {
          [K in (typeof localConfig)[number]]?: string;
        };
        const { mdbookTheme } = (await browser.storage.local.get(
          localConfig as any,
        )) as LocalConfig;

        const theme = mdbookTheme || ("mintlify" as any); // Default to mintlify
        if (ALL_THEMES.includes(theme)) {
          applyTheme(theme);
        }
      } catch (e) {
        // Default to mintlify on error
        applyTheme("mintlify");
      }
    }

    // Listen for theme change messages from popup
    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
      if (message.type === "setTheme" && ALL_THEMES.includes(message.theme)) {
        applyTheme(message.theme);
      } else if (message.type === "getStatus") {
        sendResponse({
          isMdBook,
          currentTheme: getCurrentMdBookTheme(),
        });
      }
    });

    // Create and setup right sidebar for page TOC
    function setupRightSidebar(tocSection: Element) {
      if (!tocSection) return;

      // Create right sidebar container
      const rightSidebar = document.createElement("nav");
      rightSidebar.id = "right-sidebar";
      rightSidebar.className = "right-sidebar";

      // Create header
      const header = document.createElement("div");
      header.className = "right-sidebar-header";
      header.textContent = "On this page";
      rightSidebar.appendChild(header);

      // Clone and move the section
      const clonedSection = tocSection.cloneNode(true) as Element;
      clonedSection.classList.add("right-sidebar-toc");
      rightSidebar.appendChild(clonedSection);

      // Hide original section in left sidebar
      (tocSection as HTMLElement).style.display = "none";

      return rightSidebar;
    }

    // Main initialization
    function init() {
      isMdBook = checkMdBookComment();
      if (isMdBook) {
        localStorage.setItem("enabled", "false");
        initTheme();

        const ui = createIntegratedUi(ctx, {
          position: "inline",
          anchor: "div#mdbook-content",
          onMount: (pageWrapper) => {
            const observer = new MutationObserver((_, obs) => {
              const element = document.querySelector(
                ".sidebar ol.chapter div.on-this-page > ol.section",
              );
              if (element) {
                const rightSidebar = setupRightSidebar(element)!;
                pageWrapper.append(rightSidebar);
                pageWrapper.classList.add("has-right-sidebar");
                obs.disconnect();
              }
            });

            observer.observe(document.body, {
              childList: true,
              subtree: true,
            });
          },
        });
        ui.autoMount();
      }
    }

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  },
});
