var content = (function() {
  "use strict";
  function defineContentScript(definition2) {
    return definition2;
  }
  const browser$1 = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  const mintlifyLightCSS = '/* Mintlify-inspired Light Theme for mdBook */\n:root {\n    --bg: #ffffff;\n    --fg: #0a0d0d;\n    --sidebar-bg: #f8faf9;\n    --sidebar-fg: #374151;\n    --sidebar-active: #166e3f;\n    --sidebar-active-bg: rgba(22, 110, 63, 0.1);\n    --sidebar-header-border-color: var(--sidebar-active);\n    --links: #166e3f;\n    --links-hover: #26bd6c;\n    --inline-code-bg: #f3f6f4;\n    --code-bg: #0a0d0d;\n    --code-fg: #e5e7eb;\n    --quote-bg: #f3f6f4;\n    --quote-border: #26bd6c;\n    --table-border: #e5e7eb;\n    --table-header-bg: #f3f6f4;\n    --search-bg: #ffffff;\n    --search-border: #e5e7eb;\n    --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n    --scrollbar: #d1d5db;\n    --scrollbar-hover: #9ca3af;\n    --order-weight: 400;\n    --chapter-nav-display: none;\n}\n\nhtml {\n    font-family:\n        "Inter",\n        -apple-system,\n        BlinkMacSystemFont,\n        "Segoe UI",\n        Roboto,\n        sans-serif;\n    background: var(--bg);\n    color: var(--fg);\n    scroll-behavior: smooth;\n}\n\nbody {\n    background: var(--bg);\n    color: var(--fg);\n}\n\nnav.nav-wide-wrapper a.nav-chapters {\n    display: var(--chapter-nav-display);\n}\n\n/* Sidebar */\n.sidebar {\n    background: var(--sidebar-bg);\n    border-right: 1px solid var(--table-border);\n}\n\n.sidebar .sidebar-scrollbox {\n    background: var(--sidebar-bg);\n}\n\n.sidebar ol.chapter li.chapter-item span.chapter-link-wrapper a {\n    display: block;\n    width: 100%;\n    height: 100%;\n}\n.sidebar ol.chapter li.chapter-item span.chapter-link-wrapper {\n    cursor: pointer;\n    color: var(--sidebar-fg);\n    padding: 8px 16px;\n    border-radius: 8px;\n    margin: 2px 8px;\n    transition: all 0.15s ease;\n}\n\n/*.sidebar ol.chapter > li.chapter-item > span.chapter-link-wrapper {\n    font-weight: bold;\n}*/\n\n/*.sidebar ol.chapter li .chapter-item.expanded > a,*/\n.sidebar ol.chapter li.chapter-item span.chapter-link-wrapper:has(a.active),\n.sidebar ol.chapter li.chapter-item span.chapter-link-wrapper:hover {\n    background: var(--sidebar-active-bg);\n    color: var(--sidebar-active);\n    text-decoration: none;\n}\n\n/* Main content */\n.content {\n    max-width: 800px;\n    padding: 24px 48px;\n}\n\n.content main {\n    max-width: 100%;\n}\n\n/* Typography */\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n    color: var(--fg);\n    font-weight: 600;\n    margin-top: 2em;\n    margin-bottom: 0.5em;\n    line-height: 1.3;\n}\n\nh1 {\n    font-size: 2.25rem;\n    margin-top: 0;\n}\nh2 {\n    font-size: 1.75rem;\n    border-bottom: 1px solid var(--table-border);\n    padding-bottom: 0.5rem;\n}\nh3 {\n    font-size: 1.375rem;\n}\nh4 {\n    font-size: 1.125rem;\n}\n\np {\n    line-height: 1.75;\n    margin: 1em 0;\n}\n\n/* Links */\na {\n    color: var(--links);\n    text-decoration: none;\n    transition: color 0.15s ease;\n}\n\na:hover {\n    color: var(--links-hover);\n    text-decoration: underline;\n}\n\n/* Code */\ncode {\n    font-family: "Geist Mono", "Fira Code", "JetBrains Mono", monospace;\n    font-size: 0.875em;\n}\n\nstrong {\n    font-weight: var(--order-weight);\n}\n\n:not(pre) > code {\n    background: var(--inline-code-bg);\n    padding: 0.2em 0.4em;\n    border-radius: 6px;\n    color: var(--sidebar-active);\n}\n\npre {\n    background: var(--code-bg) !important;\n    color: var(--code-fg);\n    padding: 16px 20px;\n    border-radius: 12px;\n    overflow-x: auto;\n    margin: 1.5em 0;\n    border: 1px solid rgba(255, 255, 255, 0.1);\n}\n\npre code {\n    background: transparent;\n    padding: 0;\n    color: inherit;\n}\n\n/* Blockquotes */\nblockquote {\n    background: var(--quote-bg);\n    border-left: 4px solid var(--quote-border);\n    margin: 1.5em 0;\n    padding: 16px 20px;\n    border-radius: 0 12px 12px 0;\n}\n\nblockquote p {\n    margin: 0;\n}\n\n/* Tables */\ntable {\n    border-collapse: collapse;\n    width: 100%;\n    margin: 1.5em 0;\n    border-radius: 12px;\n    overflow: hidden;\n    border: 1px solid var(--table-border);\n}\n\nth {\n    background: var(--table-header-bg);\n    font-weight: 600;\n    text-align: left;\n}\n\nth,\ntd {\n    padding: 12px 16px;\n    border-bottom: 1px solid var(--table-border);\n}\n\ntr:last-child td {\n    border-bottom: none;\n}\n\n/* Menu bar */\n#menu-bar {\n    background: var(--bg);\n    border-bottom: 1px solid var(--table-border);\n}\n\n#menu-bar i {\n    color: var(--fg);\n}\n\n/* Search */\n#searchbar {\n    background: var(--search-bg);\n    border: 1px solid var(--search-border);\n    border-radius: 8px;\n    padding: 8px 12px;\n    box-shadow: var(--searchbar-shadow);\n}\n\n/* Navigation buttons */\n.nav-chapters {\n    color: var(--links);\n    opacity: 0.8;\n    transition: opacity 0.15s ease;\n}\n\n.nav-chapters:hover {\n    color: var(--links-hover);\n    opacity: 1;\n}\n\n/* Scrollbar */\n::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n\n::-webkit-scrollbar-track {\n    background: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n    background: var(--scrollbar);\n    border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n    background: var(--scrollbar-hover);\n}\n\n/* Theme toggle */\n#theme-list {\n    background: var(--sidebar-bg);\n    border: 1px solid var(--table-border);\n    border-radius: 8px;\n}\n\n#theme-list li {\n    color: var(--fg);\n}\n\n#theme-list li:hover {\n    background: var(--sidebar-active-bg);\n}\n';
  const mintlifyDarkCSS = "/* Mintlify-inspired Dark Theme for mdBook */\n:root {\n  --bg: #0a0d0d;\n  --fg: #e5e7eb;\n  --sidebar-bg: #111414;\n  --sidebar-fg: #9ca3af;\n  --sidebar-active: #26bd6c;\n  --sidebar-active-bg: rgba(38, 189, 108, 0.15);\n  --links: #26bd6c;\n  --links-hover: #4ade80;\n  --inline-code-bg: #1f2424;\n  --code-bg: #161a1a;\n  --code-fg: #e5e7eb;\n  --quote-bg: #1f2424;\n  --quote-border: #26bd6c;\n  --table-border: #2d3333;\n  --table-header-bg: #1f2424;\n  --search-bg: #161a1a;\n  --search-border: #2d3333;\n  --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);\n  --scrollbar: #3d4343;\n  --scrollbar-hover: #4d5555;\n}\n\nhtml {\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  background: var(--bg);\n  color: var(--fg);\n  scroll-behavior: smooth;\n}\n\nbody {\n  background: var(--bg);\n  color: var(--fg);\n}\n\n/* Sidebar */\n.sidebar {\n  background: var(--sidebar-bg);\n  border-right: 1px solid var(--table-border);\n}\n\n.sidebar .sidebar-scrollbox {\n  background: var(--sidebar-bg);\n}\n\n.sidebar ol.chapter li a {\n  color: var(--sidebar-fg);\n  padding: 8px 16px;\n  border-radius: 8px;\n  margin: 2px 8px;\n  transition: all 0.15s ease;\n}\n\n.sidebar ol.chapter li a:hover {\n  background: var(--sidebar-active-bg);\n  color: var(--sidebar-active);\n  text-decoration: none;\n}\n\n.sidebar ol.chapter li.chapter-item.expanded > a,\n.sidebar ol.chapter li a.active {\n  background: var(--sidebar-active-bg);\n  color: var(--sidebar-active);\n  font-weight: 600;\n}\n\n/* Main content */\n.content {\n  max-width: 800px;\n  padding: 24px 48px;\n}\n\n.content main {\n  max-width: 100%;\n}\n\n/* Typography */\nh1, h2, h3, h4, h5, h6 {\n  color: #ffffff;\n  font-weight: 600;\n  margin-top: 2em;\n  margin-bottom: 0.5em;\n  line-height: 1.3;\n}\n\nh1 { font-size: 2.25rem; margin-top: 0; }\nh2 { font-size: 1.75rem; border-bottom: 1px solid var(--table-border); padding-bottom: 0.5rem; }\nh3 { font-size: 1.375rem; }\nh4 { font-size: 1.125rem; }\n\np {\n  line-height: 1.75;\n  margin: 1em 0;\n}\n\n/* Links */\na {\n  color: var(--links);\n  text-decoration: none;\n  transition: color 0.15s ease;\n}\n\na:hover {\n  color: var(--links-hover);\n  text-decoration: underline;\n}\n\n/* Code */\ncode {\n  font-family: 'Geist Mono', 'Fira Code', 'JetBrains Mono', monospace;\n  font-size: 0.875em;\n}\n\n:not(pre) > code {\n  background: var(--inline-code-bg);\n  padding: 0.2em 0.4em;\n  border-radius: 6px;\n  color: var(--sidebar-active);\n}\n\npre {\n  background: var(--code-bg) !important;\n  color: var(--code-fg);\n  padding: 16px 20px;\n  border-radius: 12px;\n  overflow-x: auto;\n  margin: 1.5em 0;\n  border: 1px solid var(--table-border);\n}\n\npre code {\n  background: transparent;\n  padding: 0;\n  color: inherit;\n}\n\n/* Blockquotes */\nblockquote {\n  background: var(--quote-bg);\n  border-left: 4px solid var(--quote-border);\n  margin: 1.5em 0;\n  padding: 16px 20px;\n  border-radius: 0 12px 12px 0;\n}\n\nblockquote p {\n  margin: 0;\n}\n\n/* Tables */\ntable {\n  border-collapse: collapse;\n  width: 100%;\n  margin: 1.5em 0;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid var(--table-border);\n}\n\nth {\n  background: var(--table-header-bg);\n  font-weight: 600;\n  text-align: left;\n}\n\nth, td {\n  padding: 12px 16px;\n  border-bottom: 1px solid var(--table-border);\n}\n\ntr:last-child td {\n  border-bottom: none;\n}\n\n/* Menu bar */\n#menu-bar {\n  background: var(--bg);\n  border-bottom: 1px solid var(--table-border);\n}\n\n#menu-bar i {\n  color: var(--fg);\n}\n\n/* Search */\n#searchbar {\n  background: var(--search-bg);\n  border: 1px solid var(--search-border);\n  border-radius: 8px;\n  padding: 8px 12px;\n  box-shadow: var(--searchbar-shadow);\n  color: var(--fg);\n}\n\n/* Navigation buttons */\n.nav-chapters {\n  color: var(--links);\n  opacity: 0.8;\n  transition: opacity 0.15s ease;\n}\n\n.nav-chapters:hover {\n  color: var(--links-hover);\n  opacity: 1;\n}\n\n/* Scrollbar */\n::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n\n::-webkit-scrollbar-track {\n  background: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n  background: var(--scrollbar);\n  border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n  background: var(--scrollbar-hover);\n}\n\n/* Theme toggle */\n#theme-list {\n  background: var(--sidebar-bg);\n  border: 1px solid var(--table-border);\n  border-radius: 8px;\n}\n\n#theme-list li {\n  color: var(--fg);\n}\n\n#theme-list li:hover {\n  background: var(--sidebar-active-bg);\n}\n";
  const definition = defineContentScript({
    matches: ["<all_urls>"],
    runAt: "document_start",
    main() {
      const CUSTOM_THEMES = ["mintlify", "mintlify-dark"];
      const MDBOOK_THEMES = ["light", "rust", "coal", "navy", "ayu"];
      const ALL_THEMES = [...CUSTOM_THEMES, ...MDBOOK_THEMES];
      let isMdBook = false;
      let styleElement = null;
      function checkMdBookComment() {
        const nodes = document.head.childNodes;
        return Array.from(nodes || []).filter((node) => node.nodeType === Node.COMMENT_NODE).some(
          (node) => node.nodeValue?.trim().includes("Book generated using mdBook")
        );
      }
      function getCurrentMdBookTheme() {
        const html = document.documentElement;
        for (const theme of MDBOOK_THEMES) {
          if (html.classList.contains(theme)) {
            return theme;
          }
        }
        return null;
      }
      function getThemeCSS(theme) {
        switch (theme) {
          case "mintlify":
            return mintlifyLightCSS;
          case "mintlify-dark":
            return mintlifyDarkCSS;
          default:
            return null;
        }
      }
      function injectThemeCSS(css) {
        if (!css) {
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
      function applyTheme(theme) {
        const html = document.documentElement;
        const isCustomTheme = CUSTOM_THEMES.includes(theme);
        if (isCustomTheme) {
          MDBOOK_THEMES.forEach((t) => html.classList.remove(t));
          html.classList.add(theme === "mintlify" ? "light" : "coal");
          injectThemeCSS(getThemeCSS(theme));
        } else {
          MDBOOK_THEMES.forEach((t) => html.classList.remove(t));
          html.classList.add(theme);
          injectThemeCSS(null);
          try {
            localStorage.setItem("mdbook-theme", theme);
          } catch (e) {
          }
        }
        browser.runtime.sendMessage({ type: "themeChanged", theme }).catch(() => {
        });
      }
      async function initTheme() {
        try {
          const localConfig = ["mdbookTheme", "enabled"];
          const { mdbookTheme } = await browser.storage.local.get(
            localConfig
          );
          const theme = mdbookTheme || "mintlify";
          if (ALL_THEMES.includes(theme)) {
            applyTheme(theme);
          }
        } catch (e) {
          applyTheme("mintlify");
        }
      }
      browser.runtime.onMessage.addListener((message) => {
        if (message.type === "setTheme" && ALL_THEMES.includes(message.theme)) {
          applyTheme(message.theme);
        } else if (message.type === "getStatus") {
          return Promise.resolve({
            isMdBook,
            currentTheme: getCurrentMdBookTheme()
          });
        }
      });
      function init() {
        isMdBook = checkMdBookComment();
        if (isMdBook) {
          localStorage.setItem("enabled", "true");
          initTheme();
        }
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    }
  });
  function print$1(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger$1 = {
    debug: (...args) => print$1(console.debug, ...args),
    log: (...args) => print$1(console.log, ...args),
    warn: (...args) => print$1(console.warn, ...args),
    error: (...args) => print$1(console.error, ...args)
  };
  class WxtLocationChangeEvent extends Event {
    constructor(newUrl, oldUrl) {
      super(WxtLocationChangeEvent.EVENT_NAME, {});
      this.newUrl = newUrl;
      this.oldUrl = oldUrl;
    }
    static EVENT_NAME = getUniqueEventName("wxt:locationchange");
  }
  function getUniqueEventName(eventName) {
    return `${browser?.runtime?.id}:${"content"}:${eventName}`;
  }
  function createLocationWatcher(ctx) {
    let interval;
    let oldUrl;
    return {
      /**
       * Ensure the location watcher is actively looking for URL changes. If it's already watching,
       * this is a noop.
       */
      run() {
        if (interval != null) return;
        oldUrl = new URL(location.href);
        interval = ctx.setInterval(() => {
          let newUrl = new URL(location.href);
          if (newUrl.href !== oldUrl.href) {
            window.dispatchEvent(new WxtLocationChangeEvent(newUrl, oldUrl));
            oldUrl = newUrl;
          }
        }, 1e3);
      }
    };
  }
  class ContentScriptContext {
    constructor(contentScriptName, options) {
      this.contentScriptName = contentScriptName;
      this.options = options;
      this.abortController = new AbortController();
      if (this.isTopFrame) {
        this.listenForNewerScripts({ ignoreFirstEvent: true });
        this.stopOldScripts();
      } else {
        this.listenForNewerScripts();
      }
    }
    static SCRIPT_STARTED_MESSAGE_TYPE = getUniqueEventName(
      "wxt:content-script-started"
    );
    isTopFrame = window.self === window.top;
    abortController;
    locationWatcher = createLocationWatcher(this);
    receivedMessageIds = /* @__PURE__ */ new Set();
    get signal() {
      return this.abortController.signal;
    }
    abort(reason) {
      return this.abortController.abort(reason);
    }
    get isInvalid() {
      if (browser.runtime.id == null) {
        this.notifyInvalidated();
      }
      return this.signal.aborted;
    }
    get isValid() {
      return !this.isInvalid;
    }
    /**
     * Add a listener that is called when the content script's context is invalidated.
     *
     * @returns A function to remove the listener.
     *
     * @example
     * browser.runtime.onMessage.addListener(cb);
     * const removeInvalidatedListener = ctx.onInvalidated(() => {
     *   browser.runtime.onMessage.removeListener(cb);
     * })
     * // ...
     * removeInvalidatedListener();
     */
    onInvalidated(cb) {
      this.signal.addEventListener("abort", cb);
      return () => this.signal.removeEventListener("abort", cb);
    }
    /**
     * Return a promise that never resolves. Useful if you have an async function that shouldn't run
     * after the context is expired.
     *
     * @example
     * const getValueFromStorage = async () => {
     *   if (ctx.isInvalid) return ctx.block();
     *
     *   // ...
     * }
     */
    block() {
      return new Promise(() => {
      });
    }
    /**
     * Wrapper around `window.setInterval` that automatically clears the interval when invalidated.
     *
     * Intervals can be cleared by calling the normal `clearInterval` function.
     */
    setInterval(handler, timeout) {
      const id = setInterval(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearInterval(id));
      return id;
    }
    /**
     * Wrapper around `window.setTimeout` that automatically clears the interval when invalidated.
     *
     * Timeouts can be cleared by calling the normal `setTimeout` function.
     */
    setTimeout(handler, timeout) {
      const id = setTimeout(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearTimeout(id));
      return id;
    }
    /**
     * Wrapper around `window.requestAnimationFrame` that automatically cancels the request when
     * invalidated.
     *
     * Callbacks can be canceled by calling the normal `cancelAnimationFrame` function.
     */
    requestAnimationFrame(callback) {
      const id = requestAnimationFrame((...args) => {
        if (this.isValid) callback(...args);
      });
      this.onInvalidated(() => cancelAnimationFrame(id));
      return id;
    }
    /**
     * Wrapper around `window.requestIdleCallback` that automatically cancels the request when
     * invalidated.
     *
     * Callbacks can be canceled by calling the normal `cancelIdleCallback` function.
     */
    requestIdleCallback(callback, options) {
      const id = requestIdleCallback((...args) => {
        if (!this.signal.aborted) callback(...args);
      }, options);
      this.onInvalidated(() => cancelIdleCallback(id));
      return id;
    }
    addEventListener(target, type, handler, options) {
      if (type === "wxt:locationchange") {
        if (this.isValid) this.locationWatcher.run();
      }
      target.addEventListener?.(
        type.startsWith("wxt:") ? getUniqueEventName(type) : type,
        handler,
        {
          ...options,
          signal: this.signal
        }
      );
    }
    /**
     * @internal
     * Abort the abort controller and execute all `onInvalidated` listeners.
     */
    notifyInvalidated() {
      this.abort("Content script context invalidated");
      logger$1.debug(
        `Content script "${this.contentScriptName}" context invalidated`
      );
    }
    stopOldScripts() {
      window.postMessage(
        {
          type: ContentScriptContext.SCRIPT_STARTED_MESSAGE_TYPE,
          contentScriptName: this.contentScriptName,
          messageId: Math.random().toString(36).slice(2)
        },
        "*"
      );
    }
    verifyScriptStartedEvent(event) {
      const isScriptStartedEvent = event.data?.type === ContentScriptContext.SCRIPT_STARTED_MESSAGE_TYPE;
      const isSameContentScript = event.data?.contentScriptName === this.contentScriptName;
      const isNotDuplicate = !this.receivedMessageIds.has(event.data?.messageId);
      return isScriptStartedEvent && isSameContentScript && isNotDuplicate;
    }
    listenForNewerScripts(options) {
      let isFirst = true;
      const cb = (event) => {
        if (this.verifyScriptStartedEvent(event)) {
          this.receivedMessageIds.add(event.data.messageId);
          const wasFirst = isFirst;
          isFirst = false;
          if (wasFirst && options?.ignoreFirstEvent) return;
          this.notifyInvalidated();
        }
      };
      addEventListener("message", cb);
      this.onInvalidated(() => removeEventListener("message", cb));
    }
  }
  function initPlugins() {
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  const result = (async () => {
    try {
      initPlugins();
      const { main, ...options } = definition;
      const ctx = new ContentScriptContext("content", options);
      return await main(ctx);
    } catch (err) {
      logger.error(
        `The content script "${"content"}" crashed on startup!`,
        err
      );
      throw err;
    }
  })();
  return result;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHd4dC1kZXYrYnJvd3NlckAwLjEuMzIvbm9kZV9tb2R1bGVzL0B3eHQtZGV2L2Jyb3dzZXIvc3JjL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyLm1qcyIsIi4uLy4uLy4uL2Fzc2V0cy90aGVtZXMvbWludGxpZnktbGlnaHQuY3NzP3JhdyIsIi4uLy4uLy4uL2Fzc2V0cy90aGVtZXMvbWludGxpZnktZGFyay5jc3M/cmF3IiwiLi4vLi4vLi4vZW50cnlwb2ludHMvY29udGVudC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJleHBvcnQgZGVmYXVsdCBcIi8qIE1pbnRsaWZ5LWluc3BpcmVkIExpZ2h0IFRoZW1lIGZvciBtZEJvb2sgKi9cXG46cm9vdCB7XFxuICAgIC0tYmc6ICNmZmZmZmY7XFxuICAgIC0tZmc6ICMwYTBkMGQ7XFxuICAgIC0tc2lkZWJhci1iZzogI2Y4ZmFmOTtcXG4gICAgLS1zaWRlYmFyLWZnOiAjMzc0MTUxO1xcbiAgICAtLXNpZGViYXItYWN0aXZlOiAjMTY2ZTNmO1xcbiAgICAtLXNpZGViYXItYWN0aXZlLWJnOiByZ2JhKDIyLCAxMTAsIDYzLCAwLjEpO1xcbiAgICAtLXNpZGViYXItaGVhZGVyLWJvcmRlci1jb2xvcjogdmFyKC0tc2lkZWJhci1hY3RpdmUpO1xcbiAgICAtLWxpbmtzOiAjMTY2ZTNmO1xcbiAgICAtLWxpbmtzLWhvdmVyOiAjMjZiZDZjO1xcbiAgICAtLWlubGluZS1jb2RlLWJnOiAjZjNmNmY0O1xcbiAgICAtLWNvZGUtYmc6ICMwYTBkMGQ7XFxuICAgIC0tY29kZS1mZzogI2U1ZTdlYjtcXG4gICAgLS1xdW90ZS1iZzogI2YzZjZmNDtcXG4gICAgLS1xdW90ZS1ib3JkZXI6ICMyNmJkNmM7XFxuICAgIC0tdGFibGUtYm9yZGVyOiAjZTVlN2ViO1xcbiAgICAtLXRhYmxlLWhlYWRlci1iZzogI2YzZjZmNDtcXG4gICAgLS1zZWFyY2gtYmc6ICNmZmZmZmY7XFxuICAgIC0tc2VhcmNoLWJvcmRlcjogI2U1ZTdlYjtcXG4gICAgLS1zZWFyY2hiYXItc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpO1xcbiAgICAtLXNjcm9sbGJhcjogI2QxZDVkYjtcXG4gICAgLS1zY3JvbGxiYXItaG92ZXI6ICM5Y2EzYWY7XFxuICAgIC0tb3JkZXItd2VpZ2h0OiA0MDA7XFxuICAgIC0tY2hhcHRlci1uYXYtZGlzcGxheTogbm9uZTtcXG59XFxuXFxuaHRtbCB7XFxuICAgIGZvbnQtZmFtaWx5OlxcbiAgICAgICAgXFxcIkludGVyXFxcIixcXG4gICAgICAgIC1hcHBsZS1zeXN0ZW0sXFxuICAgICAgICBCbGlua01hY1N5c3RlbUZvbnQsXFxuICAgICAgICBcXFwiU2Vnb2UgVUlcXFwiLFxcbiAgICAgICAgUm9ib3RvLFxcbiAgICAgICAgc2Fucy1zZXJpZjtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmcpO1xcbiAgICBjb2xvcjogdmFyKC0tZmcpO1xcbiAgICBzY3JvbGwtYmVoYXZpb3I6IHNtb290aDtcXG59XFxuXFxuYm9keSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxubmF2Lm5hdi13aWRlLXdyYXBwZXIgYS5uYXYtY2hhcHRlcnMge1xcbiAgICBkaXNwbGF5OiB2YXIoLS1jaGFwdGVyLW5hdi1kaXNwbGF5KTtcXG59XFxuXFxuLyogU2lkZWJhciAqL1xcbi5zaWRlYmFyIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1iZyk7XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbi5zaWRlYmFyIC5zaWRlYmFyLXNjcm9sbGJveCB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbn1cXG5cXG4uc2lkZWJhciBvbC5jaGFwdGVyIGxpLmNoYXB0ZXItaXRlbSBzcGFuLmNoYXB0ZXItbGluay13cmFwcGVyIGEge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG59XFxuLnNpZGViYXIgb2wuY2hhcHRlciBsaS5jaGFwdGVyLWl0ZW0gc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlciB7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItZmcpO1xcbiAgICBwYWRkaW5nOiA4cHggMTZweDtcXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgICBtYXJnaW46IDJweCA4cHg7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlO1xcbn1cXG5cXG4vKi5zaWRlYmFyIG9sLmNoYXB0ZXIgPiBsaS5jaGFwdGVyLWl0ZW0gPiBzcGFuLmNoYXB0ZXItbGluay13cmFwcGVyIHtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxufSovXFxuXFxuLyouc2lkZWJhciBvbC5jaGFwdGVyIGxpIC5jaGFwdGVyLWl0ZW0uZXhwYW5kZWQgPiBhLCovXFxuLnNpZGViYXIgb2wuY2hhcHRlciBsaS5jaGFwdGVyLWl0ZW0gc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlcjpoYXMoYS5hY3RpdmUpLFxcbi5zaWRlYmFyIG9sLmNoYXB0ZXIgbGkuY2hhcHRlci1pdGVtIHNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXI6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxuICAgIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuXFxuLyogTWFpbiBjb250ZW50ICovXFxuLmNvbnRlbnQge1xcbiAgICBtYXgtd2lkdGg6IDgwMHB4O1xcbiAgICBwYWRkaW5nOiAyNHB4IDQ4cHg7XFxufVxcblxcbi5jb250ZW50IG1haW4ge1xcbiAgICBtYXgtd2lkdGg6IDEwMCU7XFxufVxcblxcbi8qIFR5cG9ncmFwaHkgKi9cXG5oMSxcXG5oMixcXG5oMyxcXG5oNCxcXG5oNSxcXG5oNiB7XFxuICAgIGNvbG9yOiB2YXIoLS1mZyk7XFxuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICAgIG1hcmdpbi10b3A6IDJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMC41ZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjM7XFxufVxcblxcbmgxIHtcXG4gICAgZm9udC1zaXplOiAyLjI1cmVtO1xcbiAgICBtYXJnaW4tdG9wOiAwO1xcbn1cXG5oMiB7XFxuICAgIGZvbnQtc2l6ZTogMS43NXJlbTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxuICAgIHBhZGRpbmctYm90dG9tOiAwLjVyZW07XFxufVxcbmgzIHtcXG4gICAgZm9udC1zaXplOiAxLjM3NXJlbTtcXG59XFxuaDQge1xcbiAgICBmb250LXNpemU6IDEuMTI1cmVtO1xcbn1cXG5cXG5wIHtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNzU7XFxuICAgIG1hcmdpbjogMWVtIDA7XFxufVxcblxcbi8qIExpbmtzICovXFxuYSB7XFxuICAgIGNvbG9yOiB2YXIoLS1saW5rcyk7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgdHJhbnNpdGlvbjogY29sb3IgMC4xNXMgZWFzZTtcXG59XFxuXFxuYTpob3ZlciB7XFxuICAgIGNvbG9yOiB2YXIoLS1saW5rcy1ob3Zlcik7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xcbn1cXG5cXG4vKiBDb2RlICovXFxuY29kZSB7XFxuICAgIGZvbnQtZmFtaWx5OiBcXFwiR2Vpc3QgTW9ub1xcXCIsIFxcXCJGaXJhIENvZGVcXFwiLCBcXFwiSmV0QnJhaW5zIE1vbm9cXFwiLCBtb25vc3BhY2U7XFxuICAgIGZvbnQtc2l6ZTogMC44NzVlbTtcXG59XFxuXFxuc3Ryb25nIHtcXG4gICAgZm9udC13ZWlnaHQ6IHZhcigtLW9yZGVyLXdlaWdodCk7XFxufVxcblxcbjpub3QocHJlKSA+IGNvZGUge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1pbmxpbmUtY29kZS1iZyk7XFxuICAgIHBhZGRpbmc6IDAuMmVtIDAuNGVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICAgIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxufVxcblxcbnByZSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvZGUtYmcpICFpbXBvcnRhbnQ7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2RlLWZnKTtcXG4gICAgcGFkZGluZzogMTZweCAyMHB4O1xcbiAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xcbiAgICBvdmVyZmxvdy14OiBhdXRvO1xcbiAgICBtYXJnaW46IDEuNWVtIDA7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcXG59XFxuXFxucHJlIGNvZGUge1xcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgY29sb3I6IGluaGVyaXQ7XFxufVxcblxcbi8qIEJsb2NrcXVvdGVzICovXFxuYmxvY2txdW90ZSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXF1b3RlLWJnKTtcXG4gICAgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCB2YXIoLS1xdW90ZS1ib3JkZXIpO1xcbiAgICBtYXJnaW46IDEuNWVtIDA7XFxuICAgIHBhZGRpbmc6IDE2cHggMjBweDtcXG4gICAgYm9yZGVyLXJhZGl1czogMCAxMnB4IDEycHggMDtcXG59XFxuXFxuYmxvY2txdW90ZSBwIHtcXG4gICAgbWFyZ2luOiAwO1xcbn1cXG5cXG4vKiBUYWJsZXMgKi9cXG50YWJsZSB7XFxuICAgIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBtYXJnaW46IDEuNWVtIDA7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbnRoIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tdGFibGUtaGVhZGVyLWJnKTtcXG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gICAgdGV4dC1hbGlnbjogbGVmdDtcXG59XFxuXFxudGgsXFxudGQge1xcbiAgICBwYWRkaW5nOiAxMnB4IDE2cHg7XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG50cjpsYXN0LWNoaWxkIHRkIHtcXG4gICAgYm9yZGVyLWJvdHRvbTogbm9uZTtcXG59XFxuXFxuLyogTWVudSBiYXIgKi9cXG4jbWVudS1iYXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG4jbWVudS1iYXIgaSB7XFxuICAgIGNvbG9yOiB2YXIoLS1mZyk7XFxufVxcblxcbi8qIFNlYXJjaCAqL1xcbiNzZWFyY2hiYXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zZWFyY2gtYmcpO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1zZWFyY2gtYm9yZGVyKTtcXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgICBwYWRkaW5nOiA4cHggMTJweDtcXG4gICAgYm94LXNoYWRvdzogdmFyKC0tc2VhcmNoYmFyLXNoYWRvdyk7XFxufVxcblxcbi8qIE5hdmlnYXRpb24gYnV0dG9ucyAqL1xcbi5uYXYtY2hhcHRlcnMge1xcbiAgICBjb2xvcjogdmFyKC0tbGlua3MpO1xcbiAgICBvcGFjaXR5OiAwLjg7XFxuICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4xNXMgZWFzZTtcXG59XFxuXFxuLm5hdi1jaGFwdGVyczpob3ZlciB7XFxuICAgIGNvbG9yOiB2YXIoLS1saW5rcy1ob3Zlcik7XFxuICAgIG9wYWNpdHk6IDE7XFxufVxcblxcbi8qIFNjcm9sbGJhciAqL1xcbjo6LXdlYmtpdC1zY3JvbGxiYXIge1xcbiAgICB3aWR0aDogOHB4O1xcbiAgICBoZWlnaHQ6IDhweDtcXG59XFxuXFxuOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7XFxuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2Nyb2xsYmFyKTtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iOmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2Nyb2xsYmFyLWhvdmVyKTtcXG59XFxuXFxuLyogVGhlbWUgdG9nZ2xlICovXFxuI3RoZW1lLWxpc3Qge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWJnKTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbn1cXG5cXG4jdGhlbWUtbGlzdCBsaSB7XFxuICAgIGNvbG9yOiB2YXIoLS1mZyk7XFxufVxcblxcbiN0aGVtZS1saXN0IGxpOmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1hY3RpdmUtYmcpO1xcbn1cXG5cIiIsImV4cG9ydCBkZWZhdWx0IFwiLyogTWludGxpZnktaW5zcGlyZWQgRGFyayBUaGVtZSBmb3IgbWRCb29rICovXFxuOnJvb3Qge1xcbiAgLS1iZzogIzBhMGQwZDtcXG4gIC0tZmc6ICNlNWU3ZWI7XFxuICAtLXNpZGViYXItYmc6ICMxMTE0MTQ7XFxuICAtLXNpZGViYXItZmc6ICM5Y2EzYWY7XFxuICAtLXNpZGViYXItYWN0aXZlOiAjMjZiZDZjO1xcbiAgLS1zaWRlYmFyLWFjdGl2ZS1iZzogcmdiYSgzOCwgMTg5LCAxMDgsIDAuMTUpO1xcbiAgLS1saW5rczogIzI2YmQ2YztcXG4gIC0tbGlua3MtaG92ZXI6ICM0YWRlODA7XFxuICAtLWlubGluZS1jb2RlLWJnOiAjMWYyNDI0O1xcbiAgLS1jb2RlLWJnOiAjMTYxYTFhO1xcbiAgLS1jb2RlLWZnOiAjZTVlN2ViO1xcbiAgLS1xdW90ZS1iZzogIzFmMjQyNDtcXG4gIC0tcXVvdGUtYm9yZGVyOiAjMjZiZDZjO1xcbiAgLS10YWJsZS1ib3JkZXI6ICMyZDMzMzM7XFxuICAtLXRhYmxlLWhlYWRlci1iZzogIzFmMjQyNDtcXG4gIC0tc2VhcmNoLWJnOiAjMTYxYTFhO1xcbiAgLS1zZWFyY2gtYm9yZGVyOiAjMmQzMzMzO1xcbiAgLS1zZWFyY2hiYXItc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjMpO1xcbiAgLS1zY3JvbGxiYXI6ICMzZDQzNDM7XFxuICAtLXNjcm9sbGJhci1ob3ZlcjogIzRkNTU1NTtcXG59XFxuXFxuaHRtbCB7XFxuICBmb250LWZhbWlseTogJ0ludGVyJywgLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICBjb2xvcjogdmFyKC0tZmcpO1xcbiAgc2Nyb2xsLWJlaGF2aW9yOiBzbW9vdGg7XFxufVxcblxcbmJvZHkge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tYmcpO1xcbiAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuLyogU2lkZWJhciAqL1xcbi5zaWRlYmFyIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbiAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxuLnNpZGViYXIgLnNpZGViYXItc2Nyb2xsYm94IHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbn1cXG5cXG4uc2lkZWJhciBvbC5jaGFwdGVyIGxpIGEge1xcbiAgY29sb3I6IHZhcigtLXNpZGViYXItZmcpO1xcbiAgcGFkZGluZzogOHB4IDE2cHg7XFxuICBib3JkZXItcmFkaXVzOiA4cHg7XFxuICBtYXJnaW46IDJweCA4cHg7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTtcXG59XFxuXFxuLnNpZGViYXIgb2wuY2hhcHRlciBsaSBhOmhvdmVyIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYWN0aXZlLWJnKTtcXG4gIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxufVxcblxcbi5zaWRlYmFyIG9sLmNoYXB0ZXIgbGkuY2hhcHRlci1pdGVtLmV4cGFuZGVkID4gYSxcXG4uc2lkZWJhciBvbC5jaGFwdGVyIGxpIGEuYWN0aXZlIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYWN0aXZlLWJnKTtcXG4gIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxuICBmb250LXdlaWdodDogNjAwO1xcbn1cXG5cXG4vKiBNYWluIGNvbnRlbnQgKi9cXG4uY29udGVudCB7XFxuICBtYXgtd2lkdGg6IDgwMHB4O1xcbiAgcGFkZGluZzogMjRweCA0OHB4O1xcbn1cXG5cXG4uY29udGVudCBtYWluIHtcXG4gIG1heC13aWR0aDogMTAwJTtcXG59XFxuXFxuLyogVHlwb2dyYXBoeSAqL1xcbmgxLCBoMiwgaDMsIGg0LCBoNSwgaDYge1xcbiAgY29sb3I6ICNmZmZmZmY7XFxuICBmb250LXdlaWdodDogNjAwO1xcbiAgbWFyZ2luLXRvcDogMmVtO1xcbiAgbWFyZ2luLWJvdHRvbTogMC41ZW07XFxuICBsaW5lLWhlaWdodDogMS4zO1xcbn1cXG5cXG5oMSB7IGZvbnQtc2l6ZTogMi4yNXJlbTsgbWFyZ2luLXRvcDogMDsgfVxcbmgyIHsgZm9udC1zaXplOiAxLjc1cmVtOyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTsgcGFkZGluZy1ib3R0b206IDAuNXJlbTsgfVxcbmgzIHsgZm9udC1zaXplOiAxLjM3NXJlbTsgfVxcbmg0IHsgZm9udC1zaXplOiAxLjEyNXJlbTsgfVxcblxcbnAge1xcbiAgbGluZS1oZWlnaHQ6IDEuNzU7XFxuICBtYXJnaW46IDFlbSAwO1xcbn1cXG5cXG4vKiBMaW5rcyAqL1xcbmEge1xcbiAgY29sb3I6IHZhcigtLWxpbmtzKTtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIHRyYW5zaXRpb246IGNvbG9yIDAuMTVzIGVhc2U7XFxufVxcblxcbmE6aG92ZXIge1xcbiAgY29sb3I6IHZhcigtLWxpbmtzLWhvdmVyKTtcXG4gIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xcbn1cXG5cXG4vKiBDb2RlICovXFxuY29kZSB7XFxuICBmb250LWZhbWlseTogJ0dlaXN0IE1vbm8nLCAnRmlyYSBDb2RlJywgJ0pldEJyYWlucyBNb25vJywgbW9ub3NwYWNlO1xcbiAgZm9udC1zaXplOiAwLjg3NWVtO1xcbn1cXG5cXG46bm90KHByZSkgPiBjb2RlIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLWlubGluZS1jb2RlLWJnKTtcXG4gIHBhZGRpbmc6IDAuMmVtIDAuNGVtO1xcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xcbiAgY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG59XFxuXFxucHJlIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLWNvZGUtYmcpICFpbXBvcnRhbnQ7XFxuICBjb2xvcjogdmFyKC0tY29kZS1mZyk7XFxuICBwYWRkaW5nOiAxNnB4IDIwcHg7XFxuICBib3JkZXItcmFkaXVzOiAxMnB4O1xcbiAgb3ZlcmZsb3cteDogYXV0bztcXG4gIG1hcmdpbjogMS41ZW0gMDtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbnByZSBjb2RlIHtcXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbiAgcGFkZGluZzogMDtcXG4gIGNvbG9yOiBpbmhlcml0O1xcbn1cXG5cXG4vKiBCbG9ja3F1b3RlcyAqL1xcbmJsb2NrcXVvdGUge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tcXVvdGUtYmcpO1xcbiAgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCB2YXIoLS1xdW90ZS1ib3JkZXIpO1xcbiAgbWFyZ2luOiAxLjVlbSAwO1xcbiAgcGFkZGluZzogMTZweCAyMHB4O1xcbiAgYm9yZGVyLXJhZGl1czogMCAxMnB4IDEycHggMDtcXG59XFxuXFxuYmxvY2txdW90ZSBwIHtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuLyogVGFibGVzICovXFxudGFibGUge1xcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgbWFyZ2luOiAxLjVlbSAwO1xcbiAgYm9yZGVyLXJhZGl1czogMTJweDtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG50aCB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS10YWJsZS1oZWFkZXItYmcpO1xcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gIHRleHQtYWxpZ246IGxlZnQ7XFxufVxcblxcbnRoLCB0ZCB7XFxuICBwYWRkaW5nOiAxMnB4IDE2cHg7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxudHI6bGFzdC1jaGlsZCB0ZCB7XFxuICBib3JkZXItYm90dG9tOiBub25lO1xcbn1cXG5cXG4vKiBNZW51IGJhciAqL1xcbiNtZW51LWJhciB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxuI21lbnUtYmFyIGkge1xcbiAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuLyogU2VhcmNoICovXFxuI3NlYXJjaGJhciB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zZWFyY2gtYmcpO1xcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tc2VhcmNoLWJvcmRlcik7XFxuICBib3JkZXItcmFkaXVzOiA4cHg7XFxuICBwYWRkaW5nOiA4cHggMTJweDtcXG4gIGJveC1zaGFkb3c6IHZhcigtLXNlYXJjaGJhci1zaGFkb3cpO1xcbiAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuLyogTmF2aWdhdGlvbiBidXR0b25zICovXFxuLm5hdi1jaGFwdGVycyB7XFxuICBjb2xvcjogdmFyKC0tbGlua3MpO1xcbiAgb3BhY2l0eTogMC44O1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjE1cyBlYXNlO1xcbn1cXG5cXG4ubmF2LWNoYXB0ZXJzOmhvdmVyIHtcXG4gIGNvbG9yOiB2YXIoLS1saW5rcy1ob3Zlcik7XFxuICBvcGFjaXR5OiAxO1xcbn1cXG5cXG4vKiBTY3JvbGxiYXIgKi9cXG46Oi13ZWJraXQtc2Nyb2xsYmFyIHtcXG4gIHdpZHRoOiA4cHg7XFxuICBoZWlnaHQ6IDhweDtcXG59XFxuXFxuOjotd2Via2l0LXNjcm9sbGJhci10cmFjayB7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG59XFxuXFxuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JvbGxiYXIpO1xcbiAgYm9yZGVyLXJhZGl1czogNHB4O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iOmhvdmVyIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNjcm9sbGJhci1ob3Zlcik7XFxufVxcblxcbi8qIFRoZW1lIHRvZ2dsZSAqL1xcbiN0aGVtZS1saXN0IHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG4gIGJvcmRlci1yYWRpdXM6IDhweDtcXG59XFxuXFxuI3RoZW1lLWxpc3QgbGkge1xcbiAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuI3RoZW1lLWxpc3QgbGk6aG92ZXIge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1hY3RpdmUtYmcpO1xcbn1cXG5cIiIsIi8vIENvbnRlbnQgc2NyaXB0IGZvciBtZEJvb2sgdGhlbWUgbW9kaWZpY2F0aW9uXG4vLyBJbXBvcnQgQ1NTIGFzIHJhdyBzdHJpbmdzIGF0IGJ1aWxkIHRpbWVcbmltcG9ydCBtaW50bGlmeUxpZ2h0Q1NTIGZyb20gXCIuLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LWxpZ2h0LmNzcz9yYXdcIjtcbmltcG9ydCBtaW50bGlmeURhcmtDU1MgZnJvbSBcIi4uL2Fzc2V0cy90aGVtZXMvbWludGxpZnktZGFyay5jc3M/cmF3XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbnRlbnRTY3JpcHQoe1xuICBtYXRjaGVzOiBbXCI8YWxsX3VybHM+XCJdLFxuICBydW5BdDogXCJkb2N1bWVudF9zdGFydFwiLFxuXG4gIG1haW4oKSB7XG4gICAgLy8gQ3VzdG9tIHRoZW1lcyAoTWludGxpZnktaW5zcGlyZWQgKyBtZEJvb2sgYnVpbHQtaW4pXG4gICAgY29uc3QgQ1VTVE9NX1RIRU1FUyA9IFtcIm1pbnRsaWZ5XCIsIFwibWludGxpZnktZGFya1wiXSBhcyBjb25zdDtcbiAgICBjb25zdCBNREJPT0tfVEhFTUVTID0gW1wibGlnaHRcIiwgXCJydXN0XCIsIFwiY29hbFwiLCBcIm5hdnlcIiwgXCJheXVcIl0gYXMgY29uc3Q7XG4gICAgY29uc3QgQUxMX1RIRU1FUyA9IFsuLi5DVVNUT01fVEhFTUVTLCAuLi5NREJPT0tfVEhFTUVTXSBhcyBjb25zdDtcbiAgICB0eXBlIFRoZW1lID0gKHR5cGVvZiBBTExfVEhFTUVTKVtudW1iZXJdO1xuXG4gICAgbGV0IGlzTWRCb29rID0gZmFsc2U7XG4gICAgbGV0IHN0eWxlRWxlbWVudDogSFRNTFN0eWxlRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAgLy8gQ2hlY2sgaWYgY3VycmVudCBwYWdlIGlzIGFuIG1kQm9vayBzaXRlIGJ5IGxvb2tpbmcgZm9yIHRoZSBjb21tZW50XG4gICAgZnVuY3Rpb24gY2hlY2tNZEJvb2tDb21tZW50KCkge1xuICAgICAgLy8gQ2hlY2sgZm9yIDwhLS0gQm9vayBnZW5lcmF0ZWQgdXNpbmcgbWRCb29rIC0tPiBjb21tZW50IGF0IGRvY3VtZW50IHN0YXJ0XG4gICAgICBjb25zdCBub2RlcyA9IGRvY3VtZW50LmhlYWQuY2hpbGROb2RlcztcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKG5vZGVzIHx8IFtdKVxuICAgICAgICAuZmlsdGVyKChub2RlKSA9PiBub2RlLm5vZGVUeXBlID09PSBOb2RlLkNPTU1FTlRfTk9ERSlcbiAgICAgICAgLnNvbWUoKG5vZGUpID0+XG4gICAgICAgICAgbm9kZS5ub2RlVmFsdWU/LnRyaW0oKS5pbmNsdWRlcyhcIkJvb2sgZ2VuZXJhdGVkIHVzaW5nIG1kQm9va1wiKSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgY3VycmVudCBtZEJvb2sgdGhlbWUgZnJvbSBwYWdlXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudE1kQm9va1RoZW1lKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgIGZvciAoY29uc3QgdGhlbWUgb2YgTURCT09LX1RIRU1FUykge1xuICAgICAgICBpZiAoaHRtbC5jbGFzc0xpc3QuY29udGFpbnModGhlbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoZW1lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBHZXQgQ1NTIGZvciB0aGVtZVxuICAgIGZ1bmN0aW9uIGdldFRoZW1lQ1NTKHRoZW1lOiBUaGVtZSk6IHN0cmluZyB8IG51bGwge1xuICAgICAgc3dpdGNoICh0aGVtZSkge1xuICAgICAgICBjYXNlIFwibWludGxpZnlcIjpcbiAgICAgICAgICByZXR1cm4gbWludGxpZnlMaWdodENTUztcbiAgICAgICAgY2FzZSBcIm1pbnRsaWZ5LWRhcmtcIjpcbiAgICAgICAgICByZXR1cm4gbWludGxpZnlEYXJrQ1NTO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBudWxsOyAvLyBVc2UgbWRCb29rIGJ1aWx0LWluIHRoZW1lc1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluamVjdCBvciB1cGRhdGUgY3VzdG9tIHRoZW1lIENTU1xuICAgIGZ1bmN0aW9uIGluamVjdFRoZW1lQ1NTKGNzczogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgaWYgKCFjc3MpIHtcbiAgICAgICAgLy8gUmVtb3ZlIGN1c3RvbSBzdHlsZXMsIHVzZSBtZEJvb2sgYnVpbHQtaW5cbiAgICAgICAgaWYgKHN0eWxlRWxlbWVudCkge1xuICAgICAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICBzdHlsZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzdHlsZUVsZW1lbnQpIHtcbiAgICAgICAgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICBzdHlsZUVsZW1lbnQuaWQgPSBcIm1kYm9vay10aGVtZS1leHRlbnNpb25cIjtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgc3R5bGVFbGVtZW50LnRleHRDb250ZW50ID0gY3NzO1xuICAgIH1cblxuICAgIC8vIEFwcGx5IHRoZW1lIHRvIHBhZ2VcbiAgICBmdW5jdGlvbiBhcHBseVRoZW1lKHRoZW1lOiBUaGVtZSkge1xuICAgICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgIGNvbnN0IGlzQ3VzdG9tVGhlbWUgPSBDVVNUT01fVEhFTUVTLmluY2x1ZGVzKHRoZW1lIGFzIGFueSk7XG5cbiAgICAgIGlmIChpc0N1c3RvbVRoZW1lKSB7XG4gICAgICAgIC8vIEZvciBjdXN0b20gdGhlbWVzLCBzZXQgYmFzZSBtZEJvb2sgdGhlbWUgYW5kIGluamVjdCBDU1NcbiAgICAgICAgTURCT09LX1RIRU1FUy5mb3JFYWNoKCh0KSA9PiBodG1sLmNsYXNzTGlzdC5yZW1vdmUodCkpO1xuICAgICAgICBodG1sLmNsYXNzTGlzdC5hZGQodGhlbWUgPT09IFwibWludGxpZnlcIiA/IFwibGlnaHRcIiA6IFwiY29hbFwiKTtcbiAgICAgICAgaW5qZWN0VGhlbWVDU1MoZ2V0VGhlbWVDU1ModGhlbWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBtZEJvb2sgYnVpbHQtaW4gdGhlbWVzXG4gICAgICAgIE1EQk9PS19USEVNRVMuZm9yRWFjaCgodCkgPT4gaHRtbC5jbGFzc0xpc3QucmVtb3ZlKHQpKTtcbiAgICAgICAgaHRtbC5jbGFzc0xpc3QuYWRkKHRoZW1lKTtcbiAgICAgICAgaW5qZWN0VGhlbWVDU1MobnVsbCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm1kYm9vay10aGVtZVwiLCB0aGVtZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBJZ25vcmVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBOb3RpZnkgcG9wdXAgYWJvdXQgdGhlbWUgY2hhbmdlXG4gICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyB0eXBlOiBcInRoZW1lQ2hhbmdlZFwiLCB0aGVtZSB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8vIElnbm9yZSBlcnJvcnMgd2hlbiBwb3B1cCBpcyBub3Qgb3BlblxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGVtZSBmcm9tIHN0b3JhZ2VcbiAgICBhc3luYyBmdW5jdGlvbiBpbml0VGhlbWUoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBsb2NhbENvbmZpZyA9IFtcIm1kYm9va1RoZW1lXCIsIFwiZW5hYmxlZFwiXSBhcyBjb25zdDtcbiAgICAgICAgdHlwZSBMb2NhbENvbmZpZyA9IHtcbiAgICAgICAgICBbSyBpbiAodHlwZW9mIGxvY2FsQ29uZmlnKVtudW1iZXJdXT86IHN0cmluZztcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgeyBtZGJvb2tUaGVtZSB9ID0gKGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXG4gICAgICAgICAgbG9jYWxDb25maWcgYXMgYW55LFxuICAgICAgICApKSBhcyBMb2NhbENvbmZpZztcblxuICAgICAgICBjb25zdCB0aGVtZSA9IG1kYm9va1RoZW1lIHx8IChcIm1pbnRsaWZ5XCIgYXMgYW55KTsgLy8gRGVmYXVsdCB0byBtaW50bGlmeVxuICAgICAgICBpZiAoQUxMX1RIRU1FUy5pbmNsdWRlcyh0aGVtZSkpIHtcbiAgICAgICAgICBhcHBseVRoZW1lKHRoZW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBEZWZhdWx0IHRvIG1pbnRsaWZ5IG9uIGVycm9yXG4gICAgICAgIGFwcGx5VGhlbWUoXCJtaW50bGlmeVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHRoZW1lIGNoYW5nZSBtZXNzYWdlcyBmcm9tIHBvcHVwXG4gICAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSkgPT4ge1xuICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJzZXRUaGVtZVwiICYmIEFMTF9USEVNRVMuaW5jbHVkZXMobWVzc2FnZS50aGVtZSkpIHtcbiAgICAgICAgYXBwbHlUaGVtZShtZXNzYWdlLnRoZW1lKTtcbiAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSBcImdldFN0YXR1c1wiKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICAgIGlzTWRCb29rLFxuICAgICAgICAgIGN1cnJlbnRUaGVtZTogZ2V0Q3VycmVudE1kQm9va1RoZW1lKCksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gTWFpbiBpbml0aWFsaXphdGlvblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICBpc01kQm9vayA9IGNoZWNrTWRCb29rQ29tbWVudCgpO1xuICAgICAgaWYgKGlzTWRCb29rKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiZW5hYmxlZFwiLCBcInRydWVcIik7XG4gICAgICAgIGluaXRUaGVtZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIERPTSB0byBiZSByZWFkeVxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluaXQoKTtcbiAgICB9XG4gIH0sXG59KTtcbiIsImZ1bmN0aW9uIHByaW50KG1ldGhvZCwgLi4uYXJncykge1xuICBpZiAoaW1wb3J0Lm1ldGEuZW52Lk1PREUgPT09IFwicHJvZHVjdGlvblwiKSByZXR1cm47XG4gIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBhcmdzLnNoaWZ0KCk7XG4gICAgbWV0aG9kKGBbd3h0XSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgbWV0aG9kKFwiW3d4dF1cIiwgLi4uYXJncyk7XG4gIH1cbn1cbmV4cG9ydCBjb25zdCBsb2dnZXIgPSB7XG4gIGRlYnVnOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5kZWJ1ZywgLi4uYXJncyksXG4gIGxvZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUubG9nLCAuLi5hcmdzKSxcbiAgd2FybjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUud2FybiwgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5lcnJvciwgLi4uYXJncylcbn07XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5leHBvcnQgY2xhc3MgV3h0TG9jYXRpb25DaGFuZ2VFdmVudCBleHRlbmRzIEV2ZW50IHtcbiAgY29uc3RydWN0b3IobmV3VXJsLCBvbGRVcmwpIHtcbiAgICBzdXBlcihXeHRMb2NhdGlvbkNoYW5nZUV2ZW50LkVWRU5UX05BTUUsIHt9KTtcbiAgICB0aGlzLm5ld1VybCA9IG5ld1VybDtcbiAgICB0aGlzLm9sZFVybCA9IG9sZFVybDtcbiAgfVxuICBzdGF0aWMgRVZFTlRfTkFNRSA9IGdldFVuaXF1ZUV2ZW50TmFtZShcInd4dDpsb2NhdGlvbmNoYW5nZVwiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRVbmlxdWVFdmVudE5hbWUoZXZlbnROYW1lKSB7XG4gIHJldHVybiBgJHticm93c2VyPy5ydW50aW1lPy5pZH06JHtpbXBvcnQubWV0YS5lbnYuRU5UUllQT0lOVH06JHtldmVudE5hbWV9YDtcbn1cbiIsImltcG9ydCB7IFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQgfSBmcm9tIFwiLi9jdXN0b20tZXZlbnRzLm1qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2F0aW9uV2F0Y2hlcihjdHgpIHtcbiAgbGV0IGludGVydmFsO1xuICBsZXQgb2xkVXJsO1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIEVuc3VyZSB0aGUgbG9jYXRpb24gd2F0Y2hlciBpcyBhY3RpdmVseSBsb29raW5nIGZvciBVUkwgY2hhbmdlcy4gSWYgaXQncyBhbHJlYWR5IHdhdGNoaW5nLFxuICAgICAqIHRoaXMgaXMgYSBub29wLlxuICAgICAqL1xuICAgIHJ1bigpIHtcbiAgICAgIGlmIChpbnRlcnZhbCAhPSBudWxsKSByZXR1cm47XG4gICAgICBvbGRVcmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgaW50ZXJ2YWwgPSBjdHguc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgbmV3VXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgaWYgKG5ld1VybC5ocmVmICE9PSBvbGRVcmwuaHJlZikge1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50KG5ld1VybCwgb2xkVXJsKSk7XG4gICAgICAgICAgb2xkVXJsID0gbmV3VXJsO1xuICAgICAgICB9XG4gICAgICB9LCAxZTMpO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IGJyb3dzZXIgfSBmcm9tIFwid3h0L2Jyb3dzZXJcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCIuLi91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzXCI7XG5pbXBvcnQge1xuICBnZXRVbmlxdWVFdmVudE5hbWVcbn0gZnJvbSBcIi4vaW50ZXJuYWwvY3VzdG9tLWV2ZW50cy5tanNcIjtcbmltcG9ydCB7IGNyZWF0ZUxvY2F0aW9uV2F0Y2hlciB9IGZyb20gXCIuL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzXCI7XG5leHBvcnQgY2xhc3MgQ29udGVudFNjcmlwdENvbnRleHQge1xuICBjb25zdHJ1Y3Rvcihjb250ZW50U2NyaXB0TmFtZSwgb3B0aW9ucykge1xuICAgIHRoaXMuY29udGVudFNjcmlwdE5hbWUgPSBjb250ZW50U2NyaXB0TmFtZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGlmICh0aGlzLmlzVG9wRnJhbWUpIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yTmV3ZXJTY3JpcHRzKHsgaWdub3JlRmlyc3RFdmVudDogdHJ1ZSB9KTtcbiAgICAgIHRoaXMuc3RvcE9sZFNjcmlwdHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JOZXdlclNjcmlwdHMoKTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIFNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRSA9IGdldFVuaXF1ZUV2ZW50TmFtZShcbiAgICBcInd4dDpjb250ZW50LXNjcmlwdC1zdGFydGVkXCJcbiAgKTtcbiAgaXNUb3BGcmFtZSA9IHdpbmRvdy5zZWxmID09PSB3aW5kb3cudG9wO1xuICBhYm9ydENvbnRyb2xsZXI7XG4gIGxvY2F0aW9uV2F0Y2hlciA9IGNyZWF0ZUxvY2F0aW9uV2F0Y2hlcih0aGlzKTtcbiAgcmVjZWl2ZWRNZXNzYWdlSWRzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgZ2V0IHNpZ25hbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICB9XG4gIGFib3J0KHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5hYm9ydChyZWFzb24pO1xuICB9XG4gIGdldCBpc0ludmFsaWQoKSB7XG4gICAgaWYgKGJyb3dzZXIucnVudGltZS5pZCA9PSBudWxsKSB7XG4gICAgICB0aGlzLm5vdGlmeUludmFsaWRhdGVkKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNpZ25hbC5hYm9ydGVkO1xuICB9XG4gIGdldCBpc1ZhbGlkKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0ludmFsaWQ7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgc2NyaXB0J3MgY29udGV4dCBpcyBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogQHJldHVybnMgQSBmdW5jdGlvbiB0byByZW1vdmUgdGhlIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGNiKTtcbiAgICogY29uc3QgcmVtb3ZlSW52YWxpZGF0ZWRMaXN0ZW5lciA9IGN0eC5vbkludmFsaWRhdGVkKCgpID0+IHtcbiAgICogICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKGNiKTtcbiAgICogfSlcbiAgICogLy8gLi4uXG4gICAqIHJlbW92ZUludmFsaWRhdGVkTGlzdGVuZXIoKTtcbiAgICovXG4gIG9uSW52YWxpZGF0ZWQoY2IpIHtcbiAgICB0aGlzLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2IpO1xuICAgIHJldHVybiAoKSA9PiB0aGlzLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2IpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgbmV2ZXIgcmVzb2x2ZXMuIFVzZWZ1bCBpZiB5b3UgaGF2ZSBhbiBhc3luYyBmdW5jdGlvbiB0aGF0IHNob3VsZG4ndCBydW5cbiAgICogYWZ0ZXIgdGhlIGNvbnRleHQgaXMgZXhwaXJlZC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgZ2V0VmFsdWVGcm9tU3RvcmFnZSA9IGFzeW5jICgpID0+IHtcbiAgICogICBpZiAoY3R4LmlzSW52YWxpZCkgcmV0dXJuIGN0eC5ibG9jaygpO1xuICAgKlxuICAgKiAgIC8vIC4uLlxuICAgKiB9XG4gICAqL1xuICBibG9jaygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnNldEludGVydmFsYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2xlYXJzIHRoZSBpbnRlcnZhbCB3aGVuIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBJbnRlcnZhbHMgY2FuIGJlIGNsZWFyZWQgYnkgY2FsbGluZyB0aGUgbm9ybWFsIGBjbGVhckludGVydmFsYCBmdW5jdGlvbi5cbiAgICovXG4gIHNldEludGVydmFsKGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICBjb25zdCBpZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGhhbmRsZXIoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2xlYXJJbnRlcnZhbChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5zZXRUaW1lb3V0YCB0aGF0IGF1dG9tYXRpY2FsbHkgY2xlYXJzIHRoZSBpbnRlcnZhbCB3aGVuIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBUaW1lb3V0cyBjYW4gYmUgY2xlYXJlZCBieSBjYWxsaW5nIHRoZSBub3JtYWwgYHNldFRpbWVvdXRgIGZ1bmN0aW9uLlxuICAgKi9cbiAgc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGhhbmRsZXIoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2xlYXJUaW1lb3V0KGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZWAgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgdGhlIHJlcXVlc3Qgd2hlblxuICAgKiBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogQ2FsbGJhY2tzIGNhbiBiZSBjYW5jZWxlZCBieSBjYWxsaW5nIHRoZSBub3JtYWwgYGNhbmNlbEFuaW1hdGlvbkZyYW1lYCBmdW5jdGlvbi5cbiAgICovXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaykge1xuICAgIGNvbnN0IGlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFja2AgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgdGhlIHJlcXVlc3Qgd2hlblxuICAgKiBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogQ2FsbGJhY2tzIGNhbiBiZSBjYW5jZWxlZCBieSBjYWxsaW5nIHRoZSBub3JtYWwgYGNhbmNlbElkbGVDYWxsYmFja2AgZnVuY3Rpb24uXG4gICAqL1xuICByZXF1ZXN0SWRsZUNhbGxiYWNrKGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaWQgPSByZXF1ZXN0SWRsZUNhbGxiYWNrKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc2lnbmFsLmFib3J0ZWQpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjYW5jZWxJZGxlQ2FsbGJhY2soaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgYWRkRXZlbnRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZSA9PT0gXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIikge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgdGhpcy5sb2NhdGlvbldhdGNoZXIucnVuKCk7XG4gICAgfVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyPy4oXG4gICAgICB0eXBlLnN0YXJ0c1dpdGgoXCJ3eHQ6XCIpID8gZ2V0VW5pcXVlRXZlbnROYW1lKHR5cGUpIDogdHlwZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIHNpZ25hbDogdGhpcy5zaWduYWxcbiAgICAgIH1cbiAgICApO1xuICB9XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICogQWJvcnQgdGhlIGFib3J0IGNvbnRyb2xsZXIgYW5kIGV4ZWN1dGUgYWxsIGBvbkludmFsaWRhdGVkYCBsaXN0ZW5lcnMuXG4gICAqL1xuICBub3RpZnlJbnZhbGlkYXRlZCgpIHtcbiAgICB0aGlzLmFib3J0KFwiQ29udGVudCBzY3JpcHQgY29udGV4dCBpbnZhbGlkYXRlZFwiKTtcbiAgICBsb2dnZXIuZGVidWcoXG4gICAgICBgQ29udGVudCBzY3JpcHQgXCIke3RoaXMuY29udGVudFNjcmlwdE5hbWV9XCIgY29udGV4dCBpbnZhbGlkYXRlZGBcbiAgICApO1xuICB9XG4gIHN0b3BPbGRTY3JpcHRzKCkge1xuICAgIHdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogQ29udGVudFNjcmlwdENvbnRleHQuU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFLFxuICAgICAgICBjb250ZW50U2NyaXB0TmFtZTogdGhpcy5jb250ZW50U2NyaXB0TmFtZSxcbiAgICAgICAgbWVzc2FnZUlkOiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgICAgfSxcbiAgICAgIFwiKlwiXG4gICAgKTtcbiAgfVxuICB2ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBpc1NjcmlwdFN0YXJ0ZWRFdmVudCA9IGV2ZW50LmRhdGE/LnR5cGUgPT09IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRTtcbiAgICBjb25zdCBpc1NhbWVDb250ZW50U2NyaXB0ID0gZXZlbnQuZGF0YT8uY29udGVudFNjcmlwdE5hbWUgPT09IHRoaXMuY29udGVudFNjcmlwdE5hbWU7XG4gICAgY29uc3QgaXNOb3REdXBsaWNhdGUgPSAhdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuaGFzKGV2ZW50LmRhdGE/Lm1lc3NhZ2VJZCk7XG4gICAgcmV0dXJuIGlzU2NyaXB0U3RhcnRlZEV2ZW50ICYmIGlzU2FtZUNvbnRlbnRTY3JpcHQgJiYgaXNOb3REdXBsaWNhdGU7XG4gIH1cbiAgbGlzdGVuRm9yTmV3ZXJTY3JpcHRzKG9wdGlvbnMpIHtcbiAgICBsZXQgaXNGaXJzdCA9IHRydWU7XG4gICAgY29uc3QgY2IgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLnZlcmlmeVNjcmlwdFN0YXJ0ZWRFdmVudChldmVudCkpIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuYWRkKGV2ZW50LmRhdGEubWVzc2FnZUlkKTtcbiAgICAgICAgY29uc3Qgd2FzRmlyc3QgPSBpc0ZpcnN0O1xuICAgICAgICBpc0ZpcnN0ID0gZmFsc2U7XG4gICAgICAgIGlmICh3YXNGaXJzdCAmJiBvcHRpb25zPy5pZ25vcmVGaXJzdEV2ZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gcmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2IpKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImRlZmluaXRpb24iLCJicm93c2VyIiwiX2Jyb3dzZXIiLCJwcmludCIsImxvZ2dlciJdLCJtYXBwaW5ncyI6Ijs7QUFBTyxXQUFTLG9CQUFvQkEsYUFBWTtBQUM5QyxXQUFPQTtBQUFBLEVBQ1Q7QUNETyxRQUFNQyxZQUFVLFdBQVcsU0FBUyxTQUFTLEtBQ2hELFdBQVcsVUFDWCxX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
content;