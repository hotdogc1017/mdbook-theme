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
  const mintlifyLightCSS = '/* Mintlify-inspired Light Theme for mdBook */\n:root {\n    --bg: #ffffff;\n    --fg: #0a0d0d;\n    --sidebar-bg: #f8faf9;\n    --sidebar-fg: #374151;\n    --sidebar-active: #166e3f;\n    --sidebar-active-bg: rgba(22, 110, 63, 0.1);\n    --sidebar-header-border-color: var(--sidebar-active);\n    --links: #166e3f;\n    --links-hover: #26bd6c;\n    --inline-code-bg: #f3f6f4;\n    --inline-code-color: rgba(238, 241, 239, 0.5);\n    --code-bg: #0a0d0d;\n    --code-fg: #e5e7eb;\n    --quote-bg: #f3f6f4;\n    --quote-border: #26bd6c;\n    --table-border: #e5e7eb;\n    --table-header-bg: #f3f6f4;\n    --search-bg: #ffffff;\n    --search-border: #e5e7eb;\n    --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n    --scrollbar: #d1d5db;\n    --scrollbar-hover: #9ca3af;\n    --order-weight: 400;\n    --order-display: none;\n    --chapter-nav-display: none;\n    --sidebar-text-size: 16px;\n    --body-text-color: rgb(63, 65, 64);\n    --text-color: rgb(17, 24, 39);\n    --content-size: 36rem;\n    --root-font-size: 18px;\n    --mono-font:\n        "Geist Mono", "Menlo", "Monaco", "Lucida Console", "Liberation Mono",\n        "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace;\n    font-size: var(--root-font-size);\n}\n\n:not(pre) > code.hljs {\n    background-color: var(--inline-code-color);\n    color: var(--text-color);\n    font-weight: 500;\n    box-sizing: border-box;\n    padding: 0.125rem 0.5rem;\n    margin: 0 0.125rem;\n}\n\nhtml {\n    font-family:\n        "Inter",\n        -apple-system,\n        BlinkMacSystemFont,\n        "Segoe UI",\n        Roboto,\n        sans-serif;\n    background: var(--bg);\n    color: var(--text-color);\n    height: 100dvh;\n}\n\nbody {\n    background: var(--bg);\n    color: var(--body-text-color);\n    font-size: inherit;\n}\n\nnav.nav-wide-wrapper a.nav-chapters {\n    display: var(--chapter-nav-display);\n}\n\n/* Sidebar */\n.sidebar {\n    background: var(--sidebar-bg);\n    border-right: 1px solid var(--table-border);\n}\n\n.sidebar .sidebar-scrollbox {\n    background: var(--sidebar-bg);\n}\n\nspan.chapter-link-wrapper a {\n    display: block;\n    width: 100%;\n    height: 100%;\n}\nspan.chapter-link-wrapper {\n    cursor: pointer;\n    color: var(--sidebar-fg);\n    padding: 4px 16px;\n    border-radius: 8px;\n    transition: all 0.15s ease;\n    font-size: var(--sidebar-text-size);\n}\n\n/*.sidebar ol.chapter > li.chapter-item > span.chapter-link-wrapper {\n    font-weight: bold;\n}*/\n\n/*.sidebar ol.chapter li .chapter-item.expanded > a,*/\nspan.chapter-link-wrapper:has(a.active),\nspan.chapter-link-wrapper:hover {\n    background: var(--sidebar-active-bg);\n    color: var(--sidebar-active);\n    text-decoration: none;\n}\n\n/* Typography */\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n    color: var(--fg);\n    font-weight: 600;\n    margin-top: 2em;\n    margin-bottom: 0.5em;\n    line-height: 1.3;\n}\n\nh1.menu-title {\n    font-size: 1.75em;\n    margin-top: 0;\n}\nh2 {\n    font-size: 1.5em;\n    border-bottom: 1px solid var(--table-border);\n    padding-bottom: 0.5em;\n}\nh3 {\n    font-size: 1.25em;\n}\nh4 {\n    font-size: 1em;\n}\n\np {\n    line-height: 1.75;\n    margin: 1em 0;\n}\n\n/* Links */\na {\n    color: var(--links);\n    text-decoration: none;\n    transition: color 0.15s ease;\n}\n\na:hover {\n    color: var(--links-hover);\n    text-decoration: underline;\n}\n\n/* Code */\ncode {\n    font-family: "Geist Mono", "Fira Code", "JetBrains Mono", monospace;\n    font-size: 0.875em;\n}\n\nstrong {\n    display: var(--order-display);\n    font-weight: var(--order-weight);\n}\n\n:not(pre) > code {\n    background: var(--inline-code-bg);\n    padding: 0.2em 0.4em;\n    border-radius: 6px;\n    color: var(--sidebar-active);\n}\n\npre {\n    background: var(--code-bg) !important;\n    color: var(--code-fg);\n    padding: 16px 20px;\n    border-radius: 12px;\n    overflow-x: auto;\n    margin: 1.5em 0;\n    border: 1px solid rgba(255, 255, 255, 0.1);\n}\n\npre code {\n    background: transparent;\n    padding: 0;\n    color: inherit;\n}\n\n/* Blockquotes */\nblockquote {\n    background: var(--quote-bg);\n    border-left: 4px solid var(--quote-border);\n    margin: 1.5em 0;\n    padding: 16px 20px;\n    border-radius: 0 12px 12px 0;\n}\n\nblockquote p {\n    margin: 0;\n}\n\n/* Tables */\ntable {\n    border-collapse: collapse;\n    width: 100%;\n    margin: 1.5em 0;\n    border-radius: 12px;\n    overflow: hidden;\n    border: 1px solid var(--table-border);\n}\n\nth {\n    background: var(--table-header-bg);\n    font-weight: 600;\n    text-align: left;\n}\n\nth,\ntd {\n    padding: 12px 16px;\n    border-bottom: 1px solid var(--table-border);\n}\n\ntr:last-child td {\n    border-bottom: none;\n}\n\n/* Menu bar */\n#menu-bar {\n    background: var(--bg);\n    border-bottom: 1px solid var(--table-border);\n}\n\n#menu-bar i {\n    color: var(--fg);\n}\n\n/* Search */\n#searchbar {\n    background: var(--search-bg);\n    border: 1px solid var(--search-border);\n    box-shadow: var(--searchbar-shadow);\n    border-radius: 8px;\n    padding: 8px 12px;\n}\n\n/* Navigation buttons */\n.nav-chapters {\n    color: var(--links);\n    opacity: 0.8;\n    transition: opacity 0.15s ease;\n}\n\n.nav-chapters:hover {\n    color: var(--links-hover);\n    opacity: 1;\n}\n\n/* Scrollbar */\n::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n\n::-webkit-scrollbar-track {\n    background: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n    background: var(--scrollbar);\n    border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n    background: var(--scrollbar-hover);\n}\n\n/* Theme toggle */\n#theme-list {\n    background: var(--sidebar-bg);\n    border: 1px solid var(--table-border);\n    border-radius: 8px;\n}\n\n#theme-list li {\n    color: var(--fg);\n}\n\n#theme-list li:hover {\n    background: var(--sidebar-active-bg);\n}\n\ndiv#mdbook-menu-bar,\ndiv#mdbook-menu-bar-hover-placeholder {\n    box-sizing: border-box;\n    padding: 1rem 0;\n}\n\ndiv#mdbook-content {\n    max-height: calc(100vh - 80px);\n    box-sizing: border-box;\n    padding: 2rem 4rem;\n    display: grid;\n    grid-template-columns: var(--content-size) 28rem;\n    justify-content: center;\n    gap: 3rem;\n    overflow-y: auto;\n    scroll-behavior: smooth;\n}\n\ndiv#mdbook-content p {\n    line-height: 1.75;\n}\n\ndiv#mdbook-content main {\n    max-width: 100%;\n}\n\ndiv#mdbook-content main a.header:hover,\ndiv#mdbook-content main a {\n    font-weight: 600;\n    color: var(--text-color);\n    border-bottom: 1px solid var(--text-color);\n    text-decoration: none;\n}\ndiv#mdbook-content main a:hover {\n    border-bottom-width: 2px;\n}\n\ndiv#mdbook-content main a.header {\n    border-bottom: none;\n}\n\n/* Right Sidebar (TOC) */\n.page-wrapper.has-right-sidebar {\n    display: grid;\n    grid-template-columns: auto 1fr 220px;\n}\n\n.right-sidebar {\n    position: sticky;\n    top: 60px;\n    right: 0px;\n    height: fit-content;\n    max-height: calc(100vh - 8px);\n    overflow-y: auto;\n    border-left: 1px solid var(--table-border);\n    background: var(--bg);\n    margin-left: 2.5rem;\n    padding-left: 1rem;\n}\n\n.right-sidebar-header {\n    color: var(--sidebar-fg);\n    margin-bottom: 12px;\n    padding-left: 8px;\n}\n\n.right-sidebar-toc {\n    list-style: none;\n    padding: 0;\n    margin: 0;\n}\n\n.right-sidebar-toc ol {\n    list-style: none;\n    padding-left: 12px;\n    margin: 0;\n}\n\n.right-sidebar-toc li {\n    margin: 0;\n}\n\n/* Adjust content width when right sidebar exists */\n.page-wrapper.has-right-sidebar .content {\n    max-width: 100%;\n}\n\n/* Hide right sidebar on small screens */\n@media (max-width: 1100px) {\n    .page-wrapper.has-right-sidebar {\n        grid-template-columns: auto 1fr;\n    }\n\n    .right-sidebar {\n        display: none;\n    }\n}\n';
  const mintlifyDarkCSS = "/* Mintlify-inspired Dark Theme for mdBook */\n:root {\n  --bg: #0a0d0d;\n  --fg: #e5e7eb;\n  --sidebar-bg: #111414;\n  --sidebar-fg: #9ca3af;\n  --sidebar-active: #26bd6c;\n  --sidebar-active-bg: rgba(38, 189, 108, 0.15);\n  --links: #26bd6c;\n  --links-hover: #4ade80;\n  --inline-code-bg: #1f2424;\n  --code-bg: #161a1a;\n  --code-fg: #e5e7eb;\n  --quote-bg: #1f2424;\n  --quote-border: #26bd6c;\n  --table-border: #2d3333;\n  --table-header-bg: #1f2424;\n  --search-bg: #161a1a;\n  --search-border: #2d3333;\n  --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);\n  --scrollbar: #3d4343;\n  --scrollbar-hover: #4d5555;\n}\n\nhtml {\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  background: var(--bg);\n  color: var(--fg);\n  scroll-behavior: smooth;\n}\n\nbody {\n  background: var(--bg);\n  color: var(--fg);\n}\n\n/* Sidebar */\n.sidebar {\n  background: var(--sidebar-bg);\n  border-right: 1px solid var(--table-border);\n}\n\n.sidebar .sidebar-scrollbox {\n  background: var(--sidebar-bg);\n}\n\n.sidebar ol.chapter li a {\n  color: var(--sidebar-fg);\n  padding: 8px 16px;\n  border-radius: 8px;\n  margin: 2px 8px;\n  transition: all 0.15s ease;\n}\n\n.sidebar ol.chapter li a:hover {\n  background: var(--sidebar-active-bg);\n  color: var(--sidebar-active);\n  text-decoration: none;\n}\n\n.sidebar ol.chapter li.chapter-item.expanded > a,\n.sidebar ol.chapter li a.active {\n  background: var(--sidebar-active-bg);\n  color: var(--sidebar-active);\n  font-weight: 600;\n}\n\n/* Main content */\n.content {\n  max-width: 800px;\n  padding: 24px 48px;\n}\n\n.content main {\n  max-width: 100%;\n}\n\n/* Typography */\nh1, h2, h3, h4, h5, h6 {\n  color: #ffffff;\n  font-weight: 600;\n  margin-top: 2em;\n  margin-bottom: 0.5em;\n  line-height: 1.3;\n}\n\nh1 { font-size: 2.25rem; margin-top: 0; }\nh2 { font-size: 1.75rem; border-bottom: 1px solid var(--table-border); padding-bottom: 0.5rem; }\nh3 { font-size: 1.375rem; }\nh4 { font-size: 1.125rem; }\n\np {\n  line-height: 1.75;\n  margin: 1em 0;\n}\n\n/* Links */\na {\n  color: var(--links);\n  text-decoration: none;\n  transition: color 0.15s ease;\n}\n\na:hover {\n  color: var(--links-hover);\n  text-decoration: underline;\n}\n\n/* Code */\ncode {\n  font-family: 'Geist Mono', 'Fira Code', 'JetBrains Mono', monospace;\n  font-size: 0.875em;\n}\n\n:not(pre) > code {\n  background: var(--inline-code-bg);\n  padding: 0.2em 0.4em;\n  border-radius: 6px;\n  color: var(--sidebar-active);\n}\n\npre {\n  background: var(--code-bg) !important;\n  color: var(--code-fg);\n  padding: 16px 20px;\n  border-radius: 12px;\n  overflow-x: auto;\n  margin: 1.5em 0;\n  border: 1px solid var(--table-border);\n}\n\npre code {\n  background: transparent;\n  padding: 0;\n  color: inherit;\n}\n\n/* Blockquotes */\nblockquote {\n  background: var(--quote-bg);\n  border-left: 4px solid var(--quote-border);\n  margin: 1.5em 0;\n  padding: 16px 20px;\n  border-radius: 0 12px 12px 0;\n}\n\nblockquote p {\n  margin: 0;\n}\n\n/* Tables */\ntable {\n  border-collapse: collapse;\n  width: 100%;\n  margin: 1.5em 0;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid var(--table-border);\n}\n\nth {\n  background: var(--table-header-bg);\n  font-weight: 600;\n  text-align: left;\n}\n\nth, td {\n  padding: 12px 16px;\n  border-bottom: 1px solid var(--table-border);\n}\n\ntr:last-child td {\n  border-bottom: none;\n}\n\n/* Menu bar */\n#menu-bar {\n  background: var(--bg);\n  border-bottom: 1px solid var(--table-border);\n}\n\n#menu-bar i {\n  color: var(--fg);\n}\n\n/* Search */\n#searchbar {\n  background: var(--search-bg);\n  border: 1px solid var(--search-border);\n  border-radius: 8px;\n  padding: 8px 12px;\n  box-shadow: var(--searchbar-shadow);\n  color: var(--fg);\n}\n\n/* Navigation buttons */\n.nav-chapters {\n  color: var(--links);\n  opacity: 0.8;\n  transition: opacity 0.15s ease;\n}\n\n.nav-chapters:hover {\n  color: var(--links-hover);\n  opacity: 1;\n}\n\n/* Scrollbar */\n::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n\n::-webkit-scrollbar-track {\n  background: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n  background: var(--scrollbar);\n  border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n  background: var(--scrollbar-hover);\n}\n\n/* Theme toggle */\n#theme-list {\n  background: var(--sidebar-bg);\n  border: 1px solid var(--table-border);\n  border-radius: 8px;\n}\n\n#theme-list li {\n  color: var(--fg);\n}\n\n#theme-list li:hover {\n  background: var(--sidebar-active-bg);\n}\n\n/* Right Sidebar (TOC) */\n.page-wrapper.has-right-sidebar {\n  display: grid;\n  grid-template-columns: auto 1fr 220px;\n}\n\n.right-sidebar {\n  position: sticky;\n  top: 60px;\n  height: fit-content;\n  max-height: calc(100vh - 80px);\n  overflow-y: auto;\n  padding: 24px 16px;\n  border-left: 1px solid var(--table-border);\n  background: var(--bg);\n}\n\n.right-sidebar-header {\n  font-size: 12px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  color: var(--sidebar-fg);\n  margin-bottom: 12px;\n  padding-left: 8px;\n}\n\n.right-sidebar-toc {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n}\n\n.right-sidebar-toc ol {\n  list-style: none;\n  padding-left: 12px;\n  margin: 0;\n}\n\n.right-sidebar-toc li {\n  margin: 0;\n}\n\n.right-sidebar-toc li a {\n  display: block;\n  padding: 6px 8px;\n  font-size: 13px;\n  color: var(--sidebar-fg);\n  border-radius: 4px;\n  transition: all 0.15s ease;\n  border-left: 2px solid transparent;\n}\n\n.right-sidebar-toc li a:hover {\n  color: var(--sidebar-active);\n  background: var(--sidebar-active-bg);\n  text-decoration: none;\n}\n\n.right-sidebar-toc li a.active {\n  color: var(--sidebar-active);\n  border-left-color: var(--sidebar-active);\n  background: var(--sidebar-active-bg);\n}\n\n/* Adjust content width when right sidebar exists */\n.page-wrapper.has-right-sidebar .content {\n  max-width: 100%;\n}\n\n/* Hide right sidebar on small screens */\n@media (max-width: 1100px) {\n  .page-wrapper.has-right-sidebar {\n    grid-template-columns: auto 1fr;\n  }\n\n  .right-sidebar {\n    display: none;\n  }\n}\n";
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
                // 监听子节点的新增或删除
                subtree: true
                // 监听整个子树
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHd4dC1kZXYrYnJvd3NlckAwLjEuMzIvbm9kZV9tb2R1bGVzL0B3eHQtZGV2L2Jyb3dzZXIvc3JjL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyLm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9tYW55LWtleXMtbWFwQDIuMC4xL25vZGVfbW9kdWxlcy9tYW55LWtleXMtbWFwL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RlZnVANi4xLjQvbm9kZV9tb2R1bGVzL2RlZnUvZGlzdC9kZWZ1Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AMW5hdHN1K3dhaXQtZWxlbWVudEA0LjEuMi9ub2RlX21vZHVsZXMvQDFuYXRzdS93YWl0LWVsZW1lbnQvZGlzdC9kZXRlY3RvcnMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0AxbmF0c3Urd2FpdC1lbGVtZW50QDQuMS4yL25vZGVfbW9kdWxlcy9AMW5hdHN1L3dhaXQtZWxlbWVudC9kaXN0L2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LXVpL3NoYXJlZC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvY29udGVudC1zY3JpcHQtdWkvaW50ZWdyYXRlZC5tanMiLCIuLi8uLi8uLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LWxpZ2h0LmNzcz9yYXciLCIuLi8uLi8uLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LWRhcmsuY3NzP3JhdyIsIi4uLy4uLy4uL2VudHJ5cG9pbnRzL2NvbnRlbnQudHMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvaW50ZXJuYWwvY3VzdG9tLWV2ZW50cy5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvaW50ZXJuYWwvbG9jYXRpb24td2F0Y2hlci5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvY29udGVudC1zY3JpcHQtY29udGV4dC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUNvbnRlbnRTY3JpcHQoZGVmaW5pdGlvbikge1xuICByZXR1cm4gZGVmaW5pdGlvbjtcbn1cbiIsIi8vICNyZWdpb24gc25pcHBldFxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBnbG9iYWxUaGlzLmJyb3dzZXI/LnJ1bnRpbWU/LmlkXG4gID8gZ2xvYmFsVGhpcy5icm93c2VyXG4gIDogZ2xvYmFsVGhpcy5jaHJvbWU7XG4vLyAjZW5kcmVnaW9uIHNuaXBwZXRcbiIsImltcG9ydCB7IGJyb3dzZXIgYXMgX2Jyb3dzZXIgfSBmcm9tIFwiQHd4dC1kZXYvYnJvd3NlclwiO1xuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBfYnJvd3NlcjtcbmV4cG9ydCB7fTtcbiIsImNvbnN0IG51bGxLZXkgPSBTeW1ib2woJ251bGwnKTsgLy8gYG9iamVjdEhhc2hlc2Aga2V5IGZvciBudWxsXG5cbmxldCBrZXlDb3VudGVyID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFueUtleXNNYXAgZXh0ZW5kcyBNYXAge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fb2JqZWN0SGFzaGVzID0gbmV3IFdlYWtNYXAoKTtcblx0XHR0aGlzLl9zeW1ib2xIYXNoZXMgPSBuZXcgTWFwKCk7IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L2VjbWEyNjIvaXNzdWVzLzExOTRcblx0XHR0aGlzLl9wdWJsaWNLZXlzID0gbmV3IE1hcCgpO1xuXG5cdFx0Y29uc3QgW3BhaXJzXSA9IGFyZ3VtZW50czsgLy8gTWFwIGNvbXBhdFxuXHRcdGlmIChwYWlycyA9PT0gbnVsbCB8fCBwYWlycyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBwYWlyc1tTeW1ib2wuaXRlcmF0b3JdICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHR5cGVvZiBwYWlycyArICcgaXMgbm90IGl0ZXJhYmxlIChjYW5ub3QgcmVhZCBwcm9wZXJ0eSBTeW1ib2woU3ltYm9sLml0ZXJhdG9yKSknKTtcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IFtrZXlzLCB2YWx1ZV0gb2YgcGFpcnMpIHtcblx0XHRcdHRoaXMuc2V0KGtleXMsIHZhbHVlKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0UHVibGljS2V5cyhrZXlzLCBjcmVhdGUgPSBmYWxzZSkge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShrZXlzKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGtleXMgcGFyYW1ldGVyIG11c3QgYmUgYW4gYXJyYXknKTtcblx0XHR9XG5cblx0XHRjb25zdCBwcml2YXRlS2V5ID0gdGhpcy5fZ2V0UHJpdmF0ZUtleShrZXlzLCBjcmVhdGUpO1xuXG5cdFx0bGV0IHB1YmxpY0tleTtcblx0XHRpZiAocHJpdmF0ZUtleSAmJiB0aGlzLl9wdWJsaWNLZXlzLmhhcyhwcml2YXRlS2V5KSkge1xuXHRcdFx0cHVibGljS2V5ID0gdGhpcy5fcHVibGljS2V5cy5nZXQocHJpdmF0ZUtleSk7XG5cdFx0fSBlbHNlIGlmIChjcmVhdGUpIHtcblx0XHRcdHB1YmxpY0tleSA9IFsuLi5rZXlzXTsgLy8gUmVnZW5lcmF0ZSBrZXlzIGFycmF5IHRvIGF2b2lkIGV4dGVybmFsIGludGVyYWN0aW9uXG5cdFx0XHR0aGlzLl9wdWJsaWNLZXlzLnNldChwcml2YXRlS2V5LCBwdWJsaWNLZXkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7cHJpdmF0ZUtleSwgcHVibGljS2V5fTtcblx0fVxuXG5cdF9nZXRQcml2YXRlS2V5KGtleXMsIGNyZWF0ZSA9IGZhbHNlKSB7XG5cdFx0Y29uc3QgcHJpdmF0ZUtleXMgPSBbXTtcblx0XHRmb3IgKGxldCBrZXkgb2Yga2V5cykge1xuXHRcdFx0aWYgKGtleSA9PT0gbnVsbCkge1xuXHRcdFx0XHRrZXkgPSBudWxsS2V5O1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBoYXNoZXMgPSB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyB8fCB0eXBlb2Yga2V5ID09PSAnZnVuY3Rpb24nID8gJ19vYmplY3RIYXNoZXMnIDogKHR5cGVvZiBrZXkgPT09ICdzeW1ib2wnID8gJ19zeW1ib2xIYXNoZXMnIDogZmFsc2UpO1xuXG5cdFx0XHRpZiAoIWhhc2hlcykge1xuXHRcdFx0XHRwcml2YXRlS2V5cy5wdXNoKGtleSk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXNbaGFzaGVzXS5oYXMoa2V5KSkge1xuXHRcdFx0XHRwcml2YXRlS2V5cy5wdXNoKHRoaXNbaGFzaGVzXS5nZXQoa2V5KSk7XG5cdFx0XHR9IGVsc2UgaWYgKGNyZWF0ZSkge1xuXHRcdFx0XHRjb25zdCBwcml2YXRlS2V5ID0gYEBAbWttLXJlZi0ke2tleUNvdW50ZXIrK31AQGA7XG5cdFx0XHRcdHRoaXNbaGFzaGVzXS5zZXQoa2V5LCBwcml2YXRlS2V5KTtcblx0XHRcdFx0cHJpdmF0ZUtleXMucHVzaChwcml2YXRlS2V5KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJpdmF0ZUtleXMpO1xuXHR9XG5cblx0c2V0KGtleXMsIHZhbHVlKSB7XG5cdFx0Y29uc3Qge3B1YmxpY0tleX0gPSB0aGlzLl9nZXRQdWJsaWNLZXlzKGtleXMsIHRydWUpO1xuXHRcdHJldHVybiBzdXBlci5zZXQocHVibGljS2V5LCB2YWx1ZSk7XG5cdH1cblxuXHRnZXQoa2V5cykge1xuXHRcdGNvbnN0IHtwdWJsaWNLZXl9ID0gdGhpcy5fZ2V0UHVibGljS2V5cyhrZXlzKTtcblx0XHRyZXR1cm4gc3VwZXIuZ2V0KHB1YmxpY0tleSk7XG5cdH1cblxuXHRoYXMoa2V5cykge1xuXHRcdGNvbnN0IHtwdWJsaWNLZXl9ID0gdGhpcy5fZ2V0UHVibGljS2V5cyhrZXlzKTtcblx0XHRyZXR1cm4gc3VwZXIuaGFzKHB1YmxpY0tleSk7XG5cdH1cblxuXHRkZWxldGUoa2V5cykge1xuXHRcdGNvbnN0IHtwdWJsaWNLZXksIHByaXZhdGVLZXl9ID0gdGhpcy5fZ2V0UHVibGljS2V5cyhrZXlzKTtcblx0XHRyZXR1cm4gQm9vbGVhbihwdWJsaWNLZXkgJiYgc3VwZXIuZGVsZXRlKHB1YmxpY0tleSkgJiYgdGhpcy5fcHVibGljS2V5cy5kZWxldGUocHJpdmF0ZUtleSkpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0c3VwZXIuY2xlYXIoKTtcblx0XHR0aGlzLl9zeW1ib2xIYXNoZXMuY2xlYXIoKTtcblx0XHR0aGlzLl9wdWJsaWNLZXlzLmNsZWFyKCk7XG5cdH1cblxuXHRnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG5cdFx0cmV0dXJuICdNYW55S2V5c01hcCc7XG5cdH1cblxuXHRnZXQgc2l6ZSgpIHtcblx0XHRyZXR1cm4gc3VwZXIuc2l6ZTtcblx0fVxufVxuIiwiZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSk7XG4gIGlmIChwcm90b3R5cGUgIT09IG51bGwgJiYgcHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90b3R5cGUpICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gdmFsdWUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKFN5bWJvbC50b1N0cmluZ1RhZyBpbiB2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgTW9kdWxlXVwiO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBfZGVmdShiYXNlT2JqZWN0LCBkZWZhdWx0cywgbmFtZXNwYWNlID0gXCIuXCIsIG1lcmdlcikge1xuICBpZiAoIWlzUGxhaW5PYmplY3QoZGVmYXVsdHMpKSB7XG4gICAgcmV0dXJuIF9kZWZ1KGJhc2VPYmplY3QsIHt9LCBuYW1lc3BhY2UsIG1lcmdlcik7XG4gIH1cbiAgY29uc3Qgb2JqZWN0ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMpO1xuICBmb3IgKGNvbnN0IGtleSBpbiBiYXNlT2JqZWN0KSB7XG4gICAgaWYgKGtleSA9PT0gXCJfX3Byb3RvX19cIiB8fCBrZXkgPT09IFwiY29uc3RydWN0b3JcIikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gYmFzZU9iamVjdFtrZXldO1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKG1lcmdlciAmJiBtZXJnZXIob2JqZWN0LCBrZXksIHZhbHVlLCBuYW1lc3BhY2UpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIEFycmF5LmlzQXJyYXkob2JqZWN0W2tleV0pKSB7XG4gICAgICBvYmplY3Rba2V5XSA9IFsuLi52YWx1ZSwgLi4ub2JqZWN0W2tleV1dO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWx1ZSkgJiYgaXNQbGFpbk9iamVjdChvYmplY3Rba2V5XSkpIHtcbiAgICAgIG9iamVjdFtrZXldID0gX2RlZnUoXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBvYmplY3Rba2V5XSxcbiAgICAgICAgKG5hbWVzcGFjZSA/IGAke25hbWVzcGFjZX0uYCA6IFwiXCIpICsga2V5LnRvU3RyaW5nKCksXG4gICAgICAgIG1lcmdlclxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZURlZnUobWVyZ2VyKSB7XG4gIHJldHVybiAoLi4uYXJndW1lbnRzXykgPT4gKFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSB1bmljb3JuL25vLWFycmF5LXJlZHVjZVxuICAgIGFyZ3VtZW50c18ucmVkdWNlKChwLCBjKSA9PiBfZGVmdShwLCBjLCBcIlwiLCBtZXJnZXIpLCB7fSlcbiAgKTtcbn1cbmNvbnN0IGRlZnUgPSBjcmVhdGVEZWZ1KCk7XG5jb25zdCBkZWZ1Rm4gPSBjcmVhdGVEZWZ1KChvYmplY3QsIGtleSwgY3VycmVudFZhbHVlKSA9PiB7XG4gIGlmIChvYmplY3Rba2V5XSAhPT0gdm9pZCAwICYmIHR5cGVvZiBjdXJyZW50VmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIG9iamVjdFtrZXldID0gY3VycmVudFZhbHVlKG9iamVjdFtrZXldKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufSk7XG5jb25zdCBkZWZ1QXJyYXlGbiA9IGNyZWF0ZURlZnUoKG9iamVjdCwga2V5LCBjdXJyZW50VmFsdWUpID0+IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0W2tleV0pICYmIHR5cGVvZiBjdXJyZW50VmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIG9iamVjdFtrZXldID0gY3VycmVudFZhbHVlKG9iamVjdFtrZXldKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufSk7XG5cbmV4cG9ydCB7IGNyZWF0ZURlZnUsIGRlZnUgYXMgZGVmYXVsdCwgZGVmdSwgZGVmdUFycmF5Rm4sIGRlZnVGbiB9O1xuIiwiY29uc3QgaXNFeGlzdCA9IChlbGVtZW50KSA9PiB7XG4gIHJldHVybiBlbGVtZW50ICE9PSBudWxsID8geyBpc0RldGVjdGVkOiB0cnVlLCByZXN1bHQ6IGVsZW1lbnQgfSA6IHsgaXNEZXRlY3RlZDogZmFsc2UgfTtcbn07XG5jb25zdCBpc05vdEV4aXN0ID0gKGVsZW1lbnQpID0+IHtcbiAgcmV0dXJuIGVsZW1lbnQgPT09IG51bGwgPyB7IGlzRGV0ZWN0ZWQ6IHRydWUsIHJlc3VsdDogbnVsbCB9IDogeyBpc0RldGVjdGVkOiBmYWxzZSB9O1xufTtcblxuZXhwb3J0IHsgaXNFeGlzdCwgaXNOb3RFeGlzdCB9O1xuIiwiaW1wb3J0IE1hbnlLZXlzTWFwIGZyb20gJ21hbnkta2V5cy1tYXAnO1xuaW1wb3J0IHsgZGVmdSB9IGZyb20gJ2RlZnUnO1xuaW1wb3J0IHsgaXNFeGlzdCB9IGZyb20gJy4vZGV0ZWN0b3JzLm1qcyc7XG5cbmNvbnN0IGdldERlZmF1bHRPcHRpb25zID0gKCkgPT4gKHtcbiAgdGFyZ2V0OiBnbG9iYWxUaGlzLmRvY3VtZW50LFxuICB1bmlmeVByb2Nlc3M6IHRydWUsXG4gIGRldGVjdG9yOiBpc0V4aXN0LFxuICBvYnNlcnZlQ29uZmlnczoge1xuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZXM6IHRydWVcbiAgfSxcbiAgc2lnbmFsOiB2b2lkIDAsXG4gIGN1c3RvbU1hdGNoZXI6IHZvaWQgMFxufSk7XG5jb25zdCBtZXJnZU9wdGlvbnMgPSAodXNlclNpZGVPcHRpb25zLCBkZWZhdWx0T3B0aW9ucykgPT4ge1xuICByZXR1cm4gZGVmdSh1c2VyU2lkZU9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKTtcbn07XG5cbmNvbnN0IHVuaWZ5Q2FjaGUgPSBuZXcgTWFueUtleXNNYXAoKTtcbmZ1bmN0aW9uIGNyZWF0ZVdhaXRFbGVtZW50KGluc3RhbmNlT3B0aW9ucykge1xuICBjb25zdCB7IGRlZmF1bHRPcHRpb25zIH0gPSBpbnN0YW5jZU9wdGlvbnM7XG4gIHJldHVybiAoc2VsZWN0b3IsIG9wdGlvbnMpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICB0YXJnZXQsXG4gICAgICB1bmlmeVByb2Nlc3MsXG4gICAgICBvYnNlcnZlQ29uZmlncyxcbiAgICAgIGRldGVjdG9yLFxuICAgICAgc2lnbmFsLFxuICAgICAgY3VzdG9tTWF0Y2hlclxuICAgIH0gPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdE9wdGlvbnMpO1xuICAgIGNvbnN0IHVuaWZ5UHJvbWlzZUtleSA9IFtcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgdGFyZ2V0LFxuICAgICAgdW5pZnlQcm9jZXNzLFxuICAgICAgb2JzZXJ2ZUNvbmZpZ3MsXG4gICAgICBkZXRlY3RvcixcbiAgICAgIHNpZ25hbCxcbiAgICAgIGN1c3RvbU1hdGNoZXJcbiAgICBdO1xuICAgIGNvbnN0IGNhY2hlZFByb21pc2UgPSB1bmlmeUNhY2hlLmdldCh1bmlmeVByb21pc2VLZXkpO1xuICAgIGlmICh1bmlmeVByb2Nlc3MgJiYgY2FjaGVkUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIGNhY2hlZFByb21pc2U7XG4gICAgfVxuICAgIGNvbnN0IGRldGVjdFByb21pc2UgPSBuZXcgUHJvbWlzZShcbiAgICAgIC8vIGJpb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9Bc3luY1Byb21pc2VFeGVjdXRvcjogYXZvaWQgbmVzdGluZyBwcm9taXNlXG4gICAgICBhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmIChzaWduYWw/LmFib3J0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KHNpZ25hbC5yZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoXG4gICAgICAgICAgYXN5bmMgKG11dGF0aW9ucykgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBfIG9mIG11dGF0aW9ucykge1xuICAgICAgICAgICAgICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGRldGVjdFJlc3VsdDIgPSBhd2FpdCBkZXRlY3RFbGVtZW50KHtcbiAgICAgICAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICAgICAgZGV0ZWN0b3IsXG4gICAgICAgICAgICAgICAgY3VzdG9tTWF0Y2hlclxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGRldGVjdFJlc3VsdDIuaXNEZXRlY3RlZCkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGRldGVjdFJlc3VsdDIucmVzdWx0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgc2lnbmFsPy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwiYWJvcnRcIixcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHNpZ25hbC5yZWFzb24pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgeyBvbmNlOiB0cnVlIH1cbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZGV0ZWN0UmVzdWx0ID0gYXdhaXQgZGV0ZWN0RWxlbWVudCh7XG4gICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgIGRldGVjdG9yLFxuICAgICAgICAgIGN1c3RvbU1hdGNoZXJcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChkZXRlY3RSZXN1bHQuaXNEZXRlY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGRldGVjdFJlc3VsdC5yZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUodGFyZ2V0LCBvYnNlcnZlQ29uZmlncyk7XG4gICAgICB9XG4gICAgKS5maW5hbGx5KCgpID0+IHtcbiAgICAgIHVuaWZ5Q2FjaGUuZGVsZXRlKHVuaWZ5UHJvbWlzZUtleSk7XG4gICAgfSk7XG4gICAgdW5pZnlDYWNoZS5zZXQodW5pZnlQcm9taXNlS2V5LCBkZXRlY3RQcm9taXNlKTtcbiAgICByZXR1cm4gZGV0ZWN0UHJvbWlzZTtcbiAgfTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGRldGVjdEVsZW1lbnQoe1xuICB0YXJnZXQsXG4gIHNlbGVjdG9yLFxuICBkZXRlY3RvcixcbiAgY3VzdG9tTWF0Y2hlclxufSkge1xuICBjb25zdCBlbGVtZW50ID0gY3VzdG9tTWF0Y2hlciA/IGN1c3RvbU1hdGNoZXIoc2VsZWN0b3IpIDogdGFyZ2V0LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICByZXR1cm4gYXdhaXQgZGV0ZWN0b3IoZWxlbWVudCk7XG59XG5jb25zdCB3YWl0RWxlbWVudCA9IGNyZWF0ZVdhaXRFbGVtZW50KHtcbiAgZGVmYXVsdE9wdGlvbnM6IGdldERlZmF1bHRPcHRpb25zKClcbn0pO1xuXG5leHBvcnQgeyBjcmVhdGVXYWl0RWxlbWVudCwgZ2V0RGVmYXVsdE9wdGlvbnMsIHdhaXRFbGVtZW50IH07XG4iLCJmdW5jdGlvbiBwcmludChtZXRob2QsIC4uLmFyZ3MpIHtcbiAgaWYgKGltcG9ydC5tZXRhLmVudi5NT0RFID09PSBcInByb2R1Y3Rpb25cIikgcmV0dXJuO1xuICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09IFwic3RyaW5nXCIpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYXJncy5zaGlmdCgpO1xuICAgIG1ldGhvZChgW3d4dF0gJHttZXNzYWdlfWAsIC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIG1ldGhvZChcIlt3eHRdXCIsIC4uLmFyZ3MpO1xuICB9XG59XG5leHBvcnQgY29uc3QgbG9nZ2VyID0ge1xuICBkZWJ1ZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZGVidWcsIC4uLmFyZ3MpLFxuICBsb2c6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmxvZywgLi4uYXJncyksXG4gIHdhcm46ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLndhcm4sIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZXJyb3IsIC4uLmFyZ3MpXG59O1xuIiwiaW1wb3J0IHsgd2FpdEVsZW1lbnQgfSBmcm9tIFwiQDFuYXRzdS93YWl0LWVsZW1lbnRcIjtcbmltcG9ydCB7XG4gIGlzRXhpc3QgYXMgbW91bnREZXRlY3RvcixcbiAgaXNOb3RFeGlzdCBhcyByZW1vdmVEZXRlY3RvclxufSBmcm9tIFwiQDFuYXRzdS93YWl0LWVsZW1lbnQvZGV0ZWN0b3JzXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvaW50ZXJuYWwvbG9nZ2VyLm1qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UG9zaXRpb24ocm9vdCwgcG9zaXRpb25lZEVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMucG9zaXRpb24gPT09IFwiaW5saW5lXCIpIHJldHVybjtcbiAgaWYgKG9wdGlvbnMuekluZGV4ICE9IG51bGwpIHJvb3Quc3R5bGUuekluZGV4ID0gU3RyaW5nKG9wdGlvbnMuekluZGV4KTtcbiAgcm9vdC5zdHlsZS5vdmVyZmxvdyA9IFwidmlzaWJsZVwiO1xuICByb290LnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICByb290LnN0eWxlLndpZHRoID0gXCIwXCI7XG4gIHJvb3Quc3R5bGUuaGVpZ2h0ID0gXCIwXCI7XG4gIHJvb3Quc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgaWYgKHBvc2l0aW9uZWRFbGVtZW50KSB7XG4gICAgaWYgKG9wdGlvbnMucG9zaXRpb24gPT09IFwib3ZlcmxheVwiKSB7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgIGlmIChvcHRpb25zLmFsaWdubWVudD8uc3RhcnRzV2l0aChcImJvdHRvbS1cIikpXG4gICAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLmJvdHRvbSA9IFwiMFwiO1xuICAgICAgZWxzZSBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS50b3AgPSBcIjBcIjtcbiAgICAgIGlmIChvcHRpb25zLmFsaWdubWVudD8uZW5kc1dpdGgoXCItcmlnaHRcIikpXG4gICAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnJpZ2h0ID0gXCIwXCI7XG4gICAgICBlbHNlIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS50b3AgPSBcIjBcIjtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLmJvdHRvbSA9IFwiMFwiO1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMFwiO1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUucmlnaHQgPSBcIjBcIjtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmNob3Iob3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5hbmNob3IgPT0gbnVsbCkgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gIGxldCByZXNvbHZlZCA9IHR5cGVvZiBvcHRpb25zLmFuY2hvciA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5hbmNob3IoKSA6IG9wdGlvbnMuYW5jaG9yO1xuICBpZiAodHlwZW9mIHJlc29sdmVkID09PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKHJlc29sdmVkLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBkb2N1bWVudC5ldmFsdWF0ZShcbiAgICAgICAgcmVzb2x2ZWQsXG4gICAgICAgIGRvY3VtZW50LFxuICAgICAgICBudWxsLFxuICAgICAgICBYUGF0aFJlc3VsdC5GSVJTVF9PUkRFUkVEX05PREVfVFlQRSxcbiAgICAgICAgbnVsbFxuICAgICAgKTtcbiAgICAgIHJldHVybiByZXN1bHQuc2luZ2xlTm9kZVZhbHVlID8/IHZvaWQgMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocmVzb2x2ZWQpID8/IHZvaWQgMDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc29sdmVkID8/IHZvaWQgMDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBtb3VudFVpKHJvb3QsIG9wdGlvbnMpIHtcbiAgY29uc3QgYW5jaG9yID0gZ2V0QW5jaG9yKG9wdGlvbnMpO1xuICBpZiAoYW5jaG9yID09IG51bGwpXG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICBcIkZhaWxlZCB0byBtb3VudCBjb250ZW50IHNjcmlwdCBVSTogY291bGQgbm90IGZpbmQgYW5jaG9yIGVsZW1lbnRcIlxuICAgICk7XG4gIHN3aXRjaCAob3B0aW9ucy5hcHBlbmQpIHtcbiAgICBjYXNlIHZvaWQgMDpcbiAgICBjYXNlIFwibGFzdFwiOlxuICAgICAgYW5jaG9yLmFwcGVuZChyb290KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJmaXJzdFwiOlxuICAgICAgYW5jaG9yLnByZXBlbmQocm9vdCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwicmVwbGFjZVwiOlxuICAgICAgYW5jaG9yLnJlcGxhY2VXaXRoKHJvb3QpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImFmdGVyXCI6XG4gICAgICBhbmNob3IucGFyZW50RWxlbWVudD8uaW5zZXJ0QmVmb3JlKHJvb3QsIGFuY2hvci5uZXh0RWxlbWVudFNpYmxpbmcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImJlZm9yZVwiOlxuICAgICAgYW5jaG9yLnBhcmVudEVsZW1lbnQ/Lmluc2VydEJlZm9yZShyb290LCBhbmNob3IpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG9wdGlvbnMuYXBwZW5kKGFuY2hvciwgcm9vdCk7XG4gICAgICBicmVhaztcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vdW50RnVuY3Rpb25zKGJhc2VGdW5jdGlvbnMsIG9wdGlvbnMpIHtcbiAgbGV0IGF1dG9Nb3VudEluc3RhbmNlID0gdm9pZCAwO1xuICBjb25zdCBzdG9wQXV0b01vdW50ID0gKCkgPT4ge1xuICAgIGF1dG9Nb3VudEluc3RhbmNlPy5zdG9wQXV0b01vdW50KCk7XG4gICAgYXV0b01vdW50SW5zdGFuY2UgPSB2b2lkIDA7XG4gIH07XG4gIGNvbnN0IG1vdW50ID0gKCkgPT4ge1xuICAgIGJhc2VGdW5jdGlvbnMubW91bnQoKTtcbiAgfTtcbiAgY29uc3QgdW5tb3VudCA9IGJhc2VGdW5jdGlvbnMucmVtb3ZlO1xuICBjb25zdCByZW1vdmUgPSAoKSA9PiB7XG4gICAgc3RvcEF1dG9Nb3VudCgpO1xuICAgIGJhc2VGdW5jdGlvbnMucmVtb3ZlKCk7XG4gIH07XG4gIGNvbnN0IGF1dG9Nb3VudCA9IChhdXRvTW91bnRPcHRpb25zKSA9PiB7XG4gICAgaWYgKGF1dG9Nb3VudEluc3RhbmNlKSB7XG4gICAgICBsb2dnZXIud2FybihcImF1dG9Nb3VudCBpcyBhbHJlYWR5IHNldC5cIik7XG4gICAgfVxuICAgIGF1dG9Nb3VudEluc3RhbmNlID0gYXV0b01vdW50VWkoXG4gICAgICB7IG1vdW50LCB1bm1vdW50LCBzdG9wQXV0b01vdW50IH0sXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIC4uLmF1dG9Nb3VudE9wdGlvbnNcbiAgICAgIH1cbiAgICApO1xuICB9O1xuICByZXR1cm4ge1xuICAgIG1vdW50LFxuICAgIHJlbW92ZSxcbiAgICBhdXRvTW91bnRcbiAgfTtcbn1cbmZ1bmN0aW9uIGF1dG9Nb3VudFVpKHVpQ2FsbGJhY2tzLCBvcHRpb25zKSB7XG4gIGNvbnN0IGFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgY29uc3QgRVhQTElDSVRfU1RPUF9SRUFTT04gPSBcImV4cGxpY2l0X3N0b3BfYXV0b19tb3VudFwiO1xuICBjb25zdCBfc3RvcEF1dG9Nb3VudCA9ICgpID0+IHtcbiAgICBhYm9ydENvbnRyb2xsZXIuYWJvcnQoRVhQTElDSVRfU1RPUF9SRUFTT04pO1xuICAgIG9wdGlvbnMub25TdG9wPy4oKTtcbiAgfTtcbiAgbGV0IHJlc29sdmVkQW5jaG9yID0gdHlwZW9mIG9wdGlvbnMuYW5jaG9yID09PSBcImZ1bmN0aW9uXCIgPyBvcHRpb25zLmFuY2hvcigpIDogb3B0aW9ucy5hbmNob3I7XG4gIGlmIChyZXNvbHZlZEFuY2hvciBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIFwiYXV0b01vdW50IGFuZCBFbGVtZW50IGFuY2hvciBvcHRpb24gY2Fubm90IGJlIGNvbWJpbmVkLiBBdm9pZCBwYXNzaW5nIGBFbGVtZW50YCBkaXJlY3RseSBvciBgKCkgPT4gRWxlbWVudGAgdG8gdGhlIGFuY2hvci5cIlxuICAgICk7XG4gIH1cbiAgYXN5bmMgZnVuY3Rpb24gb2JzZXJ2ZUVsZW1lbnQoc2VsZWN0b3IpIHtcbiAgICBsZXQgaXNBbmNob3JFeGlzdCA9ICEhZ2V0QW5jaG9yKG9wdGlvbnMpO1xuICAgIGlmIChpc0FuY2hvckV4aXN0KSB7XG4gICAgICB1aUNhbGxiYWNrcy5tb3VudCgpO1xuICAgIH1cbiAgICB3aGlsZSAoIWFib3J0Q29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2hhbmdlZEFuY2hvciA9IGF3YWl0IHdhaXRFbGVtZW50KHNlbGVjdG9yID8/IFwiYm9keVwiLCB7XG4gICAgICAgICAgY3VzdG9tTWF0Y2hlcjogKCkgPT4gZ2V0QW5jaG9yKG9wdGlvbnMpID8/IG51bGwsXG4gICAgICAgICAgZGV0ZWN0b3I6IGlzQW5jaG9yRXhpc3QgPyByZW1vdmVEZXRlY3RvciA6IG1vdW50RGV0ZWN0b3IsXG4gICAgICAgICAgc2lnbmFsOiBhYm9ydENvbnRyb2xsZXIuc2lnbmFsXG4gICAgICAgIH0pO1xuICAgICAgICBpc0FuY2hvckV4aXN0ID0gISFjaGFuZ2VkQW5jaG9yO1xuICAgICAgICBpZiAoaXNBbmNob3JFeGlzdCkge1xuICAgICAgICAgIHVpQ2FsbGJhY2tzLm1vdW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdWlDYWxsYmFja3MudW5tb3VudCgpO1xuICAgICAgICAgIGlmIChvcHRpb25zLm9uY2UpIHtcbiAgICAgICAgICAgIHVpQ2FsbGJhY2tzLnN0b3BBdXRvTW91bnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChhYm9ydENvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQgJiYgYWJvcnRDb250cm9sbGVyLnNpZ25hbC5yZWFzb24gPT09IEVYUExJQ0lUX1NUT1BfUkVBU09OKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgb2JzZXJ2ZUVsZW1lbnQocmVzb2x2ZWRBbmNob3IpO1xuICByZXR1cm4geyBzdG9wQXV0b01vdW50OiBfc3RvcEF1dG9Nb3VudCB9O1xufVxuIiwiaW1wb3J0IHsgYXBwbHlQb3NpdGlvbiwgY3JlYXRlTW91bnRGdW5jdGlvbnMsIG1vdW50VWkgfSBmcm9tIFwiLi9zaGFyZWQubWpzXCI7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW50ZWdyYXRlZFVpKGN0eCwgb3B0aW9ucykge1xuICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvcHRpb25zLnRhZyB8fCBcImRpdlwiKTtcbiAgbGV0IG1vdW50ZWQgPSB2b2lkIDA7XG4gIGNvbnN0IG1vdW50ID0gKCkgPT4ge1xuICAgIGFwcGx5UG9zaXRpb24od3JhcHBlciwgdm9pZCAwLCBvcHRpb25zKTtcbiAgICBtb3VudFVpKHdyYXBwZXIsIG9wdGlvbnMpO1xuICAgIG1vdW50ZWQgPSBvcHRpb25zLm9uTW91bnQ/Lih3cmFwcGVyKTtcbiAgfTtcbiAgY29uc3QgcmVtb3ZlID0gKCkgPT4ge1xuICAgIG9wdGlvbnMub25SZW1vdmU/Lihtb3VudGVkKTtcbiAgICB3cmFwcGVyLnJlcGxhY2VDaGlsZHJlbigpO1xuICAgIHdyYXBwZXIucmVtb3ZlKCk7XG4gICAgbW91bnRlZCA9IHZvaWQgMDtcbiAgfTtcbiAgY29uc3QgbW91bnRGdW5jdGlvbnMgPSBjcmVhdGVNb3VudEZ1bmN0aW9ucyhcbiAgICB7XG4gICAgICBtb3VudCxcbiAgICAgIHJlbW92ZVxuICAgIH0sXG4gICAgb3B0aW9uc1xuICApO1xuICBjdHgub25JbnZhbGlkYXRlZChyZW1vdmUpO1xuICByZXR1cm4ge1xuICAgIGdldCBtb3VudGVkKCkge1xuICAgICAgcmV0dXJuIG1vdW50ZWQ7XG4gICAgfSxcbiAgICB3cmFwcGVyLFxuICAgIC4uLm1vdW50RnVuY3Rpb25zXG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBcIi8qIE1pbnRsaWZ5LWluc3BpcmVkIExpZ2h0IFRoZW1lIGZvciBtZEJvb2sgKi9cXG46cm9vdCB7XFxuICAgIC0tYmc6ICNmZmZmZmY7XFxuICAgIC0tZmc6ICMwYTBkMGQ7XFxuICAgIC0tc2lkZWJhci1iZzogI2Y4ZmFmOTtcXG4gICAgLS1zaWRlYmFyLWZnOiAjMzc0MTUxO1xcbiAgICAtLXNpZGViYXItYWN0aXZlOiAjMTY2ZTNmO1xcbiAgICAtLXNpZGViYXItYWN0aXZlLWJnOiByZ2JhKDIyLCAxMTAsIDYzLCAwLjEpO1xcbiAgICAtLXNpZGViYXItaGVhZGVyLWJvcmRlci1jb2xvcjogdmFyKC0tc2lkZWJhci1hY3RpdmUpO1xcbiAgICAtLWxpbmtzOiAjMTY2ZTNmO1xcbiAgICAtLWxpbmtzLWhvdmVyOiAjMjZiZDZjO1xcbiAgICAtLWlubGluZS1jb2RlLWJnOiAjZjNmNmY0O1xcbiAgICAtLWlubGluZS1jb2RlLWNvbG9yOiByZ2JhKDIzOCwgMjQxLCAyMzksIDAuNSk7XFxuICAgIC0tY29kZS1iZzogIzBhMGQwZDtcXG4gICAgLS1jb2RlLWZnOiAjZTVlN2ViO1xcbiAgICAtLXF1b3RlLWJnOiAjZjNmNmY0O1xcbiAgICAtLXF1b3RlLWJvcmRlcjogIzI2YmQ2YztcXG4gICAgLS10YWJsZS1ib3JkZXI6ICNlNWU3ZWI7XFxuICAgIC0tdGFibGUtaGVhZGVyLWJnOiAjZjNmNmY0O1xcbiAgICAtLXNlYXJjaC1iZzogI2ZmZmZmZjtcXG4gICAgLS1zZWFyY2gtYm9yZGVyOiAjZTVlN2ViO1xcbiAgICAtLXNlYXJjaGJhci1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSk7XFxuICAgIC0tc2Nyb2xsYmFyOiAjZDFkNWRiO1xcbiAgICAtLXNjcm9sbGJhci1ob3ZlcjogIzljYTNhZjtcXG4gICAgLS1vcmRlci13ZWlnaHQ6IDQwMDtcXG4gICAgLS1vcmRlci1kaXNwbGF5OiBub25lO1xcbiAgICAtLWNoYXB0ZXItbmF2LWRpc3BsYXk6IG5vbmU7XFxuICAgIC0tc2lkZWJhci10ZXh0LXNpemU6IDE2cHg7XFxuICAgIC0tYm9keS10ZXh0LWNvbG9yOiByZ2IoNjMsIDY1LCA2NCk7XFxuICAgIC0tdGV4dC1jb2xvcjogcmdiKDE3LCAyNCwgMzkpO1xcbiAgICAtLWNvbnRlbnQtc2l6ZTogMzZyZW07XFxuICAgIC0tcm9vdC1mb250LXNpemU6IDE4cHg7XFxuICAgIC0tbW9uby1mb250OlxcbiAgICAgICAgXFxcIkdlaXN0IE1vbm9cXFwiLCBcXFwiTWVubG9cXFwiLCBcXFwiTW9uYWNvXFxcIiwgXFxcIkx1Y2lkYSBDb25zb2xlXFxcIiwgXFxcIkxpYmVyYXRpb24gTW9ub1xcXCIsXFxuICAgICAgICBcXFwiRGVqYVZ1IFNhbnMgTW9ub1xcXCIsIFxcXCJCaXRzdHJlYW0gVmVyYSBTYW5zIE1vbm9cXFwiLCBcXFwiQ291cmllciBOZXdcXFwiLCBtb25vc3BhY2U7XFxuICAgIGZvbnQtc2l6ZTogdmFyKC0tcm9vdC1mb250LXNpemUpO1xcbn1cXG5cXG46bm90KHByZSkgPiBjb2RlLmhsanMge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1pbmxpbmUtY29kZS1jb2xvcik7XFxuICAgIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgcGFkZGluZzogMC4xMjVyZW0gMC41cmVtO1xcbiAgICBtYXJnaW46IDAgMC4xMjVyZW07XFxufVxcblxcbmh0bWwge1xcbiAgICBmb250LWZhbWlseTpcXG4gICAgICAgIFxcXCJJbnRlclxcXCIsXFxuICAgICAgICAtYXBwbGUtc3lzdGVtLFxcbiAgICAgICAgQmxpbmtNYWNTeXN0ZW1Gb250LFxcbiAgICAgICAgXFxcIlNlZ29lIFVJXFxcIixcXG4gICAgICAgIFJvYm90byxcXG4gICAgICAgIHNhbnMtc2VyaWY7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xcbiAgICBoZWlnaHQ6IDEwMGR2aDtcXG59XFxuXFxuYm9keSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgY29sb3I6IHZhcigtLWJvZHktdGV4dC1jb2xvcik7XFxuICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcXG59XFxuXFxubmF2Lm5hdi13aWRlLXdyYXBwZXIgYS5uYXYtY2hhcHRlcnMge1xcbiAgICBkaXNwbGF5OiB2YXIoLS1jaGFwdGVyLW5hdi1kaXNwbGF5KTtcXG59XFxuXFxuLyogU2lkZWJhciAqL1xcbi5zaWRlYmFyIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1iZyk7XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbi5zaWRlYmFyIC5zaWRlYmFyLXNjcm9sbGJveCB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbn1cXG5cXG5zcGFuLmNoYXB0ZXItbGluay13cmFwcGVyIGEge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG59XFxuc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlciB7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItZmcpO1xcbiAgICBwYWRkaW5nOiA0cHggMTZweDtcXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTtcXG4gICAgZm9udC1zaXplOiB2YXIoLS1zaWRlYmFyLXRleHQtc2l6ZSk7XFxufVxcblxcbi8qLnNpZGViYXIgb2wuY2hhcHRlciA+IGxpLmNoYXB0ZXItaXRlbSA+IHNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXIge1xcbiAgICBmb250LXdlaWdodDogYm9sZDtcXG59Ki9cXG5cXG4vKi5zaWRlYmFyIG9sLmNoYXB0ZXIgbGkgLmNoYXB0ZXItaXRlbS5leHBhbmRlZCA+IGEsKi9cXG5zcGFuLmNoYXB0ZXItbGluay13cmFwcGVyOmhhcyhhLmFjdGl2ZSksXFxuc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlcjpob3ZlciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYWN0aXZlLWJnKTtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG4vKiBUeXBvZ3JhcGh5ICovXFxuaDEsXFxuaDIsXFxuaDMsXFxuaDQsXFxuaDUsXFxuaDYge1xcbiAgICBjb2xvcjogdmFyKC0tZmcpO1xcbiAgICBmb250LXdlaWdodDogNjAwO1xcbiAgICBtYXJnaW4tdG9wOiAyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IDAuNWVtO1xcbiAgICBsaW5lLWhlaWdodDogMS4zO1xcbn1cXG5cXG5oMS5tZW51LXRpdGxlIHtcXG4gICAgZm9udC1zaXplOiAxLjc1ZW07XFxuICAgIG1hcmdpbi10b3A6IDA7XFxufVxcbmgyIHtcXG4gICAgZm9udC1zaXplOiAxLjVlbTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxuICAgIHBhZGRpbmctYm90dG9tOiAwLjVlbTtcXG59XFxuaDMge1xcbiAgICBmb250LXNpemU6IDEuMjVlbTtcXG59XFxuaDQge1xcbiAgICBmb250LXNpemU6IDFlbTtcXG59XFxuXFxucCB7XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjc1O1xcbiAgICBtYXJnaW46IDFlbSAwO1xcbn1cXG5cXG4vKiBMaW5rcyAqL1xcbmEge1xcbiAgICBjb2xvcjogdmFyKC0tbGlua3MpO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIHRyYW5zaXRpb246IGNvbG9yIDAuMTVzIGVhc2U7XFxufVxcblxcbmE6aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tbGlua3MtaG92ZXIpO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcXG59XFxuXFxuLyogQ29kZSAqL1xcbmNvZGUge1xcbiAgICBmb250LWZhbWlseTogXFxcIkdlaXN0IE1vbm9cXFwiLCBcXFwiRmlyYSBDb2RlXFxcIiwgXFxcIkpldEJyYWlucyBNb25vXFxcIiwgbW9ub3NwYWNlO1xcbiAgICBmb250LXNpemU6IDAuODc1ZW07XFxufVxcblxcbnN0cm9uZyB7XFxuICAgIGRpc3BsYXk6IHZhcigtLW9yZGVyLWRpc3BsYXkpO1xcbiAgICBmb250LXdlaWdodDogdmFyKC0tb3JkZXItd2VpZ2h0KTtcXG59XFxuXFxuOm5vdChwcmUpID4gY29kZSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWlubGluZS1jb2RlLWJnKTtcXG4gICAgcGFkZGluZzogMC4yZW0gMC40ZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG59XFxuXFxucHJlIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29kZS1iZykgIWltcG9ydGFudDtcXG4gICAgY29sb3I6IHZhcigtLWNvZGUtZmcpO1xcbiAgICBwYWRkaW5nOiAxNnB4IDIwcHg7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XFxuICAgIG92ZXJmbG93LXg6IGF1dG87XFxuICAgIG1hcmdpbjogMS41ZW0gMDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbn1cXG5cXG5wcmUgY29kZSB7XFxuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICBjb2xvcjogaW5oZXJpdDtcXG59XFxuXFxuLyogQmxvY2txdW90ZXMgKi9cXG5ibG9ja3F1b3RlIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tcXVvdGUtYmcpO1xcbiAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkIHZhcigtLXF1b3RlLWJvcmRlcik7XFxuICAgIG1hcmdpbjogMS41ZW0gMDtcXG4gICAgcGFkZGluZzogMTZweCAyMHB4O1xcbiAgICBib3JkZXItcmFkaXVzOiAwIDEycHggMTJweCAwO1xcbn1cXG5cXG5ibG9ja3F1b3RlIHAge1xcbiAgICBtYXJnaW46IDA7XFxufVxcblxcbi8qIFRhYmxlcyAqL1xcbnRhYmxlIHtcXG4gICAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMS41ZW0gMDtcXG4gICAgYm9yZGVyLXJhZGl1czogMTJweDtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxudGgge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS10YWJsZS1oZWFkZXItYmcpO1xcbiAgICBmb250LXdlaWdodDogNjAwO1xcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG5cXG50aCxcXG50ZCB7XFxuICAgIHBhZGRpbmc6IDEycHggMTZweDtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbnRyOmxhc3QtY2hpbGQgdGQge1xcbiAgICBib3JkZXItYm90dG9tOiBub25lO1xcbn1cXG5cXG4vKiBNZW51IGJhciAqL1xcbiNtZW51LWJhciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbiNtZW51LWJhciBpIHtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuLyogU2VhcmNoICovXFxuI3NlYXJjaGJhciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNlYXJjaC1iZyk7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNlYXJjaC1ib3JkZXIpO1xcbiAgICBib3gtc2hhZG93OiB2YXIoLS1zZWFyY2hiYXItc2hhZG93KTtcXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgICBwYWRkaW5nOiA4cHggMTJweDtcXG59XFxuXFxuLyogTmF2aWdhdGlvbiBidXR0b25zICovXFxuLm5hdi1jaGFwdGVycyB7XFxuICAgIGNvbG9yOiB2YXIoLS1saW5rcyk7XFxuICAgIG9wYWNpdHk6IDAuODtcXG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjE1cyBlYXNlO1xcbn1cXG5cXG4ubmF2LWNoYXB0ZXJzOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWxpbmtzLWhvdmVyKTtcXG4gICAgb3BhY2l0eTogMTtcXG59XFxuXFxuLyogU2Nyb2xsYmFyICovXFxuOjotd2Via2l0LXNjcm9sbGJhciB7XFxuICAgIHdpZHRoOiA4cHg7XFxuICAgIGhlaWdodDogOHB4O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JvbGxiYXIpO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JvbGxiYXItaG92ZXIpO1xcbn1cXG5cXG4vKiBUaGVtZSB0b2dnbGUgKi9cXG4jdGhlbWUtbGlzdCB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XFxufVxcblxcbiN0aGVtZS1saXN0IGxpIHtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuI3RoZW1lLWxpc3QgbGk6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxufVxcblxcbmRpdiNtZGJvb2stbWVudS1iYXIsXFxuZGl2I21kYm9vay1tZW51LWJhci1ob3Zlci1wbGFjZWhvbGRlciB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIHBhZGRpbmc6IDFyZW0gMDtcXG59XFxuXFxuZGl2I21kYm9vay1jb250ZW50IHtcXG4gICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDgwcHgpO1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICBwYWRkaW5nOiAycmVtIDRyZW07XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogdmFyKC0tY29udGVudC1zaXplKSAyOHJlbTtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGdhcDogM3JlbTtcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgc2Nyb2xsLWJlaGF2aW9yOiBzbW9vdGg7XFxufVxcblxcbmRpdiNtZGJvb2stY29udGVudCBwIHtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNzU7XFxufVxcblxcbmRpdiNtZGJvb2stY29udGVudCBtYWluIHtcXG4gICAgbWF4LXdpZHRoOiAxMDAlO1xcbn1cXG5cXG5kaXYjbWRib29rLWNvbnRlbnQgbWFpbiBhLmhlYWRlcjpob3ZlcixcXG5kaXYjbWRib29rLWNvbnRlbnQgbWFpbiBhIHtcXG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gICAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdGV4dC1jb2xvcik7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuZGl2I21kYm9vay1jb250ZW50IG1haW4gYTpob3ZlciB7XFxuICAgIGJvcmRlci1ib3R0b20td2lkdGg6IDJweDtcXG59XFxuXFxuZGl2I21kYm9vay1jb250ZW50IG1haW4gYS5oZWFkZXIge1xcbiAgICBib3JkZXItYm90dG9tOiBub25lO1xcbn1cXG5cXG4vKiBSaWdodCBTaWRlYmFyIChUT0MpICovXFxuLnBhZ2Utd3JhcHBlci5oYXMtcmlnaHQtc2lkZWJhciB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byAxZnIgMjIwcHg7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyIHtcXG4gICAgcG9zaXRpb246IHN0aWNreTtcXG4gICAgdG9wOiA2MHB4O1xcbiAgICByaWdodDogMHB4O1xcbiAgICBoZWlnaHQ6IGZpdC1jb250ZW50O1xcbiAgICBtYXgtaGVpZ2h0OiBjYWxjKDEwMHZoIC0gOHB4KTtcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICAgIG1hcmdpbi1sZWZ0OiAyLjVyZW07XFxuICAgIHBhZGRpbmctbGVmdDogMXJlbTtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItaGVhZGVyIHtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItZmcpO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xcbiAgICBwYWRkaW5nLWxlZnQ6IDhweDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItdG9jIHtcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgbWFyZ2luOiAwO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2Mgb2wge1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBwYWRkaW5nLWxlZnQ6IDEycHg7XFxuICAgIG1hcmdpbjogMDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItdG9jIGxpIHtcXG4gICAgbWFyZ2luOiAwO1xcbn1cXG5cXG4vKiBBZGp1c3QgY29udGVudCB3aWR0aCB3aGVuIHJpZ2h0IHNpZGViYXIgZXhpc3RzICovXFxuLnBhZ2Utd3JhcHBlci5oYXMtcmlnaHQtc2lkZWJhciAuY29udGVudCB7XFxuICAgIG1heC13aWR0aDogMTAwJTtcXG59XFxuXFxuLyogSGlkZSByaWdodCBzaWRlYmFyIG9uIHNtYWxsIHNjcmVlbnMgKi9cXG5AbWVkaWEgKG1heC13aWR0aDogMTEwMHB4KSB7XFxuICAgIC5wYWdlLXdyYXBwZXIuaGFzLXJpZ2h0LXNpZGViYXIge1xcbiAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBhdXRvIDFmcjtcXG4gICAgfVxcblxcbiAgICAucmlnaHQtc2lkZWJhciB7XFxuICAgICAgICBkaXNwbGF5OiBub25lO1xcbiAgICB9XFxufVxcblwiIiwiZXhwb3J0IGRlZmF1bHQgXCIvKiBNaW50bGlmeS1pbnNwaXJlZCBEYXJrIFRoZW1lIGZvciBtZEJvb2sgKi9cXG46cm9vdCB7XFxuICAtLWJnOiAjMGEwZDBkO1xcbiAgLS1mZzogI2U1ZTdlYjtcXG4gIC0tc2lkZWJhci1iZzogIzExMTQxNDtcXG4gIC0tc2lkZWJhci1mZzogIzljYTNhZjtcXG4gIC0tc2lkZWJhci1hY3RpdmU6ICMyNmJkNmM7XFxuICAtLXNpZGViYXItYWN0aXZlLWJnOiByZ2JhKDM4LCAxODksIDEwOCwgMC4xNSk7XFxuICAtLWxpbmtzOiAjMjZiZDZjO1xcbiAgLS1saW5rcy1ob3ZlcjogIzRhZGU4MDtcXG4gIC0taW5saW5lLWNvZGUtYmc6ICMxZjI0MjQ7XFxuICAtLWNvZGUtYmc6ICMxNjFhMWE7XFxuICAtLWNvZGUtZmc6ICNlNWU3ZWI7XFxuICAtLXF1b3RlLWJnOiAjMWYyNDI0O1xcbiAgLS1xdW90ZS1ib3JkZXI6ICMyNmJkNmM7XFxuICAtLXRhYmxlLWJvcmRlcjogIzJkMzMzMztcXG4gIC0tdGFibGUtaGVhZGVyLWJnOiAjMWYyNDI0O1xcbiAgLS1zZWFyY2gtYmc6ICMxNjFhMWE7XFxuICAtLXNlYXJjaC1ib3JkZXI6ICMyZDMzMzM7XFxuICAtLXNlYXJjaGJhci1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMyk7XFxuICAtLXNjcm9sbGJhcjogIzNkNDM0MztcXG4gIC0tc2Nyb2xsYmFyLWhvdmVyOiAjNGQ1NTU1O1xcbn1cXG5cXG5odG1sIHtcXG4gIGZvbnQtZmFtaWx5OiAnSW50ZXInLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcXG4gIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gIGNvbG9yOiB2YXIoLS1mZyk7XFxuICBzY3JvbGwtYmVoYXZpb3I6IHNtb290aDtcXG59XFxuXFxuYm9keSB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxuICBjb2xvcjogdmFyKC0tZmcpO1xcbn1cXG5cXG4vKiBTaWRlYmFyICovXFxuLnNpZGViYXIge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1iZyk7XFxuICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG4uc2lkZWJhciAuc2lkZWJhci1zY3JvbGxib3gge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1iZyk7XFxufVxcblxcbi5zaWRlYmFyIG9sLmNoYXB0ZXIgbGkgYSB7XFxuICBjb2xvcjogdmFyKC0tc2lkZWJhci1mZyk7XFxuICBwYWRkaW5nOiA4cHggMTZweDtcXG4gIGJvcmRlci1yYWRpdXM6IDhweDtcXG4gIG1hcmdpbjogMnB4IDhweDtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlO1xcbn1cXG5cXG4uc2lkZWJhciBvbC5jaGFwdGVyIGxpIGE6aG92ZXIge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1hY3RpdmUtYmcpO1xcbiAgY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuXFxuLnNpZGViYXIgb2wuY2hhcHRlciBsaS5jaGFwdGVyLWl0ZW0uZXhwYW5kZWQgPiBhLFxcbi5zaWRlYmFyIG9sLmNoYXB0ZXIgbGkgYS5hY3RpdmUge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1hY3RpdmUtYmcpO1xcbiAgY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxufVxcblxcbi8qIE1haW4gY29udGVudCAqL1xcbi5jb250ZW50IHtcXG4gIG1heC13aWR0aDogODAwcHg7XFxuICBwYWRkaW5nOiAyNHB4IDQ4cHg7XFxufVxcblxcbi5jb250ZW50IG1haW4ge1xcbiAgbWF4LXdpZHRoOiAxMDAlO1xcbn1cXG5cXG4vKiBUeXBvZ3JhcGh5ICovXFxuaDEsIGgyLCBoMywgaDQsIGg1LCBoNiB7XFxuICBjb2xvcjogI2ZmZmZmZjtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICBtYXJnaW4tdG9wOiAyZW07XFxuICBtYXJnaW4tYm90dG9tOiAwLjVlbTtcXG4gIGxpbmUtaGVpZ2h0OiAxLjM7XFxufVxcblxcbmgxIHsgZm9udC1zaXplOiAyLjI1cmVtOyBtYXJnaW4tdG9wOiAwOyB9XFxuaDIgeyBmb250LXNpemU6IDEuNzVyZW07IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpOyBwYWRkaW5nLWJvdHRvbTogMC41cmVtOyB9XFxuaDMgeyBmb250LXNpemU6IDEuMzc1cmVtOyB9XFxuaDQgeyBmb250LXNpemU6IDEuMTI1cmVtOyB9XFxuXFxucCB7XFxuICBsaW5lLWhlaWdodDogMS43NTtcXG4gIG1hcmdpbjogMWVtIDA7XFxufVxcblxcbi8qIExpbmtzICovXFxuYSB7XFxuICBjb2xvcjogdmFyKC0tbGlua3MpO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgdHJhbnNpdGlvbjogY29sb3IgMC4xNXMgZWFzZTtcXG59XFxuXFxuYTpob3ZlciB7XFxuICBjb2xvcjogdmFyKC0tbGlua3MtaG92ZXIpO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XFxufVxcblxcbi8qIENvZGUgKi9cXG5jb2RlIHtcXG4gIGZvbnQtZmFtaWx5OiAnR2Vpc3QgTW9ubycsICdGaXJhIENvZGUnLCAnSmV0QnJhaW5zIE1vbm8nLCBtb25vc3BhY2U7XFxuICBmb250LXNpemU6IDAuODc1ZW07XFxufVxcblxcbjpub3QocHJlKSA+IGNvZGUge1xcbiAgYmFja2dyb3VuZDogdmFyKC0taW5saW5lLWNvZGUtYmcpO1xcbiAgcGFkZGluZzogMC4yZW0gMC40ZW07XFxuICBib3JkZXItcmFkaXVzOiA2cHg7XFxuICBjb2xvcjogdmFyKC0tc2lkZWJhci1hY3RpdmUpO1xcbn1cXG5cXG5wcmUge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tY29kZS1iZykgIWltcG9ydGFudDtcXG4gIGNvbG9yOiB2YXIoLS1jb2RlLWZnKTtcXG4gIHBhZGRpbmc6IDE2cHggMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XFxuICBvdmVyZmxvdy14OiBhdXRvO1xcbiAgbWFyZ2luOiAxLjVlbSAwO1xcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxucHJlIGNvZGUge1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxuICBwYWRkaW5nOiAwO1xcbiAgY29sb3I6IGluaGVyaXQ7XFxufVxcblxcbi8qIEJsb2NrcXVvdGVzICovXFxuYmxvY2txdW90ZSB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1xdW90ZS1iZyk7XFxuICBib3JkZXItbGVmdDogNHB4IHNvbGlkIHZhcigtLXF1b3RlLWJvcmRlcik7XFxuICBtYXJnaW46IDEuNWVtIDA7XFxuICBwYWRkaW5nOiAxNnB4IDIwcHg7XFxuICBib3JkZXItcmFkaXVzOiAwIDEycHggMTJweCAwO1xcbn1cXG5cXG5ibG9ja3F1b3RlIHAge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5cXG4vKiBUYWJsZXMgKi9cXG50YWJsZSB7XFxuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBtYXJnaW46IDEuNWVtIDA7XFxuICBib3JkZXItcmFkaXVzOiAxMnB4O1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbnRoIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXRhYmxlLWhlYWRlci1iZyk7XFxuICBmb250LXdlaWdodDogNjAwO1xcbiAgdGV4dC1hbGlnbjogbGVmdDtcXG59XFxuXFxudGgsIHRkIHtcXG4gIHBhZGRpbmc6IDEycHggMTZweDtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG50cjpsYXN0LWNoaWxkIHRkIHtcXG4gIGJvcmRlci1ib3R0b206IG5vbmU7XFxufVxcblxcbi8qIE1lbnUgYmFyICovXFxuI21lbnUtYmFyIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG4jbWVudS1iYXIgaSB7XFxuICBjb2xvcjogdmFyKC0tZmcpO1xcbn1cXG5cXG4vKiBTZWFyY2ggKi9cXG4jc2VhcmNoYmFyIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNlYXJjaC1iZyk7XFxuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1zZWFyY2gtYm9yZGVyKTtcXG4gIGJvcmRlci1yYWRpdXM6IDhweDtcXG4gIHBhZGRpbmc6IDhweCAxMnB4O1xcbiAgYm94LXNoYWRvdzogdmFyKC0tc2VhcmNoYmFyLXNoYWRvdyk7XFxuICBjb2xvcjogdmFyKC0tZmcpO1xcbn1cXG5cXG4vKiBOYXZpZ2F0aW9uIGJ1dHRvbnMgKi9cXG4ubmF2LWNoYXB0ZXJzIHtcXG4gIGNvbG9yOiB2YXIoLS1saW5rcyk7XFxuICBvcGFjaXR5OiAwLjg7XFxuICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMTVzIGVhc2U7XFxufVxcblxcbi5uYXYtY2hhcHRlcnM6aG92ZXIge1xcbiAgY29sb3I6IHZhcigtLWxpbmtzLWhvdmVyKTtcXG4gIG9wYWNpdHk6IDE7XFxufVxcblxcbi8qIFNjcm9sbGJhciAqL1xcbjo6LXdlYmtpdC1zY3JvbGxiYXIge1xcbiAgd2lkdGg6IDhweDtcXG4gIGhlaWdodDogOHB4O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcXG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNjcm9sbGJhcik7XFxuICBib3JkZXItcmFkaXVzOiA0cHg7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2Nyb2xsYmFyLWhvdmVyKTtcXG59XFxuXFxuLyogVGhlbWUgdG9nZ2xlICovXFxuI3RoZW1lLWxpc3Qge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1iZyk7XFxuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xcbn1cXG5cXG4jdGhlbWUtbGlzdCBsaSB7XFxuICBjb2xvcjogdmFyKC0tZmcpO1xcbn1cXG5cXG4jdGhlbWUtbGlzdCBsaTpob3ZlciB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxufVxcblxcbi8qIFJpZ2h0IFNpZGViYXIgKFRPQykgKi9cXG4ucGFnZS13cmFwcGVyLmhhcy1yaWdodC1zaWRlYmFyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IGF1dG8gMWZyIDIyMHB4O1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhciB7XFxuICBwb3NpdGlvbjogc3RpY2t5O1xcbiAgdG9wOiA2MHB4O1xcbiAgaGVpZ2h0OiBmaXQtY29udGVudDtcXG4gIG1heC1oZWlnaHQ6IGNhbGMoMTAwdmggLSA4MHB4KTtcXG4gIG92ZXJmbG93LXk6IGF1dG87XFxuICBwYWRkaW5nOiAyNHB4IDE2cHg7XFxuICBib3JkZXItbGVmdDogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1iZyk7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyLWhlYWRlciB7XFxuICBmb250LXNpemU6IDEycHg7XFxuICBmb250LXdlaWdodDogNjAwO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gIGxldHRlci1zcGFjaW5nOiAwLjVweDtcXG4gIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWZnKTtcXG4gIG1hcmdpbi1ib3R0b206IDEycHg7XFxuICBwYWRkaW5nLWxlZnQ6IDhweDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItdG9jIHtcXG4gIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICBwYWRkaW5nOiAwO1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2Mgb2wge1xcbiAgbGlzdC1zdHlsZTogbm9uZTtcXG4gIHBhZGRpbmctbGVmdDogMTJweDtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItdG9jIGxpIHtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItdG9jIGxpIGEge1xcbiAgZGlzcGxheTogYmxvY2s7XFxuICBwYWRkaW5nOiA2cHggOHB4O1xcbiAgZm9udC1zaXplOiAxM3B4O1xcbiAgY29sb3I6IHZhcigtLXNpZGViYXItZmcpO1xcbiAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuMTVzIGVhc2U7XFxuICBib3JkZXItbGVmdDogMnB4IHNvbGlkIHRyYW5zcGFyZW50O1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2MgbGkgYTpob3ZlciB7XFxuICBjb2xvcjogdmFyKC0tc2lkZWJhci1hY3RpdmUpO1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1hY3RpdmUtYmcpO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2MgbGkgYS5hY3RpdmUge1xcbiAgY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG4gIGJvcmRlci1sZWZ0LWNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxufVxcblxcbi8qIEFkanVzdCBjb250ZW50IHdpZHRoIHdoZW4gcmlnaHQgc2lkZWJhciBleGlzdHMgKi9cXG4ucGFnZS13cmFwcGVyLmhhcy1yaWdodC1zaWRlYmFyIC5jb250ZW50IHtcXG4gIG1heC13aWR0aDogMTAwJTtcXG59XFxuXFxuLyogSGlkZSByaWdodCBzaWRlYmFyIG9uIHNtYWxsIHNjcmVlbnMgKi9cXG5AbWVkaWEgKG1heC13aWR0aDogMTEwMHB4KSB7XFxuICAucGFnZS13cmFwcGVyLmhhcy1yaWdodC1zaWRlYmFyIHtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBhdXRvIDFmcjtcXG4gIH1cXG5cXG4gIC5yaWdodC1zaWRlYmFyIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG59XFxuXCIiLCIvLyBDb250ZW50IHNjcmlwdCBmb3IgbWRCb29rIHRoZW1lIG1vZGlmaWNhdGlvblxuLy8gaW1wb3J0IFwiLi4vYXNzZXRzL3RoZW1lcy9taW50bGlmeS1saWdodC5jc3NcIjtcbi8vIGltcG9ydCBcIi4uL2Fzc2V0cy90aGVtZXMvbWludGxpZnktZGFyay5jc3NcIjtcbi8vIEltcG9ydCBDU1MgYXMgcmF3IHN0cmluZ3MgYXQgYnVpbGQgdGltZVxuaW1wb3J0IG1pbnRsaWZ5TGlnaHRDU1MgZnJvbSBcIi4uL2Fzc2V0cy90aGVtZXMvbWludGxpZnktbGlnaHQuY3NzP3Jhd1wiO1xuaW1wb3J0IG1pbnRsaWZ5RGFya0NTUyBmcm9tIFwiLi4vYXNzZXRzL3RoZW1lcy9taW50bGlmeS1kYXJrLmNzcz9yYXdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29udGVudFNjcmlwdCh7XG4gIG1hdGNoZXM6IFtcIjxhbGxfdXJscz5cIl0sXG4gIHJ1bkF0OiBcImRvY3VtZW50X3N0YXJ0XCIsXG5cbiAgbWFpbihjdHgpIHtcbiAgICAvLyBDdXN0b20gdGhlbWVzIChNaW50bGlmeS1pbnNwaXJlZCArIG1kQm9vayBidWlsdC1pbilcbiAgICBjb25zdCBDVVNUT01fVEhFTUVTID0gW1wibWludGxpZnlcIiwgXCJtaW50bGlmeS1kYXJrXCJdIGFzIGNvbnN0O1xuICAgIGNvbnN0IE1EQk9PS19USEVNRVMgPSBbXCJsaWdodFwiLCBcInJ1c3RcIiwgXCJjb2FsXCIsIFwibmF2eVwiLCBcImF5dVwiXSBhcyBjb25zdDtcbiAgICBjb25zdCBBTExfVEhFTUVTID0gWy4uLkNVU1RPTV9USEVNRVMsIC4uLk1EQk9PS19USEVNRVNdIGFzIGNvbnN0O1xuICAgIHR5cGUgVGhlbWUgPSAodHlwZW9mIEFMTF9USEVNRVMpW251bWJlcl07XG5cbiAgICBsZXQgaXNNZEJvb2sgPSBmYWxzZTtcbiAgICBsZXQgc3R5bGVFbGVtZW50OiBIVE1MU3R5bGVFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgICAvLyBDaGVjayBpZiBjdXJyZW50IHBhZ2UgaXMgYW4gbWRCb29rIHNpdGUgYnkgbG9va2luZyBmb3IgdGhlIGNvbW1lbnRcbiAgICBmdW5jdGlvbiBjaGVja01kQm9va0NvbW1lbnQoKSB7XG4gICAgICAvLyBDaGVjayBmb3IgPCEtLSBCb29rIGdlbmVyYXRlZCB1c2luZyBtZEJvb2sgLS0+IGNvbW1lbnQgYXQgZG9jdW1lbnQgc3RhcnRcbiAgICAgIGNvbnN0IG5vZGVzID0gZG9jdW1lbnQuaGVhZC5jaGlsZE5vZGVzO1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20obm9kZXMgfHwgW10pXG4gICAgICAgIC5maWx0ZXIoKG5vZGUpID0+IG5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFKVxuICAgICAgICAuc29tZSgobm9kZSkgPT5cbiAgICAgICAgICBub2RlLm5vZGVWYWx1ZT8udHJpbSgpLmluY2x1ZGVzKFwiQm9vayBnZW5lcmF0ZWQgdXNpbmcgbWRCb29rXCIpLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIEdldCBjdXJyZW50IG1kQm9vayB0aGVtZSBmcm9tIHBhZ2VcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50TWRCb29rVGhlbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICBjb25zdCBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgZm9yIChjb25zdCB0aGVtZSBvZiBNREJPT0tfVEhFTUVTKSB7XG4gICAgICAgIGlmIChodG1sLmNsYXNzTGlzdC5jb250YWlucyh0aGVtZSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhlbWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEdldCBDU1MgZm9yIHRoZW1lXG4gICAgZnVuY3Rpb24gZ2V0VGhlbWVDU1ModGhlbWU6IFRoZW1lKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICBzd2l0Y2ggKHRoZW1lKSB7XG4gICAgICAgIGNhc2UgXCJtaW50bGlmeVwiOlxuICAgICAgICAgIHJldHVybiBtaW50bGlmeUxpZ2h0Q1NTO1xuICAgICAgICBjYXNlIFwibWludGxpZnktZGFya1wiOlxuICAgICAgICAgIHJldHVybiBtaW50bGlmeURhcmtDU1M7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIG51bGw7IC8vIFVzZSBtZEJvb2sgYnVpbHQtaW4gdGhlbWVzXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5qZWN0IG9yIHVwZGF0ZSBjdXN0b20gdGhlbWUgQ1NTXG4gICAgZnVuY3Rpb24gaW5qZWN0VGhlbWVDU1MoY3NzOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICBpZiAoIWNzcykge1xuICAgICAgICAvLyBSZW1vdmUgY3VzdG9tIHN0eWxlcywgdXNlIG1kQm9vayBidWlsdC1pblxuICAgICAgICBpZiAoc3R5bGVFbGVtZW50KSB7XG4gICAgICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgIHN0eWxlRWxlbWVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXN0eWxlRWxlbWVudCkge1xuICAgICAgICBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgICAgIHN0eWxlRWxlbWVudC5pZCA9IFwibWRib29rLXRoZW1lLWV4dGVuc2lvblwiO1xuICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7XG4gICAgICB9XG4gICAgICBzdHlsZUVsZW1lbnQudGV4dENvbnRlbnQgPSBjc3M7XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgdGhlbWUgdG8gcGFnZVxuICAgIGZ1bmN0aW9uIGFwcGx5VGhlbWUodGhlbWU6IFRoZW1lKSB7XG4gICAgICBjb25zdCBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgY29uc3QgaXNDdXN0b21UaGVtZSA9IENVU1RPTV9USEVNRVMuaW5jbHVkZXModGhlbWUgYXMgYW55KTtcblxuICAgICAgaWYgKGlzQ3VzdG9tVGhlbWUpIHtcbiAgICAgICAgLy8gRm9yIGN1c3RvbSB0aGVtZXMsIHNldCBiYXNlIG1kQm9vayB0aGVtZSBhbmQgaW5qZWN0IENTU1xuICAgICAgICBNREJPT0tfVEhFTUVTLmZvckVhY2goKHQpID0+IGh0bWwuY2xhc3NMaXN0LnJlbW92ZSh0KSk7XG4gICAgICAgIGh0bWwuY2xhc3NMaXN0LmFkZCh0aGVtZSA9PT0gXCJtaW50bGlmeVwiID8gXCJsaWdodFwiIDogXCJjb2FsXCIpO1xuICAgICAgICBpbmplY3RUaGVtZUNTUyhnZXRUaGVtZUNTUyh0aGVtZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRm9yIG1kQm9vayBidWlsdC1pbiB0aGVtZXNcbiAgICAgICAgTURCT09LX1RIRU1FUy5mb3JFYWNoKCh0KSA9PiBodG1sLmNsYXNzTGlzdC5yZW1vdmUodCkpO1xuICAgICAgICBodG1sLmNsYXNzTGlzdC5hZGQodGhlbWUpO1xuICAgICAgICBpbmplY3RUaGVtZUNTUyhudWxsKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibWRib29rLXRoZW1lXCIsIHRoZW1lKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIElnbm9yZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE5vdGlmeSBwb3B1cCBhYm91dCB0aGVtZSBjaGFuZ2VcbiAgICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7IHR5cGU6IFwidGhlbWVDaGFuZ2VkXCIsIHRoZW1lIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgLy8gSWdub3JlIGVycm9ycyB3aGVuIHBvcHVwIGlzIG5vdCBvcGVuXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZW1lIGZyb20gc3RvcmFnZVxuICAgIGFzeW5jIGZ1bmN0aW9uIGluaXRUaGVtZSgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGxvY2FsQ29uZmlnID0gW1wibWRib29rVGhlbWVcIiwgXCJlbmFibGVkXCJdIGFzIGNvbnN0O1xuICAgICAgICB0eXBlIExvY2FsQ29uZmlnID0ge1xuICAgICAgICAgIFtLIGluICh0eXBlb2YgbG9jYWxDb25maWcpW251bWJlcl1dPzogc3RyaW5nO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCB7IG1kYm9va1RoZW1lIH0gPSAoYXdhaXQgYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldChcbiAgICAgICAgICBsb2NhbENvbmZpZyBhcyBhbnksXG4gICAgICAgICkpIGFzIExvY2FsQ29uZmlnO1xuXG4gICAgICAgIGNvbnN0IHRoZW1lID0gbWRib29rVGhlbWUgfHwgKFwibWludGxpZnlcIiBhcyBhbnkpOyAvLyBEZWZhdWx0IHRvIG1pbnRsaWZ5XG4gICAgICAgIGlmIChBTExfVEhFTUVTLmluY2x1ZGVzKHRoZW1lKSkge1xuICAgICAgICAgIGFwcGx5VGhlbWUodGhlbWUpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIERlZmF1bHQgdG8gbWludGxpZnkgb24gZXJyb3JcbiAgICAgICAgYXBwbHlUaGVtZShcIm1pbnRsaWZ5XCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgdGhlbWUgY2hhbmdlIG1lc3NhZ2VzIGZyb20gcG9wdXBcbiAgICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlKSA9PiB7XG4gICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcInNldFRoZW1lXCIgJiYgQUxMX1RIRU1FUy5pbmNsdWRlcyhtZXNzYWdlLnRoZW1lKSkge1xuICAgICAgICBhcHBseVRoZW1lKG1lc3NhZ2UudGhlbWUpO1xuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnR5cGUgPT09IFwiZ2V0U3RhdHVzXCIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgICAgaXNNZEJvb2ssXG4gICAgICAgICAgY3VycmVudFRoZW1lOiBnZXRDdXJyZW50TWRCb29rVGhlbWUoKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYW5kIHNldHVwIHJpZ2h0IHNpZGViYXIgZm9yIHBhZ2UgVE9DXG4gICAgZnVuY3Rpb24gc2V0dXBSaWdodFNpZGViYXIodG9jU2VjdGlvbjogRWxlbWVudCkge1xuICAgICAgaWYgKCF0b2NTZWN0aW9uKSByZXR1cm47XG5cbiAgICAgIC8vIENyZWF0ZSByaWdodCBzaWRlYmFyIGNvbnRhaW5lclxuICAgICAgY29uc3QgcmlnaHRTaWRlYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm5hdlwiKTtcbiAgICAgIHJpZ2h0U2lkZWJhci5pZCA9IFwicmlnaHQtc2lkZWJhclwiO1xuICAgICAgcmlnaHRTaWRlYmFyLmNsYXNzTmFtZSA9IFwicmlnaHQtc2lkZWJhclwiO1xuXG4gICAgICAvLyBDcmVhdGUgaGVhZGVyXG4gICAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgaGVhZGVyLmNsYXNzTmFtZSA9IFwicmlnaHQtc2lkZWJhci1oZWFkZXJcIjtcbiAgICAgIGhlYWRlci50ZXh0Q29udGVudCA9IFwiT24gdGhpcyBwYWdlXCI7XG4gICAgICByaWdodFNpZGViYXIuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcblxuICAgICAgLy8gQ2xvbmUgYW5kIG1vdmUgdGhlIHNlY3Rpb25cbiAgICAgIGNvbnN0IGNsb25lZFNlY3Rpb24gPSB0b2NTZWN0aW9uLmNsb25lTm9kZSh0cnVlKSBhcyBFbGVtZW50O1xuICAgICAgY2xvbmVkU2VjdGlvbi5jbGFzc0xpc3QuYWRkKFwicmlnaHQtc2lkZWJhci10b2NcIik7XG4gICAgICByaWdodFNpZGViYXIuYXBwZW5kQ2hpbGQoY2xvbmVkU2VjdGlvbik7XG5cbiAgICAgIC8vIEhpZGUgb3JpZ2luYWwgc2VjdGlvbiBpbiBsZWZ0IHNpZGViYXJcbiAgICAgICh0b2NTZWN0aW9uIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgIHJldHVybiByaWdodFNpZGViYXI7XG4gICAgfVxuXG4gICAgLy8gTWFpbiBpbml0aWFsaXphdGlvblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICBpc01kQm9vayA9IGNoZWNrTWRCb29rQ29tbWVudCgpO1xuICAgICAgaWYgKGlzTWRCb29rKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiZW5hYmxlZFwiLCBcInRydWVcIik7XG4gICAgICAgIGluaXRUaGVtZSgpO1xuXG4gICAgICAgIGNvbnN0IHVpID0gY3JlYXRlSW50ZWdyYXRlZFVpKGN0eCwge1xuICAgICAgICAgIHBvc2l0aW9uOiBcImlubGluZVwiLFxuICAgICAgICAgIGFuY2hvcjogXCJkaXYjbWRib29rLWNvbnRlbnRcIixcbiAgICAgICAgICBvbk1vdW50OiAocGFnZVdyYXBwZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKF8sIG9icykgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICBcIi5zaWRlYmFyIG9sLmNoYXB0ZXIgZGl2Lm9uLXRoaXMtcGFnZSA+IG9sLnNlY3Rpb25cIixcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByaWdodFNpZGViYXIgPSBzZXR1cFJpZ2h0U2lkZWJhcihlbGVtZW50KSE7XG4gICAgICAgICAgICAgICAgcGFnZVdyYXBwZXIuYXBwZW5kKHJpZ2h0U2lkZWJhcik7XG4gICAgICAgICAgICAgICAgcGFnZVdyYXBwZXIuY2xhc3NMaXN0LmFkZChcImhhcy1yaWdodC1zaWRlYmFyXCIpO1xuICAgICAgICAgICAgICAgIG9icy5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLCAvLyDnm5HlkKzlrZDoioLngrnnmoTmlrDlop7miJbliKDpmaRcbiAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSwgLy8g55uR5ZCs5pW05Liq5a2Q5qCRXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgdWkuYXV0b01vdW50KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3IgRE9NIHRvIGJlIHJlYWR5XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdCgpO1xuICAgIH1cbiAgfSxcbn0pO1xuIiwiaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gXCJ3eHQvYnJvd3NlclwiO1xuZXhwb3J0IGNsYXNzIFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIGNvbnN0cnVjdG9yKG5ld1VybCwgb2xkVXJsKSB7XG4gICAgc3VwZXIoV3h0TG9jYXRpb25DaGFuZ2VFdmVudC5FVkVOVF9OQU1FLCB7fSk7XG4gICAgdGhpcy5uZXdVcmwgPSBuZXdVcmw7XG4gICAgdGhpcy5vbGRVcmwgPSBvbGRVcmw7XG4gIH1cbiAgc3RhdGljIEVWRU5UX05BTUUgPSBnZXRVbmlxdWVFdmVudE5hbWUoXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0VW5pcXVlRXZlbnROYW1lKGV2ZW50TmFtZSkge1xuICByZXR1cm4gYCR7YnJvd3Nlcj8ucnVudGltZT8uaWR9OiR7aW1wb3J0Lm1ldGEuZW52LkVOVFJZUE9JTlR9OiR7ZXZlbnROYW1lfWA7XG59XG4iLCJpbXBvcnQgeyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50IH0gZnJvbSBcIi4vY3VzdG9tLWV2ZW50cy5tanNcIjtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2NhdGlvbldhdGNoZXIoY3R4KSB7XG4gIGxldCBpbnRlcnZhbDtcbiAgbGV0IG9sZFVybDtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBFbnN1cmUgdGhlIGxvY2F0aW9uIHdhdGNoZXIgaXMgYWN0aXZlbHkgbG9va2luZyBmb3IgVVJMIGNoYW5nZXMuIElmIGl0J3MgYWxyZWFkeSB3YXRjaGluZyxcbiAgICAgKiB0aGlzIGlzIGEgbm9vcC5cbiAgICAgKi9cbiAgICBydW4oKSB7XG4gICAgICBpZiAoaW50ZXJ2YWwgIT0gbnVsbCkgcmV0dXJuO1xuICAgICAgb2xkVXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgIGludGVydmFsID0gY3R4LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgbGV0IG5ld1VybCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICAgIGlmIChuZXdVcmwuaHJlZiAhPT0gb2xkVXJsLmhyZWYpIHtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgV3h0TG9jYXRpb25DaGFuZ2VFdmVudChuZXdVcmwsIG9sZFVybCkpO1xuICAgICAgICAgIG9sZFVybCA9IG5ld1VybDtcbiAgICAgICAgfVxuICAgICAgfSwgMWUzKTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwiLi4vdXRpbHMvaW50ZXJuYWwvbG9nZ2VyLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0VW5pcXVlRXZlbnROYW1lXG59IGZyb20gXCIuL2ludGVybmFsL2N1c3RvbS1ldmVudHMubWpzXCI7XG5pbXBvcnQgeyBjcmVhdGVMb2NhdGlvbldhdGNoZXIgfSBmcm9tIFwiLi9pbnRlcm5hbC9sb2NhdGlvbi13YXRjaGVyLm1qc1wiO1xuZXhwb3J0IGNsYXNzIENvbnRlbnRTY3JpcHRDb250ZXh0IHtcbiAgY29uc3RydWN0b3IoY29udGVudFNjcmlwdE5hbWUsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmNvbnRlbnRTY3JpcHROYW1lID0gY29udGVudFNjcmlwdE5hbWU7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBpZiAodGhpcy5pc1RvcEZyYW1lKSB7XG4gICAgICB0aGlzLmxpc3RlbkZvck5ld2VyU2NyaXB0cyh7IGlnbm9yZUZpcnN0RXZlbnQ6IHRydWUgfSk7XG4gICAgICB0aGlzLnN0b3BPbGRTY3JpcHRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yTmV3ZXJTY3JpcHRzKCk7XG4gICAgfVxuICB9XG4gIHN0YXRpYyBTQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEUgPSBnZXRVbmlxdWVFdmVudE5hbWUoXG4gICAgXCJ3eHQ6Y29udGVudC1zY3JpcHQtc3RhcnRlZFwiXG4gICk7XG4gIGlzVG9wRnJhbWUgPSB3aW5kb3cuc2VsZiA9PT0gd2luZG93LnRvcDtcbiAgYWJvcnRDb250cm9sbGVyO1xuICBsb2NhdGlvbldhdGNoZXIgPSBjcmVhdGVMb2NhdGlvbldhdGNoZXIodGhpcyk7XG4gIHJlY2VpdmVkTWVzc2FnZUlkcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGdldCBzaWduYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWJvcnRDb250cm9sbGVyLnNpZ25hbDtcbiAgfVxuICBhYm9ydChyZWFzb24pIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuYWJvcnQocmVhc29uKTtcbiAgfVxuICBnZXQgaXNJbnZhbGlkKCkge1xuICAgIGlmIChicm93c2VyLnJ1bnRpbWUuaWQgPT0gbnVsbCkge1xuICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zaWduYWwuYWJvcnRlZDtcbiAgfVxuICBnZXQgaXNWYWxpZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNJbnZhbGlkO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBjb250ZW50IHNjcmlwdCdzIGNvbnRleHQgaXMgaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lci5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihjYik7XG4gICAqIGNvbnN0IHJlbW92ZUludmFsaWRhdGVkTGlzdGVuZXIgPSBjdHgub25JbnZhbGlkYXRlZCgoKSA9PiB7XG4gICAqICAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5yZW1vdmVMaXN0ZW5lcihjYik7XG4gICAqIH0pXG4gICAqIC8vIC4uLlxuICAgKiByZW1vdmVJbnZhbGlkYXRlZExpc3RlbmVyKCk7XG4gICAqL1xuICBvbkludmFsaWRhdGVkKGNiKSB7XG4gICAgdGhpcy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGNiKTtcbiAgICByZXR1cm4gKCkgPT4gdGhpcy5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGNiKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IG5ldmVyIHJlc29sdmVzLiBVc2VmdWwgaWYgeW91IGhhdmUgYW4gYXN5bmMgZnVuY3Rpb24gdGhhdCBzaG91bGRuJ3QgcnVuXG4gICAqIGFmdGVyIHRoZSBjb250ZXh0IGlzIGV4cGlyZWQuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IGdldFZhbHVlRnJvbVN0b3JhZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAqICAgaWYgKGN0eC5pc0ludmFsaWQpIHJldHVybiBjdHguYmxvY2soKTtcbiAgICpcbiAgICogICAvLyAuLi5cbiAgICogfVxuICAgKi9cbiAgYmxvY2soKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5zZXRJbnRlcnZhbGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogSW50ZXJ2YWxzIGNhbiBiZSBjbGVhcmVkIGJ5IGNhbGxpbmcgdGhlIG5vcm1hbCBgY2xlYXJJbnRlcnZhbGAgZnVuY3Rpb24uXG4gICAqL1xuICBzZXRJbnRlcnZhbChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFySW50ZXJ2YWwoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cuc2V0VGltZW91dGAgdGhhdCBhdXRvbWF0aWNhbGx5IGNsZWFycyB0aGUgaW50ZXJ2YWwgd2hlbiBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogVGltZW91dHMgY2FuIGJlIGNsZWFyZWQgYnkgY2FsbGluZyB0aGUgbm9ybWFsIGBzZXRUaW1lb3V0YCBmdW5jdGlvbi5cbiAgICovXG4gIHNldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBoYW5kbGVyKCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNsZWFyVGltZW91dChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIENhbGxiYWNrcyBjYW4gYmUgY2FuY2VsZWQgYnkgY2FsbGluZyB0aGUgbm9ybWFsIGBjYW5jZWxBbmltYXRpb25GcmFtZWAgZnVuY3Rpb24uXG4gICAqL1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spIHtcbiAgICBjb25zdCBpZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgfSk7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2tgIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIHRoZSByZXF1ZXN0IHdoZW5cbiAgICogaW52YWxpZGF0ZWQuXG4gICAqXG4gICAqIENhbGxiYWNrcyBjYW4gYmUgY2FuY2VsZWQgYnkgY2FsbGluZyB0aGUgbm9ybWFsIGBjYW5jZWxJZGxlQ2FsbGJhY2tgIGZ1bmN0aW9uLlxuICAgKi9cbiAgcmVxdWVzdElkbGVDYWxsYmFjayhjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIGNvbnN0IGlkID0gcmVxdWVzdElkbGVDYWxsYmFjaygoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKCF0aGlzLnNpZ25hbC5hYm9ydGVkKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9LCBvcHRpb25zKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2FuY2VsSWRsZUNhbGxiYWNrKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGFkZEV2ZW50TGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGUgPT09IFwid3h0OmxvY2F0aW9uY2hhbmdlXCIpIHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIHRoaXMubG9jYXRpb25XYXRjaGVyLnJ1bigpO1xuICAgIH1cbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcj8uKFxuICAgICAgdHlwZS5zdGFydHNXaXRoKFwid3h0OlwiKSA/IGdldFVuaXF1ZUV2ZW50TmFtZSh0eXBlKSA6IHR5cGUsXG4gICAgICBoYW5kbGVyLFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBzaWduYWw6IHRoaXMuc2lnbmFsXG4gICAgICB9XG4gICAgKTtcbiAgfVxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqIEFib3J0IHRoZSBhYm9ydCBjb250cm9sbGVyIGFuZCBleGVjdXRlIGFsbCBgb25JbnZhbGlkYXRlZGAgbGlzdGVuZXJzLlxuICAgKi9cbiAgbm90aWZ5SW52YWxpZGF0ZWQoKSB7XG4gICAgdGhpcy5hYm9ydChcIkNvbnRlbnQgc2NyaXB0IGNvbnRleHQgaW52YWxpZGF0ZWRcIik7XG4gICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgYENvbnRlbnQgc2NyaXB0IFwiJHt0aGlzLmNvbnRlbnRTY3JpcHROYW1lfVwiIGNvbnRleHQgaW52YWxpZGF0ZWRgXG4gICAgKTtcbiAgfVxuICBzdG9wT2xkU2NyaXB0cygpIHtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRSxcbiAgICAgICAgY29udGVudFNjcmlwdE5hbWU6IHRoaXMuY29udGVudFNjcmlwdE5hbWUsXG4gICAgICAgIG1lc3NhZ2VJZDogTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICAgIH0sXG4gICAgICBcIipcIlxuICAgICk7XG4gIH1cbiAgdmVyaWZ5U2NyaXB0U3RhcnRlZEV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3QgaXNTY3JpcHRTdGFydGVkRXZlbnQgPSBldmVudC5kYXRhPy50eXBlID09PSBDb250ZW50U2NyaXB0Q29udGV4dC5TQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEU7XG4gICAgY29uc3QgaXNTYW1lQ29udGVudFNjcmlwdCA9IGV2ZW50LmRhdGE/LmNvbnRlbnRTY3JpcHROYW1lID09PSB0aGlzLmNvbnRlbnRTY3JpcHROYW1lO1xuICAgIGNvbnN0IGlzTm90RHVwbGljYXRlID0gIXRoaXMucmVjZWl2ZWRNZXNzYWdlSWRzLmhhcyhldmVudC5kYXRhPy5tZXNzYWdlSWQpO1xuICAgIHJldHVybiBpc1NjcmlwdFN0YXJ0ZWRFdmVudCAmJiBpc1NhbWVDb250ZW50U2NyaXB0ICYmIGlzTm90RHVwbGljYXRlO1xuICB9XG4gIGxpc3RlbkZvck5ld2VyU2NyaXB0cyhvcHRpb25zKSB7XG4gICAgbGV0IGlzRmlyc3QgPSB0cnVlO1xuICAgIGNvbnN0IGNiID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy52ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpKSB7XG4gICAgICAgIHRoaXMucmVjZWl2ZWRNZXNzYWdlSWRzLmFkZChldmVudC5kYXRhLm1lc3NhZ2VJZCk7XG4gICAgICAgIGNvbnN0IHdhc0ZpcnN0ID0gaXNGaXJzdDtcbiAgICAgICAgaXNGaXJzdCA9IGZhbHNlO1xuICAgICAgICBpZiAod2FzRmlyc3QgJiYgb3B0aW9ucz8uaWdub3JlRmlyc3RFdmVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm5vdGlmeUludmFsaWRhdGVkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBhZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYik7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IHJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJkZWZpbml0aW9uIiwiYnJvd3NlciIsIl9icm93c2VyIiwicHJpbnQiLCJsb2dnZXIiLCJyZXN1bHQiLCJyZW1vdmVEZXRlY3RvciIsIm1vdW50RGV0ZWN0b3IiXSwibWFwcGluZ3MiOiI7O0FBQU8sV0FBUyxvQkFBb0JBLGFBQVk7QUFDOUMsV0FBT0E7QUFBQSxFQUNUO0FDRE8sUUFBTUMsWUFBVSxXQUFXLFNBQVMsU0FBUyxLQUNoRCxXQUFXLFVBQ1gsV0FBVztBQ0ZSLFFBQU0sVUFBVUM7QUNEdkIsUUFBTSxVQUFVLHVCQUFPLE1BQU07QUFFN0IsTUFBSSxhQUFhO0FBQUEsRUFFRixNQUFNLG9CQUFvQixJQUFJO0FBQUEsSUFDNUMsY0FBYztBQUNiLFlBQUs7QUFFTCxXQUFLLGdCQUFnQixvQkFBSSxRQUFPO0FBQ2hDLFdBQUssZ0JBQWdCLG9CQUFJO0FBQ3pCLFdBQUssY0FBYyxvQkFBSSxJQUFHO0FBRTFCLFlBQU0sQ0FBQyxLQUFLLElBQUk7QUFDaEIsVUFBSSxVQUFVLFFBQVEsVUFBVSxRQUFXO0FBQzFDO0FBQUEsTUFDRDtBQUVBLFVBQUksT0FBTyxNQUFNLE9BQU8sUUFBUSxNQUFNLFlBQVk7QUFDakQsY0FBTSxJQUFJLFVBQVUsT0FBTyxRQUFRLGlFQUFpRTtBQUFBLE1BQ3JHO0FBRUEsaUJBQVcsQ0FBQyxNQUFNLEtBQUssS0FBSyxPQUFPO0FBQ2xDLGFBQUssSUFBSSxNQUFNLEtBQUs7QUFBQSxNQUNyQjtBQUFBLElBQ0Q7QUFBQSxJQUVBLGVBQWUsTUFBTSxTQUFTLE9BQU87QUFDcEMsVUFBSSxDQUFDLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDekIsY0FBTSxJQUFJLFVBQVUscUNBQXFDO0FBQUEsTUFDMUQ7QUFFQSxZQUFNLGFBQWEsS0FBSyxlQUFlLE1BQU0sTUFBTTtBQUVuRCxVQUFJO0FBQ0osVUFBSSxjQUFjLEtBQUssWUFBWSxJQUFJLFVBQVUsR0FB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Q3JEO0FBQUEsUUFDTTtBQUFBLE1BQ047QUFBQSxJQUNFO0FBQUEsSUFDQSx5QkFBeUIsT0FBTztBQUM5QixZQUFNLHVCQUF1QixNQUFNLE1BQU0sU0FBUyxxQkFBcUI7QUFDdkUsWUFBTSxzQkFBc0IsTUFBTSxNQUFNLHNCQUFzQixLQUFLO0FBQ25FLFlBQU0saUJBQWlCLENBQUMsS0FBSyxtQkFBbUIsSUFBSSxNQUFNLE1BQU0sU0FBUztBQUN6RSxhQUFPLHdCQUF3Qix1QkFBdUI7QUFBQSxJQUN4RDtBQUFBLElBQ0Esc0JBQXNCLFNBQVM7QUFDN0IsVUFBSSxVQUFVO0FBQ2QsWUFBTSxLQUFLLENBQUMsVUFBVTtBQUNwQixZQUFJLEtBQUsseUJBQXlCLEtBQUssR0FBRztBQUN4QyxlQUFLLG1CQUFtQixJQUFJLE1BQU0sS0FBSyxTQUFTO0FBQ2hELGdCQUFNLFdBQVc7QUFDakIsb0JBQVU7QUFDVixjQUFJLFlBQVksU0FBUyxpQkFBa0I7QUFDM0MsZUFBSyxrQkFBaUI7QUFBQSxRQUN4QjtBQUFBLE1BQ0Y7QUFDQSx1QkFBaUIsV0FBVyxFQUFFO0FBQzlCLFdBQUssY0FBYyxNQUFNLG9CQUFvQixXQUFXLEVBQUUsQ0FBQztBQUFBLElBQzdEO0FBQUEsRUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiwzLDQsNSw2LDcsOCw5LDEzLDE0LDE1XX0=
content;