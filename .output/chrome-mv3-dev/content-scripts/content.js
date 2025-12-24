var content = (function() {
  "use strict";
  function defineContentScript(definition2) {
    return definition2;
  }
  const browser$1 = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  const nullKey = /* @__PURE__ */ Symbol("null");
  let keyCounter = 0;
  class ManyKeysMap extends Map {
    constructor() {
      super();
      this._objectHashes = /* @__PURE__ */ new WeakMap();
      this._symbolHashes = /* @__PURE__ */ new Map();
      this._publicKeys = /* @__PURE__ */ new Map();
      const [pairs] = arguments;
      if (pairs === null || pairs === void 0) {
        return;
      }
      if (typeof pairs[Symbol.iterator] !== "function") {
        throw new TypeError(typeof pairs + " is not iterable (cannot read property Symbol(Symbol.iterator))");
      }
      for (const [keys, value] of pairs) {
        this.set(keys, value);
      }
    }
    _getPublicKeys(keys, create = false) {
      if (!Array.isArray(keys)) {
        throw new TypeError("The keys parameter must be an array");
      }
      const privateKey = this._getPrivateKey(keys, create);
      let publicKey;
      if (privateKey && this._publicKeys.has(privateKey)) {
        publicKey = this._publicKeys.get(privateKey);
      } else if (create) {
        publicKey = [...keys];
        this._publicKeys.set(privateKey, publicKey);
      }
      return { privateKey, publicKey };
    }
    _getPrivateKey(keys, create = false) {
      const privateKeys = [];
      for (let key of keys) {
        if (key === null) {
          key = nullKey;
        }
        const hashes = typeof key === "object" || typeof key === "function" ? "_objectHashes" : typeof key === "symbol" ? "_symbolHashes" : false;
        if (!hashes) {
          privateKeys.push(key);
        } else if (this[hashes].has(key)) {
          privateKeys.push(this[hashes].get(key));
        } else if (create) {
          const privateKey = `@@mkm-ref-${keyCounter++}@@`;
          this[hashes].set(key, privateKey);
          privateKeys.push(privateKey);
        } else {
          return false;
        }
      }
      return JSON.stringify(privateKeys);
    }
    set(keys, value) {
      const { publicKey } = this._getPublicKeys(keys, true);
      return super.set(publicKey, value);
    }
    get(keys) {
      const { publicKey } = this._getPublicKeys(keys);
      return super.get(publicKey);
    }
    has(keys) {
      const { publicKey } = this._getPublicKeys(keys);
      return super.has(publicKey);
    }
    delete(keys) {
      const { publicKey, privateKey } = this._getPublicKeys(keys);
      return Boolean(publicKey && super.delete(publicKey) && this._publicKeys.delete(privateKey));
    }
    clear() {
      super.clear();
      this._symbolHashes.clear();
      this._publicKeys.clear();
    }
    get [Symbol.toStringTag]() {
      return "ManyKeysMap";
    }
    get size() {
      return super.size;
    }
  }
  function isPlainObject(value) {
    if (value === null || typeof value !== "object") {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
      return false;
    }
    if (Symbol.iterator in value) {
      return false;
    }
    if (Symbol.toStringTag in value) {
      return Object.prototype.toString.call(value) === "[object Module]";
    }
    return true;
  }
  function _defu(baseObject, defaults, namespace = ".", merger) {
    if (!isPlainObject(defaults)) {
      return _defu(baseObject, {}, namespace, merger);
    }
    const object = Object.assign({}, defaults);
    for (const key in baseObject) {
      if (key === "__proto__" || key === "constructor") {
        continue;
      }
      const value = baseObject[key];
      if (value === null || value === void 0) {
        continue;
      }
      if (merger && merger(object, key, value, namespace)) {
        continue;
      }
      if (Array.isArray(value) && Array.isArray(object[key])) {
        object[key] = [...value, ...object[key]];
      } else if (isPlainObject(value) && isPlainObject(object[key])) {
        object[key] = _defu(
          value,
          object[key],
          (namespace ? `${namespace}.` : "") + key.toString(),
          merger
        );
      } else {
        object[key] = value;
      }
    }
    return object;
  }
  function createDefu(merger) {
    return (...arguments_) => (
      // eslint-disable-next-line unicorn/no-array-reduce
      arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
    );
  }
  const defu = createDefu();
  const isExist = (element) => {
    return element !== null ? { isDetected: true, result: element } : { isDetected: false };
  };
  const isNotExist = (element) => {
    return element === null ? { isDetected: true, result: null } : { isDetected: false };
  };
  const getDefaultOptions = () => ({
    target: globalThis.document,
    unifyProcess: true,
    detector: isExist,
    observeConfigs: {
      childList: true,
      subtree: true,
      attributes: true
    },
    signal: void 0,
    customMatcher: void 0
  });
  const mergeOptions = (userSideOptions, defaultOptions) => {
    return defu(userSideOptions, defaultOptions);
  };
  const unifyCache = new ManyKeysMap();
  function createWaitElement(instanceOptions) {
    const { defaultOptions } = instanceOptions;
    return (selector, options) => {
      const {
        target,
        unifyProcess,
        observeConfigs,
        detector,
        signal,
        customMatcher
      } = mergeOptions(options, defaultOptions);
      const unifyPromiseKey = [
        selector,
        target,
        unifyProcess,
        observeConfigs,
        detector,
        signal,
        customMatcher
      ];
      const cachedPromise = unifyCache.get(unifyPromiseKey);
      if (unifyProcess && cachedPromise) {
        return cachedPromise;
      }
      const detectPromise = new Promise(
        // biome-ignore lint/suspicious/noAsyncPromiseExecutor: avoid nesting promise
        async (resolve, reject) => {
          if (signal?.aborted) {
            return reject(signal.reason);
          }
          const observer = new MutationObserver(
            async (mutations) => {
              for (const _ of mutations) {
                if (signal?.aborted) {
                  observer.disconnect();
                  break;
                }
                const detectResult2 = await detectElement({
                  selector,
                  target,
                  detector,
                  customMatcher
                });
                if (detectResult2.isDetected) {
                  observer.disconnect();
                  resolve(detectResult2.result);
                  break;
                }
              }
            }
          );
          signal?.addEventListener(
            "abort",
            () => {
              observer.disconnect();
              return reject(signal.reason);
            },
            { once: true }
          );
          const detectResult = await detectElement({
            selector,
            target,
            detector,
            customMatcher
          });
          if (detectResult.isDetected) {
            return resolve(detectResult.result);
          }
          observer.observe(target, observeConfigs);
        }
      ).finally(() => {
        unifyCache.delete(unifyPromiseKey);
      });
      unifyCache.set(unifyPromiseKey, detectPromise);
      return detectPromise;
    };
  }
  async function detectElement({
    target,
    selector,
    detector,
    customMatcher
  }) {
    const element = customMatcher ? customMatcher(selector) : target.querySelector(selector);
    return await detector(element);
  }
  const waitElement = createWaitElement({
    defaultOptions: getDefaultOptions()
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
  function applyPosition(root, positionedElement, options) {
    if (options.position === "inline") return;
    if (options.zIndex != null) root.style.zIndex = String(options.zIndex);
    root.style.overflow = "visible";
    root.style.position = "relative";
    root.style.width = "0";
    root.style.height = "0";
    root.style.display = "block";
  }
  function getAnchor(options) {
    if (options.anchor == null) return document.body;
    let resolved = typeof options.anchor === "function" ? options.anchor() : options.anchor;
    if (typeof resolved === "string") {
      if (resolved.startsWith("/")) {
        const result2 = document.evaluate(
          resolved,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        return result2.singleNodeValue ?? void 0;
      } else {
        return document.querySelector(resolved) ?? void 0;
      }
    }
    return resolved ?? void 0;
  }
  function mountUi(root, options) {
    const anchor = getAnchor(options);
    if (anchor == null)
      throw Error(
        "Failed to mount content script UI: could not find anchor element"
      );
    switch (options.append) {
      case void 0:
      case "last":
        anchor.append(root);
        break;
      case "first":
        anchor.prepend(root);
        break;
      case "replace":
        anchor.replaceWith(root);
        break;
      case "after":
        anchor.parentElement?.insertBefore(root, anchor.nextElementSibling);
        break;
      case "before":
        anchor.parentElement?.insertBefore(root, anchor);
        break;
      default:
        options.append(anchor, root);
        break;
    }
  }
  function createMountFunctions(baseFunctions, options) {
    let autoMountInstance = void 0;
    const stopAutoMount = () => {
      autoMountInstance?.stopAutoMount();
      autoMountInstance = void 0;
    };
    const mount = () => {
      baseFunctions.mount();
    };
    const unmount = baseFunctions.remove;
    const remove = () => {
      stopAutoMount();
      baseFunctions.remove();
    };
    const autoMount = (autoMountOptions) => {
      if (autoMountInstance) {
        logger$1.warn("autoMount is already set.");
      }
      autoMountInstance = autoMountUi(
        { mount, unmount, stopAutoMount },
        {
          ...options,
          ...autoMountOptions
        }
      );
    };
    return {
      mount,
      remove,
      autoMount
    };
  }
  function autoMountUi(uiCallbacks, options) {
    const abortController = new AbortController();
    const EXPLICIT_STOP_REASON = "explicit_stop_auto_mount";
    const _stopAutoMount = () => {
      abortController.abort(EXPLICIT_STOP_REASON);
      options.onStop?.();
    };
    let resolvedAnchor = typeof options.anchor === "function" ? options.anchor() : options.anchor;
    if (resolvedAnchor instanceof Element) {
      throw Error(
        "autoMount and Element anchor option cannot be combined. Avoid passing `Element` directly or `() => Element` to the anchor."
      );
    }
    async function observeElement(selector) {
      let isAnchorExist = !!getAnchor(options);
      if (isAnchorExist) {
        uiCallbacks.mount();
      }
      while (!abortController.signal.aborted) {
        try {
          const changedAnchor = await waitElement(selector ?? "body", {
            customMatcher: () => getAnchor(options) ?? null,
            detector: isAnchorExist ? isNotExist : isExist,
            signal: abortController.signal
          });
          isAnchorExist = !!changedAnchor;
          if (isAnchorExist) {
            uiCallbacks.mount();
          } else {
            uiCallbacks.unmount();
            if (options.once) {
              uiCallbacks.stopAutoMount();
            }
          }
        } catch (error) {
          if (abortController.signal.aborted && abortController.signal.reason === EXPLICIT_STOP_REASON) {
            break;
          } else {
            throw error;
          }
        }
      }
    }
    observeElement(resolvedAnchor);
    return { stopAutoMount: _stopAutoMount };
  }
  function createIntegratedUi(ctx, options) {
    const wrapper = document.createElement(options.tag || "div");
    let mounted = void 0;
    const mount = () => {
      applyPosition(wrapper, void 0, options);
      mountUi(wrapper, options);
      mounted = options.onMount?.(wrapper);
    };
    const remove = () => {
      options.onRemove?.(mounted);
      wrapper.replaceChildren();
      wrapper.remove();
      mounted = void 0;
    };
    const mountFunctions = createMountFunctions(
      {
        mount,
        remove
      },
      options
    );
    ctx.onInvalidated(remove);
    return {
      get mounted() {
        return mounted;
      },
      wrapper,
      ...mountFunctions
    };
  }
  const mintlify = '/* Mintlify-inspired Light Theme for mdBook */\n:root {\n    --bg: #ffffff;\n    --fg: #0a0d0d;\n    --sidebar-bg: #f8faf9;\n    --sidebar-fg: #374151;\n    --sidebar-active: #166e3f;\n    --sidebar-active-bg: rgba(22, 110, 63, 0.1);\n    --sidebar-header-border-color: var(--sidebar-active);\n    --links: #166e3f;\n    --links-hover: #26bd6c;\n    --inline-code-bg: #f3f6f4;\n    --inline-code-color: rgba(238, 241, 239, 0.5);\n    --code-bg: #0a0d0d;\n    --code-fg: #e5e7eb;\n    --quote-bg: #f3f6f4;\n    --quote-border: #26bd6c;\n    --quote-block-border: rgb(16 185 129 / 0.2);\n    --quote-block-bg: rgb(236 253 245 / 0.5);\n    --table-border: #e5e7eb;\n    --table-header-bg: #f3f6f4;\n    --search-bg: #ffffff;\n    --search-border: #e5e7eb;\n    --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n    --scrollbar: #d1d5db;\n    --scrollbar-hover: #9ca3af;\n    --order-weight: 400;\n    --order-display: none;\n    --chapter-nav-display: none;\n    --sidebar-text-size: 16px;\n    --body-text-color: rgb(63, 65, 64);\n    --text-color: rgb(17, 24, 39);\n    --content-size: 36rem;\n    --root-font-size: 18px;\n    --mono-font:\n        "Geist Mono", "Menlo", "Monaco", "Lucida Console", "Liberation Mono",\n        "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace;\n    font-size: var(--root-font-size);\n}\n\n:not(pre) > code.hljs {\n    background-color: var(--inline-code-color);\n    color: var(--text-color);\n    font-weight: 500;\n    box-sizing: border-box;\n    padding: 0.125rem 0.5rem;\n    margin: 0 0.125rem;\n}\n\nhtml {\n    font-family:\n        "Inter",\n        -apple-system,\n        BlinkMacSystemFont,\n        "Segoe UI",\n        Roboto,\n        sans-serif;\n    background: var(--bg);\n    color: var(--text-color);\n    height: 100dvh;\n}\n\nbody {\n    background: var(--bg);\n    color: var(--body-text-color);\n    font-size: inherit;\n}\n\nnav.nav-wide-wrapper a.nav-chapters {\n    display: var(--chapter-nav-display);\n}\n\n/* Sidebar */\n.sidebar {\n    background: var(--sidebar-bg);\n    border-right: 1px solid var(--table-border);\n}\n\n.sidebar .sidebar-scrollbox {\n    background: var(--sidebar-bg);\n}\n\nspan.chapter-link-wrapper a {\n    display: block;\n    width: 100%;\n    height: 100%;\n}\nspan.chapter-link-wrapper {\n    cursor: pointer;\n    color: var(--sidebar-fg);\n    padding: 4px 16px;\n    border-radius: 8px;\n    transition: all 0.15s ease;\n    font-size: var(--sidebar-text-size);\n}\n\n/*.sidebar ol.chapter > li.chapter-item > span.chapter-link-wrapper {\n    font-weight: bold;\n}*/\n\n/*.sidebar ol.chapter li .chapter-item.expanded > a,*/\nspan.chapter-link-wrapper:has(a.active),\nspan.chapter-link-wrapper:hover {\n    background: var(--sidebar-active-bg);\n    color: var(--sidebar-active);\n    text-decoration: none;\n}\n\n/* Typography */\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n    color: var(--fg);\n    font-weight: 600;\n    margin-top: 2em;\n    margin-bottom: 0.5em;\n    line-height: 1.3;\n}\n\nh1.menu-title {\n    font-size: 1.75em;\n    margin-top: 0;\n}\nh2 {\n    font-size: 1.5em;\n    border-bottom: 1px solid var(--table-border);\n    padding-bottom: 0.5em;\n}\nh3 {\n    font-size: 1.25em;\n}\nh4 {\n    font-size: 1em;\n}\n\np {\n    line-height: 1.75;\n    margin: 1em 0;\n}\n\n/* Links */\na {\n    color: var(--links);\n    text-decoration: none;\n    transition: color 0.15s ease;\n}\n\na:hover {\n    color: var(--links-hover);\n    text-decoration: underline;\n}\n\n/* Code */\ncode {\n    font-family: "Geist Mono", "Fira Code", "JetBrains Mono", monospace;\n    font-size: 0.875em;\n}\n\nstrong {\n    display: var(--order-display);\n    font-weight: var(--order-weight);\n}\n\n:not(pre) > code {\n    background: var(--inline-code-bg);\n    padding: 0.2em 0.4em;\n    border-radius: 6px;\n    color: var(--sidebar-active);\n}\n\npre {\n    background: var(--code-bg) !important;\n    color: var(--code-fg);\n    padding: 16px 20px;\n    border-radius: 12px;\n    overflow-x: auto;\n    margin: 1.5em 0;\n    border: 1px solid rgba(255, 255, 255, 0.1);\n}\n\npre code {\n    background: transparent;\n    padding: 0;\n    color: inherit;\n}\n\n/* Blockquotes */\nblockquote {\n    background: var(--quote-block-bg);\n    border: 1px solid var(--quote-block-border);\n    margin: 1.5em 0;\n    padding: 1rem 1.25rem;\n    border-radius: 1rem;\n}\n\nblockquote p {\n    margin: 0;\n}\nblockquote h1,\nblockquote h2,\nblockquote h3,\nblockquote h4,\nblockquote h5 {\n    margin: 0;\n    margin-bottom: 1em;\n}\n\n/* Tables */\ntable {\n    border-collapse: collapse;\n    width: 100%;\n    margin: 1.5em 0;\n    border-radius: 12px;\n    overflow: hidden;\n    border: 1px solid var(--table-border);\n}\n\nth {\n    background: var(--table-header-bg);\n    font-weight: 600;\n    text-align: left;\n}\n\nth,\ntd {\n    padding: 12px 16px;\n    border-bottom: 1px solid var(--table-border);\n}\n\ntr:last-child td {\n    border-bottom: none;\n}\n\n/* Menu bar */\n#menu-bar {\n    background: var(--bg);\n    border-bottom: 1px solid var(--table-border);\n}\n\n#menu-bar i {\n    color: var(--fg);\n}\n\n/* Search */\n#searchbar {\n    background: var(--search-bg);\n    border: 1px solid var(--search-border);\n    box-shadow: var(--searchbar-shadow);\n    border-radius: 8px;\n    padding: 8px 12px;\n}\n\n/* Navigation buttons */\n.nav-chapters {\n    color: var(--links);\n    opacity: 0.8;\n    transition: opacity 0.15s ease;\n}\n\n.nav-chapters:hover {\n    color: var(--links-hover);\n    opacity: 1;\n}\n\n/* Scrollbar */\n::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n\n::-webkit-scrollbar-track {\n    background: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n    background: var(--scrollbar);\n    border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n    background: var(--scrollbar-hover);\n}\n\n/* Theme toggle */\n#theme-list {\n    background: var(--sidebar-bg);\n    border: 1px solid var(--table-border);\n    border-radius: 8px;\n}\n\n#theme-list li {\n    color: var(--fg);\n}\n\n#theme-list li:hover {\n    background: var(--sidebar-active-bg);\n}\n\ndiv#mdbook-menu-bar,\ndiv#mdbook-menu-bar-hover-placeholder {\n    box-sizing: border-box;\n    padding: 1rem 0;\n}\n\ndiv#mdbook-content {\n    max-height: calc(100vh - 80px);\n    box-sizing: border-box;\n    padding: 2rem 4rem;\n    display: grid;\n    grid-template-columns: var(--content-size) 28rem;\n    justify-content: center;\n    gap: 3rem;\n    overflow-y: auto;\n    scroll-behavior: smooth;\n}\n\ndiv#mdbook-content p {\n    line-height: 1.75;\n}\n\ndiv#mdbook-content main {\n    max-width: 100%;\n}\n\ndiv#mdbook-content main a.header:hover,\ndiv#mdbook-content main a {\n    font-weight: 600;\n    color: var(--text-color);\n    border-bottom: 1px solid var(--text-color);\n    text-decoration: none;\n}\ndiv#mdbook-content main a:hover {\n    border-bottom-width: 2px;\n}\n\ndiv#mdbook-content main a.header {\n    border-bottom: none;\n}\n\n/* Right Sidebar (TOC) */\n.page-wrapper.has-right-sidebar {\n    display: grid;\n    grid-template-columns: auto 1fr 220px;\n}\n\n.right-sidebar {\n    position: sticky;\n    top: 60px;\n    right: 0px;\n    height: fit-content;\n    max-height: calc(100vh - 8px);\n    overflow-y: auto;\n    border-left: 1px solid var(--table-border);\n    background: var(--bg);\n    margin-left: 2.5rem;\n    padding-left: 1rem;\n}\n\n.right-sidebar-header {\n    color: var(--sidebar-fg);\n    margin-bottom: 12px;\n    padding-left: 8px;\n}\n\n.right-sidebar-toc {\n    list-style: none;\n    padding: 0;\n    margin: 0;\n}\n\n.right-sidebar-toc ol {\n    list-style: none;\n    padding-left: 12px;\n    margin: 0;\n}\n\n.right-sidebar-toc li {\n    margin: 0;\n}\n\n/* Adjust content width when right sidebar exists */\n.page-wrapper.has-right-sidebar .content {\n    max-width: 100%;\n}\n\n/* Hide right sidebar on small screens */\n@media (max-width: 1100px) {\n    .page-wrapper.has-right-sidebar {\n        grid-template-columns: auto 1fr;\n    }\n\n    .right-sidebar {\n        display: none;\n    }\n}\n';
  const definition = defineContentScript({
    matches: ["<all_urls>"],
    runAt: "document_start",
    main(ctx) {
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
            return mintlify;
          // case "mintlify-dark":
          //   return mintlifyDarkCSS;
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
      function setupRightSidebar(tocSection) {
        if (!tocSection) return;
        const rightSidebar = document.createElement("nav");
        rightSidebar.id = "right-sidebar";
        rightSidebar.className = "right-sidebar";
        const header = document.createElement("div");
        header.className = "right-sidebar-header";
        header.textContent = "On this page";
        rightSidebar.appendChild(header);
        const clonedSection = tocSection.cloneNode(true);
        clonedSection.classList.add("right-sidebar-toc");
        rightSidebar.appendChild(clonedSection);
        tocSection.style.display = "none";
        return rightSidebar;
      }
      function init() {
        isMdBook = checkMdBookComment();
        if (isMdBook) {
          localStorage.setItem("enabled", "true");
          initTheme();
          const ui = createIntegratedUi(ctx, {
            position: "inline",
            anchor: "div#mdbook-content",
            onMount: (pageWrapper) => {
              const observer = new MutationObserver((_, obs) => {
                const element = document.querySelector(
                  ".sidebar ol.chapter div.on-this-page > ol.section"
                );
                if (element) {
                  const rightSidebar = setupRightSidebar(element);
                  pageWrapper.append(rightSidebar);
                  pageWrapper.classList.add("has-right-sidebar");
                  obs.disconnect();
                }
              });
              observer.observe(document.body, {
                childList: true,
                subtree: true
              });
            }
          });
          ui.autoMount();
        }
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    }
  });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHd4dC1kZXYrYnJvd3NlckAwLjEuMzIvbm9kZV9tb2R1bGVzL0B3eHQtZGV2L2Jyb3dzZXIvc3JjL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyLm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9tYW55LWtleXMtbWFwQDIuMC4xL25vZGVfbW9kdWxlcy9tYW55LWtleXMtbWFwL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RlZnVANi4xLjQvbm9kZV9tb2R1bGVzL2RlZnUvZGlzdC9kZWZ1Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AMW5hdHN1K3dhaXQtZWxlbWVudEA0LjEuMi9ub2RlX21vZHVsZXMvQDFuYXRzdS93YWl0LWVsZW1lbnQvZGlzdC9kZXRlY3RvcnMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0AxbmF0c3Urd2FpdC1lbGVtZW50QDQuMS4yL25vZGVfbW9kdWxlcy9AMW5hdHN1L3dhaXQtZWxlbWVudC9kaXN0L2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LXVpL3NoYXJlZC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvY29udGVudC1zY3JpcHQtdWkvaW50ZWdyYXRlZC5tanMiLCIuLi8uLi8uLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LmNzcz9yYXciLCIuLi8uLi8uLi9lbnRyeXBvaW50cy9jb250ZW50LnRzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJjb25zdCBudWxsS2V5ID0gU3ltYm9sKCdudWxsJyk7IC8vIGBvYmplY3RIYXNoZXNgIGtleSBmb3IgbnVsbFxuXG5sZXQga2V5Q291bnRlciA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hbnlLZXlzTWFwIGV4dGVuZHMgTWFwIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX29iamVjdEhhc2hlcyA9IG5ldyBXZWFrTWFwKCk7XG5cdFx0dGhpcy5fc3ltYm9sSGFzaGVzID0gbmV3IE1hcCgpOyAvLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9lY21hMjYyL2lzc3Vlcy8xMTk0XG5cdFx0dGhpcy5fcHVibGljS2V5cyA9IG5ldyBNYXAoKTtcblxuXHRcdGNvbnN0IFtwYWlyc10gPSBhcmd1bWVudHM7IC8vIE1hcCBjb21wYXRcblx0XHRpZiAocGFpcnMgPT09IG51bGwgfHwgcGFpcnMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgcGFpcnNbU3ltYm9sLml0ZXJhdG9yXSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcih0eXBlb2YgcGFpcnMgKyAnIGlzIG5vdCBpdGVyYWJsZSAoY2Fubm90IHJlYWQgcHJvcGVydHkgU3ltYm9sKFN5bWJvbC5pdGVyYXRvcikpJyk7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBba2V5cywgdmFsdWVdIG9mIHBhaXJzKSB7XG5cdFx0XHR0aGlzLnNldChrZXlzLCB2YWx1ZSk7XG5cdFx0fVxuXHR9XG5cblx0X2dldFB1YmxpY0tleXMoa2V5cywgY3JlYXRlID0gZmFsc2UpIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoa2V5cykpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBrZXlzIHBhcmFtZXRlciBtdXN0IGJlIGFuIGFycmF5Jyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJpdmF0ZUtleSA9IHRoaXMuX2dldFByaXZhdGVLZXkoa2V5cywgY3JlYXRlKTtcblxuXHRcdGxldCBwdWJsaWNLZXk7XG5cdFx0aWYgKHByaXZhdGVLZXkgJiYgdGhpcy5fcHVibGljS2V5cy5oYXMocHJpdmF0ZUtleSkpIHtcblx0XHRcdHB1YmxpY0tleSA9IHRoaXMuX3B1YmxpY0tleXMuZ2V0KHByaXZhdGVLZXkpO1xuXHRcdH0gZWxzZSBpZiAoY3JlYXRlKSB7XG5cdFx0XHRwdWJsaWNLZXkgPSBbLi4ua2V5c107IC8vIFJlZ2VuZXJhdGUga2V5cyBhcnJheSB0byBhdm9pZCBleHRlcm5hbCBpbnRlcmFjdGlvblxuXHRcdFx0dGhpcy5fcHVibGljS2V5cy5zZXQocHJpdmF0ZUtleSwgcHVibGljS2V5KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge3ByaXZhdGVLZXksIHB1YmxpY0tleX07XG5cdH1cblxuXHRfZ2V0UHJpdmF0ZUtleShrZXlzLCBjcmVhdGUgPSBmYWxzZSkge1xuXHRcdGNvbnN0IHByaXZhdGVLZXlzID0gW107XG5cdFx0Zm9yIChsZXQga2V5IG9mIGtleXMpIHtcblx0XHRcdGlmIChrZXkgPT09IG51bGwpIHtcblx0XHRcdFx0a2V5ID0gbnVsbEtleTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgaGFzaGVzID0gdHlwZW9mIGtleSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIGtleSA9PT0gJ2Z1bmN0aW9uJyA/ICdfb2JqZWN0SGFzaGVzJyA6ICh0eXBlb2Yga2V5ID09PSAnc3ltYm9sJyA/ICdfc3ltYm9sSGFzaGVzJyA6IGZhbHNlKTtcblxuXHRcdFx0aWYgKCFoYXNoZXMpIHtcblx0XHRcdFx0cHJpdmF0ZUtleXMucHVzaChrZXkpO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzW2hhc2hlc10uaGFzKGtleSkpIHtcblx0XHRcdFx0cHJpdmF0ZUtleXMucHVzaCh0aGlzW2hhc2hlc10uZ2V0KGtleSkpO1xuXHRcdFx0fSBlbHNlIGlmIChjcmVhdGUpIHtcblx0XHRcdFx0Y29uc3QgcHJpdmF0ZUtleSA9IGBAQG1rbS1yZWYtJHtrZXlDb3VudGVyKyt9QEBgO1xuXHRcdFx0XHR0aGlzW2hhc2hlc10uc2V0KGtleSwgcHJpdmF0ZUtleSk7XG5cdFx0XHRcdHByaXZhdGVLZXlzLnB1c2gocHJpdmF0ZUtleSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHByaXZhdGVLZXlzKTtcblx0fVxuXG5cdHNldChrZXlzLCB2YWx1ZSkge1xuXHRcdGNvbnN0IHtwdWJsaWNLZXl9ID0gdGhpcy5fZ2V0UHVibGljS2V5cyhrZXlzLCB0cnVlKTtcblx0XHRyZXR1cm4gc3VwZXIuc2V0KHB1YmxpY0tleSwgdmFsdWUpO1xuXHR9XG5cblx0Z2V0KGtleXMpIHtcblx0XHRjb25zdCB7cHVibGljS2V5fSA9IHRoaXMuX2dldFB1YmxpY0tleXMoa2V5cyk7XG5cdFx0cmV0dXJuIHN1cGVyLmdldChwdWJsaWNLZXkpO1xuXHR9XG5cblx0aGFzKGtleXMpIHtcblx0XHRjb25zdCB7cHVibGljS2V5fSA9IHRoaXMuX2dldFB1YmxpY0tleXMoa2V5cyk7XG5cdFx0cmV0dXJuIHN1cGVyLmhhcyhwdWJsaWNLZXkpO1xuXHR9XG5cblx0ZGVsZXRlKGtleXMpIHtcblx0XHRjb25zdCB7cHVibGljS2V5LCBwcml2YXRlS2V5fSA9IHRoaXMuX2dldFB1YmxpY0tleXMoa2V5cyk7XG5cdFx0cmV0dXJuIEJvb2xlYW4ocHVibGljS2V5ICYmIHN1cGVyLmRlbGV0ZShwdWJsaWNLZXkpICYmIHRoaXMuX3B1YmxpY0tleXMuZGVsZXRlKHByaXZhdGVLZXkpKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHN1cGVyLmNsZWFyKCk7XG5cdFx0dGhpcy5fc3ltYm9sSGFzaGVzLmNsZWFyKCk7XG5cdFx0dGhpcy5fcHVibGljS2V5cy5jbGVhcigpO1xuXHR9XG5cblx0Z2V0IFtTeW1ib2wudG9TdHJpbmdUYWddKCkge1xuXHRcdHJldHVybiAnTWFueUtleXNNYXAnO1xuXHR9XG5cblx0Z2V0IHNpemUoKSB7XG5cdFx0cmV0dXJuIHN1cGVyLnNpemU7XG5cdH1cbn1cbiIsImZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpO1xuICBpZiAocHJvdG90eXBlICE9PSBudWxsICYmIHByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG90eXBlKSAhPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIHZhbHVlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChTeW1ib2wudG9TdHJpbmdUYWcgaW4gdmFsdWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IE1vZHVsZV1cIjtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gX2RlZnUoYmFzZU9iamVjdCwgZGVmYXVsdHMsIG5hbWVzcGFjZSA9IFwiLlwiLCBtZXJnZXIpIHtcbiAgaWYgKCFpc1BsYWluT2JqZWN0KGRlZmF1bHRzKSkge1xuICAgIHJldHVybiBfZGVmdShiYXNlT2JqZWN0LCB7fSwgbmFtZXNwYWNlLCBtZXJnZXIpO1xuICB9XG4gIGNvbnN0IG9iamVjdCA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzKTtcbiAgZm9yIChjb25zdCBrZXkgaW4gYmFzZU9iamVjdCkge1xuICAgIGlmIChrZXkgPT09IFwiX19wcm90b19fXCIgfHwga2V5ID09PSBcImNvbnN0cnVjdG9yXCIpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IGJhc2VPYmplY3Rba2V5XTtcbiAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChtZXJnZXIgJiYgbWVyZ2VyKG9iamVjdCwga2V5LCB2YWx1ZSwgbmFtZXNwYWNlKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiBBcnJheS5pc0FycmF5KG9iamVjdFtrZXldKSkge1xuICAgICAgb2JqZWN0W2tleV0gPSBbLi4udmFsdWUsIC4uLm9iamVjdFtrZXldXTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpICYmIGlzUGxhaW5PYmplY3Qob2JqZWN0W2tleV0pKSB7XG4gICAgICBvYmplY3Rba2V5XSA9IF9kZWZ1KFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgb2JqZWN0W2tleV0sXG4gICAgICAgIChuYW1lc3BhY2UgPyBgJHtuYW1lc3BhY2V9LmAgOiBcIlwiKSArIGtleS50b1N0cmluZygpLFxuICAgICAgICBtZXJnZXJcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5mdW5jdGlvbiBjcmVhdGVEZWZ1KG1lcmdlcikge1xuICByZXR1cm4gKC4uLmFyZ3VtZW50c18pID0+IChcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9uby1hcnJheS1yZWR1Y2VcbiAgICBhcmd1bWVudHNfLnJlZHVjZSgocCwgYykgPT4gX2RlZnUocCwgYywgXCJcIiwgbWVyZ2VyKSwge30pXG4gICk7XG59XG5jb25zdCBkZWZ1ID0gY3JlYXRlRGVmdSgpO1xuY29uc3QgZGVmdUZuID0gY3JlYXRlRGVmdSgob2JqZWN0LCBrZXksIGN1cnJlbnRWYWx1ZSkgPT4ge1xuICBpZiAob2JqZWN0W2tleV0gIT09IHZvaWQgMCAmJiB0eXBlb2YgY3VycmVudFZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBvYmplY3Rba2V5XSA9IGN1cnJlbnRWYWx1ZShvYmplY3Rba2V5XSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuY29uc3QgZGVmdUFycmF5Rm4gPSBjcmVhdGVEZWZ1KChvYmplY3QsIGtleSwgY3VycmVudFZhbHVlKSA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KG9iamVjdFtrZXldKSAmJiB0eXBlb2YgY3VycmVudFZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBvYmplY3Rba2V5XSA9IGN1cnJlbnRWYWx1ZShvYmplY3Rba2V5XSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuXG5leHBvcnQgeyBjcmVhdGVEZWZ1LCBkZWZ1IGFzIGRlZmF1bHQsIGRlZnUsIGRlZnVBcnJheUZuLCBkZWZ1Rm4gfTtcbiIsImNvbnN0IGlzRXhpc3QgPSAoZWxlbWVudCkgPT4ge1xuICByZXR1cm4gZWxlbWVudCAhPT0gbnVsbCA/IHsgaXNEZXRlY3RlZDogdHJ1ZSwgcmVzdWx0OiBlbGVtZW50IH0gOiB7IGlzRGV0ZWN0ZWQ6IGZhbHNlIH07XG59O1xuY29uc3QgaXNOb3RFeGlzdCA9IChlbGVtZW50KSA9PiB7XG4gIHJldHVybiBlbGVtZW50ID09PSBudWxsID8geyBpc0RldGVjdGVkOiB0cnVlLCByZXN1bHQ6IG51bGwgfSA6IHsgaXNEZXRlY3RlZDogZmFsc2UgfTtcbn07XG5cbmV4cG9ydCB7IGlzRXhpc3QsIGlzTm90RXhpc3QgfTtcbiIsImltcG9ydCBNYW55S2V5c01hcCBmcm9tICdtYW55LWtleXMtbWFwJztcbmltcG9ydCB7IGRlZnUgfSBmcm9tICdkZWZ1JztcbmltcG9ydCB7IGlzRXhpc3QgfSBmcm9tICcuL2RldGVjdG9ycy5tanMnO1xuXG5jb25zdCBnZXREZWZhdWx0T3B0aW9ucyA9ICgpID0+ICh7XG4gIHRhcmdldDogZ2xvYmFsVGhpcy5kb2N1bWVudCxcbiAgdW5pZnlQcm9jZXNzOiB0cnVlLFxuICBkZXRlY3RvcjogaXNFeGlzdCxcbiAgb2JzZXJ2ZUNvbmZpZ3M6IHtcbiAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVzOiB0cnVlXG4gIH0sXG4gIHNpZ25hbDogdm9pZCAwLFxuICBjdXN0b21NYXRjaGVyOiB2b2lkIDBcbn0pO1xuY29uc3QgbWVyZ2VPcHRpb25zID0gKHVzZXJTaWRlT3B0aW9ucywgZGVmYXVsdE9wdGlvbnMpID0+IHtcbiAgcmV0dXJuIGRlZnUodXNlclNpZGVPcHRpb25zLCBkZWZhdWx0T3B0aW9ucyk7XG59O1xuXG5jb25zdCB1bmlmeUNhY2hlID0gbmV3IE1hbnlLZXlzTWFwKCk7XG5mdW5jdGlvbiBjcmVhdGVXYWl0RWxlbWVudChpbnN0YW5jZU9wdGlvbnMpIHtcbiAgY29uc3QgeyBkZWZhdWx0T3B0aW9ucyB9ID0gaW5zdGFuY2VPcHRpb25zO1xuICByZXR1cm4gKHNlbGVjdG9yLCBvcHRpb25zKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgdGFyZ2V0LFxuICAgICAgdW5pZnlQcm9jZXNzLFxuICAgICAgb2JzZXJ2ZUNvbmZpZ3MsXG4gICAgICBkZXRlY3RvcixcbiAgICAgIHNpZ25hbCxcbiAgICAgIGN1c3RvbU1hdGNoZXJcbiAgICB9ID0gbWVyZ2VPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKTtcbiAgICBjb25zdCB1bmlmeVByb21pc2VLZXkgPSBbXG4gICAgICBzZWxlY3RvcixcbiAgICAgIHRhcmdldCxcbiAgICAgIHVuaWZ5UHJvY2VzcyxcbiAgICAgIG9ic2VydmVDb25maWdzLFxuICAgICAgZGV0ZWN0b3IsXG4gICAgICBzaWduYWwsXG4gICAgICBjdXN0b21NYXRjaGVyXG4gICAgXTtcbiAgICBjb25zdCBjYWNoZWRQcm9taXNlID0gdW5pZnlDYWNoZS5nZXQodW5pZnlQcm9taXNlS2V5KTtcbiAgICBpZiAodW5pZnlQcm9jZXNzICYmIGNhY2hlZFByb21pc2UpIHtcbiAgICAgIHJldHVybiBjYWNoZWRQcm9taXNlO1xuICAgIH1cbiAgICBjb25zdCBkZXRlY3RQcm9taXNlID0gbmV3IFByb21pc2UoXG4gICAgICAvLyBiaW9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vQXN5bmNQcm9taXNlRXhlY3V0b3I6IGF2b2lkIG5lc3RpbmcgcHJvbWlzZVxuICAgICAgYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChzaWduYWwucmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKFxuICAgICAgICAgIGFzeW5jIChtdXRhdGlvbnMpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgXyBvZiBtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgICAgaWYgKHNpZ25hbD8uYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBkZXRlY3RSZXN1bHQyID0gYXdhaXQgZGV0ZWN0RWxlbWVudCh7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAgICAgIGRldGVjdG9yLFxuICAgICAgICAgICAgICAgIGN1c3RvbU1hdGNoZXJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChkZXRlY3RSZXN1bHQyLmlzRGV0ZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShkZXRlY3RSZXN1bHQyLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcImFib3J0XCIsXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChzaWduYWwucmVhc29uKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgb25jZTogdHJ1ZSB9XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGRldGVjdFJlc3VsdCA9IGF3YWl0IGRldGVjdEVsZW1lbnQoe1xuICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICBkZXRlY3RvcixcbiAgICAgICAgICBjdXN0b21NYXRjaGVyXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZGV0ZWN0UmVzdWx0LmlzRGV0ZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShkZXRlY3RSZXN1bHQucmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRhcmdldCwgb2JzZXJ2ZUNvbmZpZ3MpO1xuICAgICAgfVxuICAgICkuZmluYWxseSgoKSA9PiB7XG4gICAgICB1bmlmeUNhY2hlLmRlbGV0ZSh1bmlmeVByb21pc2VLZXkpO1xuICAgIH0pO1xuICAgIHVuaWZ5Q2FjaGUuc2V0KHVuaWZ5UHJvbWlzZUtleSwgZGV0ZWN0UHJvbWlzZSk7XG4gICAgcmV0dXJuIGRldGVjdFByb21pc2U7XG4gIH07XG59XG5hc3luYyBmdW5jdGlvbiBkZXRlY3RFbGVtZW50KHtcbiAgdGFyZ2V0LFxuICBzZWxlY3RvcixcbiAgZGV0ZWN0b3IsXG4gIGN1c3RvbU1hdGNoZXJcbn0pIHtcbiAgY29uc3QgZWxlbWVudCA9IGN1c3RvbU1hdGNoZXIgPyBjdXN0b21NYXRjaGVyKHNlbGVjdG9yKSA6IHRhcmdldC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgcmV0dXJuIGF3YWl0IGRldGVjdG9yKGVsZW1lbnQpO1xufVxuY29uc3Qgd2FpdEVsZW1lbnQgPSBjcmVhdGVXYWl0RWxlbWVudCh7XG4gIGRlZmF1bHRPcHRpb25zOiBnZXREZWZhdWx0T3B0aW9ucygpXG59KTtcblxuZXhwb3J0IHsgY3JlYXRlV2FpdEVsZW1lbnQsIGdldERlZmF1bHRPcHRpb25zLCB3YWl0RWxlbWVudCB9O1xuIiwiZnVuY3Rpb24gcHJpbnQobWV0aG9kLCAuLi5hcmdzKSB7XG4gIGlmIChpbXBvcnQubWV0YS5lbnYuTU9ERSA9PT0gXCJwcm9kdWN0aW9uXCIpIHJldHVybjtcbiAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGFyZ3Muc2hpZnQoKTtcbiAgICBtZXRob2QoYFt3eHRdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBtZXRob2QoXCJbd3h0XVwiLCAuLi5hcmdzKTtcbiAgfVxufVxuZXhwb3J0IGNvbnN0IGxvZ2dlciA9IHtcbiAgZGVidWc6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmRlYnVnLCAuLi5hcmdzKSxcbiAgbG9nOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5sb2csIC4uLmFyZ3MpLFxuICB3YXJuOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS53YXJuLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmVycm9yLCAuLi5hcmdzKVxufTtcbiIsImltcG9ydCB7IHdhaXRFbGVtZW50IH0gZnJvbSBcIkAxbmF0c3Uvd2FpdC1lbGVtZW50XCI7XG5pbXBvcnQge1xuICBpc0V4aXN0IGFzIG1vdW50RGV0ZWN0b3IsXG4gIGlzTm90RXhpc3QgYXMgcmVtb3ZlRGV0ZWN0b3Jcbn0gZnJvbSBcIkAxbmF0c3Uvd2FpdC1lbGVtZW50L2RldGVjdG9yc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2ludGVybmFsL2xvZ2dlci5tanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBvc2l0aW9uKHJvb3QsIHBvc2l0aW9uZWRFbGVtZW50LCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLnBvc2l0aW9uID09PSBcImlubGluZVwiKSByZXR1cm47XG4gIGlmIChvcHRpb25zLnpJbmRleCAhPSBudWxsKSByb290LnN0eWxlLnpJbmRleCA9IFN0cmluZyhvcHRpb25zLnpJbmRleCk7XG4gIHJvb3Quc3R5bGUub3ZlcmZsb3cgPSBcInZpc2libGVcIjtcbiAgcm9vdC5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcbiAgcm9vdC5zdHlsZS53aWR0aCA9IFwiMFwiO1xuICByb290LnN0eWxlLmhlaWdodCA9IFwiMFwiO1xuICByb290LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gIGlmIChwb3NpdGlvbmVkRWxlbWVudCkge1xuICAgIGlmIChvcHRpb25zLnBvc2l0aW9uID09PSBcIm92ZXJsYXlcIikge1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICBpZiAob3B0aW9ucy5hbGlnbm1lbnQ/LnN0YXJ0c1dpdGgoXCJib3R0b20tXCIpKVxuICAgICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5ib3R0b20gPSBcIjBcIjtcbiAgICAgIGVsc2UgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUudG9wID0gXCIwXCI7XG4gICAgICBpZiAob3B0aW9ucy5hbGlnbm1lbnQ/LmVuZHNXaXRoKFwiLXJpZ2h0XCIpKVxuICAgICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5yaWdodCA9IFwiMFwiO1xuICAgICAgZWxzZSBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gXCJmaXhlZFwiO1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUudG9wID0gXCIwXCI7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5ib3R0b20gPSBcIjBcIjtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnJpZ2h0ID0gXCIwXCI7XG4gICAgfVxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5jaG9yKG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuYW5jaG9yID09IG51bGwpIHJldHVybiBkb2N1bWVudC5ib2R5O1xuICBsZXQgcmVzb2x2ZWQgPSB0eXBlb2Ygb3B0aW9ucy5hbmNob3IgPT09IFwiZnVuY3Rpb25cIiA/IG9wdGlvbnMuYW5jaG9yKCkgOiBvcHRpb25zLmFuY2hvcjtcbiAgaWYgKHR5cGVvZiByZXNvbHZlZCA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmIChyZXNvbHZlZC5zdGFydHNXaXRoKFwiL1wiKSkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZG9jdW1lbnQuZXZhbHVhdGUoXG4gICAgICAgIHJlc29sdmVkLFxuICAgICAgICBkb2N1bWVudCxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgWFBhdGhSZXN1bHQuRklSU1RfT1JERVJFRF9OT0RFX1RZUEUsXG4gICAgICAgIG51bGxcbiAgICAgICk7XG4gICAgICByZXR1cm4gcmVzdWx0LnNpbmdsZU5vZGVWYWx1ZSA/PyB2b2lkIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHJlc29sdmVkKSA/PyB2b2lkIDA7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXNvbHZlZCA/PyB2b2lkIDA7XG59XG5leHBvcnQgZnVuY3Rpb24gbW91bnRVaShyb290LCBvcHRpb25zKSB7XG4gIGNvbnN0IGFuY2hvciA9IGdldEFuY2hvcihvcHRpb25zKTtcbiAgaWYgKGFuY2hvciA9PSBudWxsKVxuICAgIHRocm93IEVycm9yKFxuICAgICAgXCJGYWlsZWQgdG8gbW91bnQgY29udGVudCBzY3JpcHQgVUk6IGNvdWxkIG5vdCBmaW5kIGFuY2hvciBlbGVtZW50XCJcbiAgICApO1xuICBzd2l0Y2ggKG9wdGlvbnMuYXBwZW5kKSB7XG4gICAgY2FzZSB2b2lkIDA6XG4gICAgY2FzZSBcImxhc3RcIjpcbiAgICAgIGFuY2hvci5hcHBlbmQocm9vdCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZmlyc3RcIjpcbiAgICAgIGFuY2hvci5wcmVwZW5kKHJvb3QpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInJlcGxhY2VcIjpcbiAgICAgIGFuY2hvci5yZXBsYWNlV2l0aChyb290KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJhZnRlclwiOlxuICAgICAgYW5jaG9yLnBhcmVudEVsZW1lbnQ/Lmluc2VydEJlZm9yZShyb290LCBhbmNob3IubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJiZWZvcmVcIjpcbiAgICAgIGFuY2hvci5wYXJlbnRFbGVtZW50Py5pbnNlcnRCZWZvcmUocm9vdCwgYW5jaG9yKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBvcHRpb25zLmFwcGVuZChhbmNob3IsIHJvb3QpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb3VudEZ1bmN0aW9ucyhiYXNlRnVuY3Rpb25zLCBvcHRpb25zKSB7XG4gIGxldCBhdXRvTW91bnRJbnN0YW5jZSA9IHZvaWQgMDtcbiAgY29uc3Qgc3RvcEF1dG9Nb3VudCA9ICgpID0+IHtcbiAgICBhdXRvTW91bnRJbnN0YW5jZT8uc3RvcEF1dG9Nb3VudCgpO1xuICAgIGF1dG9Nb3VudEluc3RhbmNlID0gdm9pZCAwO1xuICB9O1xuICBjb25zdCBtb3VudCA9ICgpID0+IHtcbiAgICBiYXNlRnVuY3Rpb25zLm1vdW50KCk7XG4gIH07XG4gIGNvbnN0IHVubW91bnQgPSBiYXNlRnVuY3Rpb25zLnJlbW92ZTtcbiAgY29uc3QgcmVtb3ZlID0gKCkgPT4ge1xuICAgIHN0b3BBdXRvTW91bnQoKTtcbiAgICBiYXNlRnVuY3Rpb25zLnJlbW92ZSgpO1xuICB9O1xuICBjb25zdCBhdXRvTW91bnQgPSAoYXV0b01vdW50T3B0aW9ucykgPT4ge1xuICAgIGlmIChhdXRvTW91bnRJbnN0YW5jZSkge1xuICAgICAgbG9nZ2VyLndhcm4oXCJhdXRvTW91bnQgaXMgYWxyZWFkeSBzZXQuXCIpO1xuICAgIH1cbiAgICBhdXRvTW91bnRJbnN0YW5jZSA9IGF1dG9Nb3VudFVpKFxuICAgICAgeyBtb3VudCwgdW5tb3VudCwgc3RvcEF1dG9Nb3VudCB9LFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAuLi5hdXRvTW91bnRPcHRpb25zXG4gICAgICB9XG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBtb3VudCxcbiAgICByZW1vdmUsXG4gICAgYXV0b01vdW50XG4gIH07XG59XG5mdW5jdGlvbiBhdXRvTW91bnRVaSh1aUNhbGxiYWNrcywgb3B0aW9ucykge1xuICBjb25zdCBhYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGNvbnN0IEVYUExJQ0lUX1NUT1BfUkVBU09OID0gXCJleHBsaWNpdF9zdG9wX2F1dG9fbW91bnRcIjtcbiAgY29uc3QgX3N0b3BBdXRvTW91bnQgPSAoKSA9PiB7XG4gICAgYWJvcnRDb250cm9sbGVyLmFib3J0KEVYUExJQ0lUX1NUT1BfUkVBU09OKTtcbiAgICBvcHRpb25zLm9uU3RvcD8uKCk7XG4gIH07XG4gIGxldCByZXNvbHZlZEFuY2hvciA9IHR5cGVvZiBvcHRpb25zLmFuY2hvciA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5hbmNob3IoKSA6IG9wdGlvbnMuYW5jaG9yO1xuICBpZiAocmVzb2x2ZWRBbmNob3IgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICBcImF1dG9Nb3VudCBhbmQgRWxlbWVudCBhbmNob3Igb3B0aW9uIGNhbm5vdCBiZSBjb21iaW5lZC4gQXZvaWQgcGFzc2luZyBgRWxlbWVudGAgZGlyZWN0bHkgb3IgYCgpID0+IEVsZW1lbnRgIHRvIHRoZSBhbmNob3IuXCJcbiAgICApO1xuICB9XG4gIGFzeW5jIGZ1bmN0aW9uIG9ic2VydmVFbGVtZW50KHNlbGVjdG9yKSB7XG4gICAgbGV0IGlzQW5jaG9yRXhpc3QgPSAhIWdldEFuY2hvcihvcHRpb25zKTtcbiAgICBpZiAoaXNBbmNob3JFeGlzdCkge1xuICAgICAgdWlDYWxsYmFja3MubW91bnQoKTtcbiAgICB9XG4gICAgd2hpbGUgKCFhYm9ydENvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNoYW5nZWRBbmNob3IgPSBhd2FpdCB3YWl0RWxlbWVudChzZWxlY3RvciA/PyBcImJvZHlcIiwge1xuICAgICAgICAgIGN1c3RvbU1hdGNoZXI6ICgpID0+IGdldEFuY2hvcihvcHRpb25zKSA/PyBudWxsLFxuICAgICAgICAgIGRldGVjdG9yOiBpc0FuY2hvckV4aXN0ID8gcmVtb3ZlRGV0ZWN0b3IgOiBtb3VudERldGVjdG9yLFxuICAgICAgICAgIHNpZ25hbDogYWJvcnRDb250cm9sbGVyLnNpZ25hbFxuICAgICAgICB9KTtcbiAgICAgICAgaXNBbmNob3JFeGlzdCA9ICEhY2hhbmdlZEFuY2hvcjtcbiAgICAgICAgaWYgKGlzQW5jaG9yRXhpc3QpIHtcbiAgICAgICAgICB1aUNhbGxiYWNrcy5tb3VudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVpQ2FsbGJhY2tzLnVubW91bnQoKTtcbiAgICAgICAgICBpZiAob3B0aW9ucy5vbmNlKSB7XG4gICAgICAgICAgICB1aUNhbGxiYWNrcy5zdG9wQXV0b01vdW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoYWJvcnRDb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkICYmIGFib3J0Q29udHJvbGxlci5zaWduYWwucmVhc29uID09PSBFWFBMSUNJVF9TVE9QX1JFQVNPTikge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG9ic2VydmVFbGVtZW50KHJlc29sdmVkQW5jaG9yKTtcbiAgcmV0dXJuIHsgc3RvcEF1dG9Nb3VudDogX3N0b3BBdXRvTW91bnQgfTtcbn1cbiIsImltcG9ydCB7IGFwcGx5UG9zaXRpb24sIGNyZWF0ZU1vdW50RnVuY3Rpb25zLCBtb3VudFVpIH0gZnJvbSBcIi4vc2hhcmVkLm1qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUludGVncmF0ZWRVaShjdHgsIG9wdGlvbnMpIHtcbiAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQob3B0aW9ucy50YWcgfHwgXCJkaXZcIik7XG4gIGxldCBtb3VudGVkID0gdm9pZCAwO1xuICBjb25zdCBtb3VudCA9ICgpID0+IHtcbiAgICBhcHBseVBvc2l0aW9uKHdyYXBwZXIsIHZvaWQgMCwgb3B0aW9ucyk7XG4gICAgbW91bnRVaSh3cmFwcGVyLCBvcHRpb25zKTtcbiAgICBtb3VudGVkID0gb3B0aW9ucy5vbk1vdW50Py4od3JhcHBlcik7XG4gIH07XG4gIGNvbnN0IHJlbW92ZSA9ICgpID0+IHtcbiAgICBvcHRpb25zLm9uUmVtb3ZlPy4obW91bnRlZCk7XG4gICAgd3JhcHBlci5yZXBsYWNlQ2hpbGRyZW4oKTtcbiAgICB3cmFwcGVyLnJlbW92ZSgpO1xuICAgIG1vdW50ZWQgPSB2b2lkIDA7XG4gIH07XG4gIGNvbnN0IG1vdW50RnVuY3Rpb25zID0gY3JlYXRlTW91bnRGdW5jdGlvbnMoXG4gICAge1xuICAgICAgbW91bnQsXG4gICAgICByZW1vdmVcbiAgICB9LFxuICAgIG9wdGlvbnNcbiAgKTtcbiAgY3R4Lm9uSW52YWxpZGF0ZWQocmVtb3ZlKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgbW91bnRlZCgpIHtcbiAgICAgIHJldHVybiBtb3VudGVkO1xuICAgIH0sXG4gICAgd3JhcHBlcixcbiAgICAuLi5tb3VudEZ1bmN0aW9uc1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgXCIvKiBNaW50bGlmeS1pbnNwaXJlZCBMaWdodCBUaGVtZSBmb3IgbWRCb29rICovXFxuOnJvb3Qge1xcbiAgICAtLWJnOiAjZmZmZmZmO1xcbiAgICAtLWZnOiAjMGEwZDBkO1xcbiAgICAtLXNpZGViYXItYmc6ICNmOGZhZjk7XFxuICAgIC0tc2lkZWJhci1mZzogIzM3NDE1MTtcXG4gICAgLS1zaWRlYmFyLWFjdGl2ZTogIzE2NmUzZjtcXG4gICAgLS1zaWRlYmFyLWFjdGl2ZS1iZzogcmdiYSgyMiwgMTEwLCA2MywgMC4xKTtcXG4gICAgLS1zaWRlYmFyLWhlYWRlci1ib3JkZXItY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG4gICAgLS1saW5rczogIzE2NmUzZjtcXG4gICAgLS1saW5rcy1ob3ZlcjogIzI2YmQ2YztcXG4gICAgLS1pbmxpbmUtY29kZS1iZzogI2YzZjZmNDtcXG4gICAgLS1pbmxpbmUtY29kZS1jb2xvcjogcmdiYSgyMzgsIDI0MSwgMjM5LCAwLjUpO1xcbiAgICAtLWNvZGUtYmc6ICMwYTBkMGQ7XFxuICAgIC0tY29kZS1mZzogI2U1ZTdlYjtcXG4gICAgLS1xdW90ZS1iZzogI2YzZjZmNDtcXG4gICAgLS1xdW90ZS1ib3JkZXI6ICMyNmJkNmM7XFxuICAgIC0tcXVvdGUtYmxvY2stYm9yZGVyOiByZ2IoMTYgMTg1IDEyOSAvIDAuMik7XFxuICAgIC0tcXVvdGUtYmxvY2stYmc6IHJnYigyMzYgMjUzIDI0NSAvIDAuNSk7XFxuICAgIC0tdGFibGUtYm9yZGVyOiAjZTVlN2ViO1xcbiAgICAtLXRhYmxlLWhlYWRlci1iZzogI2YzZjZmNDtcXG4gICAgLS1zZWFyY2gtYmc6ICNmZmZmZmY7XFxuICAgIC0tc2VhcmNoLWJvcmRlcjogI2U1ZTdlYjtcXG4gICAgLS1zZWFyY2hiYXItc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpO1xcbiAgICAtLXNjcm9sbGJhcjogI2QxZDVkYjtcXG4gICAgLS1zY3JvbGxiYXItaG92ZXI6ICM5Y2EzYWY7XFxuICAgIC0tb3JkZXItd2VpZ2h0OiA0MDA7XFxuICAgIC0tb3JkZXItZGlzcGxheTogbm9uZTtcXG4gICAgLS1jaGFwdGVyLW5hdi1kaXNwbGF5OiBub25lO1xcbiAgICAtLXNpZGViYXItdGV4dC1zaXplOiAxNnB4O1xcbiAgICAtLWJvZHktdGV4dC1jb2xvcjogcmdiKDYzLCA2NSwgNjQpO1xcbiAgICAtLXRleHQtY29sb3I6IHJnYigxNywgMjQsIDM5KTtcXG4gICAgLS1jb250ZW50LXNpemU6IDM2cmVtO1xcbiAgICAtLXJvb3QtZm9udC1zaXplOiAxOHB4O1xcbiAgICAtLW1vbm8tZm9udDpcXG4gICAgICAgIFxcXCJHZWlzdCBNb25vXFxcIiwgXFxcIk1lbmxvXFxcIiwgXFxcIk1vbmFjb1xcXCIsIFxcXCJMdWNpZGEgQ29uc29sZVxcXCIsIFxcXCJMaWJlcmF0aW9uIE1vbm9cXFwiLFxcbiAgICAgICAgXFxcIkRlamFWdSBTYW5zIE1vbm9cXFwiLCBcXFwiQml0c3RyZWFtIFZlcmEgU2FucyBNb25vXFxcIiwgXFxcIkNvdXJpZXIgTmV3XFxcIiwgbW9ub3NwYWNlO1xcbiAgICBmb250LXNpemU6IHZhcigtLXJvb3QtZm9udC1zaXplKTtcXG59XFxuXFxuOm5vdChwcmUpID4gY29kZS5obGpzIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taW5saW5lLWNvZGUtY29sb3IpO1xcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XFxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIHBhZGRpbmc6IDAuMTI1cmVtIDAuNXJlbTtcXG4gICAgbWFyZ2luOiAwIDAuMTI1cmVtO1xcbn1cXG5cXG5odG1sIHtcXG4gICAgZm9udC1mYW1pbHk6XFxuICAgICAgICBcXFwiSW50ZXJcXFwiLFxcbiAgICAgICAgLWFwcGxlLXN5c3RlbSxcXG4gICAgICAgIEJsaW5rTWFjU3lzdGVtRm9udCxcXG4gICAgICAgIFxcXCJTZWdvZSBVSVxcXCIsXFxuICAgICAgICBSb2JvdG8sXFxuICAgICAgICBzYW5zLXNlcmlmO1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcXG4gICAgaGVpZ2h0OiAxMDBkdmg7XFxufVxcblxcbmJvZHkge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICAgIGNvbG9yOiB2YXIoLS1ib2R5LXRleHQtY29sb3IpO1xcbiAgICBmb250LXNpemU6IGluaGVyaXQ7XFxufVxcblxcbm5hdi5uYXYtd2lkZS13cmFwcGVyIGEubmF2LWNoYXB0ZXJzIHtcXG4gICAgZGlzcGxheTogdmFyKC0tY2hhcHRlci1uYXYtZGlzcGxheSk7XFxufVxcblxcbi8qIFNpZGViYXIgKi9cXG4uc2lkZWJhciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbiAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG4uc2lkZWJhciAuc2lkZWJhci1zY3JvbGxib3gge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWJnKTtcXG59XFxuXFxuc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlciBhIHtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxufVxcbnNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXIge1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWZnKTtcXG4gICAgcGFkZGluZzogNHB4IDE2cHg7XFxuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMTVzIGVhc2U7XFxuICAgIGZvbnQtc2l6ZTogdmFyKC0tc2lkZWJhci10ZXh0LXNpemUpO1xcbn1cXG5cXG4vKi5zaWRlYmFyIG9sLmNoYXB0ZXIgPiBsaS5jaGFwdGVyLWl0ZW0gPiBzcGFuLmNoYXB0ZXItbGluay13cmFwcGVyIHtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxufSovXFxuXFxuLyouc2lkZWJhciBvbC5jaGFwdGVyIGxpIC5jaGFwdGVyLWl0ZW0uZXhwYW5kZWQgPiBhLCovXFxuc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlcjpoYXMoYS5hY3RpdmUpLFxcbnNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXI6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxuICAgIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuXFxuLyogVHlwb2dyYXBoeSAqL1xcbmgxLFxcbmgyLFxcbmgzLFxcbmg0LFxcbmg1LFxcbmg2IHtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gICAgbWFyZ2luLXRvcDogMmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjVlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuMztcXG59XFxuXFxuaDEubWVudS10aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMS43NWVtO1xcbiAgICBtYXJnaW4tdG9wOiAwO1xcbn1cXG5oMiB7XFxuICAgIGZvbnQtc2l6ZTogMS41ZW07XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgICBwYWRkaW5nLWJvdHRvbTogMC41ZW07XFxufVxcbmgzIHtcXG4gICAgZm9udC1zaXplOiAxLjI1ZW07XFxufVxcbmg0IHtcXG4gICAgZm9udC1zaXplOiAxZW07XFxufVxcblxcbnAge1xcbiAgICBsaW5lLWhlaWdodDogMS43NTtcXG4gICAgbWFyZ2luOiAxZW0gMDtcXG59XFxuXFxuLyogTGlua3MgKi9cXG5hIHtcXG4gICAgY29sb3I6IHZhcigtLWxpbmtzKTtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICB0cmFuc2l0aW9uOiBjb2xvciAwLjE1cyBlYXNlO1xcbn1cXG5cXG5hOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWxpbmtzLWhvdmVyKTtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XFxufVxcblxcbi8qIENvZGUgKi9cXG5jb2RlIHtcXG4gICAgZm9udC1mYW1pbHk6IFxcXCJHZWlzdCBNb25vXFxcIiwgXFxcIkZpcmEgQ29kZVxcXCIsIFxcXCJKZXRCcmFpbnMgTW9ub1xcXCIsIG1vbm9zcGFjZTtcXG4gICAgZm9udC1zaXplOiAwLjg3NWVtO1xcbn1cXG5cXG5zdHJvbmcge1xcbiAgICBkaXNwbGF5OiB2YXIoLS1vcmRlci1kaXNwbGF5KTtcXG4gICAgZm9udC13ZWlnaHQ6IHZhcigtLW9yZGVyLXdlaWdodCk7XFxufVxcblxcbjpub3QocHJlKSA+IGNvZGUge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1pbmxpbmUtY29kZS1iZyk7XFxuICAgIHBhZGRpbmc6IDAuMmVtIDAuNGVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICAgIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxufVxcblxcbnByZSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvZGUtYmcpICFpbXBvcnRhbnQ7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2RlLWZnKTtcXG4gICAgcGFkZGluZzogMTZweCAyMHB4O1xcbiAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xcbiAgICBvdmVyZmxvdy14OiBhdXRvO1xcbiAgICBtYXJnaW46IDEuNWVtIDA7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcXG59XFxuXFxucHJlIGNvZGUge1xcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgY29sb3I6IGluaGVyaXQ7XFxufVxcblxcbi8qIEJsb2NrcXVvdGVzICovXFxuYmxvY2txdW90ZSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXF1b3RlLWJsb2NrLWJnKTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcXVvdGUtYmxvY2stYm9yZGVyKTtcXG4gICAgbWFyZ2luOiAxLjVlbSAwO1xcbiAgICBwYWRkaW5nOiAxcmVtIDEuMjVyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDFyZW07XFxufVxcblxcbmJsb2NrcXVvdGUgcCB7XFxuICAgIG1hcmdpbjogMDtcXG59XFxuYmxvY2txdW90ZSBoMSxcXG5ibG9ja3F1b3RlIGgyLFxcbmJsb2NrcXVvdGUgaDMsXFxuYmxvY2txdW90ZSBoNCxcXG5ibG9ja3F1b3RlIGg1IHtcXG4gICAgbWFyZ2luOiAwO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxZW07XFxufVxcblxcbi8qIFRhYmxlcyAqL1xcbnRhYmxlIHtcXG4gICAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMS41ZW0gMDtcXG4gICAgYm9yZGVyLXJhZGl1czogMTJweDtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxudGgge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS10YWJsZS1oZWFkZXItYmcpO1xcbiAgICBmb250LXdlaWdodDogNjAwO1xcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG5cXG50aCxcXG50ZCB7XFxuICAgIHBhZGRpbmc6IDEycHggMTZweDtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbnRyOmxhc3QtY2hpbGQgdGQge1xcbiAgICBib3JkZXItYm90dG9tOiBub25lO1xcbn1cXG5cXG4vKiBNZW51IGJhciAqL1xcbiNtZW51LWJhciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbiNtZW51LWJhciBpIHtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuLyogU2VhcmNoICovXFxuI3NlYXJjaGJhciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNlYXJjaC1iZyk7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNlYXJjaC1ib3JkZXIpO1xcbiAgICBib3gtc2hhZG93OiB2YXIoLS1zZWFyY2hiYXItc2hhZG93KTtcXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgICBwYWRkaW5nOiA4cHggMTJweDtcXG59XFxuXFxuLyogTmF2aWdhdGlvbiBidXR0b25zICovXFxuLm5hdi1jaGFwdGVycyB7XFxuICAgIGNvbG9yOiB2YXIoLS1saW5rcyk7XFxuICAgIG9wYWNpdHk6IDAuODtcXG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjE1cyBlYXNlO1xcbn1cXG5cXG4ubmF2LWNoYXB0ZXJzOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWxpbmtzLWhvdmVyKTtcXG4gICAgb3BhY2l0eTogMTtcXG59XFxuXFxuLyogU2Nyb2xsYmFyICovXFxuOjotd2Via2l0LXNjcm9sbGJhciB7XFxuICAgIHdpZHRoOiA4cHg7XFxuICAgIGhlaWdodDogOHB4O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JvbGxiYXIpO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JvbGxiYXItaG92ZXIpO1xcbn1cXG5cXG4vKiBUaGVtZSB0b2dnbGUgKi9cXG4jdGhlbWUtbGlzdCB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XFxufVxcblxcbiN0aGVtZS1saXN0IGxpIHtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuI3RoZW1lLWxpc3QgbGk6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxufVxcblxcbmRpdiNtZGJvb2stbWVudS1iYXIsXFxuZGl2I21kYm9vay1tZW51LWJhci1ob3Zlci1wbGFjZWhvbGRlciB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIHBhZGRpbmc6IDFyZW0gMDtcXG59XFxuXFxuZGl2I21kYm9vay1jb250ZW50IHtcXG4gICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDgwcHgpO1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICBwYWRkaW5nOiAycmVtIDRyZW07XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogdmFyKC0tY29udGVudC1zaXplKSAyOHJlbTtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGdhcDogM3JlbTtcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgc2Nyb2xsLWJlaGF2aW9yOiBzbW9vdGg7XFxufVxcblxcbmRpdiNtZGJvb2stY29udGVudCBwIHtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNzU7XFxufVxcblxcbmRpdiNtZGJvb2stY29udGVudCBtYWluIHtcXG4gICAgbWF4LXdpZHRoOiAxMDAlO1xcbn1cXG5cXG5kaXYjbWRib29rLWNvbnRlbnQgbWFpbiBhLmhlYWRlcjpob3ZlcixcXG5kaXYjbWRib29rLWNvbnRlbnQgbWFpbiBhIHtcXG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGV4dC1jb2xvcik7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuZGl2I21kYm9vay1jb250ZW50IG1haW4gYTpob3ZlciB7XFxuICAgIGJvcmRlci1ib3R0b20td2lkdGg6IDJweDtcXG59XFxuXFxuZGl2I21kYm9vay1jb250ZW50IG1haW4gYS5oZWFkZXIge1xcbiAgICBib3JkZXItYm90dG9tOiBub25lO1xcbn1cXG5cXG4vKiBSaWdodCBTaWRlYmFyIChUT0MpICovXFxuLnBhZ2Utd3JhcHBlci5oYXMtcmlnaHQtc2lkZWJhciB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byAxZnIgMjIwcHg7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyIHtcXG4gICAgcG9zaXRpb246IHN0aWNreTtcXG4gICAgdG9wOiA2MHB4O1xcbiAgICByaWdodDogMHB4O1xcbiAgICBoZWlnaHQ6IGZpdC1jb250ZW50O1xcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gOHB4KTtcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICAgIG1hcmdpbi1sZWZ0OiAyLjVyZW07XFxuICAgIHBhZGRpbmctbGVmdDogMXJlbTtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItaGVhZGVyIHtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItZmcpO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xcbiAgICBwYWRkaW5nLWxlZnQ6IDhweDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItdG9jIHtcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgbWFyZ2luOiAwO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2Mgb2wge1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBwYWRkaW5nLWxlZnQ6IDEycHg7XFxuICAgIG1hcmdpbjogMDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItdG9jIGxpIHtcXG4gICAgbWFyZ2luOiAwO1xcbn1cXG5cXG4vKiBBZGp1c3QgY29udGVudCB3aWR0aCB3aGVuIHJpZ2h0IHNpZGViYXIgZXhpc3RzICovXFxuLnBhZ2Utd3JhcHBlci5oYXMtcmlnaHQtc2lkZWJhciAuY29udGVudCB7XFxuICAgIG1heC13aWR0aDogMTAwJTtcXG59XFxuXFxuLyogSGlkZSByaWdodCBzaWRlYmFyIG9uIHNtYWxsIHNjcmVlbnMgKi9cXG5AbWVkaWEgKG1heC13aWR0aDogMTEwMHB4KSB7XFxuICAgIC5wYWdlLXdyYXBwZXIuaGFzLXJpZ2h0LXNpZGViYXIge1xcbiAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBhdXRvIDFmcjtcXG4gICAgfVxcblxcbiAgICAucmlnaHQtc2lkZWJhciB7XFxuICAgICAgICBkaXNwbGF5OiBub25lO1xcbiAgICB9XFxufVxcblwiIiwiaW1wb3J0IG1pbnRsaWZ5IGZyb20gXCIuLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LmNzcz9yYXdcIjtcbi8vIGltcG9ydCBtaW50bGlmeUxpZ2h0Q1NTIGZyb20gXCIuLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LWxpZ2h0LmNzcz9yYXdcIjtcbi8vIGltcG9ydCBtaW50bGlmeURhcmtDU1MgZnJvbSBcIi4uL2Fzc2V0cy90aGVtZXMvbWludGxpZnktZGFyay5jc3M/cmF3XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbnRlbnRTY3JpcHQoe1xuICBtYXRjaGVzOiBbXCI8YWxsX3VybHM+XCJdLFxuICBydW5BdDogXCJkb2N1bWVudF9zdGFydFwiLFxuXG4gIG1haW4oY3R4KSB7XG4gICAgLy8gQ3VzdG9tIHRoZW1lcyAoTWludGxpZnktaW5zcGlyZWQgKyBtZEJvb2sgYnVpbHQtaW4pXG4gICAgY29uc3QgQ1VTVE9NX1RIRU1FUyA9IFtcIm1pbnRsaWZ5XCIsIFwibWludGxpZnktZGFya1wiXSBhcyBjb25zdDtcbiAgICBjb25zdCBNREJPT0tfVEhFTUVTID0gW1wibGlnaHRcIiwgXCJydXN0XCIsIFwiY29hbFwiLCBcIm5hdnlcIiwgXCJheXVcIl0gYXMgY29uc3Q7XG4gICAgY29uc3QgQUxMX1RIRU1FUyA9IFsuLi5DVVNUT01fVEhFTUVTLCAuLi5NREJPT0tfVEhFTUVTXSBhcyBjb25zdDtcbiAgICB0eXBlIFRoZW1lID0gKHR5cGVvZiBBTExfVEhFTUVTKVtudW1iZXJdO1xuXG4gICAgbGV0IGlzTWRCb29rID0gZmFsc2U7XG4gICAgbGV0IHN0eWxlRWxlbWVudDogSFRNTFN0eWxlRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gICAgLy8gQ2hlY2sgaWYgY3VycmVudCBwYWdlIGlzIGFuIG1kQm9vayBzaXRlIGJ5IGxvb2tpbmcgZm9yIHRoZSBjb21tZW50XG4gICAgZnVuY3Rpb24gY2hlY2tNZEJvb2tDb21tZW50KCkge1xuICAgICAgLy8gQ2hlY2sgZm9yIDwhLS0gQm9vayBnZW5lcmF0ZWQgdXNpbmcgbWRCb29rIC0tPiBjb21tZW50IGF0IGRvY3VtZW50IHN0YXJ0XG4gICAgICBjb25zdCBub2RlcyA9IGRvY3VtZW50LmhlYWQuY2hpbGROb2RlcztcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKG5vZGVzIHx8IFtdKVxuICAgICAgICAuZmlsdGVyKChub2RlKSA9PiBub2RlLm5vZGVUeXBlID09PSBOb2RlLkNPTU1FTlRfTk9ERSlcbiAgICAgICAgLnNvbWUoKG5vZGUpID0+XG4gICAgICAgICAgbm9kZS5ub2RlVmFsdWU/LnRyaW0oKS5pbmNsdWRlcyhcIkJvb2sgZ2VuZXJhdGVkIHVzaW5nIG1kQm9va1wiKSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgY3VycmVudCBtZEJvb2sgdGhlbWUgZnJvbSBwYWdlXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudE1kQm9va1RoZW1lKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgIGZvciAoY29uc3QgdGhlbWUgb2YgTURCT09LX1RIRU1FUykge1xuICAgICAgICBpZiAoaHRtbC5jbGFzc0xpc3QuY29udGFpbnModGhlbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoZW1lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBHZXQgQ1NTIGZvciB0aGVtZVxuICAgIGZ1bmN0aW9uIGdldFRoZW1lQ1NTKHRoZW1lOiBUaGVtZSk6IHN0cmluZyB8IG51bGwge1xuICAgICAgc3dpdGNoICh0aGVtZSkge1xuICAgICAgICBjYXNlIFwibWludGxpZnlcIjpcbiAgICAgICAgICByZXR1cm4gbWludGxpZnk7XG4gICAgICAgIC8vIGNhc2UgXCJtaW50bGlmeS1kYXJrXCI6XG4gICAgICAgIC8vICAgcmV0dXJuIG1pbnRsaWZ5RGFya0NTUztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gVXNlIG1kQm9vayBidWlsdC1pbiB0aGVtZXNcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbmplY3Qgb3IgdXBkYXRlIGN1c3RvbSB0aGVtZSBDU1NcbiAgICBmdW5jdGlvbiBpbmplY3RUaGVtZUNTUyhjc3M6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgIGlmICghY3NzKSB7XG4gICAgICAgIC8vIFJlbW92ZSBjdXN0b20gc3R5bGVzLCB1c2UgbWRCb29rIGJ1aWx0LWluXG4gICAgICAgIGlmIChzdHlsZUVsZW1lbnQpIHtcbiAgICAgICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgc3R5bGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghc3R5bGVFbGVtZW50KSB7XG4gICAgICAgIHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgc3R5bGVFbGVtZW50LmlkID0gXCJtZGJvb2stdGhlbWUtZXh0ZW5zaW9uXCI7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHN0eWxlRWxlbWVudC50ZXh0Q29udGVudCA9IGNzcztcbiAgICB9XG5cbiAgICAvLyBBcHBseSB0aGVtZSB0byBwYWdlXG4gICAgZnVuY3Rpb24gYXBwbHlUaGVtZSh0aGVtZTogVGhlbWUpIHtcbiAgICAgIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBjb25zdCBpc0N1c3RvbVRoZW1lID0gQ1VTVE9NX1RIRU1FUy5pbmNsdWRlcyh0aGVtZSBhcyBhbnkpO1xuXG4gICAgICBpZiAoaXNDdXN0b21UaGVtZSkge1xuICAgICAgICAvLyBGb3IgY3VzdG9tIHRoZW1lcywgc2V0IGJhc2UgbWRCb29rIHRoZW1lIGFuZCBpbmplY3QgQ1NTXG4gICAgICAgIE1EQk9PS19USEVNRVMuZm9yRWFjaCgodCkgPT4gaHRtbC5jbGFzc0xpc3QucmVtb3ZlKHQpKTtcbiAgICAgICAgaHRtbC5jbGFzc0xpc3QuYWRkKHRoZW1lID09PSBcIm1pbnRsaWZ5XCIgPyBcImxpZ2h0XCIgOiBcImNvYWxcIik7XG4gICAgICAgIGluamVjdFRoZW1lQ1NTKGdldFRoZW1lQ1NTKHRoZW1lKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGb3IgbWRCb29rIGJ1aWx0LWluIHRoZW1lc1xuICAgICAgICBNREJPT0tfVEhFTUVTLmZvckVhY2goKHQpID0+IGh0bWwuY2xhc3NMaXN0LnJlbW92ZSh0KSk7XG4gICAgICAgIGh0bWwuY2xhc3NMaXN0LmFkZCh0aGVtZSk7XG4gICAgICAgIGluamVjdFRoZW1lQ1NTKG51bGwpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJtZGJvb2stdGhlbWVcIiwgdGhlbWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gSWdub3JlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTm90aWZ5IHBvcHVwIGFib3V0IHRoZW1lIGNoYW5nZVxuICAgICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogXCJ0aGVtZUNoYW5nZWRcIiwgdGhlbWUgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIHdoZW4gcG9wdXAgaXMgbm90IG9wZW5cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemUgdGhlbWUgZnJvbSBzdG9yYWdlXG4gICAgYXN5bmMgZnVuY3Rpb24gaW5pdFRoZW1lKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbG9jYWxDb25maWcgPSBbXCJtZGJvb2tUaGVtZVwiLCBcImVuYWJsZWRcIl0gYXMgY29uc3Q7XG4gICAgICAgIHR5cGUgTG9jYWxDb25maWcgPSB7XG4gICAgICAgICAgW0sgaW4gKHR5cGVvZiBsb2NhbENvbmZpZylbbnVtYmVyXV0/OiBzdHJpbmc7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHsgbWRib29rVGhlbWUgfSA9IChhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFxuICAgICAgICAgIGxvY2FsQ29uZmlnIGFzIGFueSxcbiAgICAgICAgKSkgYXMgTG9jYWxDb25maWc7XG5cbiAgICAgICAgY29uc3QgdGhlbWUgPSBtZGJvb2tUaGVtZSB8fCAoXCJtaW50bGlmeVwiIGFzIGFueSk7IC8vIERlZmF1bHQgdG8gbWludGxpZnlcbiAgICAgICAgaWYgKEFMTF9USEVNRVMuaW5jbHVkZXModGhlbWUpKSB7XG4gICAgICAgICAgYXBwbHlUaGVtZSh0aGVtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRGVmYXVsdCB0byBtaW50bGlmeSBvbiBlcnJvclxuICAgICAgICBhcHBseVRoZW1lKFwibWludGxpZnlcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciB0aGVtZSBjaGFuZ2UgbWVzc2FnZXMgZnJvbSBwb3B1cFxuICAgIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UpID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwic2V0VGhlbWVcIiAmJiBBTExfVEhFTUVTLmluY2x1ZGVzKG1lc3NhZ2UudGhlbWUpKSB7XG4gICAgICAgIGFwcGx5VGhlbWUobWVzc2FnZS50aGVtZSk7XG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJnZXRTdGF0dXNcIikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICBpc01kQm9vayxcbiAgICAgICAgICBjdXJyZW50VGhlbWU6IGdldEN1cnJlbnRNZEJvb2tUaGVtZSgpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhbmQgc2V0dXAgcmlnaHQgc2lkZWJhciBmb3IgcGFnZSBUT0NcbiAgICBmdW5jdGlvbiBzZXR1cFJpZ2h0U2lkZWJhcih0b2NTZWN0aW9uOiBFbGVtZW50KSB7XG4gICAgICBpZiAoIXRvY1NlY3Rpb24pIHJldHVybjtcblxuICAgICAgLy8gQ3JlYXRlIHJpZ2h0IHNpZGViYXIgY29udGFpbmVyXG4gICAgICBjb25zdCByaWdodFNpZGViYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibmF2XCIpO1xuICAgICAgcmlnaHRTaWRlYmFyLmlkID0gXCJyaWdodC1zaWRlYmFyXCI7XG4gICAgICByaWdodFNpZGViYXIuY2xhc3NOYW1lID0gXCJyaWdodC1zaWRlYmFyXCI7XG5cbiAgICAgIC8vIENyZWF0ZSBoZWFkZXJcbiAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJyaWdodC1zaWRlYmFyLWhlYWRlclwiO1xuICAgICAgaGVhZGVyLnRleHRDb250ZW50ID0gXCJPbiB0aGlzIHBhZ2VcIjtcbiAgICAgIHJpZ2h0U2lkZWJhci5hcHBlbmRDaGlsZChoZWFkZXIpO1xuXG4gICAgICAvLyBDbG9uZSBhbmQgbW92ZSB0aGUgc2VjdGlvblxuICAgICAgY29uc3QgY2xvbmVkU2VjdGlvbiA9IHRvY1NlY3Rpb24uY2xvbmVOb2RlKHRydWUpIGFzIEVsZW1lbnQ7XG4gICAgICBjbG9uZWRTZWN0aW9uLmNsYXNzTGlzdC5hZGQoXCJyaWdodC1zaWRlYmFyLXRvY1wiKTtcbiAgICAgIHJpZ2h0U2lkZWJhci5hcHBlbmRDaGlsZChjbG9uZWRTZWN0aW9uKTtcblxuICAgICAgLy8gSGlkZSBvcmlnaW5hbCBzZWN0aW9uIGluIGxlZnQgc2lkZWJhclxuICAgICAgKHRvY1NlY3Rpb24gYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgICAgcmV0dXJuIHJpZ2h0U2lkZWJhcjtcbiAgICB9XG5cbiAgICAvLyBNYWluIGluaXRpYWxpemF0aW9uXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIGlzTWRCb29rID0gY2hlY2tNZEJvb2tDb21tZW50KCk7XG4gICAgICBpZiAoaXNNZEJvb2spIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJlbmFibGVkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgaW5pdFRoZW1lKCk7XG5cbiAgICAgICAgY29uc3QgdWkgPSBjcmVhdGVJbnRlZ3JhdGVkVWkoY3R4LCB7XG4gICAgICAgICAgcG9zaXRpb246IFwiaW5saW5lXCIsXG4gICAgICAgICAgYW5jaG9yOiBcImRpdiNtZGJvb2stY29udGVudFwiLFxuICAgICAgICAgIG9uTW91bnQ6IChwYWdlV3JhcHBlcikgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoXywgb2JzKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgIFwiLnNpZGViYXIgb2wuY2hhcHRlciBkaXYub24tdGhpcy1wYWdlID4gb2wuc2VjdGlvblwiLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0U2lkZWJhciA9IHNldHVwUmlnaHRTaWRlYmFyKGVsZW1lbnQpITtcbiAgICAgICAgICAgICAgICBwYWdlV3JhcHBlci5hcHBlbmQocmlnaHRTaWRlYmFyKTtcbiAgICAgICAgICAgICAgICBwYWdlV3JhcHBlci5jbGFzc0xpc3QuYWRkKFwiaGFzLXJpZ2h0LXNpZGViYXJcIik7XG4gICAgICAgICAgICAgICAgb2JzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgdWkuYXV0b01vdW50KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3IgRE9NIHRvIGJlIHJlYWR5XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdCgpO1xuICAgIH1cbiAgfSxcbn0pO1xuIiwiaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gXCJ3eHQvYnJvd3NlclwiO1xuZXhwb3J0IGNsYXNzIFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIGNvbnN0cnVjdG9yKG5ld1VybCwgb2xkVXJsKSB7XG4gICAgc3VwZXIoV3h0TG9jYXRpb25DaGFuZ2VFdmVudC5FVkVOVF9OQU1FLCB7fSk7XG4gICAgdGhpcy5uZXdVcmwgPSBuZXdVcmw7XG4gICAgdGhpcy5vbGRVcmwgPSBvbGRVcmw7XG4gIH1cbiAgc3RhdGljIEVWRU5UX05BTUUgPSBnZXRVbmlxdWVFdmVudE5hbWUoXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0VW5pcXVlRXZlbnROYW1lKGV2ZW50TmFtZSkge1xuICByZXR1cm4gYCR7YnJvd3Nlcj8ucnVudGltZT8uaWR9OiR7aW1wb3J0Lm1ldGEuZW52LkVOVFJZUE9JTlR9OiR7ZXZlbnROYW1lfWA7XG59XG4iLCJpbXBvcnQgeyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50IH0gZnJvbSBcIi4vY3VzdG9tLWV2ZW50cy5tanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbldhdGNoZXIoY3R4KSB7XG4gIGxldCBpbnRlcnZhbDtcbiAgbGV0IG9sZFVybDtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBFbnN1cmUgdGhlIGxvY2F0aW9uIHdhdGNoZXIgaXMgYWN0aXZlbHkgbG9va2luZyBmb3IgVVJMIGNoYW5nZXMuIElmIGl0J3MgYWxyZWFkeSB3YXRjaGluZyxcbiAgICAgKiB0aGlzIGlzIGEgbm9vcC5cbiAgICAgKi9cbiAgICBydW4oKSB7XG4gICAgICBpZiAoaW50ZXJ2YWwgIT0gbnVsbCkgcmV0dXJuO1xuICAgICAgb2xkVXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgIGludGVydmFsID0gY3R4LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IG5ld1VybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICAgIGlmIChuZXdVcmwuaHJlZiAhPT0gb2xkVXJsLmhyZWYpIHtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgV3h0TG9jYXRpb25DaGFuZ2VFdmVudChuZXdVcmwsIG9sZFVybCkpO1xuICAgICAgICAgIG9sZFVybCA9IG5ld1VybDtcbiAgICAgICAgfVxuICAgICAgfSwgMWUzKTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwiLi4vdXRpbHMvaW50ZXJuYWwvbG9nZ2VyLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0VW5pcXVlRXZlbnROYW1lXG59IGZyb20gXCIuL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzXCI7XG5pbXBvcnQgeyBjcmVhdGVMb2NhdGlvbldhdGNoZXIgfSBmcm9tIFwiLi9pbnRlcm5hbC9sb2NhdGlvbi13YXRjaGVyLm1qc1wiO1xuZXhwb3J0IGNsYXNzIENvbnRlbnRTY3JpcHRDb250ZXh0IHtcbiAgY29uc3RydWN0b3IoY29udGVudFNjcmlwdE5hbWUsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmNvbnRlbnRTY3JpcHROYW1lID0gY29udGVudFNjcmlwdE5hbWU7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBpZiAodGhpcy5pc1RvcEZyYW1lKSB7XG4gICAgICB0aGlzLmxpc3RlbkZvck5ld2VyU2NyaXB0cyh7IGlnbm9yZUZpcnN0RXZlbnQ6IHRydWUgfSk7XG4gICAgICB0aGlzLnN0b3BPbGRTY3JpcHRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yTmV3ZXJTY3JpcHRzKCk7XG4gICAgfVxuICB9XG4gIHN0YXRpYyBTQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEUgPSBnZXRVbmlxdWVFdmVudE5hbWUoXG4gICAgXCJ3eHQ6Y29udGVudC1zY3JpcHQtc3RhcnRlZFwiXG4gICk7XG4gIGlzVG9wRnJhbWUgPSB3aW5kb3cuc2VsZiA9PT0gd2luZG93LnRvcDtcbiAgYWJvcnRDb250cm9sbGVyO1xuICBsb2NhdGlvbldhdGNoZXIgPSBjcmVhdGVMb2NhdGlvbldhdGNoZXIodGhpcyk7XG4gIHJlY2VpdmVkTWVzc2FnZUlkcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGdldCBzaWduYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLnNpZ25hbDtcbiAgfVxuICBhYm9ydChyZWFzb24pIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuYWJvcnQocmVhc29uKTtcbiAgfVxuICBnZXQgaXNJbnZhbGlkKCkge1xuICAgIGlmIChicm93c2VyLnJ1bnRpbWUuaWQgPT0gbnVsbCkge1xuICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zaWduYWwuYWJvcnRlZDtcbiAgfVxuICBnZXQgaXNWYWxpZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNJbnZhbGlkO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBjb250ZW50IHNjcmlwdCdzIGNvbnRleHQgaXMgaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lci5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihjYik7XG4gICAqIGNvbnN0IHJlbW92ZUludmFsaWRhdGVkTGlzdGVuZXIgPSBjdHgub25JbnZhbGlkYXRlZCgoKSA9PiB7XG4gICAqICAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5yZW1vdmVMaXN0ZW5lcihjYik7XG4gICAqIH0pXG4gICAqIC8vIC4uLlxuICAgKiByZW1vdmVJbnZhbGlkYXRlZExpc3RlbmVyKCk7XG4gICAqL1xuICBvbkludmFsaWRhdGVkKGNiKSB7XG4gICAgdGhpcy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGNiKTtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGNiKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IG5ldmVyIHJlc29sdmVzLiBVc2VmdWwgaWYgeW91IGhhdmUgYW4gYXN5bmMgZnVuY3Rpb24gdGhhdCBzaG91bGRuJ3QgcnVuXG4gICAqIGFmdGVyIHRoZSBjb250ZXh0IGlzIGV4cGlyZWQuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IGdldFZhbHVlRnJvbVN0b3JhZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAqICAgaWYgKGN0eC5pc0ludmFsaWQpIHJldHVybiBjdHguYmxvY2soKTtcbiAgICpcbiAgICogICAvLyAuLi5cbiAgICogfVxuICAgKi9cbiAgYmxvY2soKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5zZXRJbnRlcnZhbGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogSW50ZXJ2YWxzIGNhbiBiZSBjbGVhcmVkIGJ5IGNhbGxpbmcgdGhlIG5vcm1hbCBgY2xlYXJJbnRlcnZhbGAgZnVuY3Rpb24uXG4gICAqL1xuICBzZXRJbnRlcnZhbChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFySW50ZXJ2YWwoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0VGltZW91dGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogVGltZW91dHMgY2FuIGJlIGNsZWFyZWQgYnkgY2FsbGluZyB0aGUgbm9ybWFsIGBzZXRUaW1lb3V0YCBmdW5jdGlvbi5cbiAgICovXG4gIHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFyVGltZW91dChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIENhbGxiYWNrcyBjYW4gYmUgY2FuY2VsZWQgYnkgY2FsbGluZyB0aGUgbm9ybWFsIGBjYW5jZWxBbmltYXRpb25GcmFtZWAgZnVuY3Rpb24uXG4gICAqL1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spIHtcbiAgICBjb25zdCBpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgfSk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2tgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIENhbGxiYWNrcyBjYW4gYmUgY2FuY2VsZWQgYnkgY2FsbGluZyB0aGUgbm9ybWFsIGBjYW5jZWxJZGxlQ2FsbGJhY2tgIGZ1bmN0aW9uLlxuICAgKi9cbiAgcmVxdWVzdElkbGVDYWxsYmFjayhjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIGNvbnN0IGlkID0gcmVxdWVzdElkbGVDYWxsYmFjaygoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKCF0aGlzLnNpZ25hbC5hYm9ydGVkKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9LCBvcHRpb25zKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2FuY2VsSWRsZUNhbGxiYWNrKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGFkZEV2ZW50TGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGUgPT09IFwid3h0OmxvY2F0aW9uY2hhbmdlXCIpIHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIHRoaXMubG9jYXRpb25XYXRjaGVyLnJ1bigpO1xuICAgIH1cbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcj8uKFxuICAgICAgdHlwZS5zdGFydHNXaXRoKFwid3h0OlwiKSA/IGdldFVuaXF1ZUV2ZW50TmFtZSh0eXBlKSA6IHR5cGUsXG4gICAgICBoYW5kbGVyLFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBzaWduYWw6IHRoaXMuc2lnbmFsXG4gICAgICB9XG4gICAgKTtcbiAgfVxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqIEFib3J0IHRoZSBhYm9ydCBjb250cm9sbGVyIGFuZCBleGVjdXRlIGFsbCBgb25JbnZhbGlkYXRlZGAgbGlzdGVuZXJzLlxuICAgKi9cbiAgbm90aWZ5SW52YWxpZGF0ZWQoKSB7XG4gICAgdGhpcy5hYm9ydChcIkNvbnRlbnQgc2NyaXB0IGNvbnRleHQgaW52YWxpZGF0ZWRcIik7XG4gICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgYENvbnRlbnQgc2NyaXB0IFwiJHt0aGlzLmNvbnRlbnRTY3JpcHROYW1lfVwiIGNvbnRleHQgaW52YWxpZGF0ZWRgXG4gICAgKTtcbiAgfVxuICBzdG9wT2xkU2NyaXB0cygpIHtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRSxcbiAgICAgICAgY29udGVudFNjcmlwdE5hbWU6IHRoaXMuY29udGVudFNjcmlwdE5hbWUsXG4gICAgICAgIG1lc3NhZ2VJZDogTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICAgIH0sXG4gICAgICBcIipcIlxuICAgICk7XG4gIH1cbiAgdmVyaWZ5U2NyaXB0U3RhcnRlZEV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3QgaXNTY3JpcHRTdGFydGVkRXZlbnQgPSBldmVudC5kYXRhPy50eXBlID09PSBDb250ZW50U2NyaXB0Q29udGV4dC5TQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEU7XG4gICAgY29uc3QgaXNTYW1lQ29udGVudFNjcmlwdCA9IGV2ZW50LmRhdGE/LmNvbnRlbnRTY3JpcHROYW1lID09PSB0aGlzLmNvbnRlbnRTY3JpcHROYW1lO1xuICAgIGNvbnN0IGlzTm90RHVwbGljYXRlID0gIXRoaXMucmVjZWl2ZWRNZXNzYWdlSWRzLmhhcyhldmVudC5kYXRhPy5tZXNzYWdlSWQpO1xuICAgIHJldHVybiBpc1NjcmlwdFN0YXJ0ZWRFdmVudCAmJiBpc1NhbWVDb250ZW50U2NyaXB0ICYmIGlzTm90RHVwbGljYXRlO1xuICB9XG4gIGxpc3RlbkZvck5ld2VyU2NyaXB0cyhvcHRpb25zKSB7XG4gICAgbGV0IGlzRmlyc3QgPSB0cnVlO1xuICAgIGNvbnN0IGNiID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy52ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpKSB7XG4gICAgICAgIHRoaXMucmVjZWl2ZWRNZXNzYWdlSWRzLmFkZChldmVudC5kYXRhLm1lc3NhZ2VJZCk7XG4gICAgICAgIGNvbnN0IHdhc0ZpcnN0ID0gaXNGaXJzdDtcbiAgICAgICAgaXNGaXJzdCA9IGZhbHNlO1xuICAgICAgICBpZiAod2FzRmlyc3QgJiYgb3B0aW9ucz8uaWdub3JlRmlyc3RFdmVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm5vdGlmeUludmFsaWRhdGVkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBhZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYik7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IHJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJkZWZpbml0aW9uIiwiYnJvd3NlciIsIl9icm93c2VyIiwicHJpbnQiLCJsb2dnZXIiLCJyZXN1bHQiLCJyZW1vdmVEZXRlY3RvciIsIm1vdW50RGV0ZWN0b3IiXSwibWFwcGluZ3MiOiI7O0FBQU8sV0FBUyxvQkFBb0JBLGFBQVk7QUFDOUMsV0FBT0E7QUFBQSxF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QUFJLENBQUMsS0FBSyxPQUFPLFFBQVMsVUFBUyxHQUFHLElBQUk7QUFBQSxNQUM1QyxHQUFHLE9BQU87QUFDVixXQUFLLGNBQWMsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO0FBQy9DLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxpQkFBaUIsUUFBUSxNQUFNLFNBQVMsU0FBUztBQUMvQyxVQUFJLFNBQVMsc0JBQXNCO0FBQ2pDLFlBQUksS0FBSyxRQUFTLE1BQUssZ0JBQWdCLElBQUc7QUFBQSxNQUM1QztBQUNBLGFBQU87QUFBQSxRQUNMLEtBQUssV0FBVyxNQUFNLElBQUksbUJBQW1CLElBQUksSUFBSTtBQUFBLFFBQ3JEO0FBQUEsUUFDQTtBQUFBLFVBQ0UsR0FBRztBQUFBLFVBQ0gsUUFBUSxLQUFLO0FBQUEsUUFDckI7QUFBQSxNQUNBO0FBQUEsSUFDRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxvQkFBb0I7QUFDbEIsV0FBSyxNQUFNLG9DQUFvQztBQUMvQ0gsZUFBTztBQUFBLFFBQ0wsbUJBQW1CLEtBQUssaUJBQWlCO0FBQUEsTUFDL0M7QUFBQSxJQUNFO0FBQUEsSUFDQSxpQkFBaUI7QUFDZixhQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTSxxQkFBcUI7QUFBQSxVQUMzQixtQkFBbUIsS0FBSztBQUFBLFVBQ3hCLFdBQVcsS0FBSyxPQUFNLEVBQUcsU0FBUyxFQUFFLEVBQUUsTUFBTSxDQUFDO0FBQUEsUUFDckQ7QUFBQSxRQUNNO0FBQUEsTUFDTjtBQUFBLElBQ0U7QUFBQSxJQUNBLHlCQUF5QixPQUFPO0FBQzlCLFlBQU0sdUJBQXVCLE1BQU0sTUFBTSxTQUFTLHFCQUFxQjtBQUN2RSxZQUFNLHNCQUFzQixNQUFNLE1BQU0sc0JBQXNCLEtBQUs7QUFDbkUsWUFBTSxpQkFBaUIsQ0FBQyxLQUFLLG1CQUFtQixJQUFJLE1BQU0sTUFBTSxTQUFTO0FBQ3pFLGFBQU8sd0JBQXdCLHVCQUF1QjtBQUFBLElBQ3hEO0FBQUEsSUFDQSxzQkFBc0IsU0FBUztBQUM3QixVQUFJLFVBQVU7QUFDZCxZQUFNLEtBQUssQ0FBQyxVQUFVO0FBQ3BCLFlBQUksS0FBSyx5QkFBeUIsS0FBSyxHQUFHO0FBQ3hDLGVBQUssbUJBQW1CLElBQUksTUFBTSxLQUFLLFNBQVM7QUFDaEQsZ0JBQU0sV0FBVztBQUNqQixvQkFBVTtBQUNWLGNBQUksWUFBWSxTQUFTLGlCQUFrQjtBQUMzQyxlQUFLLGtCQUFpQjtBQUFBLFFBQ3hCO0FBQUEsTUFDRjtBQUNBLHVCQUFpQixXQUFXLEVBQUU7QUFDOUIsV0FBSyxjQUFjLE1BQU0sb0JBQW9CLFdBQVcsRUFBRSxDQUFDO0FBQUEsSUFDN0Q7QUFBQSxFQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzAsMSwyLDMsNCw1LDYsNyw4LDksMTIsMTMsMTRdfQ==
content;