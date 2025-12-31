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
  const mintlify = '/* Mintlify-inspired Light Theme for mdBook */\n:root {\n    --bg: #ffffff;\n    --fg: #0a0d0d;\n    --sidebar-bg: #f8faf9;\n    --sidebar-fg: #374151;\n    --sidebar-active: #166e3f;\n    --sidebar-active-bg: rgba(22, 110, 63, 0.1);\n    --sidebar-header-border-color: var(--sidebar-active);\n    --links: #166e3f;\n    --links-hover: #26bd6c;\n    --inline-code-bg: #f3f6f4;\n    --inline-code-color: rgba(238, 241, 239, 0.5);\n    --code-bg: #0a0d0d;\n    --code-fg: #e5e7eb;\n    --quote-bg: #f3f6f4;\n    --quote-border: #26bd6c;\n    --quote-block-border: rgb(16 185 129 / 0.2);\n    --quote-block-bg: rgb(236 253 245 / 0.5);\n    --table-border: #e5e7eb;\n    --table-header-bg: #f3f6f4;\n    --search-bg: #ffffff;\n    --search-border: #e5e7eb;\n    --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n    --scrollbar: #d1d5db;\n    --scrollbar-hover: #9ca3af;\n    --order-weight: 400;\n    --order-display: none;\n    --chapter-nav-display: none;\n    --sidebar-text-size: 16px;\n    --body-text-color: rgb(63, 65, 64);\n    --text-color: rgb(17, 24, 39);\n    --content-size: 36rem;\n    --root-font-size: 18px;\n    --mono-font:\n        "Geist Mono", "Menlo", "Monaco", "Lucida Console", "Liberation Mono",\n        "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace;\n    font-size: var(--root-font-size);\n}\n\n:not(pre) > code.hljs {\n    background-color: var(--inline-code-color);\n    color: var(--text-color);\n    font-weight: 500;\n    box-sizing: border-box;\n    padding: 0.125rem 0.5rem;\n    margin: 0 0.125rem;\n}\n\nhtml {\n    font-family:\n        "Inter",\n        -apple-system,\n        BlinkMacSystemFont,\n        "Segoe UI",\n        Roboto,\n        sans-serif;\n    background: var(--bg);\n    color: var(--text-color);\n    height: 100dvh;\n}\n\nbody {\n    background: var(--bg);\n    color: var(--body-text-color);\n    font-size: inherit;\n}\n\nnav.nav-wide-wrapper a.nav-chapters {\n    display: var(--chapter-nav-display);\n}\n\n/* Sidebar */\n.sidebar {\n    background: var(--sidebar-bg);\n    border-right: 1px solid var(--table-border);\n}\n\n.sidebar .sidebar-scrollbox {\n    background: var(--sidebar-bg);\n}\n\nli.chapter-item:not(:has(span.chapter-link-wrapper)) a,\nspan.chapter-link-wrapper a {\n    display: block;\n    width: 100%;\n    height: 100%;\n}\nli.chapter-item:not(:has(span.chapter-link-wrapper)),\nspan.chapter-link-wrapper {\n    cursor: pointer;\n    color: var(--sidebar-fg);\n    padding: 4px 16px;\n    border-radius: 8px;\n    transition: all 0.15s ease;\n    font-size: var(--sidebar-text-size);\n}\n\n/*.sidebar ol.chapter > li.chapter-item > span.chapter-link-wrapper {\n    font-weight: bold;\n}*/\n\n/*.sidebar ol.chapter li .chapter-item.expanded > a,*/\nli.chapter-item:not(:has(span.chapter-link-wrapper)):hover,\nli.chapter-item:not(:has(span.chapter-link-wrapper)):has(a.active),\nspan.chapter-link-wrapper:has(a.active),\nspan.chapter-link-wrapper:hover {\n    background: var(--sidebar-active-bg);\n    color: var(--sidebar-active);\n    text-decoration: none;\n}\n\n/* Typography */\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n    color: var(--fg);\n    font-weight: 600;\n    margin-top: 2em;\n    margin-bottom: 0.5em;\n    line-height: 1.3;\n}\n\nh1.menu-title {\n    font-size: 1.75em;\n    margin-top: 0;\n}\nh2 {\n    font-size: 1.5em;\n    border-bottom: 1px solid var(--table-border);\n    padding-bottom: 0.5em;\n}\nh3 {\n    font-size: 1.25em;\n}\nh4 {\n    font-size: 1em;\n}\n\np {\n    line-height: 1.75;\n    margin: 1em 0;\n}\n\n/* Links */\na {\n    color: var(--links);\n    text-decoration: none;\n    transition: color 0.15s ease;\n}\n\na:hover {\n    color: var(--links-hover);\n    text-decoration: underline;\n}\n\n/* Code */\ncode {\n    font-family: "Geist Mono", "Fira Code", "JetBrains Mono", monospace;\n    font-size: 0.875em;\n}\n\nstrong {\n    display: var(--order-display);\n    font-weight: var(--order-weight);\n}\n\n:not(pre) > code {\n    background: var(--inline-code-bg);\n    padding: 0.2em 0.4em;\n    border-radius: 6px;\n    color: var(--sidebar-active);\n}\n\npre {\n    background: var(--code-bg) !important;\n    color: var(--code-fg);\n    padding: 16px 20px;\n    border-radius: 12px;\n    overflow-x: auto;\n    margin: 1.5em 0;\n    border: 1px solid rgba(255, 255, 255, 0.1);\n}\n\npre code {\n    background: transparent;\n    padding: 0;\n    color: inherit;\n}\n\n/* Blockquotes */\nsection[aria-role="note"],\nblockquote {\n    background: var(--quote-block-bg);\n    border: 1px solid var(--quote-block-border);\n    margin: 1.5em 0;\n    padding: 1rem 1.25rem;\n    border-radius: 1rem;\n}\n\n:is(blockquote, section[aria-role="note"]) p {\n    margin: 0;\n}\n:is(blockquote, section[aria-role="note"]) h1,\n:is(blockquote, section[aria-role="note"]) h2,\n:is(blockquote, section[aria-role="note"]) h3,\n:is(blockquote, section[aria-role="note"]) h4,\n:is(blockquote, section[aria-role="note"]) h5 {\n    margin: 0;\n    margin-bottom: 1em;\n}\n\n/* Tables */\ntable {\n    border-collapse: collapse;\n    width: 100%;\n    margin: 1.5em 0;\n    border-radius: 12px;\n    overflow: hidden;\n    border: 1px solid var(--table-border);\n}\n\nth {\n    background: var(--table-header-bg);\n    font-weight: 600;\n    text-align: left;\n}\n\nth,\ntd {\n    padding: 12px 16px;\n    border-bottom: 1px solid var(--table-border);\n}\n\ntr:last-child td {\n    border-bottom: none;\n}\n\n/* Menu bar */\n#menu-bar {\n    background: var(--bg);\n    border-bottom: 1px solid var(--table-border);\n}\n\n#menu-bar i {\n    color: var(--fg);\n}\n\n/* Search */\n#searchbar {\n    background: var(--search-bg);\n    border: 1px solid var(--search-border);\n    box-shadow: var(--searchbar-shadow);\n    border-radius: 8px;\n    padding: 8px 12px;\n}\n\n/* Navigation buttons */\n.nav-chapters {\n    color: var(--links);\n    opacity: 0.8;\n    transition: opacity 0.15s ease;\n}\n\n.nav-chapters:hover {\n    color: var(--links-hover);\n    opacity: 1;\n}\n\n/* Scrollbar */\n::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n\n::-webkit-scrollbar-track {\n    background: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n    background: var(--scrollbar);\n    border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n    background: var(--scrollbar-hover);\n}\n\n/* Theme toggle */\n#theme-list {\n    background: var(--sidebar-bg);\n    border: 1px solid var(--table-border);\n    border-radius: 8px;\n}\n\n#theme-list li {\n    color: var(--fg);\n}\n\n#theme-list li:hover {\n    background: var(--sidebar-active-bg);\n}\n\ndiv#mdbook-menu-bar,\ndiv#mdbook-menu-bar-hover-placeholder {\n    box-sizing: border-box;\n    padding: 1rem 0;\n}\n\ndiv#mdbook-content,\ndiv#content {\n    max-height: calc(100vh - 80px);\n    box-sizing: border-box;\n    padding: 2rem 4rem;\n    display: grid;\n    grid-template-columns: var(--content-size) 28rem;\n    justify-content: center;\n    gap: 3rem;\n    overflow-y: auto;\n    scroll-behavior: smooth;\n}\n\n:is(div#mdbook-content, div#content) p {\n    line-height: 1.75;\n}\n\n:is(div#mdbook-content, div#content) main {\n    max-width: 100%;\n    /*letter-spacing: 0.5px;*/\n}\n\n:is(div#mdbook-content, div#content) main a.header:hover,\n:is(div#mdbook-content, div#content) main a {\n    font-weight: 600;\n    color: var(--text-color);\n    border-bottom: 1px solid var(--text-color);\n    text-decoration: none;\n}\n:is(div#mdbook-content, div#content) main a:hover {\n    border-bottom-width: 2px;\n}\n\n:is(div#mdbook-content, div#content) main a.header {\n    border-bottom: none;\n}\n\n/* Right Sidebar (TOC) */\n.page-wrapper.has-right-sidebar {\n    display: grid;\n    grid-template-columns: auto 1fr 220px;\n}\n\n.right-sidebar {\n    position: sticky;\n    top: 60px;\n    right: 0px;\n    height: fit-content;\n    max-height: calc(100vh - 8px);\n    overflow-y: auto;\n    border-left: 1px solid var(--table-border);\n    background: var(--bg);\n    margin-left: 2.5rem;\n    padding-left: 1rem;\n}\n\n.right-sidebar-header {\n    color: var(--sidebar-fg);\n    margin-bottom: 12px;\n    padding-left: 8px;\n}\n\n.right-sidebar-toc {\n    list-style: none;\n    padding: 0;\n    margin: 0;\n}\n\n.right-sidebar-toc ol {\n    list-style: none;\n    padding-left: 12px;\n    margin: 0;\n}\n\n.right-sidebar-toc li {\n    margin: 0;\n}\n\n/* Adjust content width when right sidebar exists */\n.page-wrapper.has-right-sidebar .content {\n    max-width: 100%;\n}\n\n/* Hide right sidebar on small screens */\n@media (max-width: 1100px) {\n    .page-wrapper.has-right-sidebar {\n        grid-template-columns: auto 1fr;\n    }\n\n    .right-sidebar {\n        display: none;\n    }\n}\n';
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
          const { mdbookTheme, enabled } = await browser.storage.local.get(
            localConfig
          );
          if (!enabled) {
            return;
          }
          const theme = mdbookTheme || "mintlify";
          if (ALL_THEMES.includes(theme)) {
            applyTheme(theme);
          }
        } catch (e) {
          applyTheme("mintlify");
        }
      }
      browser.runtime.onMessage.addListener((message, _, sendResponse) => {
        if (message.type === "setTheme" && ALL_THEMES.includes(message.theme)) {
          applyTheme(message.theme);
        } else if (message.type === "getStatus") {
          sendResponse({
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
          localStorage.setItem("enabled", "false");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHd4dC1kZXYrYnJvd3NlckAwLjEuMzIvbm9kZV9tb2R1bGVzL0B3eHQtZGV2L2Jyb3dzZXIvc3JjL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyLm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9tYW55LWtleXMtbWFwQDIuMC4xL25vZGVfbW9kdWxlcy9tYW55LWtleXMtbWFwL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RlZnVANi4xLjQvbm9kZV9tb2R1bGVzL2RlZnUvZGlzdC9kZWZ1Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AMW5hdHN1K3dhaXQtZWxlbWVudEA0LjEuMi9ub2RlX21vZHVsZXMvQDFuYXRzdS93YWl0LWVsZW1lbnQvZGlzdC9kZXRlY3RvcnMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0AxbmF0c3Urd2FpdC1lbGVtZW50QDQuMS4yL25vZGVfbW9kdWxlcy9AMW5hdHN1L3dhaXQtZWxlbWVudC9kaXN0L2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LXVpL3NoYXJlZC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvY29udGVudC1zY3JpcHQtdWkvaW50ZWdyYXRlZC5tanMiLCIuLi8uLi8uLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LmNzcz9yYXciLCIuLi8uLi8uLi9lbnRyeXBvaW50cy9jb250ZW50LnRzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIF9icm93c2VyIH0gZnJvbSBcIkB3eHQtZGV2L2Jyb3dzZXJcIjtcbmV4cG9ydCBjb25zdCBicm93c2VyID0gX2Jyb3dzZXI7XG5leHBvcnQge307XG4iLCJjb25zdCBudWxsS2V5ID0gU3ltYm9sKCdudWxsJyk7IC8vIGBvYmplY3RIYXNoZXNgIGtleSBmb3IgbnVsbFxuXG5sZXQga2V5Q291bnRlciA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hbnlLZXlzTWFwIGV4dGVuZHMgTWFwIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX29iamVjdEhhc2hlcyA9IG5ldyBXZWFrTWFwKCk7XG5cdFx0dGhpcy5fc3ltYm9sSGFzaGVzID0gbmV3IE1hcCgpOyAvLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9lY21hMjYyL2lzc3Vlcy8xMTk0XG5cdFx0dGhpcy5fcHVibGljS2V5cyA9IG5ldyBNYXAoKTtcblxuXHRcdGNvbnN0IFtwYWlyc10gPSBhcmd1bWVudHM7IC8vIE1hcCBjb21wYXRcblx0XHRpZiAocGFpcnMgPT09IG51bGwgfHwgcGFpcnMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgcGFpcnNbU3ltYm9sLml0ZXJhdG9yXSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcih0eXBlb2YgcGFpcnMgKyAnIGlzIG5vdCBpdGVyYWJsZSAoY2Fubm90IHJlYWQgcHJvcGVydHkgU3ltYm9sKFN5bWJvbC5pdGVyYXRvcikpJyk7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBba2V5cywgdmFsdWVdIG9mIHBhaXJzKSB7XG5cdFx0XHR0aGlzLnNldChrZXlzLCB2YWx1ZSk7XG5cdFx0fVxuXHR9XG5cblx0X2dldFB1YmxpY0tleXMoa2V5cywgY3JlYXRlID0gZmFsc2UpIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoa2V5cykpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBrZXlzIHBhcmFtZXRlciBtdXN0IGJlIGFuIGFycmF5Jyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJpdmF0ZUtleSA9IHRoaXMuX2dldFByaXZhdGVLZXkoa2V5cywgY3JlYXRlKTtcblxuXHRcdGxldCBwdWJsaWNLZXk7XG5cdFx0aWYgKHByaXZhdGVLZXkgJiYgdGhpcy5fcHVibGljS2V5cy5oYXMocHJpdmF0ZUtleSkpIHtcblx0XHRcdHB1YmxpY0tleSA9IHRoaXMuX3B1YmxpY0tleXMuZ2V0KHByaXZhdGVLZXkpO1xuXHRcdH0gZWxzZSBpZiAoY3JlYXRlKSB7XG5cdFx0XHRwdWJsaWNLZXkgPSBbLi4ua2V5c107IC8vIFJlZ2VuZXJhdGUga2V5cyBhcnJheSB0byBhdm9pZCBleHRlcm5hbCBpbnRlcmFjdGlvblxuXHRcdFx0dGhpcy5fcHVibGljS2V5cy5zZXQocHJpdmF0ZUtleSwgcHVibGljS2V5KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge3ByaXZhdGVLZXksIHB1YmxpY0tleX07XG5cdH1cblxuXHRfZ2V0UHJpdmF0ZUtleShrZXlzLCBjcmVhdGUgPSBmYWxzZSkge1xuXHRcdGNvbnN0IHByaXZhdGVLZXlzID0gW107XG5cdFx0Zm9yIChsZXQga2V5IG9mIGtleXMpIHtcblx0XHRcdGlmIChrZXkgPT09IG51bGwpIHtcblx0XHRcdFx0a2V5ID0gbnVsbEtleTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgaGFzaGVzID0gdHlwZW9mIGtleSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIGtleSA9PT0gJ2Z1bmN0aW9uJyA/ICdfb2JqZWN0SGFzaGVzJyA6ICh0eXBlb2Yga2V5ID09PSAnc3ltYm9sJyA/ICdfc3ltYm9sSGFzaGVzJyA6IGZhbHNlKTtcblxuXHRcdFx0aWYgKCFoYXNoZXMpIHtcblx0XHRcdFx0cHJpdmF0ZUtleXMucHVzaChrZXkpO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzW2hhc2hlc10uaGFzKGtleSkpIHtcblx0XHRcdFx0cHJpdmF0ZUtleXMucHVzaCh0aGlzW2hhc2hlc10uZ2V0KGtleSkpO1xuXHRcdFx0fSBlbHNlIGlmIChjcmVhdGUpIHtcblx0XHRcdFx0Y29uc3QgcHJpdmF0ZUtleSA9IGBAQG1rbS1yZWYtJHtrZXlDb3VudGVyKyt9QEBgO1xuXHRcdFx0XHR0aGlzW2hhc2hlc10uc2V0KGtleSwgcHJpdmF0ZUtleSk7XG5cdFx0XHRcdHByaXZhdGVLZXlzLnB1c2gocHJpdmF0ZUtleSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHByaXZhdGVLZXlzKTtcblx0fVxuXG5cdHNldChrZXlzLCB2YWx1ZSkge1xuXHRcdGNvbnN0IHtwdWJsaWNLZXl9ID0gdGhpcy5fZ2V0UHVibGljS2V5cyhrZXlzLCB0cnVlKTtcblx0XHRyZXR1cm4gc3VwZXIuc2V0KHB1YmxpY0tleSwgdmFsdWUpO1xuXHR9XG5cblx0Z2V0KGtleXMpIHtcblx0XHRjb25zdCB7cHVibGljS2V5fSA9IHRoaXMuX2dldFB1YmxpY0tleXMoa2V5cyk7XG5cdFx0cmV0dXJuIHN1cGVyLmdldChwdWJsaWNLZXkpO1xuXHR9XG5cblx0aGFzKGtleXMpIHtcblx0XHRjb25zdCB7cHVibGljS2V5fSA9IHRoaXMuX2dldFB1YmxpY0tleXMoa2V5cyk7XG5cdFx0cmV0dXJuIHN1cGVyLmhhcyhwdWJsaWNLZXkpO1xuXHR9XG5cblx0ZGVsZXRlKGtleXMpIHtcblx0XHRjb25zdCB7cHVibGljS2V5LCBwcml2YXRlS2V5fSA9IHRoaXMuX2dldFB1YmxpY0tleXMoa2V5cyk7XG5cdFx0cmV0dXJuIEJvb2xlYW4ocHVibGljS2V5ICYmIHN1cGVyLmRlbGV0ZShwdWJsaWNLZXkpICYmIHRoaXMuX3B1YmxpY0tleXMuZGVsZXRlKHByaXZhdGVLZXkpKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHN1cGVyLmNsZWFyKCk7XG5cdFx0dGhpcy5fc3ltYm9sSGFzaGVzLmNsZWFyKCk7XG5cdFx0dGhpcy5fcHVibGljS2V5cy5jbGVhcigpO1xuXHR9XG5cblx0Z2V0IFtTeW1ib2wudG9TdHJpbmdUYWddKCkge1xuXHRcdHJldHVybiAnTWFueUtleXNNYXAnO1xuXHR9XG5cblx0Z2V0IHNpemUoKSB7XG5cdFx0cmV0dXJuIHN1cGVyLnNpemU7XG5cdH1cbn1cbiIsImZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpO1xuICBpZiAocHJvdG90eXBlICE9PSBudWxsICYmIHByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG90eXBlKSAhPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIHZhbHVlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChTeW1ib2wudG9TdHJpbmdUYWcgaW4gdmFsdWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IE1vZHVsZV1cIjtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gX2RlZnUoYmFzZU9iamVjdCwgZGVmYXVsdHMsIG5hbWVzcGFjZSA9IFwiLlwiLCBtZXJnZXIpIHtcbiAgaWYgKCFpc1BsYWluT2JqZWN0KGRlZmF1bHRzKSkge1xuICAgIHJldHVybiBfZGVmdShiYXNlT2JqZWN0LCB7fSwgbmFtZXNwYWNlLCBtZXJnZXIpO1xuICB9XG4gIGNvbnN0IG9iamVjdCA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzKTtcbiAgZm9yIChjb25zdCBrZXkgaW4gYmFzZU9iamVjdCkge1xuICAgIGlmIChrZXkgPT09IFwiX19wcm90b19fXCIgfHwga2V5ID09PSBcImNvbnN0cnVjdG9yXCIpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IGJhc2VPYmplY3Rba2V5XTtcbiAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChtZXJnZXIgJiYgbWVyZ2VyKG9iamVjdCwga2V5LCB2YWx1ZSwgbmFtZXNwYWNlKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiBBcnJheS5pc0FycmF5KG9iamVjdFtrZXldKSkge1xuICAgICAgb2JqZWN0W2tleV0gPSBbLi4udmFsdWUsIC4uLm9iamVjdFtrZXldXTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpICYmIGlzUGxhaW5PYmplY3Qob2JqZWN0W2tleV0pKSB7XG4gICAgICBvYmplY3Rba2V5XSA9IF9kZWZ1KFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgb2JqZWN0W2tleV0sXG4gICAgICAgIChuYW1lc3BhY2UgPyBgJHtuYW1lc3BhY2V9LmAgOiBcIlwiKSArIGtleS50b1N0cmluZygpLFxuICAgICAgICBtZXJnZXJcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5mdW5jdGlvbiBjcmVhdGVEZWZ1KG1lcmdlcikge1xuICByZXR1cm4gKC4uLmFyZ3VtZW50c18pID0+IChcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9uby1hcnJheS1yZWR1Y2VcbiAgICBhcmd1bWVudHNfLnJlZHVjZSgocCwgYykgPT4gX2RlZnUocCwgYywgXCJcIiwgbWVyZ2VyKSwge30pXG4gICk7XG59XG5jb25zdCBkZWZ1ID0gY3JlYXRlRGVmdSgpO1xuY29uc3QgZGVmdUZuID0gY3JlYXRlRGVmdSgob2JqZWN0LCBrZXksIGN1cnJlbnRWYWx1ZSkgPT4ge1xuICBpZiAob2JqZWN0W2tleV0gIT09IHZvaWQgMCAmJiB0eXBlb2YgY3VycmVudFZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBvYmplY3Rba2V5XSA9IGN1cnJlbnRWYWx1ZShvYmplY3Rba2V5XSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuY29uc3QgZGVmdUFycmF5Rm4gPSBjcmVhdGVEZWZ1KChvYmplY3QsIGtleSwgY3VycmVudFZhbHVlKSA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KG9iamVjdFtrZXldKSAmJiB0eXBlb2YgY3VycmVudFZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBvYmplY3Rba2V5XSA9IGN1cnJlbnRWYWx1ZShvYmplY3Rba2V5XSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn0pO1xuXG5leHBvcnQgeyBjcmVhdGVEZWZ1LCBkZWZ1IGFzIGRlZmF1bHQsIGRlZnUsIGRlZnVBcnJheUZuLCBkZWZ1Rm4gfTtcbiIsImNvbnN0IGlzRXhpc3QgPSAoZWxlbWVudCkgPT4ge1xuICByZXR1cm4gZWxlbWVudCAhPT0gbnVsbCA/IHsgaXNEZXRlY3RlZDogdHJ1ZSwgcmVzdWx0OiBlbGVtZW50IH0gOiB7IGlzRGV0ZWN0ZWQ6IGZhbHNlIH07XG59O1xuY29uc3QgaXNOb3RFeGlzdCA9IChlbGVtZW50KSA9PiB7XG4gIHJldHVybiBlbGVtZW50ID09PSBudWxsID8geyBpc0RldGVjdGVkOiB0cnVlLCByZXN1bHQ6IG51bGwgfSA6IHsgaXNEZXRlY3RlZDogZmFsc2UgfTtcbn07XG5cbmV4cG9ydCB7IGlzRXhpc3QsIGlzTm90RXhpc3QgfTtcbiIsImltcG9ydCBNYW55S2V5c01hcCBmcm9tICdtYW55LWtleXMtbWFwJztcbmltcG9ydCB7IGRlZnUgfSBmcm9tICdkZWZ1JztcbmltcG9ydCB7IGlzRXhpc3QgfSBmcm9tICcuL2RldGVjdG9ycy5tanMnO1xuXG5jb25zdCBnZXREZWZhdWx0T3B0aW9ucyA9ICgpID0+ICh7XG4gIHRhcmdldDogZ2xvYmFsVGhpcy5kb2N1bWVudCxcbiAgdW5pZnlQcm9jZXNzOiB0cnVlLFxuICBkZXRlY3RvcjogaXNFeGlzdCxcbiAgb2JzZXJ2ZUNvbmZpZ3M6IHtcbiAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVzOiB0cnVlXG4gIH0sXG4gIHNpZ25hbDogdm9pZCAwLFxuICBjdXN0b21NYXRjaGVyOiB2b2lkIDBcbn0pO1xuY29uc3QgbWVyZ2VPcHRpb25zID0gKHVzZXJTaWRlT3B0aW9ucywgZGVmYXVsdE9wdGlvbnMpID0+IHtcbiAgcmV0dXJuIGRlZnUodXNlclNpZGVPcHRpb25zLCBkZWZhdWx0T3B0aW9ucyk7XG59O1xuXG5jb25zdCB1bmlmeUNhY2hlID0gbmV3IE1hbnlLZXlzTWFwKCk7XG5mdW5jdGlvbiBjcmVhdGVXYWl0RWxlbWVudChpbnN0YW5jZU9wdGlvbnMpIHtcbiAgY29uc3QgeyBkZWZhdWx0T3B0aW9ucyB9ID0gaW5zdGFuY2VPcHRpb25zO1xuICByZXR1cm4gKHNlbGVjdG9yLCBvcHRpb25zKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgdGFyZ2V0LFxuICAgICAgdW5pZnlQcm9jZXNzLFxuICAgICAgb2JzZXJ2ZUNvbmZpZ3MsXG4gICAgICBkZXRlY3RvcixcbiAgICAgIHNpZ25hbCxcbiAgICAgIGN1c3RvbU1hdGNoZXJcbiAgICB9ID0gbWVyZ2VPcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKTtcbiAgICBjb25zdCB1bmlmeVByb21pc2VLZXkgPSBbXG4gICAgICBzZWxlY3RvcixcbiAgICAgIHRhcmdldCxcbiAgICAgIHVuaWZ5UHJvY2VzcyxcbiAgICAgIG9ic2VydmVDb25maWdzLFxuICAgICAgZGV0ZWN0b3IsXG4gICAgICBzaWduYWwsXG4gICAgICBjdXN0b21NYXRjaGVyXG4gICAgXTtcbiAgICBjb25zdCBjYWNoZWRQcm9taXNlID0gdW5pZnlDYWNoZS5nZXQodW5pZnlQcm9taXNlS2V5KTtcbiAgICBpZiAodW5pZnlQcm9jZXNzICYmIGNhY2hlZFByb21pc2UpIHtcbiAgICAgIHJldHVybiBjYWNoZWRQcm9taXNlO1xuICAgIH1cbiAgICBjb25zdCBkZXRlY3RQcm9taXNlID0gbmV3IFByb21pc2UoXG4gICAgICAvLyBiaW9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vQXN5bmNQcm9taXNlRXhlY3V0b3I6IGF2b2lkIG5lc3RpbmcgcHJvbWlzZVxuICAgICAgYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChzaWduYWwucmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKFxuICAgICAgICAgIGFzeW5jIChtdXRhdGlvbnMpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgXyBvZiBtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgICAgaWYgKHNpZ25hbD8uYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb25zdCBkZXRlY3RSZXN1bHQyID0gYXdhaXQgZGV0ZWN0RWxlbWVudCh7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAgICAgIGRldGVjdG9yLFxuICAgICAgICAgICAgICAgIGN1c3RvbU1hdGNoZXJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChkZXRlY3RSZXN1bHQyLmlzRGV0ZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShkZXRlY3RSZXN1bHQyLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHNpZ25hbD8uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcImFib3J0XCIsXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChzaWduYWwucmVhc29uKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgb25jZTogdHJ1ZSB9XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGRldGVjdFJlc3VsdCA9IGF3YWl0IGRldGVjdEVsZW1lbnQoe1xuICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICBkZXRlY3RvcixcbiAgICAgICAgICBjdXN0b21NYXRjaGVyXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZGV0ZWN0UmVzdWx0LmlzRGV0ZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShkZXRlY3RSZXN1bHQucmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRhcmdldCwgb2JzZXJ2ZUNvbmZpZ3MpO1xuICAgICAgfVxuICAgICkuZmluYWxseSgoKSA9PiB7XG4gICAgICB1bmlmeUNhY2hlLmRlbGV0ZSh1bmlmeVByb21pc2VLZXkpO1xuICAgIH0pO1xuICAgIHVuaWZ5Q2FjaGUuc2V0KHVuaWZ5UHJvbWlzZUtleSwgZGV0ZWN0UHJvbWlzZSk7XG4gICAgcmV0dXJuIGRldGVjdFByb21pc2U7XG4gIH07XG59XG5hc3luYyBmdW5jdGlvbiBkZXRlY3RFbGVtZW50KHtcbiAgdGFyZ2V0LFxuICBzZWxlY3RvcixcbiAgZGV0ZWN0b3IsXG4gIGN1c3RvbU1hdGNoZXJcbn0pIHtcbiAgY29uc3QgZWxlbWVudCA9IGN1c3RvbU1hdGNoZXIgPyBjdXN0b21NYXRjaGVyKHNlbGVjdG9yKSA6IHRhcmdldC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgcmV0dXJuIGF3YWl0IGRldGVjdG9yKGVsZW1lbnQpO1xufVxuY29uc3Qgd2FpdEVsZW1lbnQgPSBjcmVhdGVXYWl0RWxlbWVudCh7XG4gIGRlZmF1bHRPcHRpb25zOiBnZXREZWZhdWx0T3B0aW9ucygpXG59KTtcblxuZXhwb3J0IHsgY3JlYXRlV2FpdEVsZW1lbnQsIGdldERlZmF1bHRPcHRpb25zLCB3YWl0RWxlbWVudCB9O1xuIiwiZnVuY3Rpb24gcHJpbnQobWV0aG9kLCAuLi5hcmdzKSB7XG4gIGlmIChpbXBvcnQubWV0YS5lbnYuTU9ERSA9PT0gXCJwcm9kdWN0aW9uXCIpIHJldHVybjtcbiAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGFyZ3Muc2hpZnQoKTtcbiAgICBtZXRob2QoYFt3eHRdICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBtZXRob2QoXCJbd3h0XVwiLCAuLi5hcmdzKTtcbiAgfVxufVxuZXhwb3J0IGNvbnN0IGxvZ2dlciA9IHtcbiAgZGVidWc6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmRlYnVnLCAuLi5hcmdzKSxcbiAgbG9nOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5sb2csIC4uLmFyZ3MpLFxuICB3YXJuOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS53YXJuLCAuLi5hcmdzKSxcbiAgZXJyb3I6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmVycm9yLCAuLi5hcmdzKVxufTtcbiIsImltcG9ydCB7IHdhaXRFbGVtZW50IH0gZnJvbSBcIkAxbmF0c3Uvd2FpdC1lbGVtZW50XCI7XG5pbXBvcnQge1xuICBpc0V4aXN0IGFzIG1vdW50RGV0ZWN0b3IsXG4gIGlzTm90RXhpc3QgYXMgcmVtb3ZlRGV0ZWN0b3Jcbn0gZnJvbSBcIkAxbmF0c3Uvd2FpdC1lbGVtZW50L2RldGVjdG9yc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2ludGVybmFsL2xvZ2dlci5tanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBvc2l0aW9uKHJvb3QsIHBvc2l0aW9uZWRFbGVtZW50LCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLnBvc2l0aW9uID09PSBcImlubGluZVwiKSByZXR1cm47XG4gIGlmIChvcHRpb25zLnpJbmRleCAhPSBudWxsKSByb290LnN0eWxlLnpJbmRleCA9IFN0cmluZyhvcHRpb25zLnpJbmRleCk7XG4gIHJvb3Quc3R5bGUub3ZlcmZsb3cgPSBcInZpc2libGVcIjtcbiAgcm9vdC5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcbiAgcm9vdC5zdHlsZS53aWR0aCA9IFwiMFwiO1xuICByb290LnN0eWxlLmhlaWdodCA9IFwiMFwiO1xuICByb290LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gIGlmIChwb3NpdGlvbmVkRWxlbWVudCkge1xuICAgIGlmIChvcHRpb25zLnBvc2l0aW9uID09PSBcIm92ZXJsYXlcIikge1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICBpZiAob3B0aW9ucy5hbGlnbm1lbnQ/LnN0YXJ0c1dpdGgoXCJib3R0b20tXCIpKVxuICAgICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5ib3R0b20gPSBcIjBcIjtcbiAgICAgIGVsc2UgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUudG9wID0gXCIwXCI7XG4gICAgICBpZiAob3B0aW9ucy5hbGlnbm1lbnQ/LmVuZHNXaXRoKFwiLXJpZ2h0XCIpKVxuICAgICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5yaWdodCA9IFwiMFwiO1xuICAgICAgZWxzZSBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5sZWZ0ID0gXCIwXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gXCJmaXhlZFwiO1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUudG9wID0gXCIwXCI7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5ib3R0b20gPSBcIjBcIjtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnJpZ2h0ID0gXCIwXCI7XG4gICAgfVxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5jaG9yKG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuYW5jaG9yID09IG51bGwpIHJldHVybiBkb2N1bWVudC5ib2R5O1xuICBsZXQgcmVzb2x2ZWQgPSB0eXBlb2Ygb3B0aW9ucy5hbmNob3IgPT09IFwiZnVuY3Rpb25cIiA/IG9wdGlvbnMuYW5jaG9yKCkgOiBvcHRpb25zLmFuY2hvcjtcbiAgaWYgKHR5cGVvZiByZXNvbHZlZCA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmIChyZXNvbHZlZC5zdGFydHNXaXRoKFwiL1wiKSkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZG9jdW1lbnQuZXZhbHVhdGUoXG4gICAgICAgIHJlc29sdmVkLFxuICAgICAgICBkb2N1bWVudCxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgWFBhdGhSZXN1bHQuRklSU1RfT1JERVJFRF9OT0RFX1RZUEUsXG4gICAgICAgIG51bGxcbiAgICAgICk7XG4gICAgICByZXR1cm4gcmVzdWx0LnNpbmdsZU5vZGVWYWx1ZSA/PyB2b2lkIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHJlc29sdmVkKSA/PyB2b2lkIDA7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXNvbHZlZCA/PyB2b2lkIDA7XG59XG5leHBvcnQgZnVuY3Rpb24gbW91bnRVaShyb290LCBvcHRpb25zKSB7XG4gIGNvbnN0IGFuY2hvciA9IGdldEFuY2hvcihvcHRpb25zKTtcbiAgaWYgKGFuY2hvciA9PSBudWxsKVxuICAgIHRocm93IEVycm9yKFxuICAgICAgXCJGYWlsZWQgdG8gbW91bnQgY29udGVudCBzY3JpcHQgVUk6IGNvdWxkIG5vdCBmaW5kIGFuY2hvciBlbGVtZW50XCJcbiAgICApO1xuICBzd2l0Y2ggKG9wdGlvbnMuYXBwZW5kKSB7XG4gICAgY2FzZSB2b2lkIDA6XG4gICAgY2FzZSBcImxhc3RcIjpcbiAgICAgIGFuY2hvci5hcHBlbmQocm9vdCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZmlyc3RcIjpcbiAgICAgIGFuY2hvci5wcmVwZW5kKHJvb3QpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInJlcGxhY2VcIjpcbiAgICAgIGFuY2hvci5yZXBsYWNlV2l0aChyb290KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJhZnRlclwiOlxuICAgICAgYW5jaG9yLnBhcmVudEVsZW1lbnQ/Lmluc2VydEJlZm9yZShyb290LCBhbmNob3IubmV4dEVsZW1lbnRTaWJsaW5nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJiZWZvcmVcIjpcbiAgICAgIGFuY2hvci5wYXJlbnRFbGVtZW50Py5pbnNlcnRCZWZvcmUocm9vdCwgYW5jaG9yKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBvcHRpb25zLmFwcGVuZChhbmNob3IsIHJvb3QpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb3VudEZ1bmN0aW9ucyhiYXNlRnVuY3Rpb25zLCBvcHRpb25zKSB7XG4gIGxldCBhdXRvTW91bnRJbnN0YW5jZSA9IHZvaWQgMDtcbiAgY29uc3Qgc3RvcEF1dG9Nb3VudCA9ICgpID0+IHtcbiAgICBhdXRvTW91bnRJbnN0YW5jZT8uc3RvcEF1dG9Nb3VudCgpO1xuICAgIGF1dG9Nb3VudEluc3RhbmNlID0gdm9pZCAwO1xuICB9O1xuICBjb25zdCBtb3VudCA9ICgpID0+IHtcbiAgICBiYXNlRnVuY3Rpb25zLm1vdW50KCk7XG4gIH07XG4gIGNvbnN0IHVubW91bnQgPSBiYXNlRnVuY3Rpb25zLnJlbW92ZTtcbiAgY29uc3QgcmVtb3ZlID0gKCkgPT4ge1xuICAgIHN0b3BBdXRvTW91bnQoKTtcbiAgICBiYXNlRnVuY3Rpb25zLnJlbW92ZSgpO1xuICB9O1xuICBjb25zdCBhdXRvTW91bnQgPSAoYXV0b01vdW50T3B0aW9ucykgPT4ge1xuICAgIGlmIChhdXRvTW91bnRJbnN0YW5jZSkge1xuICAgICAgbG9nZ2VyLndhcm4oXCJhdXRvTW91bnQgaXMgYWxyZWFkeSBzZXQuXCIpO1xuICAgIH1cbiAgICBhdXRvTW91bnRJbnN0YW5jZSA9IGF1dG9Nb3VudFVpKFxuICAgICAgeyBtb3VudCwgdW5tb3VudCwgc3RvcEF1dG9Nb3VudCB9LFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAuLi5hdXRvTW91bnRPcHRpb25zXG4gICAgICB9XG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBtb3VudCxcbiAgICByZW1vdmUsXG4gICAgYXV0b01vdW50XG4gIH07XG59XG5mdW5jdGlvbiBhdXRvTW91bnRVaSh1aUNhbGxiYWNrcywgb3B0aW9ucykge1xuICBjb25zdCBhYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gIGNvbnN0IEVYUExJQ0lUX1NUT1BfUkVBU09OID0gXCJleHBsaWNpdF9zdG9wX2F1dG9fbW91bnRcIjtcbiAgY29uc3QgX3N0b3BBdXRvTW91bnQgPSAoKSA9PiB7XG4gICAgYWJvcnRDb250cm9sbGVyLmFib3J0KEVYUExJQ0lUX1NUT1BfUkVBU09OKTtcbiAgICBvcHRpb25zLm9uU3RvcD8uKCk7XG4gIH07XG4gIGxldCByZXNvbHZlZEFuY2hvciA9IHR5cGVvZiBvcHRpb25zLmFuY2hvciA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5hbmNob3IoKSA6IG9wdGlvbnMuYW5jaG9yO1xuICBpZiAocmVzb2x2ZWRBbmNob3IgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICBcImF1dG9Nb3VudCBhbmQgRWxlbWVudCBhbmNob3Igb3B0aW9uIGNhbm5vdCBiZSBjb21iaW5lZC4gQXZvaWQgcGFzc2luZyBgRWxlbWVudGAgZGlyZWN0bHkgb3IgYCgpID0+IEVsZW1lbnRgIHRvIHRoZSBhbmNob3IuXCJcbiAgICApO1xuICB9XG4gIGFzeW5jIGZ1bmN0aW9uIG9ic2VydmVFbGVtZW50KHNlbGVjdG9yKSB7XG4gICAgbGV0IGlzQW5jaG9yRXhpc3QgPSAhIWdldEFuY2hvcihvcHRpb25zKTtcbiAgICBpZiAoaXNBbmNob3JFeGlzdCkge1xuICAgICAgdWlDYWxsYmFja3MubW91bnQoKTtcbiAgICB9XG4gICAgd2hpbGUgKCFhYm9ydENvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNoYW5nZWRBbmNob3IgPSBhd2FpdCB3YWl0RWxlbWVudChzZWxlY3RvciA/PyBcImJvZHlcIiwge1xuICAgICAgICAgIGN1c3RvbU1hdGNoZXI6ICgpID0+IGdldEFuY2hvcihvcHRpb25zKSA/PyBudWxsLFxuICAgICAgICAgIGRldGVjdG9yOiBpc0FuY2hvckV4aXN0ID8gcmVtb3ZlRGV0ZWN0b3IgOiBtb3VudERldGVjdG9yLFxuICAgICAgICAgIHNpZ25hbDogYWJvcnRDb250cm9sbGVyLnNpZ25hbFxuICAgICAgICB9KTtcbiAgICAgICAgaXNBbmNob3JFeGlzdCA9ICEhY2hhbmdlZEFuY2hvcjtcbiAgICAgICAgaWYgKGlzQW5jaG9yRXhpc3QpIHtcbiAgICAgICAgICB1aUNhbGxiYWNrcy5tb3VudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVpQ2FsbGJhY2tzLnVubW91bnQoKTtcbiAgICAgICAgICBpZiAob3B0aW9ucy5vbmNlKSB7XG4gICAgICAgICAgICB1aUNhbGxiYWNrcy5zdG9wQXV0b01vdW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoYWJvcnRDb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkICYmIGFib3J0Q29udHJvbGxlci5zaWduYWwucmVhc29uID09PSBFWFBMSUNJVF9TVE9QX1JFQVNPTikge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG9ic2VydmVFbGVtZW50KHJlc29sdmVkQW5jaG9yKTtcbiAgcmV0dXJuIHsgc3RvcEF1dG9Nb3VudDogX3N0b3BBdXRvTW91bnQgfTtcbn1cbiIsImltcG9ydCB7IGFwcGx5UG9zaXRpb24sIGNyZWF0ZU1vdW50RnVuY3Rpb25zLCBtb3VudFVpIH0gZnJvbSBcIi4vc2hhcmVkLm1qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUludGVncmF0ZWRVaShjdHgsIG9wdGlvbnMpIHtcbiAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQob3B0aW9ucy50YWcgfHwgXCJkaXZcIik7XG4gIGxldCBtb3VudGVkID0gdm9pZCAwO1xuICBjb25zdCBtb3VudCA9ICgpID0+IHtcbiAgICBhcHBseVBvc2l0aW9uKHdyYXBwZXIsIHZvaWQgMCwgb3B0aW9ucyk7XG4gICAgbW91bnRVaSh3cmFwcGVyLCBvcHRpb25zKTtcbiAgICBtb3VudGVkID0gb3B0aW9ucy5vbk1vdW50Py4od3JhcHBlcik7XG4gIH07XG4gIGNvbnN0IHJlbW92ZSA9ICgpID0+IHtcbiAgICBvcHRpb25zLm9uUmVtb3ZlPy4obW91bnRlZCk7XG4gICAgd3JhcHBlci5yZXBsYWNlQ2hpbGRyZW4oKTtcbiAgICB3cmFwcGVyLnJlbW92ZSgpO1xuICAgIG1vdW50ZWQgPSB2b2lkIDA7XG4gIH07XG4gIGNvbnN0IG1vdW50RnVuY3Rpb25zID0gY3JlYXRlTW91bnRGdW5jdGlvbnMoXG4gICAge1xuICAgICAgbW91bnQsXG4gICAgICByZW1vdmVcbiAgICB9LFxuICAgIG9wdGlvbnNcbiAgKTtcbiAgY3R4Lm9uSW52YWxpZGF0ZWQocmVtb3ZlKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgbW91bnRlZCgpIHtcbiAgICAgIHJldHVybiBtb3VudGVkO1xuICAgIH0sXG4gICAgd3JhcHBlcixcbiAgICAuLi5tb3VudEZ1bmN0aW9uc1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgXCIvKiBNaW50bGlmeS1pbnNwaXJlZCBMaWdodCBUaGVtZSBmb3IgbWRCb29rICovXFxuOnJvb3Qge1xcbiAgICAtLWJnOiAjZmZmZmZmO1xcbiAgICAtLWZnOiAjMGEwZDBkO1xcbiAgICAtLXNpZGViYXItYmc6ICNmOGZhZjk7XFxuICAgIC0tc2lkZWJhci1mZzogIzM3NDE1MTtcXG4gICAgLS1zaWRlYmFyLWFjdGl2ZTogIzE2NmUzZjtcXG4gICAgLS1zaWRlYmFyLWFjdGl2ZS1iZzogcmdiYSgyMiwgMTEwLCA2MywgMC4xKTtcXG4gICAgLS1zaWRlYmFyLWhlYWRlci1ib3JkZXItY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG4gICAgLS1saW5rczogIzE2NmUzZjtcXG4gICAgLS1saW5rcy1ob3ZlcjogIzI2YmQ2YztcXG4gICAgLS1pbmxpbmUtY29kZS1iZzogI2YzZjZmNDtcXG4gICAgLS1pbmxpbmUtY29kZS1jb2xvcjogcmdiYSgyMzgsIDI0MSwgMjM5LCAwLjUpO1xcbiAgICAtLWNvZGUtYmc6ICMwYTBkMGQ7XFxuICAgIC0tY29kZS1mZzogI2U1ZTdlYjtcXG4gICAgLS1xdW90ZS1iZzogI2YzZjZmNDtcXG4gICAgLS1xdW90ZS1ib3JkZXI6ICMyNmJkNmM7XFxuICAgIC0tcXVvdGUtYmxvY2stYm9yZGVyOiByZ2IoMTYgMTg1IDEyOSAvIDAuMik7XFxuICAgIC0tcXVvdGUtYmxvY2stYmc6IHJnYigyMzYgMjUzIDI0NSAvIDAuNSk7XFxuICAgIC0tdGFibGUtYm9yZGVyOiAjZTVlN2ViO1xcbiAgICAtLXRhYmxlLWhlYWRlci1iZzogI2YzZjZmNDtcXG4gICAgLS1zZWFyY2gtYmc6ICNmZmZmZmY7XFxuICAgIC0tc2VhcmNoLWJvcmRlcjogI2U1ZTdlYjtcXG4gICAgLS1zZWFyY2hiYXItc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpO1xcbiAgICAtLXNjcm9sbGJhcjogI2QxZDVkYjtcXG4gICAgLS1zY3JvbGxiYXItaG92ZXI6ICM5Y2EzYWY7XFxuICAgIC0tb3JkZXItd2VpZ2h0OiA0MDA7XFxuICAgIC0tb3JkZXItZGlzcGxheTogbm9uZTtcXG4gICAgLS1jaGFwdGVyLW5hdi1kaXNwbGF5OiBub25lO1xcbiAgICAtLXNpZGViYXItdGV4dC1zaXplOiAxNnB4O1xcbiAgICAtLWJvZHktdGV4dC1jb2xvcjogcmdiKDYzLCA2NSwgNjQpO1xcbiAgICAtLXRleHQtY29sb3I6IHJnYigxNywgMjQsIDM5KTtcXG4gICAgLS1jb250ZW50LXNpemU6IDM2cmVtO1xcbiAgICAtLXJvb3QtZm9udC1zaXplOiAxOHB4O1xcbiAgICAtLW1vbm8tZm9udDpcXG4gICAgICAgIFxcXCJHZWlzdCBNb25vXFxcIiwgXFxcIk1lbmxvXFxcIiwgXFxcIk1vbmFjb1xcXCIsIFxcXCJMdWNpZGEgQ29uc29sZVxcXCIsIFxcXCJMaWJlcmF0aW9uIE1vbm9cXFwiLFxcbiAgICAgICAgXFxcIkRlamFWdSBTYW5zIE1vbm9cXFwiLCBcXFwiQml0c3RyZWFtIFZlcmEgU2FucyBNb25vXFxcIiwgXFxcIkNvdXJpZXIgTmV3XFxcIiwgbW9ub3NwYWNlO1xcbiAgICBmb250LXNpemU6IHZhcigtLXJvb3QtZm9udC1zaXplKTtcXG59XFxuXFxuOm5vdChwcmUpID4gY29kZS5obGpzIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0taW5saW5lLWNvZGUtY29sb3IpO1xcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XFxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIHBhZGRpbmc6IDAuMTI1cmVtIDAuNXJlbTtcXG4gICAgbWFyZ2luOiAwIDAuMTI1cmVtO1xcbn1cXG5cXG5odG1sIHtcXG4gICAgZm9udC1mYW1pbHk6XFxuICAgICAgICBcXFwiSW50ZXJcXFwiLFxcbiAgICAgICAgLWFwcGxlLXN5c3RlbSxcXG4gICAgICAgIEJsaW5rTWFjU3lzdGVtRm9udCxcXG4gICAgICAgIFxcXCJTZWdvZSBVSVxcXCIsXFxuICAgICAgICBSb2JvdG8sXFxuICAgICAgICBzYW5zLXNlcmlmO1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcXG4gICAgaGVpZ2h0OiAxMDBkdmg7XFxufVxcblxcbmJvZHkge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICAgIGNvbG9yOiB2YXIoLS1ib2R5LXRleHQtY29sb3IpO1xcbiAgICBmb250LXNpemU6IGluaGVyaXQ7XFxufVxcblxcbm5hdi5uYXYtd2lkZS13cmFwcGVyIGEubmF2LWNoYXB0ZXJzIHtcXG4gICAgZGlzcGxheTogdmFyKC0tY2hhcHRlci1uYXYtZGlzcGxheSk7XFxufVxcblxcbi8qIFNpZGViYXIgKi9cXG4uc2lkZWJhciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbiAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG4uc2lkZWJhciAuc2lkZWJhci1zY3JvbGxib3gge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWJnKTtcXG59XFxuXFxubGkuY2hhcHRlci1pdGVtOm5vdCg6aGFzKHNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXIpKSBhLFxcbnNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXIgYSB7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbn1cXG5saS5jaGFwdGVyLWl0ZW06bm90KDpoYXMoc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlcikpLFxcbnNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXIge1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWZnKTtcXG4gICAgcGFkZGluZzogNHB4IDE2cHg7XFxuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMTVzIGVhc2U7XFxuICAgIGZvbnQtc2l6ZTogdmFyKC0tc2lkZWJhci10ZXh0LXNpemUpO1xcbn1cXG5cXG4vKi5zaWRlYmFyIG9sLmNoYXB0ZXIgPiBsaS5jaGFwdGVyLWl0ZW0gPiBzcGFuLmNoYXB0ZXItbGluay13cmFwcGVyIHtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxufSovXFxuXFxuLyouc2lkZWJhciBvbC5jaGFwdGVyIGxpIC5jaGFwdGVyLWl0ZW0uZXhwYW5kZWQgPiBhLCovXFxubGkuY2hhcHRlci1pdGVtOm5vdCg6aGFzKHNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXIpKTpob3ZlcixcXG5saS5jaGFwdGVyLWl0ZW06bm90KDpoYXMoc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlcikpOmhhcyhhLmFjdGl2ZSksXFxuc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlcjpoYXMoYS5hY3RpdmUpLFxcbnNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXI6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxuICAgIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuXFxuLyogVHlwb2dyYXBoeSAqL1xcbmgxLFxcbmgyLFxcbmgzLFxcbmg0LFxcbmg1LFxcbmg2IHtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gICAgbWFyZ2luLXRvcDogMmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjVlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuMztcXG59XFxuXFxuaDEubWVudS10aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMS43NWVtO1xcbiAgICBtYXJnaW4tdG9wOiAwO1xcbn1cXG5oMiB7XFxuICAgIGZvbnQtc2l6ZTogMS41ZW07XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgICBwYWRkaW5nLWJvdHRvbTogMC41ZW07XFxufVxcbmgzIHtcXG4gICAgZm9udC1zaXplOiAxLjI1ZW07XFxufVxcbmg0IHtcXG4gICAgZm9udC1zaXplOiAxZW07XFxufVxcblxcbnAge1xcbiAgICBsaW5lLWhlaWdodDogMS43NTtcXG4gICAgbWFyZ2luOiAxZW0gMDtcXG59XFxuXFxuLyogTGlua3MgKi9cXG5hIHtcXG4gICAgY29sb3I6IHZhcigtLWxpbmtzKTtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICB0cmFuc2l0aW9uOiBjb2xvciAwLjE1cyBlYXNlO1xcbn1cXG5cXG5hOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWxpbmtzLWhvdmVyKTtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XFxufVxcblxcbi8qIENvZGUgKi9cXG5jb2RlIHtcXG4gICAgZm9udC1mYW1pbHk6IFxcXCJHZWlzdCBNb25vXFxcIiwgXFxcIkZpcmEgQ29kZVxcXCIsIFxcXCJKZXRCcmFpbnMgTW9ub1xcXCIsIG1vbm9zcGFjZTtcXG4gICAgZm9udC1zaXplOiAwLjg3NWVtO1xcbn1cXG5cXG5zdHJvbmcge1xcbiAgICBkaXNwbGF5OiB2YXIoLS1vcmRlci1kaXNwbGF5KTtcXG4gICAgZm9udC13ZWlnaHQ6IHZhcigtLW9yZGVyLXdlaWdodCk7XFxufVxcblxcbjpub3QocHJlKSA+IGNvZGUge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1pbmxpbmUtY29kZS1iZyk7XFxuICAgIHBhZGRpbmc6IDAuMmVtIDAuNGVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICAgIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxufVxcblxcbnByZSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWNvZGUtYmcpICFpbXBvcnRhbnQ7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2RlLWZnKTtcXG4gICAgcGFkZGluZzogMTZweCAyMHB4O1xcbiAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xcbiAgICBvdmVyZmxvdy14OiBhdXRvO1xcbiAgICBtYXJnaW46IDEuNWVtIDA7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcXG59XFxuXFxucHJlIGNvZGUge1xcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgY29sb3I6IGluaGVyaXQ7XFxufVxcblxcbi8qIEJsb2NrcXVvdGVzICovXFxuc2VjdGlvblthcmlhLXJvbGU9XFxcIm5vdGVcXFwiXSxcXG5ibG9ja3F1b3RlIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tcXVvdGUtYmxvY2stYmcpO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1xdW90ZS1ibG9jay1ib3JkZXIpO1xcbiAgICBtYXJnaW46IDEuNWVtIDA7XFxuICAgIHBhZGRpbmc6IDFyZW0gMS4yNXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogMXJlbTtcXG59XFxuXFxuOmlzKGJsb2NrcXVvdGUsIHNlY3Rpb25bYXJpYS1yb2xlPVxcXCJub3RlXFxcIl0pIHAge1xcbiAgICBtYXJnaW46IDA7XFxufVxcbjppcyhibG9ja3F1b3RlLCBzZWN0aW9uW2FyaWEtcm9sZT1cXFwibm90ZVxcXCJdKSBoMSxcXG46aXMoYmxvY2txdW90ZSwgc2VjdGlvblthcmlhLXJvbGU9XFxcIm5vdGVcXFwiXSkgaDIsXFxuOmlzKGJsb2NrcXVvdGUsIHNlY3Rpb25bYXJpYS1yb2xlPVxcXCJub3RlXFxcIl0pIGgzLFxcbjppcyhibG9ja3F1b3RlLCBzZWN0aW9uW2FyaWEtcm9sZT1cXFwibm90ZVxcXCJdKSBoNCxcXG46aXMoYmxvY2txdW90ZSwgc2VjdGlvblthcmlhLXJvbGU9XFxcIm5vdGVcXFwiXSkgaDUge1xcbiAgICBtYXJnaW46IDA7XFxuICAgIG1hcmdpbi1ib3R0b206IDFlbTtcXG59XFxuXFxuLyogVGFibGVzICovXFxudGFibGUge1xcbiAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgbWFyZ2luOiAxLjVlbSAwO1xcbiAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG50aCB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXRhYmxlLWhlYWRlci1iZyk7XFxuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICAgIHRleHQtYWxpZ246IGxlZnQ7XFxufVxcblxcbnRoLFxcbnRkIHtcXG4gICAgcGFkZGluZzogMTJweCAxNnB4O1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxudHI6bGFzdC1jaGlsZCB0ZCB7XFxuICAgIGJvcmRlci1ib3R0b206IG5vbmU7XFxufVxcblxcbi8qIE1lbnUgYmFyICovXFxuI21lbnUtYmFyIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmcpO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxuI21lbnUtYmFyIGkge1xcbiAgICBjb2xvcjogdmFyKC0tZmcpO1xcbn1cXG5cXG4vKiBTZWFyY2ggKi9cXG4jc2VhcmNoYmFyIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2VhcmNoLWJnKTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tc2VhcmNoLWJvcmRlcik7XFxuICAgIGJveC1zaGFkb3c6IHZhcigtLXNlYXJjaGJhci1zaGFkb3cpO1xcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XFxuICAgIHBhZGRpbmc6IDhweCAxMnB4O1xcbn1cXG5cXG4vKiBOYXZpZ2F0aW9uIGJ1dHRvbnMgKi9cXG4ubmF2LWNoYXB0ZXJzIHtcXG4gICAgY29sb3I6IHZhcigtLWxpbmtzKTtcXG4gICAgb3BhY2l0eTogMC44O1xcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMTVzIGVhc2U7XFxufVxcblxcbi5uYXYtY2hhcHRlcnM6aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tbGlua3MtaG92ZXIpO1xcbiAgICBvcGFjaXR5OiAxO1xcbn1cXG5cXG4vKiBTY3JvbGxiYXIgKi9cXG46Oi13ZWJraXQtc2Nyb2xsYmFyIHtcXG4gICAgd2lkdGg6IDhweDtcXG4gICAgaGVpZ2h0OiA4cHg7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sge1xcbiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG59XFxuXFxuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNjcm9sbGJhcik7XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG59XFxuXFxuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYjpob3ZlciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNjcm9sbGJhci1ob3Zlcik7XFxufVxcblxcbi8qIFRoZW1lIHRvZ2dsZSAqL1xcbiN0aGVtZS1saXN0IHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1iZyk7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxuICAgIGJvcmRlci1yYWRpdXM6IDhweDtcXG59XFxuXFxuI3RoZW1lLWxpc3QgbGkge1xcbiAgICBjb2xvcjogdmFyKC0tZmcpO1xcbn1cXG5cXG4jdGhlbWUtbGlzdCBsaTpob3ZlciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYWN0aXZlLWJnKTtcXG59XFxuXFxuZGl2I21kYm9vay1tZW51LWJhcixcXG5kaXYjbWRib29rLW1lbnUtYmFyLWhvdmVyLXBsYWNlaG9sZGVyIHtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgcGFkZGluZzogMXJlbSAwO1xcbn1cXG5cXG5kaXYjbWRib29rLWNvbnRlbnQsXFxuZGl2I2NvbnRlbnQge1xcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gODBweCk7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIHBhZGRpbmc6IDJyZW0gNHJlbTtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiB2YXIoLS1jb250ZW50LXNpemUpIDI4cmVtO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgZ2FwOiAzcmVtO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBzY3JvbGwtYmVoYXZpb3I6IHNtb290aDtcXG59XFxuXFxuOmlzKGRpdiNtZGJvb2stY29udGVudCwgZGl2I2NvbnRlbnQpIHAge1xcbiAgICBsaW5lLWhlaWdodDogMS43NTtcXG59XFxuXFxuOmlzKGRpdiNtZGJvb2stY29udGVudCwgZGl2I2NvbnRlbnQpIG1haW4ge1xcbiAgICBtYXgtd2lkdGg6IDEwMCU7XFxuICAgIC8qbGV0dGVyLXNwYWNpbmc6IDAuNXB4OyovXFxufVxcblxcbjppcyhkaXYjbWRib29rLWNvbnRlbnQsIGRpdiNjb250ZW50KSBtYWluIGEuaGVhZGVyOmhvdmVyLFxcbjppcyhkaXYjbWRib29rLWNvbnRlbnQsIGRpdiNjb250ZW50KSBtYWluIGEge1xcbiAgICBmb250LXdlaWdodDogNjAwO1xcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10ZXh0LWNvbG9yKTtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG46aXMoZGl2I21kYm9vay1jb250ZW50LCBkaXYjY29udGVudCkgbWFpbiBhOmhvdmVyIHtcXG4gICAgYm9yZGVyLWJvdHRvbS13aWR0aDogMnB4O1xcbn1cXG5cXG46aXMoZGl2I21kYm9vay1jb250ZW50LCBkaXYjY29udGVudCkgbWFpbiBhLmhlYWRlciB7XFxuICAgIGJvcmRlci1ib3R0b206IG5vbmU7XFxufVxcblxcbi8qIFJpZ2h0IFNpZGViYXIgKFRPQykgKi9cXG4ucGFnZS13cmFwcGVyLmhhcy1yaWdodC1zaWRlYmFyIHtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBhdXRvIDFmciAyMjBweDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXIge1xcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xcbiAgICB0b3A6IDYwcHg7XFxuICAgIHJpZ2h0OiAwcHg7XFxuICAgIGhlaWdodDogZml0LWNvbnRlbnQ7XFxuICAgIG1heC1oZWlnaHQ6IGNhbGMoMTAwdmggLSA4cHgpO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgbWFyZ2luLWxlZnQ6IDIuNXJlbTtcXG4gICAgcGFkZGluZy1sZWZ0OiAxcmVtO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci1oZWFkZXIge1xcbiAgICBjb2xvcjogdmFyKC0tc2lkZWJhci1mZyk7XFxuICAgIG1hcmdpbi1ib3R0b206IDEycHg7XFxuICAgIHBhZGRpbmctbGVmdDogOHB4O1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2Mge1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICBtYXJnaW46IDA7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyLXRvYyBvbCB7XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIHBhZGRpbmctbGVmdDogMTJweDtcXG4gICAgbWFyZ2luOiAwO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2MgbGkge1xcbiAgICBtYXJnaW46IDA7XFxufVxcblxcbi8qIEFkanVzdCBjb250ZW50IHdpZHRoIHdoZW4gcmlnaHQgc2lkZWJhciBleGlzdHMgKi9cXG4ucGFnZS13cmFwcGVyLmhhcy1yaWdodC1zaWRlYmFyIC5jb250ZW50IHtcXG4gICAgbWF4LXdpZHRoOiAxMDAlO1xcbn1cXG5cXG4vKiBIaWRlIHJpZ2h0IHNpZGViYXIgb24gc21hbGwgc2NyZWVucyAqL1xcbkBtZWRpYSAobWF4LXdpZHRoOiAxMTAwcHgpIHtcXG4gICAgLnBhZ2Utd3JhcHBlci5oYXMtcmlnaHQtc2lkZWJhciB7XFxuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IGF1dG8gMWZyO1xcbiAgICB9XFxuXFxuICAgIC5yaWdodC1zaWRlYmFyIHtcXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XFxuICAgIH1cXG59XFxuXCIiLCJpbXBvcnQgbWludGxpZnkgZnJvbSBcIi4uL2Fzc2V0cy90aGVtZXMvbWludGxpZnkuY3NzP3Jhd1wiO1xuLy8gaW1wb3J0IG1pbnRsaWZ5TGlnaHRDU1MgZnJvbSBcIi4uL2Fzc2V0cy90aGVtZXMvbWludGxpZnktbGlnaHQuY3NzP3Jhd1wiO1xuLy8gaW1wb3J0IG1pbnRsaWZ5RGFya0NTUyBmcm9tIFwiLi4vYXNzZXRzL3RoZW1lcy9taW50bGlmeS1kYXJrLmNzcz9yYXdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29udGVudFNjcmlwdCh7XG4gIG1hdGNoZXM6IFtcIjxhbGxfdXJscz5cIl0sXG4gIHJ1bkF0OiBcImRvY3VtZW50X3N0YXJ0XCIsXG5cbiAgbWFpbihjdHgpIHtcbiAgICAvLyBDdXN0b20gdGhlbWVzIChNaW50bGlmeS1pbnNwaXJlZCArIG1kQm9vayBidWlsdC1pbilcbiAgICBjb25zdCBDVVNUT01fVEhFTUVTID0gW1wibWludGxpZnlcIiwgXCJtaW50bGlmeS1kYXJrXCJdIGFzIGNvbnN0O1xuICAgIGNvbnN0IE1EQk9PS19USEVNRVMgPSBbXCJsaWdodFwiLCBcInJ1c3RcIiwgXCJjb2FsXCIsIFwibmF2eVwiLCBcImF5dVwiXSBhcyBjb25zdDtcbiAgICBjb25zdCBBTExfVEhFTUVTID0gWy4uLkNVU1RPTV9USEVNRVMsIC4uLk1EQk9PS19USEVNRVNdIGFzIGNvbnN0O1xuICAgIHR5cGUgVGhlbWUgPSAodHlwZW9mIEFMTF9USEVNRVMpW251bWJlcl07XG5cbiAgICBsZXQgaXNNZEJvb2sgPSBmYWxzZTtcbiAgICBsZXQgc3R5bGVFbGVtZW50OiBIVE1MU3R5bGVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICAvLyBDaGVjayBpZiBjdXJyZW50IHBhZ2UgaXMgYW4gbWRCb29rIHNpdGUgYnkgbG9va2luZyBmb3IgdGhlIGNvbW1lbnRcbiAgICBmdW5jdGlvbiBjaGVja01kQm9va0NvbW1lbnQoKSB7XG4gICAgICAvLyBDaGVjayBmb3IgPCEtLSBCb29rIGdlbmVyYXRlZCB1c2luZyBtZEJvb2sgLS0+IGNvbW1lbnQgYXQgZG9jdW1lbnQgc3RhcnRcbiAgICAgIGNvbnN0IG5vZGVzID0gZG9jdW1lbnQuaGVhZC5jaGlsZE5vZGVzO1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20obm9kZXMgfHwgW10pXG4gICAgICAgIC5maWx0ZXIoKG5vZGUpID0+IG5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFKVxuICAgICAgICAuc29tZSgobm9kZSkgPT5cbiAgICAgICAgICBub2RlLm5vZGVWYWx1ZT8udHJpbSgpLmluY2x1ZGVzKFwiQm9vayBnZW5lcmF0ZWQgdXNpbmcgbWRCb29rXCIpLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIEdldCBjdXJyZW50IG1kQm9vayB0aGVtZSBmcm9tIHBhZ2VcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50TWRCb29rVGhlbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICBjb25zdCBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgZm9yIChjb25zdCB0aGVtZSBvZiBNREJPT0tfVEhFTUVTKSB7XG4gICAgICAgIGlmIChodG1sLmNsYXNzTGlzdC5jb250YWlucyh0aGVtZSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhlbWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEdldCBDU1MgZm9yIHRoZW1lXG4gICAgZnVuY3Rpb24gZ2V0VGhlbWVDU1ModGhlbWU6IFRoZW1lKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICBzd2l0Y2ggKHRoZW1lKSB7XG4gICAgICAgIGNhc2UgXCJtaW50bGlmeVwiOlxuICAgICAgICAgIHJldHVybiBtaW50bGlmeTtcbiAgICAgICAgLy8gY2FzZSBcIm1pbnRsaWZ5LWRhcmtcIjpcbiAgICAgICAgLy8gICByZXR1cm4gbWludGxpZnlEYXJrQ1NTO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBudWxsOyAvLyBVc2UgbWRCb29rIGJ1aWx0LWluIHRoZW1lc1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluamVjdCBvciB1cGRhdGUgY3VzdG9tIHRoZW1lIENTU1xuICAgIGZ1bmN0aW9uIGluamVjdFRoZW1lQ1NTKGNzczogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgaWYgKCFjc3MpIHtcbiAgICAgICAgLy8gUmVtb3ZlIGN1c3RvbSBzdHlsZXMsIHVzZSBtZEJvb2sgYnVpbHQtaW5cbiAgICAgICAgaWYgKHN0eWxlRWxlbWVudCkge1xuICAgICAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICBzdHlsZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzdHlsZUVsZW1lbnQpIHtcbiAgICAgICAgc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICBzdHlsZUVsZW1lbnQuaWQgPSBcIm1kYm9vay10aGVtZS1leHRlbnNpb25cIjtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgc3R5bGVFbGVtZW50LnRleHRDb250ZW50ID0gY3NzO1xuICAgIH1cblxuICAgIC8vIEFwcGx5IHRoZW1lIHRvIHBhZ2VcbiAgICBmdW5jdGlvbiBhcHBseVRoZW1lKHRoZW1lOiBUaGVtZSkge1xuICAgICAgY29uc3QgaHRtbCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgIGNvbnN0IGlzQ3VzdG9tVGhlbWUgPSBDVVNUT01fVEhFTUVTLmluY2x1ZGVzKHRoZW1lIGFzIGFueSk7XG5cbiAgICAgIGlmIChpc0N1c3RvbVRoZW1lKSB7XG4gICAgICAgIC8vIEZvciBjdXN0b20gdGhlbWVzLCBzZXQgYmFzZSBtZEJvb2sgdGhlbWUgYW5kIGluamVjdCBDU1NcbiAgICAgICAgTURCT09LX1RIRU1FUy5mb3JFYWNoKCh0KSA9PiBodG1sLmNsYXNzTGlzdC5yZW1vdmUodCkpO1xuICAgICAgICBodG1sLmNsYXNzTGlzdC5hZGQodGhlbWUgPT09IFwibWludGxpZnlcIiA/IFwibGlnaHRcIiA6IFwiY29hbFwiKTtcbiAgICAgICAgaW5qZWN0VGhlbWVDU1MoZ2V0VGhlbWVDU1ModGhlbWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBtZEJvb2sgYnVpbHQtaW4gdGhlbWVzXG4gICAgICAgIE1EQk9PS19USEVNRVMuZm9yRWFjaCgodCkgPT4gaHRtbC5jbGFzc0xpc3QucmVtb3ZlKHQpKTtcbiAgICAgICAgaHRtbC5jbGFzc0xpc3QuYWRkKHRoZW1lKTtcbiAgICAgICAgaW5qZWN0VGhlbWVDU1MobnVsbCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm1kYm9vay10aGVtZVwiLCB0aGVtZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBJZ25vcmVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBOb3RpZnkgcG9wdXAgYWJvdXQgdGhlbWUgY2hhbmdlXG4gICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyB0eXBlOiBcInRoZW1lQ2hhbmdlZFwiLCB0aGVtZSB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgIC8vIElnbm9yZSBlcnJvcnMgd2hlbiBwb3B1cCBpcyBub3Qgb3BlblxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGVtZSBmcm9tIHN0b3JhZ2VcbiAgICBhc3luYyBmdW5jdGlvbiBpbml0VGhlbWUoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBsb2NhbENvbmZpZyA9IFtcIm1kYm9va1RoZW1lXCIsIFwiZW5hYmxlZFwiXSBhcyBjb25zdDtcbiAgICAgICAgdHlwZSBMb2NhbENvbmZpZyA9IHtcbiAgICAgICAgICBbSyBpbiAodHlwZW9mIGxvY2FsQ29uZmlnKVtudW1iZXJdXT86IHN0cmluZztcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgeyBtZGJvb2tUaGVtZSwgZW5hYmxlZCB9ID0gKGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoXG4gICAgICAgICAgbG9jYWxDb25maWcgYXMgYW55LFxuICAgICAgICApKSBhcyBMb2NhbENvbmZpZztcblxuICAgICAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aGVtZSA9IG1kYm9va1RoZW1lIHx8IChcIm1pbnRsaWZ5XCIgYXMgYW55KTsgLy8gRGVmYXVsdCB0byBtaW50bGlmeVxuICAgICAgICBpZiAoQUxMX1RIRU1FUy5pbmNsdWRlcyh0aGVtZSkpIHtcbiAgICAgICAgICBhcHBseVRoZW1lKHRoZW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBEZWZhdWx0IHRvIG1pbnRsaWZ5IG9uIGVycm9yXG4gICAgICAgIGFwcGx5VGhlbWUoXCJtaW50bGlmeVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHRoZW1lIGNoYW5nZSBtZXNzYWdlcyBmcm9tIHBvcHVwXG4gICAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgXywgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcInNldFRoZW1lXCIgJiYgQUxMX1RIRU1FUy5pbmNsdWRlcyhtZXNzYWdlLnRoZW1lKSkge1xuICAgICAgICBhcHBseVRoZW1lKG1lc3NhZ2UudGhlbWUpO1xuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnR5cGUgPT09IFwiZ2V0U3RhdHVzXCIpIHtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICBpc01kQm9vayxcbiAgICAgICAgICBjdXJyZW50VGhlbWU6IGdldEN1cnJlbnRNZEJvb2tUaGVtZSgpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhbmQgc2V0dXAgcmlnaHQgc2lkZWJhciBmb3IgcGFnZSBUT0NcbiAgICBmdW5jdGlvbiBzZXR1cFJpZ2h0U2lkZWJhcih0b2NTZWN0aW9uOiBFbGVtZW50KSB7XG4gICAgICBpZiAoIXRvY1NlY3Rpb24pIHJldHVybjtcblxuICAgICAgLy8gQ3JlYXRlIHJpZ2h0IHNpZGViYXIgY29udGFpbmVyXG4gICAgICBjb25zdCByaWdodFNpZGViYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibmF2XCIpO1xuICAgICAgcmlnaHRTaWRlYmFyLmlkID0gXCJyaWdodC1zaWRlYmFyXCI7XG4gICAgICByaWdodFNpZGViYXIuY2xhc3NOYW1lID0gXCJyaWdodC1zaWRlYmFyXCI7XG5cbiAgICAgIC8vIENyZWF0ZSBoZWFkZXJcbiAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJyaWdodC1zaWRlYmFyLWhlYWRlclwiO1xuICAgICAgaGVhZGVyLnRleHRDb250ZW50ID0gXCJPbiB0aGlzIHBhZ2VcIjtcbiAgICAgIHJpZ2h0U2lkZWJhci5hcHBlbmRDaGlsZChoZWFkZXIpO1xuXG4gICAgICAvLyBDbG9uZSBhbmQgbW92ZSB0aGUgc2VjdGlvblxuICAgICAgY29uc3QgY2xvbmVkU2VjdGlvbiA9IHRvY1NlY3Rpb24uY2xvbmVOb2RlKHRydWUpIGFzIEVsZW1lbnQ7XG4gICAgICBjbG9uZWRTZWN0aW9uLmNsYXNzTGlzdC5hZGQoXCJyaWdodC1zaWRlYmFyLXRvY1wiKTtcbiAgICAgIHJpZ2h0U2lkZWJhci5hcHBlbmRDaGlsZChjbG9uZWRTZWN0aW9uKTtcblxuICAgICAgLy8gSGlkZSBvcmlnaW5hbCBzZWN0aW9uIGluIGxlZnQgc2lkZWJhclxuICAgICAgKHRvY1NlY3Rpb24gYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgICAgcmV0dXJuIHJpZ2h0U2lkZWJhcjtcbiAgICB9XG5cbiAgICAvLyBNYWluIGluaXRpYWxpemF0aW9uXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIGlzTWRCb29rID0gY2hlY2tNZEJvb2tDb21tZW50KCk7XG4gICAgICBpZiAoaXNNZEJvb2spIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJlbmFibGVkXCIsIFwiZmFsc2VcIik7XG4gICAgICAgIGluaXRUaGVtZSgpO1xuXG4gICAgICAgIGNvbnN0IHVpID0gY3JlYXRlSW50ZWdyYXRlZFVpKGN0eCwge1xuICAgICAgICAgIHBvc2l0aW9uOiBcImlubGluZVwiLFxuICAgICAgICAgIGFuY2hvcjogXCJkaXYjbWRib29rLWNvbnRlbnRcIixcbiAgICAgICAgICBvbk1vdW50OiAocGFnZVdyYXBwZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKF8sIG9icykgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICBcIi5zaWRlYmFyIG9sLmNoYXB0ZXIgZGl2Lm9uLXRoaXMtcGFnZSA+IG9sLnNlY3Rpb25cIixcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByaWdodFNpZGViYXIgPSBzZXR1cFJpZ2h0U2lkZWJhcihlbGVtZW50KSE7XG4gICAgICAgICAgICAgICAgcGFnZVdyYXBwZXIuYXBwZW5kKHJpZ2h0U2lkZWJhcik7XG4gICAgICAgICAgICAgICAgcGFnZVdyYXBwZXIuY2xhc3NMaXN0LmFkZChcImhhcy1yaWdodC1zaWRlYmFyXCIpO1xuICAgICAgICAgICAgICAgIG9icy5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIHVpLmF1dG9Nb3VudCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIERPTSB0byBiZSByZWFkeVxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluaXQoKTtcbiAgICB9XG4gIH0sXG59KTtcbiIsImltcG9ydCB7IGJyb3dzZXIgfSBmcm9tIFwid3h0L2Jyb3dzZXJcIjtcbmV4cG9ydCBjbGFzcyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50IGV4dGVuZHMgRXZlbnQge1xuICBjb25zdHJ1Y3RvcihuZXdVcmwsIG9sZFVybCkge1xuICAgIHN1cGVyKFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQuRVZFTlRfTkFNRSwge30pO1xuICAgIHRoaXMubmV3VXJsID0gbmV3VXJsO1xuICAgIHRoaXMub2xkVXJsID0gb2xkVXJsO1xuICB9XG4gIHN0YXRpYyBFVkVOVF9OQU1FID0gZ2V0VW5pcXVlRXZlbnROYW1lKFwid3h0OmxvY2F0aW9uY2hhbmdlXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFVuaXF1ZUV2ZW50TmFtZShldmVudE5hbWUpIHtcbiAgcmV0dXJuIGAke2Jyb3dzZXI/LnJ1bnRpbWU/LmlkfToke2ltcG9ydC5tZXRhLmVudi5FTlRSWVBPSU5UfToke2V2ZW50TmFtZX1gO1xufVxuIiwiaW1wb3J0IHsgV3h0TG9jYXRpb25DaGFuZ2VFdmVudCB9IGZyb20gXCIuL2N1c3RvbS1ldmVudHMubWpzXCI7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9jYXRpb25XYXRjaGVyKGN0eCkge1xuICBsZXQgaW50ZXJ2YWw7XG4gIGxldCBvbGRVcmw7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogRW5zdXJlIHRoZSBsb2NhdGlvbiB3YXRjaGVyIGlzIGFjdGl2ZWx5IGxvb2tpbmcgZm9yIFVSTCBjaGFuZ2VzLiBJZiBpdCdzIGFscmVhZHkgd2F0Y2hpbmcsXG4gICAgICogdGhpcyBpcyBhIG5vb3AuXG4gICAgICovXG4gICAgcnVuKCkge1xuICAgICAgaWYgKGludGVydmFsICE9IG51bGwpIHJldHVybjtcbiAgICAgIG9sZFVybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICBpbnRlcnZhbCA9IGN0eC5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGxldCBuZXdVcmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgICBpZiAobmV3VXJsLmhyZWYgIT09IG9sZFVybC5ocmVmKSB7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQobmV3VXJsLCBvbGRVcmwpKTtcbiAgICAgICAgICBvbGRVcmwgPSBuZXdVcmw7XG4gICAgICAgIH1cbiAgICAgIH0sIDFlMyk7XG4gICAgfVxuICB9O1xufVxuIiwiaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gXCJ3eHQvYnJvd3NlclwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIi4uL3V0aWxzL2ludGVybmFsL2xvZ2dlci5tanNcIjtcbmltcG9ydCB7XG4gIGdldFVuaXF1ZUV2ZW50TmFtZVxufSBmcm9tIFwiLi9pbnRlcm5hbC9jdXN0b20tZXZlbnRzLm1qc1wiO1xuaW1wb3J0IHsgY3JlYXRlTG9jYXRpb25XYXRjaGVyIH0gZnJvbSBcIi4vaW50ZXJuYWwvbG9jYXRpb24td2F0Y2hlci5tanNcIjtcbmV4cG9ydCBjbGFzcyBDb250ZW50U2NyaXB0Q29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKGNvbnRlbnRTY3JpcHROYW1lLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jb250ZW50U2NyaXB0TmFtZSA9IGNvbnRlbnRTY3JpcHROYW1lO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5hYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgaWYgKHRoaXMuaXNUb3BGcmFtZSkge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JOZXdlclNjcmlwdHMoeyBpZ25vcmVGaXJzdEV2ZW50OiB0cnVlIH0pO1xuICAgICAgdGhpcy5zdG9wT2xkU2NyaXB0cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpc3RlbkZvck5ld2VyU2NyaXB0cygpO1xuICAgIH1cbiAgfVxuICBzdGF0aWMgU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFID0gZ2V0VW5pcXVlRXZlbnROYW1lKFxuICAgIFwid3h0OmNvbnRlbnQtc2NyaXB0LXN0YXJ0ZWRcIlxuICApO1xuICBpc1RvcEZyYW1lID0gd2luZG93LnNlbGYgPT09IHdpbmRvdy50b3A7XG4gIGFib3J0Q29udHJvbGxlcjtcbiAgbG9jYXRpb25XYXRjaGVyID0gY3JlYXRlTG9jYXRpb25XYXRjaGVyKHRoaXMpO1xuICByZWNlaXZlZE1lc3NhZ2VJZHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBnZXQgc2lnbmFsKCkge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gIH1cbiAgYWJvcnQocmVhc29uKSB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLmFib3J0KHJlYXNvbik7XG4gIH1cbiAgZ2V0IGlzSW52YWxpZCgpIHtcbiAgICBpZiAoYnJvd3Nlci5ydW50aW1lLmlkID09IG51bGwpIHtcbiAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2lnbmFsLmFib3J0ZWQ7XG4gIH1cbiAgZ2V0IGlzVmFsaWQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzSW52YWxpZDtcbiAgfVxuICAvKipcbiAgICogQWRkIGEgbGlzdGVuZXIgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgY29udGVudCBzY3JpcHQncyBjb250ZXh0IGlzIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoY2IpO1xuICAgKiBjb25zdCByZW1vdmVJbnZhbGlkYXRlZExpc3RlbmVyID0gY3R4Lm9uSW52YWxpZGF0ZWQoKCkgPT4ge1xuICAgKiAgIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UucmVtb3ZlTGlzdGVuZXIoY2IpO1xuICAgKiB9KVxuICAgKiAvLyAuLi5cbiAgICogcmVtb3ZlSW52YWxpZGF0ZWRMaXN0ZW5lcigpO1xuICAgKi9cbiAgb25JbnZhbGlkYXRlZChjYikge1xuICAgIHRoaXMuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYik7XG4gICAgcmV0dXJuICgpID0+IHRoaXMuc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYik7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybiBhIHByb21pc2UgdGhhdCBuZXZlciByZXNvbHZlcy4gVXNlZnVsIGlmIHlvdSBoYXZlIGFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgc2hvdWxkbid0IHJ1blxuICAgKiBhZnRlciB0aGUgY29udGV4dCBpcyBleHBpcmVkLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBjb25zdCBnZXRWYWx1ZUZyb21TdG9yYWdlID0gYXN5bmMgKCkgPT4ge1xuICAgKiAgIGlmIChjdHguaXNJbnZhbGlkKSByZXR1cm4gY3R4LmJsb2NrKCk7XG4gICAqXG4gICAqICAgLy8gLi4uXG4gICAqIH1cbiAgICovXG4gIGJsb2NrKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0SW50ZXJ2YWxgIHRoYXQgYXV0b21hdGljYWxseSBjbGVhcnMgdGhlIGludGVydmFsIHdoZW4gaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIEludGVydmFscyBjYW4gYmUgY2xlYXJlZCBieSBjYWxsaW5nIHRoZSBub3JtYWwgYGNsZWFySW50ZXJ2YWxgIGZ1bmN0aW9uLlxuICAgKi9cbiAgc2V0SW50ZXJ2YWwoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgaGFuZGxlcigpO1xuICAgIH0sIHRpbWVvdXQpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjbGVhckludGVydmFsKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnNldFRpbWVvdXRgIHRoYXQgYXV0b21hdGljYWxseSBjbGVhcnMgdGhlIGludGVydmFsIHdoZW4gaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIFRpbWVvdXRzIGNhbiBiZSBjbGVhcmVkIGJ5IGNhbGxpbmcgdGhlIG5vcm1hbCBgc2V0VGltZW91dGAgZnVuY3Rpb24uXG4gICAqL1xuICBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICBjb25zdCBpZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgaGFuZGxlcigpO1xuICAgIH0sIHRpbWVvdXQpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjbGVhclRpbWVvdXQoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2FuY2VscyB0aGUgcmVxdWVzdCB3aGVuXG4gICAqIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBDYWxsYmFja3MgY2FuIGJlIGNhbmNlbGVkIGJ5IGNhbGxpbmcgdGhlIG5vcm1hbCBgY2FuY2VsQW5pbWF0aW9uRnJhbWVgIGZ1bmN0aW9uLlxuICAgKi9cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgIH0pO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjYW5jZWxBbmltYXRpb25GcmFtZShpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2FuY2VscyB0aGUgcmVxdWVzdCB3aGVuXG4gICAqIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBDYWxsYmFja3MgY2FuIGJlIGNhbmNlbGVkIGJ5IGNhbGxpbmcgdGhlIG5vcm1hbCBgY2FuY2VsSWRsZUNhbGxiYWNrYCBmdW5jdGlvbi5cbiAgICovXG4gIHJlcXVlc3RJZGxlQ2FsbGJhY2soY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICBjb25zdCBpZCA9IHJlcXVlc3RJZGxlQ2FsbGJhY2soKC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmICghdGhpcy5zaWduYWwuYWJvcnRlZCkgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNhbmNlbElkbGVDYWxsYmFjayhpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICBhZGRFdmVudExpc3RlbmVyKHRhcmdldCwgdHlwZSwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlID09PSBcInd4dDpsb2NhdGlvbmNoYW5nZVwiKSB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSB0aGlzLmxvY2F0aW9uV2F0Y2hlci5ydW4oKTtcbiAgICB9XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXI/LihcbiAgICAgIHR5cGUuc3RhcnRzV2l0aChcInd4dDpcIikgPyBnZXRVbmlxdWVFdmVudE5hbWUodHlwZSkgOiB0eXBlLFxuICAgICAgaGFuZGxlcixcbiAgICAgIHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgc2lnbmFsOiB0aGlzLnNpZ25hbFxuICAgICAgfVxuICAgICk7XG4gIH1cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKiBBYm9ydCB0aGUgYWJvcnQgY29udHJvbGxlciBhbmQgZXhlY3V0ZSBhbGwgYG9uSW52YWxpZGF0ZWRgIGxpc3RlbmVycy5cbiAgICovXG4gIG5vdGlmeUludmFsaWRhdGVkKCkge1xuICAgIHRoaXMuYWJvcnQoXCJDb250ZW50IHNjcmlwdCBjb250ZXh0IGludmFsaWRhdGVkXCIpO1xuICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgIGBDb250ZW50IHNjcmlwdCBcIiR7dGhpcy5jb250ZW50U2NyaXB0TmFtZX1cIiBjb250ZXh0IGludmFsaWRhdGVkYFxuICAgICk7XG4gIH1cbiAgc3RvcE9sZFNjcmlwdHMoKSB7XG4gICAgd2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAge1xuICAgICAgICB0eXBlOiBDb250ZW50U2NyaXB0Q29udGV4dC5TQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEUsXG4gICAgICAgIGNvbnRlbnRTY3JpcHROYW1lOiB0aGlzLmNvbnRlbnRTY3JpcHROYW1lLFxuICAgICAgICBtZXNzYWdlSWQ6IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpXG4gICAgICB9LFxuICAgICAgXCIqXCJcbiAgICApO1xuICB9XG4gIHZlcmlmeVNjcmlwdFN0YXJ0ZWRFdmVudChldmVudCkge1xuICAgIGNvbnN0IGlzU2NyaXB0U3RhcnRlZEV2ZW50ID0gZXZlbnQuZGF0YT8udHlwZSA9PT0gQ29udGVudFNjcmlwdENvbnRleHQuU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFO1xuICAgIGNvbnN0IGlzU2FtZUNvbnRlbnRTY3JpcHQgPSBldmVudC5kYXRhPy5jb250ZW50U2NyaXB0TmFtZSA9PT0gdGhpcy5jb250ZW50U2NyaXB0TmFtZTtcbiAgICBjb25zdCBpc05vdER1cGxpY2F0ZSA9ICF0aGlzLnJlY2VpdmVkTWVzc2FnZUlkcy5oYXMoZXZlbnQuZGF0YT8ubWVzc2FnZUlkKTtcbiAgICByZXR1cm4gaXNTY3JpcHRTdGFydGVkRXZlbnQgJiYgaXNTYW1lQ29udGVudFNjcmlwdCAmJiBpc05vdER1cGxpY2F0ZTtcbiAgfVxuICBsaXN0ZW5Gb3JOZXdlclNjcmlwdHMob3B0aW9ucykge1xuICAgIGxldCBpc0ZpcnN0ID0gdHJ1ZTtcbiAgICBjb25zdCBjYiA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRoaXMudmVyaWZ5U2NyaXB0U3RhcnRlZEV2ZW50KGV2ZW50KSkge1xuICAgICAgICB0aGlzLnJlY2VpdmVkTWVzc2FnZUlkcy5hZGQoZXZlbnQuZGF0YS5tZXNzYWdlSWQpO1xuICAgICAgICBjb25zdCB3YXNGaXJzdCA9IGlzRmlyc3Q7XG4gICAgICAgIGlzRmlyc3QgPSBmYWxzZTtcbiAgICAgICAgaWYgKHdhc0ZpcnN0ICYmIG9wdGlvbnM/Lmlnbm9yZUZpcnN0RXZlbnQpIHJldHVybjtcbiAgICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRlZCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2IpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiByZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYikpO1xuICB9XG59XG4iXSwibmFtZXMiOlsiZGVmaW5pdGlvbiIsImJyb3dzZXIiLCJfYnJvd3NlciIsInByaW50IiwibG9nZ2VyIiwicmVzdWx0IiwicmVtb3ZlRGV0ZWN0b3IiLCJtb3VudERldGVjdG9yIl0sIm1hcHBpbmdzIjoiOztBQUFPLFdBQVMsb0JBQW9CQSxhQUFZO0FBQzlDLFdBQU9BO0FBQUEsRUFDVDtBQ0RPLFFBQU1DLFlBQVUsV0FBVyxTQUFTLFNBQVMsS0FDaEQsV0FBVyxVQUNYLFdBQVc7QUNGUixRQUFNLFVBQVVDO0FDRHZCLFFBQU0sVUFBVSx1QkFBTyxNQUFNO0FBRTdCLE1BQUksYUFBYTtBQUFBLEVBRUYsTUFBTSxvQkFBb0IsSUFBSTtBQUFBLElBQzVDLGNBQWM7QUFD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LElBQ0EsaUJBQWlCLFFBQVEsTUFBTSxTQUFTLFNBQVM7QUFDL0MsVUFBSSxTQUFTLHNCQUFzQjtBQUNqQyxZQUFJLEtBQUssUUFBUyxNQUFLLGdCQUFnQixJQUFHO0FBQUEsTUFDNUM7QUFDQSxhQUFPO0FBQUEsUUFDTCxLQUFLLFdBQVcsTUFBTSxJQUFJLG1CQUFtQixJQUFJLElBQUk7QUFBQSxRQUNyRDtBQUFBLFFBQ0E7QUFBQSxVQUNFLEdBQUc7QUFBQSxVQUNILFFBQVEsS0FBSztBQUFBLFFBQ3JCO0FBQUEsTUFDQTtBQUFBLElBQ0U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0Esb0JBQW9CO0FBQ2xCLFdBQUssTUFBTSxvQ0FBb0M7QUFDL0NILGVBQU87QUFBQSxRQUNMLG1CQUFtQixLQUFLLGlCQUFpQjtBQUFBLE1BQy9DO0FBQUEsSUFDRTtBQUFBLElBQ0EsaUJBQWlCO0FBQ2YsYUFBTztBQUFBLFFBQ0w7QUFBQSxVQUNFLE1BQU0scUJBQXFCO0FBQUEsVUFDM0IsbUJBQW1CLEtBQUs7QUFBQSxVQUN4QixXQUFXLEtBQUssT0FBTSxFQUFHLFNBQVMsRUFBRSxFQUFFLE1BQU0sQ0FBQztBQUFBLFFBQ3JEO0FBQUEsUUFDTTtBQUFBLE1BQ047QUFBQSxJQUNFO0FBQUEsSUFDQSx5QkFBeUIsT0FBTztBQUM5QixZQUFNLHVCQUF1QixNQUFNLE1BQU0sU0FBUyxxQkFBcUI7QUFDdkUsWUFBTSxzQkFBc0IsTUFBTSxNQUFNLHNCQUFzQixLQUFLO0FBQ25FLFlBQU0saUJBQWlCLENBQUMsS0FBSyxtQkFBbUIsSUFBSSxNQUFNLE1BQU0sU0FBUztBQUN6RSxhQUFPLHdCQUF3Qix1QkFBdUI7QUFBQSxJQUN4RDtBQUFBLElBQ0Esc0JBQXNCLFNBQVM7QUFDN0IsVUFBSSxVQUFVO0FBQ2QsWUFBTSxLQUFLLENBQUMsVUFBVTtBQUNwQixZQUFJLEtBQUsseUJBQXlCLEtBQUssR0FBRztBQUN4QyxlQUFLLG1CQUFtQixJQUFJLE1BQU0sS0FBSyxTQUFTO0FBQ2hELGdCQUFNLFdBQVc7QUFDakIsb0JBQVU7QUFDVixjQUFJLFlBQVksU0FBUyxpQkFBa0I7QUFDM0MsZUFBSyxrQkFBaUI7QUFBQSxRQUN4QjtBQUFBLE1BQ0Y7QUFDQSx1QkFBaUIsV0FBVyxFQUFFO0FBQzlCLFdBQUssY0FBYyxNQUFNLG9CQUFvQixXQUFXLEVBQUUsQ0FBQztBQUFBLElBQzdEO0FBQUEsRUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiwzLDQsNSw2LDcsOCw5LDEyLDEzLDE0XX0=
content;