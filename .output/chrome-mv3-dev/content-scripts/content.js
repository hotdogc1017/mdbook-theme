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
  const mintlifyLightCSS = '/* Mintlify-inspired Light Theme for mdBook */\n:root {\n    --bg: #ffffff;\n    --fg: #0a0d0d;\n    --sidebar-bg: #f8faf9;\n    --sidebar-fg: #374151;\n    --sidebar-active: #166e3f;\n    --sidebar-active-bg: rgba(22, 110, 63, 0.1);\n    --sidebar-header-border-color: var(--sidebar-active);\n    --links: #166e3f;\n    --links-hover: #26bd6c;\n    --inline-code-bg: #f3f6f4;\n    --inline-code-color: rgba(238, 241, 239, 0.5);\n    --code-bg: #0a0d0d;\n    --code-fg: #e5e7eb;\n    --quote-bg: #f3f6f4;\n    --quote-border: #26bd6c;\n    --table-border: #e5e7eb;\n    --table-header-bg: #f3f6f4;\n    --search-bg: #ffffff;\n    --search-border: #e5e7eb;\n    --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n    --scrollbar: #d1d5db;\n    --scrollbar-hover: #9ca3af;\n    --order-weight: 400;\n    --order-display: none;\n    --chapter-nav-display: none;\n    --sidebar-text-size: 16px;\n}\n\n:not(pre) > code.hljs {\n    background-color: var(--inline-code-color);\n    color: rgb(17, 24, 39);\n    font-weight: 500;\n}\n\nhtml {\n    font-family:\n        "Inter",\n        -apple-system,\n        BlinkMacSystemFont,\n        "Segoe UI",\n        Roboto,\n        sans-serif;\n    background: var(--bg);\n    color: var(--fg);\n    height: 100dvh;\n}\n\nbody {\n    background: var(--bg);\n    color: var(--fg);\n}\n\nnav.nav-wide-wrapper a.nav-chapters {\n    display: var(--chapter-nav-display);\n}\n\n/* Sidebar */\n.sidebar {\n    background: var(--sidebar-bg);\n    border-right: 1px solid var(--table-border);\n}\n\n.sidebar .sidebar-scrollbox {\n    background: var(--sidebar-bg);\n}\n\nspan.chapter-link-wrapper a {\n    display: block;\n    width: 100%;\n    height: 100%;\n}\nspan.chapter-link-wrapper {\n    cursor: pointer;\n    color: var(--sidebar-fg);\n    padding: 4px 16px;\n    border-radius: 8px;\n    transition: all 0.15s ease;\n    font-size: var(--sidebar-text-size);\n}\n\n/*.sidebar ol.chapter > li.chapter-item > span.chapter-link-wrapper {\n    font-weight: bold;\n}*/\n\n/*.sidebar ol.chapter li .chapter-item.expanded > a,*/\nspan.chapter-link-wrapper:has(a.active),\nspan.chapter-link-wrapper:hover {\n    background: var(--sidebar-active-bg);\n    color: var(--sidebar-active);\n    text-decoration: none;\n}\n\n/* Typography */\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n    color: var(--fg);\n    font-weight: 600;\n    margin-top: 2em;\n    margin-bottom: 0.5em;\n    line-height: 1.3;\n}\n\nh1 {\n    font-size: 2.25rem;\n    margin-top: 0;\n}\nh2 {\n    font-size: 1.75rem;\n    border-bottom: 1px solid var(--table-border);\n    padding-bottom: 0.5rem;\n}\nh3 {\n    font-size: 1.375rem;\n}\nh4 {\n    font-size: 1.125rem;\n}\n\np {\n    line-height: 1.75;\n    margin: 1em 0;\n}\n\n/* Links */\na {\n    color: var(--links);\n    text-decoration: none;\n    transition: color 0.15s ease;\n}\n\na:hover {\n    color: var(--links-hover);\n    text-decoration: underline;\n}\n\n/* Code */\ncode {\n    font-family: "Geist Mono", "Fira Code", "JetBrains Mono", monospace;\n    font-size: 0.875em;\n}\n\nstrong {\n    display: var(--order-display);\n    font-weight: var(--order-weight);\n}\n\n:not(pre) > code {\n    background: var(--inline-code-bg);\n    padding: 0.2em 0.4em;\n    border-radius: 6px;\n    color: var(--sidebar-active);\n}\n\npre {\n    background: var(--code-bg) !important;\n    color: var(--code-fg);\n    padding: 16px 20px;\n    border-radius: 12px;\n    overflow-x: auto;\n    margin: 1.5em 0;\n    border: 1px solid rgba(255, 255, 255, 0.1);\n}\n\npre code {\n    background: transparent;\n    padding: 0;\n    color: inherit;\n}\n\n/* Blockquotes */\nblockquote {\n    background: var(--quote-bg);\n    border-left: 4px solid var(--quote-border);\n    margin: 1.5em 0;\n    padding: 16px 20px;\n    border-radius: 0 12px 12px 0;\n}\n\nblockquote p {\n    margin: 0;\n}\n\n/* Tables */\ntable {\n    border-collapse: collapse;\n    width: 100%;\n    margin: 1.5em 0;\n    border-radius: 12px;\n    overflow: hidden;\n    border: 1px solid var(--table-border);\n}\n\nth {\n    background: var(--table-header-bg);\n    font-weight: 600;\n    text-align: left;\n}\n\nth,\ntd {\n    padding: 12px 16px;\n    border-bottom: 1px solid var(--table-border);\n}\n\ntr:last-child td {\n    border-bottom: none;\n}\n\n/* Menu bar */\n#menu-bar {\n    background: var(--bg);\n    border-bottom: 1px solid var(--table-border);\n}\n\n#menu-bar i {\n    color: var(--fg);\n}\n\n/* Search */\n#searchbar {\n    background: var(--search-bg);\n    border: 1px solid var(--search-border);\n    box-shadow: var(--searchbar-shadow);\n    border-radius: 8px;\n    padding: 8px 12px;\n}\n\n/* Navigation buttons */\n.nav-chapters {\n    color: var(--links);\n    opacity: 0.8;\n    transition: opacity 0.15s ease;\n}\n\n.nav-chapters:hover {\n    color: var(--links-hover);\n    opacity: 1;\n}\n\n/* Scrollbar */\n::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n\n::-webkit-scrollbar-track {\n    background: transparent;\n}\n\n::-webkit-scrollbar-thumb {\n    background: var(--scrollbar);\n    border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n    background: var(--scrollbar-hover);\n}\n\n/* Theme toggle */\n#theme-list {\n    background: var(--sidebar-bg);\n    border: 1px solid var(--table-border);\n    border-radius: 8px;\n}\n\n#theme-list li {\n    color: var(--fg);\n}\n\n#theme-list li:hover {\n    background: var(--sidebar-active-bg);\n}\n\ndiv#mdbook-content {\n    max-height: calc(100vh - 80px);\n    box-sizing: border-box;\n    padding: 2rem 4rem;\n    display: grid;\n    grid-template-columns: 1fr 36rem;\n    gap: 3rem;\n    overflow-y: auto;\n    scroll-behavior: smooth;\n}\n\ndiv#mdbook-content main {\n    max-width: 100%;\n}\n\n/* Right Sidebar (TOC) */\n.page-wrapper.has-right-sidebar {\n    display: grid;\n    grid-template-columns: auto 1fr 220px;\n}\n\n.right-sidebar {\n    position: sticky;\n    top: 60px;\n    right: 0px;\n    height: fit-content;\n    max-height: calc(100vh - 8px);\n    overflow-y: auto;\n    border-left: 1px solid var(--table-border);\n    background: var(--bg);\n    margin-left: 2.5rem;\n    padding-left: 1rem;\n}\n\n.right-sidebar-header {\n    color: var(--sidebar-fg);\n    margin-bottom: 12px;\n    padding-left: 8px;\n}\n\n.right-sidebar-toc {\n    list-style: none;\n    padding: 0;\n    margin: 0;\n}\n\n.right-sidebar-toc ol {\n    list-style: none;\n    padding-left: 12px;\n    margin: 0;\n}\n\n.right-sidebar-toc li {\n    margin: 0;\n}\n\n/* Adjust content width when right sidebar exists */\n.page-wrapper.has-right-sidebar .content {\n    max-width: 100%;\n}\n\n/* Hide right sidebar on small screens */\n@media (max-width: 1100px) {\n    .page-wrapper.has-right-sidebar {\n        grid-template-columns: auto 1fr;\n    }\n\n    .right-sidebar {\n        display: none;\n    }\n}\n';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1jb250ZW50LXNjcmlwdC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHd4dC1kZXYrYnJvd3NlckAwLjEuMzIvbm9kZV9tb2R1bGVzL0B3eHQtZGV2L2Jyb3dzZXIvc3JjL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyLm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9tYW55LWtleXMtbWFwQDIuMC4xL25vZGVfbW9kdWxlcy9tYW55LWtleXMtbWFwL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RlZnVANi4xLjQvbm9kZV9tb2R1bGVzL2RlZnUvZGlzdC9kZWZ1Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AMW5hdHN1K3dhaXQtZWxlbWVudEA0LjEuMi9ub2RlX21vZHVsZXMvQDFuYXRzdS93YWl0LWVsZW1lbnQvZGlzdC9kZXRlY3RvcnMubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0AxbmF0c3Urd2FpdC1lbGVtZW50QDQuMS4yL25vZGVfbW9kdWxlcy9AMW5hdHN1L3dhaXQtZWxlbWVudC9kaXN0L2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC4xM19AdHlwZXMrbm9kZUAyNS4wLjNfaml0aUAyLjYuMV9yb2xsdXBANC41NC4wL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjEzX0B0eXBlcytub2RlQDI1LjAuM19qaXRpQDIuNi4xX3JvbGx1cEA0LjU0LjAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LXVpL3NoYXJlZC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvY29udGVudC1zY3JpcHQtdWkvaW50ZWdyYXRlZC5tanMiLCIuLi8uLi8uLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LWxpZ2h0LmNzcz9yYXciLCIuLi8uLi8uLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LWRhcmsuY3NzP3JhdyIsIi4uLy4uLy4uL2VudHJ5cG9pbnRzL2NvbnRlbnQudHMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvaW50ZXJuYWwvY3VzdG9tLWV2ZW50cy5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvaW50ZXJuYWwvbG9jYXRpb24td2F0Y2hlci5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuMTNfQHR5cGVzK25vZGVAMjUuMC4zX2ppdGlAMi42LjFfcm9sbHVwQDQuNTQuMC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvY29udGVudC1zY3JpcHQtY29udGV4dC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUNvbnRlbnRTY3JpcHQoZGVmaW5pdGlvbikge1xuICByZXR1cm4gZGVmaW5pdGlvbjtcbn1cbiIsIi8vICNyZWdpb24gc25pcHBldFxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBnbG9iYWxUaGlzLmJyb3dzZXI/LnJ1bnRpbWU/LmlkXG4gID8gZ2xvYmFsVGhpcy5icm93c2VyXG4gIDogZ2xvYmFsVGhpcy5jaHJvbWU7XG4vLyAjZW5kcmVnaW9uIHNuaXBwZXRcbiIsImltcG9ydCB7IGJyb3dzZXIgYXMgX2Jyb3dzZXIgfSBmcm9tIFwiQHd4dC1kZXYvYnJvd3NlclwiO1xuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBfYnJvd3NlcjtcbmV4cG9ydCB7fTtcbiIsImNvbnN0IG51bGxLZXkgPSBTeW1ib2woJ251bGwnKTsgLy8gYG9iamVjdEhhc2hlc2Aga2V5IGZvciBudWxsXG5cbmxldCBrZXlDb3VudGVyID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFueUtleXNNYXAgZXh0ZW5kcyBNYXAge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fb2JqZWN0SGFzaGVzID0gbmV3IFdlYWtNYXAoKTtcblx0XHR0aGlzLl9zeW1ib2xIYXNoZXMgPSBuZXcgTWFwKCk7IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L2VjbWEyNjIvaXNzdWVzLzExOTRcblx0XHR0aGlzLl9wdWJsaWNLZXlzID0gbmV3IE1hcCgpO1xuXG5cdFx0Y29uc3QgW3BhaXJzXSA9IGFyZ3VtZW50czsgLy8gTWFwIGNvbXBhdFxuXHRcdGlmIChwYWlycyA9PT0gbnVsbCB8fCBwYWlycyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBwYWlyc1tTeW1ib2wuaXRlcmF0b3JdICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKHR5cGVvZiBwYWlycyArICcgaXMgbm90IGl0ZXJhYmxlIChjYW5ub3QgcmVhZCBwcm9wZXJ0eSBTeW1ib2woU3ltYm9sLml0ZXJhdG9yKSknKTtcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IFtrZXlzLCB2YWx1ZV0gb2YgcGFpcnMpIHtcblx0XHRcdHRoaXMuc2V0KGtleXMsIHZhbHVlKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0UHVibGljS2V5cyhrZXlzLCBjcmVhdGUgPSBmYWxzZSkge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShrZXlzKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGtleXMgcGFyYW1ldGVyIG11c3QgYmUgYW4gYXJyYXknKTtcblx0XHR9XG5cblx0XHRjb25zdCBwcml2YXRlS2V5ID0gdGhpcy5fZ2V0UHJpdmF0ZUtleShrZXlzLCBjcmVhdGUpO1xuXG5cdFx0bGV0IHB1YmxpY0tleTtcblx0XHRpZiAocHJpdmF0ZUtleSAmJiB0aGlzLl9wdWJsaWNLZXlzLmhhcyhwcml2YXRlS2V5KSkge1xuXHRcdFx0cHVibGljS2V5ID0gdGhpcy5fcHVibGljS2V5cy5nZXQocHJpdmF0ZUtleSk7XG5cdFx0fSBlbHNlIGlmIChjcmVhdGUpIHtcblx0XHRcdHB1YmxpY0tleSA9IFsuLi5rZXlzXTsgLy8gUmVnZW5lcmF0ZSBrZXlzIGFycmF5IHRvIGF2b2lkIGV4dGVybmFsIGludGVyYWN0aW9uXG5cdFx0XHR0aGlzLl9wdWJsaWNLZXlzLnNldChwcml2YXRlS2V5LCBwdWJsaWNLZXkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7cHJpdmF0ZUtleSwgcHVibGljS2V5fTtcblx0fVxuXG5cdF9nZXRQcml2YXRlS2V5KGtleXMsIGNyZWF0ZSA9IGZhbHNlKSB7XG5cdFx0Y29uc3QgcHJpdmF0ZUtleXMgPSBbXTtcblx0XHRmb3IgKGxldCBrZXkgb2Yga2V5cykge1xuXHRcdFx0aWYgKGtleSA9PT0gbnVsbCkge1xuXHRcdFx0XHRrZXkgPSBudWxsS2V5O1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBoYXNoZXMgPSB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyB8fCB0eXBlb2Yga2V5ID09PSAnZnVuY3Rpb24nID8gJ19vYmplY3RIYXNoZXMnIDogKHR5cGVvZiBrZXkgPT09ICdzeW1ib2wnID8gJ19zeW1ib2xIYXNoZXMnIDogZmFsc2UpO1xuXG5cdFx0XHRpZiAoIWhhc2hlcykge1xuXHRcdFx0XHRwcml2YXRlS2V5cy5wdXNoKGtleSk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXNbaGFzaGVzXS5oYXMoa2V5KSkge1xuXHRcdFx0XHRwcml2YXRlS2V5cy5wdXNoKHRoaXNbaGFzaGVzXS5nZXQoa2V5KSk7XG5cdFx0XHR9IGVsc2UgaWYgKGNyZWF0ZSkge1xuXHRcdFx0XHRjb25zdCBwcml2YXRlS2V5ID0gYEBAbWttLXJlZi0ke2tleUNvdW50ZXIrK31AQGA7XG5cdFx0XHRcdHRoaXNbaGFzaGVzXS5zZXQoa2V5LCBwcml2YXRlS2V5KTtcblx0XHRcdFx0cHJpdmF0ZUtleXMucHVzaChwcml2YXRlS2V5KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJpdmF0ZUtleXMpO1xuXHR9XG5cblx0c2V0KGtleXMsIHZhbHVlKSB7XG5cdFx0Y29uc3Qge3B1YmxpY0tleX0gPSB0aGlzLl9nZXRQdWJsaWNLZXlzKGtleXMsIHRydWUpO1xuXHRcdHJldHVybiBzdXBlci5zZXQocHVibGljS2V5LCB2YWx1ZSk7XG5cdH1cblxuXHRnZXQoa2V5cykge1xuXHRcdGNvbnN0IHtwdWJsaWNLZXl9ID0gdGhpcy5fZ2V0UHVibGljS2V5cyhrZXlzKTtcblx0XHRyZXR1cm4gc3VwZXIuZ2V0KHB1YmxpY0tleSk7XG5cdH1cblxuXHRoYXMoa2V5cykge1xuXHRcdGNvbnN0IHtwdWJsaWNLZXl9ID0gdGhpcy5fZ2V0UHVibGljS2V5cyhrZXlzKTtcblx0XHRyZXR1cm4gc3VwZXIuaGFzKHB1YmxpY0tleSk7XG5cdH1cblxuXHRkZWxldGUoa2V5cykge1xuXHRcdGNvbnN0IHtwdWJsaWNLZXksIHByaXZhdGVLZXl9ID0gdGhpcy5fZ2V0UHVibGljS2V5cyhrZXlzKTtcblx0XHRyZXR1cm4gQm9vbGVhbihwdWJsaWNLZXkgJiYgc3VwZXIuZGVsZXRlKHB1YmxpY0tleSkgJiYgdGhpcy5fcHVibGljS2V5cy5kZWxldGUocHJpdmF0ZUtleSkpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0c3VwZXIuY2xlYXIoKTtcblx0XHR0aGlzLl9zeW1ib2xIYXNoZXMuY2xlYXIoKTtcblx0XHR0aGlzLl9wdWJsaWNLZXlzLmNsZWFyKCk7XG5cdH1cblxuXHRnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG5cdFx0cmV0dXJuICdNYW55S2V5c01hcCc7XG5cdH1cblxuXHRnZXQgc2l6ZSgpIHtcblx0XHRyZXR1cm4gc3VwZXIuc2l6ZTtcblx0fVxufVxuIiwiZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSk7XG4gIGlmIChwcm90b3R5cGUgIT09IG51bGwgJiYgcHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90b3R5cGUpICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gdmFsdWUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKFN5bWJvbC50b1N0cmluZ1RhZyBpbiB2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgTW9kdWxlXVwiO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBfZGVmdShiYXNlT2JqZWN0LCBkZWZhdWx0cywgbmFtZXNwYWNlID0gXCIuXCIsIG1lcmdlcikge1xuICBpZiAoIWlzUGxhaW5PYmplY3QoZGVmYXVsdHMpKSB7XG4gICAgcmV0dXJuIF9kZWZ1KGJhc2VPYmplY3QsIHt9LCBuYW1lc3BhY2UsIG1lcmdlcik7XG4gIH1cbiAgY29uc3Qgb2JqZWN0ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMpO1xuICBmb3IgKGNvbnN0IGtleSBpbiBiYXNlT2JqZWN0KSB7XG4gICAgaWYgKGtleSA9PT0gXCJfX3Byb3RvX19cIiB8fCBrZXkgPT09IFwiY29uc3RydWN0b3JcIikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gYmFzZU9iamVjdFtrZXldO1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKG1lcmdlciAmJiBtZXJnZXIob2JqZWN0LCBrZXksIHZhbHVlLCBuYW1lc3BhY2UpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIEFycmF5LmlzQXJyYXkob2JqZWN0W2tleV0pKSB7XG4gICAgICBvYmplY3Rba2V5XSA9IFsuLi52YWx1ZSwgLi4ub2JqZWN0W2tleV1dO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWx1ZSkgJiYgaXNQbGFpbk9iamVjdChvYmplY3Rba2V5XSkpIHtcbiAgICAgIG9iamVjdFtrZXldID0gX2RlZnUoXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBvYmplY3Rba2V5XSxcbiAgICAgICAgKG5hbWVzcGFjZSA/IGAke25hbWVzcGFjZX0uYCA6IFwiXCIpICsga2V5LnRvU3RyaW5nKCksXG4gICAgICAgIG1lcmdlclxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZURlZnUobWVyZ2VyKSB7XG4gIHJldHVybiAoLi4uYXJndW1lbnRzXykgPT4gKFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSB1bmljb3JuL25vLWFycmF5LXJlZHVjZVxuICAgIGFyZ3VtZW50c18ucmVkdWNlKChwLCBjKSA9PiBfZGVmdShwLCBjLCBcIlwiLCBtZXJnZXIpLCB7fSlcbiAgKTtcbn1cbmNvbnN0IGRlZnUgPSBjcmVhdGVEZWZ1KCk7XG5jb25zdCBkZWZ1Rm4gPSBjcmVhdGVEZWZ1KChvYmplY3QsIGtleSwgY3VycmVudFZhbHVlKSA9PiB7XG4gIGlmIChvYmplY3Rba2V5XSAhPT0gdm9pZCAwICYmIHR5cGVvZiBjdXJyZW50VmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIG9iamVjdFtrZXldID0gY3VycmVudFZhbHVlKG9iamVjdFtrZXldKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufSk7XG5jb25zdCBkZWZ1QXJyYXlGbiA9IGNyZWF0ZURlZnUoKG9iamVjdCwga2V5LCBjdXJyZW50VmFsdWUpID0+IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0W2tleV0pICYmIHR5cGVvZiBjdXJyZW50VmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIG9iamVjdFtrZXldID0gY3VycmVudFZhbHVlKG9iamVjdFtrZXldKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufSk7XG5cbmV4cG9ydCB7IGNyZWF0ZURlZnUsIGRlZnUgYXMgZGVmYXVsdCwgZGVmdSwgZGVmdUFycmF5Rm4sIGRlZnVGbiB9O1xuIiwiY29uc3QgaXNFeGlzdCA9IChlbGVtZW50KSA9PiB7XG4gIHJldHVybiBlbGVtZW50ICE9PSBudWxsID8geyBpc0RldGVjdGVkOiB0cnVlLCByZXN1bHQ6IGVsZW1lbnQgfSA6IHsgaXNEZXRlY3RlZDogZmFsc2UgfTtcbn07XG5jb25zdCBpc05vdEV4aXN0ID0gKGVsZW1lbnQpID0+IHtcbiAgcmV0dXJuIGVsZW1lbnQgPT09IG51bGwgPyB7IGlzRGV0ZWN0ZWQ6IHRydWUsIHJlc3VsdDogbnVsbCB9IDogeyBpc0RldGVjdGVkOiBmYWxzZSB9O1xufTtcblxuZXhwb3J0IHsgaXNFeGlzdCwgaXNOb3RFeGlzdCB9O1xuIiwiaW1wb3J0IE1hbnlLZXlzTWFwIGZyb20gJ21hbnkta2V5cy1tYXAnO1xuaW1wb3J0IHsgZGVmdSB9IGZyb20gJ2RlZnUnO1xuaW1wb3J0IHsgaXNFeGlzdCB9IGZyb20gJy4vZGV0ZWN0b3JzLm1qcyc7XG5cbmNvbnN0IGdldERlZmF1bHRPcHRpb25zID0gKCkgPT4gKHtcbiAgdGFyZ2V0OiBnbG9iYWxUaGlzLmRvY3VtZW50LFxuICB1bmlmeVByb2Nlc3M6IHRydWUsXG4gIGRldGVjdG9yOiBpc0V4aXN0LFxuICBvYnNlcnZlQ29uZmlnczoge1xuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZXM6IHRydWVcbiAgfSxcbiAgc2lnbmFsOiB2b2lkIDAsXG4gIGN1c3RvbU1hdGNoZXI6IHZvaWQgMFxufSk7XG5jb25zdCBtZXJnZU9wdGlvbnMgPSAodXNlclNpZGVPcHRpb25zLCBkZWZhdWx0T3B0aW9ucykgPT4ge1xuICByZXR1cm4gZGVmdSh1c2VyU2lkZU9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKTtcbn07XG5cbmNvbnN0IHVuaWZ5Q2FjaGUgPSBuZXcgTWFueUtleXNNYXAoKTtcbmZ1bmN0aW9uIGNyZWF0ZVdhaXRFbGVtZW50KGluc3RhbmNlT3B0aW9ucykge1xuICBjb25zdCB7IGRlZmF1bHRPcHRpb25zIH0gPSBpbnN0YW5jZU9wdGlvbnM7XG4gIHJldHVybiAoc2VsZWN0b3IsIG9wdGlvbnMpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICB0YXJnZXQsXG4gICAgICB1bmlmeVByb2Nlc3MsXG4gICAgICBvYnNlcnZlQ29uZmlncyxcbiAgICAgIGRldGVjdG9yLFxuICAgICAgc2lnbmFsLFxuICAgICAgY3VzdG9tTWF0Y2hlclxuICAgIH0gPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdE9wdGlvbnMpO1xuICAgIGNvbnN0IHVuaWZ5UHJvbWlzZUtleSA9IFtcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgdGFyZ2V0LFxuICAgICAgdW5pZnlQcm9jZXNzLFxuICAgICAgb2JzZXJ2ZUNvbmZpZ3MsXG4gICAgICBkZXRlY3RvcixcbiAgICAgIHNpZ25hbCxcbiAgICAgIGN1c3RvbU1hdGNoZXJcbiAgICBdO1xuICAgIGNvbnN0IGNhY2hlZFByb21pc2UgPSB1bmlmeUNhY2hlLmdldCh1bmlmeVByb21pc2VLZXkpO1xuICAgIGlmICh1bmlmeVByb2Nlc3MgJiYgY2FjaGVkUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIGNhY2hlZFByb21pc2U7XG4gICAgfVxuICAgIGNvbnN0IGRldGVjdFByb21pc2UgPSBuZXcgUHJvbWlzZShcbiAgICAgIC8vIGJpb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9Bc3luY1Byb21pc2VFeGVjdXRvcjogYXZvaWQgbmVzdGluZyBwcm9taXNlXG4gICAgICBhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGlmIChzaWduYWw/LmFib3J0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KHNpZ25hbC5yZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoXG4gICAgICAgICAgYXN5bmMgKG11dGF0aW9ucykgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBfIG9mIG11dGF0aW9ucykge1xuICAgICAgICAgICAgICBpZiAoc2lnbmFsPy5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGRldGVjdFJlc3VsdDIgPSBhd2FpdCBkZXRlY3RFbGVtZW50KHtcbiAgICAgICAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICAgICAgZGV0ZWN0b3IsXG4gICAgICAgICAgICAgICAgY3VzdG9tTWF0Y2hlclxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGRldGVjdFJlc3VsdDIuaXNEZXRlY3RlZCkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGRldGVjdFJlc3VsdDIucmVzdWx0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgc2lnbmFsPy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgIFwiYWJvcnRcIixcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHNpZ25hbC5yZWFzb24pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgeyBvbmNlOiB0cnVlIH1cbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZGV0ZWN0UmVzdWx0ID0gYXdhaXQgZGV0ZWN0RWxlbWVudCh7XG4gICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgIGRldGVjdG9yLFxuICAgICAgICAgIGN1c3RvbU1hdGNoZXJcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChkZXRlY3RSZXN1bHQuaXNEZXRlY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGRldGVjdFJlc3VsdC5yZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUodGFyZ2V0LCBvYnNlcnZlQ29uZmlncyk7XG4gICAgICB9XG4gICAgKS5maW5hbGx5KCgpID0+IHtcbiAgICAgIHVuaWZ5Q2FjaGUuZGVsZXRlKHVuaWZ5UHJvbWlzZUtleSk7XG4gICAgfSk7XG4gICAgdW5pZnlDYWNoZS5zZXQodW5pZnlQcm9taXNlS2V5LCBkZXRlY3RQcm9taXNlKTtcbiAgICByZXR1cm4gZGV0ZWN0UHJvbWlzZTtcbiAgfTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGRldGVjdEVsZW1lbnQoe1xuICB0YXJnZXQsXG4gIHNlbGVjdG9yLFxuICBkZXRlY3RvcixcbiAgY3VzdG9tTWF0Y2hlclxufSkge1xuICBjb25zdCBlbGVtZW50ID0gY3VzdG9tTWF0Y2hlciA/IGN1c3RvbU1hdGNoZXIoc2VsZWN0b3IpIDogdGFyZ2V0LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICByZXR1cm4gYXdhaXQgZGV0ZWN0b3IoZWxlbWVudCk7XG59XG5jb25zdCB3YWl0RWxlbWVudCA9IGNyZWF0ZVdhaXRFbGVtZW50KHtcbiAgZGVmYXVsdE9wdGlvbnM6IGdldERlZmF1bHRPcHRpb25zKClcbn0pO1xuXG5leHBvcnQgeyBjcmVhdGVXYWl0RWxlbWVudCwgZ2V0RGVmYXVsdE9wdGlvbnMsIHdhaXRFbGVtZW50IH07XG4iLCJmdW5jdGlvbiBwcmludChtZXRob2QsIC4uLmFyZ3MpIHtcbiAgaWYgKGltcG9ydC5tZXRhLmVudi5NT0RFID09PSBcInByb2R1Y3Rpb25cIikgcmV0dXJuO1xuICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09IFwic3RyaW5nXCIpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYXJncy5zaGlmdCgpO1xuICAgIG1ldGhvZChgW3d4dF0gJHttZXNzYWdlfWAsIC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIG1ldGhvZChcIlt3eHRdXCIsIC4uLmFyZ3MpO1xuICB9XG59XG5leHBvcnQgY29uc3QgbG9nZ2VyID0ge1xuICBkZWJ1ZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZGVidWcsIC4uLmFyZ3MpLFxuICBsb2c6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmxvZywgLi4uYXJncyksXG4gIHdhcm46ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLndhcm4sIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZXJyb3IsIC4uLmFyZ3MpXG59O1xuIiwiaW1wb3J0IHsgd2FpdEVsZW1lbnQgfSBmcm9tIFwiQDFuYXRzdS93YWl0LWVsZW1lbnRcIjtcbmltcG9ydCB7XG4gIGlzRXhpc3QgYXMgbW91bnREZXRlY3RvcixcbiAgaXNOb3RFeGlzdCBhcyByZW1vdmVEZXRlY3RvclxufSBmcm9tIFwiQDFuYXRzdS93YWl0LWVsZW1lbnQvZGV0ZWN0b3JzXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvaW50ZXJuYWwvbG9nZ2VyLm1qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UG9zaXRpb24ocm9vdCwgcG9zaXRpb25lZEVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMucG9zaXRpb24gPT09IFwiaW5saW5lXCIpIHJldHVybjtcbiAgaWYgKG9wdGlvbnMuekluZGV4ICE9IG51bGwpIHJvb3Quc3R5bGUuekluZGV4ID0gU3RyaW5nKG9wdGlvbnMuekluZGV4KTtcbiAgcm9vdC5zdHlsZS5vdmVyZmxvdyA9IFwidmlzaWJsZVwiO1xuICByb290LnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICByb290LnN0eWxlLndpZHRoID0gXCIwXCI7XG4gIHJvb3Quc3R5bGUuaGVpZ2h0ID0gXCIwXCI7XG4gIHJvb3Quc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgaWYgKHBvc2l0aW9uZWRFbGVtZW50KSB7XG4gICAgaWYgKG9wdGlvbnMucG9zaXRpb24gPT09IFwib3ZlcmxheVwiKSB7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgIGlmIChvcHRpb25zLmFsaWdubWVudD8uc3RhcnRzV2l0aChcImJvdHRvbS1cIikpXG4gICAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLmJvdHRvbSA9IFwiMFwiO1xuICAgICAgZWxzZSBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS50b3AgPSBcIjBcIjtcbiAgICAgIGlmIChvcHRpb25zLmFsaWdubWVudD8uZW5kc1dpdGgoXCItcmlnaHRcIikpXG4gICAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLnJpZ2h0ID0gXCIwXCI7XG4gICAgICBlbHNlIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBcIjBcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBcImZpeGVkXCI7XG4gICAgICBwb3NpdGlvbmVkRWxlbWVudC5zdHlsZS50b3AgPSBcIjBcIjtcbiAgICAgIHBvc2l0aW9uZWRFbGVtZW50LnN0eWxlLmJvdHRvbSA9IFwiMFwiO1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUubGVmdCA9IFwiMFwiO1xuICAgICAgcG9zaXRpb25lZEVsZW1lbnQuc3R5bGUucmlnaHQgPSBcIjBcIjtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmNob3Iob3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5hbmNob3IgPT0gbnVsbCkgcmV0dXJuIGRvY3VtZW50LmJvZHk7XG4gIGxldCByZXNvbHZlZCA9IHR5cGVvZiBvcHRpb25zLmFuY2hvciA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9ucy5hbmNob3IoKSA6IG9wdGlvbnMuYW5jaG9yO1xuICBpZiAodHlwZW9mIHJlc29sdmVkID09PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKHJlc29sdmVkLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBkb2N1bWVudC5ldmFsdWF0ZShcbiAgICAgICAgcmVzb2x2ZWQsXG4gICAgICAgIGRvY3VtZW50LFxuICAgICAgICBudWxsLFxuICAgICAgICBYUGF0aFJlc3VsdC5GSVJTVF9PUkRFUkVEX05PREVfVFlQRSxcbiAgICAgICAgbnVsbFxuICAgICAgKTtcbiAgICAgIHJldHVybiByZXN1bHQuc2luZ2xlTm9kZVZhbHVlID8/IHZvaWQgMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocmVzb2x2ZWQpID8/IHZvaWQgMDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc29sdmVkID8/IHZvaWQgMDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBtb3VudFVpKHJvb3QsIG9wdGlvbnMpIHtcbiAgY29uc3QgYW5jaG9yID0gZ2V0QW5jaG9yKG9wdGlvbnMpO1xuICBpZiAoYW5jaG9yID09IG51bGwpXG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICBcIkZhaWxlZCB0byBtb3VudCBjb250ZW50IHNjcmlwdCBVSTogY291bGQgbm90IGZpbmQgYW5jaG9yIGVsZW1lbnRcIlxuICAgICk7XG4gIHN3aXRjaCAob3B0aW9ucy5hcHBlbmQpIHtcbiAgICBjYXNlIHZvaWQgMDpcbiAgICBjYXNlIFwibGFzdFwiOlxuICAgICAgYW5jaG9yLmFwcGVuZChyb290KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJmaXJzdFwiOlxuICAgICAgYW5jaG9yLnByZXBlbmQocm9vdCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwicmVwbGFjZVwiOlxuICAgICAgYW5jaG9yLnJlcGxhY2VXaXRoKHJvb3QpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImFmdGVyXCI6XG4gICAgICBhbmNob3IucGFyZW50RWxlbWVudD8uaW5zZXJ0QmVmb3JlKHJvb3QsIGFuY2hvci5uZXh0RWxlbWVudFNpYmxpbmcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImJlZm9yZVwiOlxuICAgICAgYW5jaG9yLnBhcmVudEVsZW1lbnQ/Lmluc2VydEJlZm9yZShyb290LCBhbmNob3IpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG9wdGlvbnMuYXBwZW5kKGFuY2hvciwgcm9vdCk7XG4gICAgICBicmVhaztcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vdW50RnVuY3Rpb25zKGJhc2VGdW5jdGlvbnMsIG9wdGlvbnMpIHtcbiAgbGV0IGF1dG9Nb3VudEluc3RhbmNlID0gdm9pZCAwO1xuICBjb25zdCBzdG9wQXV0b01vdW50ID0gKCkgPT4ge1xuICAgIGF1dG9Nb3VudEluc3RhbmNlPy5zdG9wQXV0b01vdW50KCk7XG4gICAgYXV0b01vdW50SW5zdGFuY2UgPSB2b2lkIDA7XG4gIH07XG4gIGNvbnN0IG1vdW50ID0gKCkgPT4ge1xuICAgIGJhc2VGdW5jdGlvbnMubW91bnQoKTtcbiAgfTtcbiAgY29uc3QgdW5tb3VudCA9IGJhc2VGdW5jdGlvbnMucmVtb3ZlO1xuICBjb25zdCByZW1vdmUgPSAoKSA9PiB7XG4gICAgc3RvcEF1dG9Nb3VudCgpO1xuICAgIGJhc2VGdW5jdGlvbnMucmVtb3ZlKCk7XG4gIH07XG4gIGNvbnN0IGF1dG9Nb3VudCA9IChhdXRvTW91bnRPcHRpb25zKSA9PiB7XG4gICAgaWYgKGF1dG9Nb3VudEluc3RhbmNlKSB7XG4gICAgICBsb2dnZXIud2FybihcImF1dG9Nb3VudCBpcyBhbHJlYWR5IHNldC5cIik7XG4gICAgfVxuICAgIGF1dG9Nb3VudEluc3RhbmNlID0gYXV0b01vdW50VWkoXG4gICAgICB7IG1vdW50LCB1bm1vdW50LCBzdG9wQXV0b01vdW50IH0sXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIC4uLmF1dG9Nb3VudE9wdGlvbnNcbiAgICAgIH1cbiAgICApO1xuICB9O1xuICByZXR1cm4ge1xuICAgIG1vdW50LFxuICAgIHJlbW92ZSxcbiAgICBhdXRvTW91bnRcbiAgfTtcbn1cbmZ1bmN0aW9uIGF1dG9Nb3VudFVpKHVpQ2FsbGJhY2tzLCBvcHRpb25zKSB7XG4gIGNvbnN0IGFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgY29uc3QgRVhQTElDSVRfU1RPUF9SRUFTT04gPSBcImV4cGxpY2l0X3N0b3BfYXV0b19tb3VudFwiO1xuICBjb25zdCBfc3RvcEF1dG9Nb3VudCA9ICgpID0+IHtcbiAgICBhYm9ydENvbnRyb2xsZXIuYWJvcnQoRVhQTElDSVRfU1RPUF9SRUFTT04pO1xuICAgIG9wdGlvbnMub25TdG9wPy4oKTtcbiAgfTtcbiAgbGV0IHJlc29sdmVkQW5jaG9yID0gdHlwZW9mIG9wdGlvbnMuYW5jaG9yID09PSBcImZ1bmN0aW9uXCIgPyBvcHRpb25zLmFuY2hvcigpIDogb3B0aW9ucy5hbmNob3I7XG4gIGlmIChyZXNvbHZlZEFuY2hvciBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIFwiYXV0b01vdW50IGFuZCBFbGVtZW50IGFuY2hvciBvcHRpb24gY2Fubm90IGJlIGNvbWJpbmVkLiBBdm9pZCBwYXNzaW5nIGBFbGVtZW50YCBkaXJlY3RseSBvciBgKCkgPT4gRWxlbWVudGAgdG8gdGhlIGFuY2hvci5cIlxuICAgICk7XG4gIH1cbiAgYXN5bmMgZnVuY3Rpb24gb2JzZXJ2ZUVsZW1lbnQoc2VsZWN0b3IpIHtcbiAgICBsZXQgaXNBbmNob3JFeGlzdCA9ICEhZ2V0QW5jaG9yKG9wdGlvbnMpO1xuICAgIGlmIChpc0FuY2hvckV4aXN0KSB7XG4gICAgICB1aUNhbGxiYWNrcy5tb3VudCgpO1xuICAgIH1cbiAgICB3aGlsZSAoIWFib3J0Q29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2hhbmdlZEFuY2hvciA9IGF3YWl0IHdhaXRFbGVtZW50KHNlbGVjdG9yID8/IFwiYm9keVwiLCB7XG4gICAgICAgICAgY3VzdG9tTWF0Y2hlcjogKCkgPT4gZ2V0QW5jaG9yKG9wdGlvbnMpID8/IG51bGwsXG4gICAgICAgICAgZGV0ZWN0b3I6IGlzQW5jaG9yRXhpc3QgPyByZW1vdmVEZXRlY3RvciA6IG1vdW50RGV0ZWN0b3IsXG4gICAgICAgICAgc2lnbmFsOiBhYm9ydENvbnRyb2xsZXIuc2lnbmFsXG4gICAgICAgIH0pO1xuICAgICAgICBpc0FuY2hvckV4aXN0ID0gISFjaGFuZ2VkQW5jaG9yO1xuICAgICAgICBpZiAoaXNBbmNob3JFeGlzdCkge1xuICAgICAgICAgIHVpQ2FsbGJhY2tzLm1vdW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdWlDYWxsYmFja3MudW5tb3VudCgpO1xuICAgICAgICAgIGlmIChvcHRpb25zLm9uY2UpIHtcbiAgICAgICAgICAgIHVpQ2FsbGJhY2tzLnN0b3BBdXRvTW91bnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChhYm9ydENvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQgJiYgYWJvcnRDb250cm9sbGVyLnNpZ25hbC5yZWFzb24gPT09IEVYUExJQ0lUX1NUT1BfUkVBU09OKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgb2JzZXJ2ZUVsZW1lbnQocmVzb2x2ZWRBbmNob3IpO1xuICByZXR1cm4geyBzdG9wQXV0b01vdW50OiBfc3RvcEF1dG9Nb3VudCB9O1xufVxuIiwiaW1wb3J0IHsgYXBwbHlQb3NpdGlvbiwgY3JlYXRlTW91bnRGdW5jdGlvbnMsIG1vdW50VWkgfSBmcm9tIFwiLi9zaGFyZWQubWpzXCI7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW50ZWdyYXRlZFVpKGN0eCwgb3B0aW9ucykge1xuICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvcHRpb25zLnRhZyB8fCBcImRpdlwiKTtcbiAgbGV0IG1vdW50ZWQgPSB2b2lkIDA7XG4gIGNvbnN0IG1vdW50ID0gKCkgPT4ge1xuICAgIGFwcGx5UG9zaXRpb24od3JhcHBlciwgdm9pZCAwLCBvcHRpb25zKTtcbiAgICBtb3VudFVpKHdyYXBwZXIsIG9wdGlvbnMpO1xuICAgIG1vdW50ZWQgPSBvcHRpb25zLm9uTW91bnQ/Lih3cmFwcGVyKTtcbiAgfTtcbiAgY29uc3QgcmVtb3ZlID0gKCkgPT4ge1xuICAgIG9wdGlvbnMub25SZW1vdmU/Lihtb3VudGVkKTtcbiAgICB3cmFwcGVyLnJlcGxhY2VDaGlsZHJlbigpO1xuICAgIHdyYXBwZXIucmVtb3ZlKCk7XG4gICAgbW91bnRlZCA9IHZvaWQgMDtcbiAgfTtcbiAgY29uc3QgbW91bnRGdW5jdGlvbnMgPSBjcmVhdGVNb3VudEZ1bmN0aW9ucyhcbiAgICB7XG4gICAgICBtb3VudCxcbiAgICAgIHJlbW92ZVxuICAgIH0sXG4gICAgb3B0aW9uc1xuICApO1xuICBjdHgub25JbnZhbGlkYXRlZChyZW1vdmUpO1xuICByZXR1cm4ge1xuICAgIGdldCBtb3VudGVkKCkge1xuICAgICAgcmV0dXJuIG1vdW50ZWQ7XG4gICAgfSxcbiAgICB3cmFwcGVyLFxuICAgIC4uLm1vdW50RnVuY3Rpb25zXG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBcIi8qIE1pbnRsaWZ5LWluc3BpcmVkIExpZ2h0IFRoZW1lIGZvciBtZEJvb2sgKi9cXG46cm9vdCB7XFxuICAgIC0tYmc6ICNmZmZmZmY7XFxuICAgIC0tZmc6ICMwYTBkMGQ7XFxuICAgIC0tc2lkZWJhci1iZzogI2Y4ZmFmOTtcXG4gICAgLS1zaWRlYmFyLWZnOiAjMzc0MTUxO1xcbiAgICAtLXNpZGViYXItYWN0aXZlOiAjMTY2ZTNmO1xcbiAgICAtLXNpZGViYXItYWN0aXZlLWJnOiByZ2JhKDIyLCAxMTAsIDYzLCAwLjEpO1xcbiAgICAtLXNpZGViYXItaGVhZGVyLWJvcmRlci1jb2xvcjogdmFyKC0tc2lkZWJhci1hY3RpdmUpO1xcbiAgICAtLWxpbmtzOiAjMTY2ZTNmO1xcbiAgICAtLWxpbmtzLWhvdmVyOiAjMjZiZDZjO1xcbiAgICAtLWlubGluZS1jb2RlLWJnOiAjZjNmNmY0O1xcbiAgICAtLWlubGluZS1jb2RlLWNvbG9yOiByZ2JhKDIzOCwgMjQxLCAyMzksIDAuNSk7XFxuICAgIC0tY29kZS1iZzogIzBhMGQwZDtcXG4gICAgLS1jb2RlLWZnOiAjZTVlN2ViO1xcbiAgICAtLXF1b3RlLWJnOiAjZjNmNmY0O1xcbiAgICAtLXF1b3RlLWJvcmRlcjogIzI2YmQ2YztcXG4gICAgLS10YWJsZS1ib3JkZXI6ICNlNWU3ZWI7XFxuICAgIC0tdGFibGUtaGVhZGVyLWJnOiAjZjNmNmY0O1xcbiAgICAtLXNlYXJjaC1iZzogI2ZmZmZmZjtcXG4gICAgLS1zZWFyY2gtYm9yZGVyOiAjZTVlN2ViO1xcbiAgICAtLXNlYXJjaGJhci1zaGFkb3c6IDAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSk7XFxuICAgIC0tc2Nyb2xsYmFyOiAjZDFkNWRiO1xcbiAgICAtLXNjcm9sbGJhci1ob3ZlcjogIzljYTNhZjtcXG4gICAgLS1vcmRlci13ZWlnaHQ6IDQwMDtcXG4gICAgLS1vcmRlci1kaXNwbGF5OiBub25lO1xcbiAgICAtLWNoYXB0ZXItbmF2LWRpc3BsYXk6IG5vbmU7XFxuICAgIC0tc2lkZWJhci10ZXh0LXNpemU6IDE2cHg7XFxufVxcblxcbjpub3QocHJlKSA+IGNvZGUuaGxqcyB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWlubGluZS1jb2RlLWNvbG9yKTtcXG4gICAgY29sb3I6IHJnYigxNywgMjQsIDM5KTtcXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcXG59XFxuXFxuaHRtbCB7XFxuICAgIGZvbnQtZmFtaWx5OlxcbiAgICAgICAgXFxcIkludGVyXFxcIixcXG4gICAgICAgIC1hcHBsZS1zeXN0ZW0sXFxuICAgICAgICBCbGlua01hY1N5c3RlbUZvbnQsXFxuICAgICAgICBcXFwiU2Vnb2UgVUlcXFwiLFxcbiAgICAgICAgUm9ib3RvLFxcbiAgICAgICAgc2Fucy1zZXJpZjtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tYmcpO1xcbiAgICBjb2xvcjogdmFyKC0tZmcpO1xcbiAgICBoZWlnaHQ6IDEwMGR2aDtcXG59XFxuXFxuYm9keSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxubmF2Lm5hdi13aWRlLXdyYXBwZXIgYS5uYXYtY2hhcHRlcnMge1xcbiAgICBkaXNwbGF5OiB2YXIoLS1jaGFwdGVyLW5hdi1kaXNwbGF5KTtcXG59XFxuXFxuLyogU2lkZWJhciAqL1xcbi5zaWRlYmFyIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tc2lkZWJhci1iZyk7XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbi5zaWRlYmFyIC5zaWRlYmFyLXNjcm9sbGJveCB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbn1cXG5cXG5zcGFuLmNoYXB0ZXItbGluay13cmFwcGVyIGEge1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG59XFxuc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlciB7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItZmcpO1xcbiAgICBwYWRkaW5nOiA0cHggMTZweDtcXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTtcXG4gICAgZm9udC1zaXplOiB2YXIoLS1zaWRlYmFyLXRleHQtc2l6ZSk7XFxufVxcblxcbi8qLnNpZGViYXIgb2wuY2hhcHRlciA+IGxpLmNoYXB0ZXItaXRlbSA+IHNwYW4uY2hhcHRlci1saW5rLXdyYXBwZXIge1xcbiAgICBmb250LXdlaWdodDogYm9sZDtcXG59Ki9cXG5cXG4vKi5zaWRlYmFyIG9sLmNoYXB0ZXIgbGkgLmNoYXB0ZXItaXRlbS5leHBhbmRlZCA+IGEsKi9cXG5zcGFuLmNoYXB0ZXItbGluay13cmFwcGVyOmhhcyhhLmFjdGl2ZSksXFxuc3Bhbi5jaGFwdGVyLWxpbmstd3JhcHBlcjpob3ZlciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYWN0aXZlLWJnKTtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG4vKiBUeXBvZ3JhcGh5ICovXFxuaDEsXFxuaDIsXFxuaDMsXFxuaDQsXFxuaDUsXFxuaDYge1xcbiAgICBjb2xvcjogdmFyKC0tZmcpO1xcbiAgICBmb250LXdlaWdodDogNjAwO1xcbiAgICBtYXJnaW4tdG9wOiAyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IDAuNWVtO1xcbiAgICBsaW5lLWhlaWdodDogMS4zO1xcbn1cXG5cXG5oMSB7XFxuICAgIGZvbnQtc2l6ZTogMi4yNXJlbTtcXG4gICAgbWFyZ2luLXRvcDogMDtcXG59XFxuaDIge1xcbiAgICBmb250LXNpemU6IDEuNzVyZW07XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgICBwYWRkaW5nLWJvdHRvbTogMC41cmVtO1xcbn1cXG5oMyB7XFxuICAgIGZvbnQtc2l6ZTogMS4zNzVyZW07XFxufVxcbmg0IHtcXG4gICAgZm9udC1zaXplOiAxLjEyNXJlbTtcXG59XFxuXFxucCB7XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjc1O1xcbiAgICBtYXJnaW46IDFlbSAwO1xcbn1cXG5cXG4vKiBMaW5rcyAqL1xcbmEge1xcbiAgICBjb2xvcjogdmFyKC0tbGlua3MpO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIHRyYW5zaXRpb246IGNvbG9yIDAuMTVzIGVhc2U7XFxufVxcblxcbmE6aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tbGlua3MtaG92ZXIpO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcXG59XFxuXFxuLyogQ29kZSAqL1xcbmNvZGUge1xcbiAgICBmb250LWZhbWlseTogXFxcIkdlaXN0IE1vbm9cXFwiLCBcXFwiRmlyYSBDb2RlXFxcIiwgXFxcIkpldEJyYWlucyBNb25vXFxcIiwgbW9ub3NwYWNlO1xcbiAgICBmb250LXNpemU6IDAuODc1ZW07XFxufVxcblxcbnN0cm9uZyB7XFxuICAgIGRpc3BsYXk6IHZhcigtLW9yZGVyLWRpc3BsYXkpO1xcbiAgICBmb250LXdlaWdodDogdmFyKC0tb3JkZXItd2VpZ2h0KTtcXG59XFxuXFxuOm5vdChwcmUpID4gY29kZSB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWlubGluZS1jb2RlLWJnKTtcXG4gICAgcGFkZGluZzogMC4yZW0gMC40ZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gICAgY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG59XFxuXFxucHJlIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tY29kZS1iZykgIWltcG9ydGFudDtcXG4gICAgY29sb3I6IHZhcigtLWNvZGUtZmcpO1xcbiAgICBwYWRkaW5nOiAxNnB4IDIwcHg7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEycHg7XFxuICAgIG92ZXJmbG93LXg6IGF1dG87XFxuICAgIG1hcmdpbjogMS41ZW0gMDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbn1cXG5cXG5wcmUgY29kZSB7XFxuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICBjb2xvcjogaW5oZXJpdDtcXG59XFxuXFxuLyogQmxvY2txdW90ZXMgKi9cXG5ibG9ja3F1b3RlIHtcXG4gICAgYmFja2dyb3VuZDogdmFyKC0tcXVvdGUtYmcpO1xcbiAgICBib3JkZXItbGVmdDogNHB4IHNvbGlkIHZhcigtLXF1b3RlLWJvcmRlcik7XFxuICAgIG1hcmdpbjogMS41ZW0gMDtcXG4gICAgcGFkZGluZzogMTZweCAyMHB4O1xcbiAgICBib3JkZXItcmFkaXVzOiAwIDEycHggMTJweCAwO1xcbn1cXG5cXG5ibG9ja3F1b3RlIHAge1xcbiAgICBtYXJnaW46IDA7XFxufVxcblxcbi8qIFRhYmxlcyAqL1xcbnRhYmxlIHtcXG4gICAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMS41ZW0gMDtcXG4gICAgYm9yZGVyLXJhZGl1czogMTJweDtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxudGgge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS10YWJsZS1oZWFkZXItYmcpO1xcbiAgICBmb250LXdlaWdodDogNjAwO1xcbiAgICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG5cXG50aCxcXG50ZCB7XFxuICAgIHBhZGRpbmc6IDEycHggMTZweDtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbnRyOmxhc3QtY2hpbGQgdGQge1xcbiAgICBib3JkZXItYm90dG9tOiBub25lO1xcbn1cXG5cXG4vKiBNZW51IGJhciAqL1xcbiNtZW51LWJhciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbiNtZW51LWJhciBpIHtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuLyogU2VhcmNoICovXFxuI3NlYXJjaGJhciB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNlYXJjaC1iZyk7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNlYXJjaC1ib3JkZXIpO1xcbiAgICBib3gtc2hhZG93OiB2YXIoLS1zZWFyY2hiYXItc2hhZG93KTtcXG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgICBwYWRkaW5nOiA4cHggMTJweDtcXG59XFxuXFxuLyogTmF2aWdhdGlvbiBidXR0b25zICovXFxuLm5hdi1jaGFwdGVycyB7XFxuICAgIGNvbG9yOiB2YXIoLS1saW5rcyk7XFxuICAgIG9wYWNpdHk6IDAuODtcXG4gICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjE1cyBlYXNlO1xcbn1cXG5cXG4ubmF2LWNoYXB0ZXJzOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWxpbmtzLWhvdmVyKTtcXG4gICAgb3BhY2l0eTogMTtcXG59XFxuXFxuLyogU2Nyb2xsYmFyICovXFxuOjotd2Via2l0LXNjcm9sbGJhciB7XFxuICAgIHdpZHRoOiA4cHg7XFxuICAgIGhlaWdodDogOHB4O1xcbn1cXG5cXG46Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JvbGxiYXIpO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JvbGxiYXItaG92ZXIpO1xcbn1cXG5cXG4vKiBUaGVtZSB0b2dnbGUgKi9cXG4jdGhlbWUtbGlzdCB7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYmcpO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XFxufVxcblxcbiN0aGVtZS1saXN0IGxpIHtcXG4gICAgY29sb3I6IHZhcigtLWZnKTtcXG59XFxuXFxuI3RoZW1lLWxpc3QgbGk6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxufVxcblxcbmRpdiNtZGJvb2stY29udGVudCB7XFxuICAgIG1heC1oZWlnaHQ6IGNhbGMoMTAwdmggLSA4MHB4KTtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgcGFkZGluZzogMnJlbSA0cmVtO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciAzNnJlbTtcXG4gICAgZ2FwOiAzcmVtO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBzY3JvbGwtYmVoYXZpb3I6IHNtb290aDtcXG59XFxuXFxuZGl2I21kYm9vay1jb250ZW50IG1haW4ge1xcbiAgICBtYXgtd2lkdGg6IDEwMCU7XFxufVxcblxcbi8qIFJpZ2h0IFNpZGViYXIgKFRPQykgKi9cXG4ucGFnZS13cmFwcGVyLmhhcy1yaWdodC1zaWRlYmFyIHtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBhdXRvIDFmciAyMjBweDtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXIge1xcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xcbiAgICB0b3A6IDYwcHg7XFxuICAgIHJpZ2h0OiAwcHg7XFxuICAgIGhlaWdodDogZml0LWNvbnRlbnQ7XFxuICAgIG1heC1oZWlnaHQ6IGNhbGMoMTAwdmggLSA4cHgpO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxuICAgIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gICAgbWFyZ2luLWxlZnQ6IDIuNXJlbTtcXG4gICAgcGFkZGluZy1sZWZ0OiAxcmVtO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci1oZWFkZXIge1xcbiAgICBjb2xvcjogdmFyKC0tc2lkZWJhci1mZyk7XFxuICAgIG1hcmdpbi1ib3R0b206IDEycHg7XFxuICAgIHBhZGRpbmctbGVmdDogOHB4O1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2Mge1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICBtYXJnaW46IDA7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyLXRvYyBvbCB7XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIHBhZGRpbmctbGVmdDogMTJweDtcXG4gICAgbWFyZ2luOiAwO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2MgbGkge1xcbiAgICBtYXJnaW46IDA7XFxufVxcblxcbi8qIEFkanVzdCBjb250ZW50IHdpZHRoIHdoZW4gcmlnaHQgc2lkZWJhciBleGlzdHMgKi9cXG4ucGFnZS13cmFwcGVyLmhhcy1yaWdodC1zaWRlYmFyIC5jb250ZW50IHtcXG4gICAgbWF4LXdpZHRoOiAxMDAlO1xcbn1cXG5cXG4vKiBIaWRlIHJpZ2h0IHNpZGViYXIgb24gc21hbGwgc2NyZWVucyAqL1xcbkBtZWRpYSAobWF4LXdpZHRoOiAxMTAwcHgpIHtcXG4gICAgLnBhZ2Utd3JhcHBlci5oYXMtcmlnaHQtc2lkZWJhciB7XFxuICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IGF1dG8gMWZyO1xcbiAgICB9XFxuXFxuICAgIC5yaWdodC1zaWRlYmFyIHtcXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XFxuICAgIH1cXG59XFxuXCIiLCJleHBvcnQgZGVmYXVsdCBcIi8qIE1pbnRsaWZ5LWluc3BpcmVkIERhcmsgVGhlbWUgZm9yIG1kQm9vayAqL1xcbjpyb290IHtcXG4gIC0tYmc6ICMwYTBkMGQ7XFxuICAtLWZnOiAjZTVlN2ViO1xcbiAgLS1zaWRlYmFyLWJnOiAjMTExNDE0O1xcbiAgLS1zaWRlYmFyLWZnOiAjOWNhM2FmO1xcbiAgLS1zaWRlYmFyLWFjdGl2ZTogIzI2YmQ2YztcXG4gIC0tc2lkZWJhci1hY3RpdmUtYmc6IHJnYmEoMzgsIDE4OSwgMTA4LCAwLjE1KTtcXG4gIC0tbGlua3M6ICMyNmJkNmM7XFxuICAtLWxpbmtzLWhvdmVyOiAjNGFkZTgwO1xcbiAgLS1pbmxpbmUtY29kZS1iZzogIzFmMjQyNDtcXG4gIC0tY29kZS1iZzogIzE2MWExYTtcXG4gIC0tY29kZS1mZzogI2U1ZTdlYjtcXG4gIC0tcXVvdGUtYmc6ICMxZjI0MjQ7XFxuICAtLXF1b3RlLWJvcmRlcjogIzI2YmQ2YztcXG4gIC0tdGFibGUtYm9yZGVyOiAjMmQzMzMzO1xcbiAgLS10YWJsZS1oZWFkZXItYmc6ICMxZjI0MjQ7XFxuICAtLXNlYXJjaC1iZzogIzE2MWExYTtcXG4gIC0tc2VhcmNoLWJvcmRlcjogIzJkMzMzMztcXG4gIC0tc2VhcmNoYmFyLXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMCwgMCwgMCwgMC4zKTtcXG4gIC0tc2Nyb2xsYmFyOiAjM2Q0MzQzO1xcbiAgLS1zY3JvbGxiYXItaG92ZXI6ICM0ZDU1NTU7XFxufVxcblxcbmh0bWwge1xcbiAgZm9udC1mYW1pbHk6ICdJbnRlcicsIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xcbiAgYmFja2dyb3VuZDogdmFyKC0tYmcpO1xcbiAgY29sb3I6IHZhcigtLWZnKTtcXG4gIHNjcm9sbC1iZWhhdmlvcjogc21vb3RoO1xcbn1cXG5cXG5ib2R5IHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG4gIGNvbG9yOiB2YXIoLS1mZyk7XFxufVxcblxcbi8qIFNpZGViYXIgKi9cXG4uc2lkZWJhciB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWJnKTtcXG4gIGJvcmRlci1yaWdodDogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbi5zaWRlYmFyIC5zaWRlYmFyLXNjcm9sbGJveCB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWJnKTtcXG59XFxuXFxuLnNpZGViYXIgb2wuY2hhcHRlciBsaSBhIHtcXG4gIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWZnKTtcXG4gIHBhZGRpbmc6IDhweCAxNnB4O1xcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgbWFyZ2luOiAycHggOHB4O1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuMTVzIGVhc2U7XFxufVxcblxcbi5zaWRlYmFyIG9sLmNoYXB0ZXIgbGkgYTpob3ZlciB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxuICBjb2xvcjogdmFyKC0tc2lkZWJhci1hY3RpdmUpO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG4uc2lkZWJhciBvbC5jaGFwdGVyIGxpLmNoYXB0ZXItaXRlbS5leHBhbmRlZCA+IGEsXFxuLnNpZGViYXIgb2wuY2hhcHRlciBsaSBhLmFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxuICBjb2xvcjogdmFyKC0tc2lkZWJhci1hY3RpdmUpO1xcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXG59XFxuXFxuLyogTWFpbiBjb250ZW50ICovXFxuLmNvbnRlbnQge1xcbiAgbWF4LXdpZHRoOiA4MDBweDtcXG4gIHBhZGRpbmc6IDI0cHggNDhweDtcXG59XFxuXFxuLmNvbnRlbnQgbWFpbiB7XFxuICBtYXgtd2lkdGg6IDEwMCU7XFxufVxcblxcbi8qIFR5cG9ncmFwaHkgKi9cXG5oMSwgaDIsIGgzLCBoNCwgaDUsIGg2IHtcXG4gIGNvbG9yOiAjZmZmZmZmO1xcbiAgZm9udC13ZWlnaHQ6IDYwMDtcXG4gIG1hcmdpbi10b3A6IDJlbTtcXG4gIG1hcmdpbi1ib3R0b206IDAuNWVtO1xcbiAgbGluZS1oZWlnaHQ6IDEuMztcXG59XFxuXFxuaDEgeyBmb250LXNpemU6IDIuMjVyZW07IG1hcmdpbi10b3A6IDA7IH1cXG5oMiB7IGZvbnQtc2l6ZTogMS43NXJlbTsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7IHBhZGRpbmctYm90dG9tOiAwLjVyZW07IH1cXG5oMyB7IGZvbnQtc2l6ZTogMS4zNzVyZW07IH1cXG5oNCB7IGZvbnQtc2l6ZTogMS4xMjVyZW07IH1cXG5cXG5wIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjc1O1xcbiAgbWFyZ2luOiAxZW0gMDtcXG59XFxuXFxuLyogTGlua3MgKi9cXG5hIHtcXG4gIGNvbG9yOiB2YXIoLS1saW5rcyk7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICB0cmFuc2l0aW9uOiBjb2xvciAwLjE1cyBlYXNlO1xcbn1cXG5cXG5hOmhvdmVyIHtcXG4gIGNvbG9yOiB2YXIoLS1saW5rcy1ob3Zlcik7XFxuICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcXG59XFxuXFxuLyogQ29kZSAqL1xcbmNvZGUge1xcbiAgZm9udC1mYW1pbHk6ICdHZWlzdCBNb25vJywgJ0ZpcmEgQ29kZScsICdKZXRCcmFpbnMgTW9ubycsIG1vbm9zcGFjZTtcXG4gIGZvbnQtc2l6ZTogMC44NzVlbTtcXG59XFxuXFxuOm5vdChwcmUpID4gY29kZSB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1pbmxpbmUtY29kZS1iZyk7XFxuICBwYWRkaW5nOiAwLjJlbSAwLjRlbTtcXG4gIGJvcmRlci1yYWRpdXM6IDZweDtcXG4gIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxufVxcblxcbnByZSB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1jb2RlLWJnKSAhaW1wb3J0YW50O1xcbiAgY29sb3I6IHZhcigtLWNvZGUtZmcpO1xcbiAgcGFkZGluZzogMTZweCAyMHB4O1xcbiAgYm9yZGVyLXJhZGl1czogMTJweDtcXG4gIG92ZXJmbG93LXg6IGF1dG87XFxuICBtYXJnaW46IDEuNWVtIDA7XFxuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS10YWJsZS1ib3JkZXIpO1xcbn1cXG5cXG5wcmUgY29kZSB7XFxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcXG4gIHBhZGRpbmc6IDA7XFxuICBjb2xvcjogaW5oZXJpdDtcXG59XFxuXFxuLyogQmxvY2txdW90ZXMgKi9cXG5ibG9ja3F1b3RlIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXF1b3RlLWJnKTtcXG4gIGJvcmRlci1sZWZ0OiA0cHggc29saWQgdmFyKC0tcXVvdGUtYm9yZGVyKTtcXG4gIG1hcmdpbjogMS41ZW0gMDtcXG4gIHBhZGRpbmc6IDE2cHggMjBweDtcXG4gIGJvcmRlci1yYWRpdXM6IDAgMTJweCAxMnB4IDA7XFxufVxcblxcbmJsb2NrcXVvdGUgcCB7XFxuICBtYXJnaW46IDA7XFxufVxcblxcbi8qIFRhYmxlcyAqL1xcbnRhYmxlIHtcXG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XFxuICB3aWR0aDogMTAwJTtcXG4gIG1hcmdpbjogMS41ZW0gMDtcXG4gIGJvcmRlci1yYWRpdXM6IDEycHg7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG59XFxuXFxudGgge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tdGFibGUtaGVhZGVyLWJnKTtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICB0ZXh0LWFsaWduOiBsZWZ0O1xcbn1cXG5cXG50aCwgdGQge1xcbiAgcGFkZGluZzogMTJweCAxNnB4O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbnRyOmxhc3QtY2hpbGQgdGQge1xcbiAgYm9yZGVyLWJvdHRvbTogbm9uZTtcXG59XFxuXFxuLyogTWVudSBiYXIgKi9cXG4jbWVudS1iYXIge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tYmcpO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxufVxcblxcbiNtZW51LWJhciBpIHtcXG4gIGNvbG9yOiB2YXIoLS1mZyk7XFxufVxcblxcbi8qIFNlYXJjaCAqL1xcbiNzZWFyY2hiYXIge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2VhcmNoLWJnKTtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNlYXJjaC1ib3JkZXIpO1xcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xcbiAgcGFkZGluZzogOHB4IDEycHg7XFxuICBib3gtc2hhZG93OiB2YXIoLS1zZWFyY2hiYXItc2hhZG93KTtcXG4gIGNvbG9yOiB2YXIoLS1mZyk7XFxufVxcblxcbi8qIE5hdmlnYXRpb24gYnV0dG9ucyAqL1xcbi5uYXYtY2hhcHRlcnMge1xcbiAgY29sb3I6IHZhcigtLWxpbmtzKTtcXG4gIG9wYWNpdHk6IDAuODtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC4xNXMgZWFzZTtcXG59XFxuXFxuLm5hdi1jaGFwdGVyczpob3ZlciB7XFxuICBjb2xvcjogdmFyKC0tbGlua3MtaG92ZXIpO1xcbiAgb3BhY2l0eTogMTtcXG59XFxuXFxuLyogU2Nyb2xsYmFyICovXFxuOjotd2Via2l0LXNjcm9sbGJhciB7XFxuICB3aWR0aDogOHB4O1xcbiAgaGVpZ2h0OiA4cHg7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2sge1xcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XFxufVxcblxcbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xcbiAgYmFja2dyb3VuZDogdmFyKC0tc2Nyb2xsYmFyKTtcXG4gIGJvcmRlci1yYWRpdXM6IDRweDtcXG59XFxuXFxuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYjpob3ZlciB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zY3JvbGxiYXItaG92ZXIpO1xcbn1cXG5cXG4vKiBUaGVtZSB0b2dnbGUgKi9cXG4jdGhlbWUtbGlzdCB7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWJnKTtcXG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXRhYmxlLWJvcmRlcik7XFxuICBib3JkZXItcmFkaXVzOiA4cHg7XFxufVxcblxcbiN0aGVtZS1saXN0IGxpIHtcXG4gIGNvbG9yOiB2YXIoLS1mZyk7XFxufVxcblxcbiN0aGVtZS1saXN0IGxpOmhvdmVyIHtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYWN0aXZlLWJnKTtcXG59XFxuXFxuLyogUmlnaHQgU2lkZWJhciAoVE9DKSAqL1xcbi5wYWdlLXdyYXBwZXIuaGFzLXJpZ2h0LXNpZGViYXIge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byAxZnIgMjIwcHg7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyIHtcXG4gIHBvc2l0aW9uOiBzdGlja3k7XFxuICB0b3A6IDYwcHg7XFxuICBoZWlnaHQ6IGZpdC1jb250ZW50O1xcbiAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDgwcHgpO1xcbiAgb3ZlcmZsb3cteTogYXV0bztcXG4gIHBhZGRpbmc6IDI0cHggMTZweDtcXG4gIGJvcmRlci1sZWZ0OiAxcHggc29saWQgdmFyKC0tdGFibGUtYm9yZGVyKTtcXG4gIGJhY2tncm91bmQ6IHZhcigtLWJnKTtcXG59XFxuXFxuLnJpZ2h0LXNpZGViYXItaGVhZGVyIHtcXG4gIGZvbnQtc2l6ZTogMTJweDtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuNXB4O1xcbiAgY29sb3I6IHZhcigtLXNpZGViYXItZmcpO1xcbiAgbWFyZ2luLWJvdHRvbTogMTJweDtcXG4gIHBhZGRpbmctbGVmdDogOHB4O1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2Mge1xcbiAgbGlzdC1zdHlsZTogbm9uZTtcXG4gIHBhZGRpbmc6IDA7XFxuICBtYXJnaW46IDA7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyLXRvYyBvbCB7XFxuICBsaXN0LXN0eWxlOiBub25lO1xcbiAgcGFkZGluZy1sZWZ0OiAxMnB4O1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2MgbGkge1xcbiAgbWFyZ2luOiAwO1xcbn1cXG5cXG4ucmlnaHQtc2lkZWJhci10b2MgbGkgYSB7XFxuICBkaXNwbGF5OiBibG9jaztcXG4gIHBhZGRpbmc6IDZweCA4cHg7XFxuICBmb250LXNpemU6IDEzcHg7XFxuICBjb2xvcjogdmFyKC0tc2lkZWJhci1mZyk7XFxuICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZTtcXG4gIGJvcmRlci1sZWZ0OiAycHggc29saWQgdHJhbnNwYXJlbnQ7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyLXRvYyBsaSBhOmhvdmVyIHtcXG4gIGNvbG9yOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZSk7XFxuICBiYWNrZ3JvdW5kOiB2YXIoLS1zaWRlYmFyLWFjdGl2ZS1iZyk7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxufVxcblxcbi5yaWdodC1zaWRlYmFyLXRvYyBsaSBhLmFjdGl2ZSB7XFxuICBjb2xvcjogdmFyKC0tc2lkZWJhci1hY3RpdmUpO1xcbiAgYm9yZGVyLWxlZnQtY29sb3I6IHZhcigtLXNpZGViYXItYWN0aXZlKTtcXG4gIGJhY2tncm91bmQ6IHZhcigtLXNpZGViYXItYWN0aXZlLWJnKTtcXG59XFxuXFxuLyogQWRqdXN0IGNvbnRlbnQgd2lkdGggd2hlbiByaWdodCBzaWRlYmFyIGV4aXN0cyAqL1xcbi5wYWdlLXdyYXBwZXIuaGFzLXJpZ2h0LXNpZGViYXIgLmNvbnRlbnQge1xcbiAgbWF4LXdpZHRoOiAxMDAlO1xcbn1cXG5cXG4vKiBIaWRlIHJpZ2h0IHNpZGViYXIgb24gc21hbGwgc2NyZWVucyAqL1xcbkBtZWRpYSAobWF4LXdpZHRoOiAxMTAwcHgpIHtcXG4gIC5wYWdlLXdyYXBwZXIuaGFzLXJpZ2h0LXNpZGViYXIge1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IGF1dG8gMWZyO1xcbiAgfVxcblxcbiAgLnJpZ2h0LXNpZGViYXIge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbn1cXG5cIiIsIi8vIENvbnRlbnQgc2NyaXB0IGZvciBtZEJvb2sgdGhlbWUgbW9kaWZpY2F0aW9uXG4vLyBpbXBvcnQgXCIuLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LWxpZ2h0LmNzc1wiO1xuLy8gaW1wb3J0IFwiLi4vYXNzZXRzL3RoZW1lcy9taW50bGlmeS1kYXJrLmNzc1wiO1xuLy8gSW1wb3J0IENTUyBhcyByYXcgc3RyaW5ncyBhdCBidWlsZCB0aW1lXG5pbXBvcnQgbWludGxpZnlMaWdodENTUyBmcm9tIFwiLi4vYXNzZXRzL3RoZW1lcy9taW50bGlmeS1saWdodC5jc3M/cmF3XCI7XG5pbXBvcnQgbWludGxpZnlEYXJrQ1NTIGZyb20gXCIuLi9hc3NldHMvdGhlbWVzL21pbnRsaWZ5LWRhcmsuY3NzP3Jhd1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb250ZW50U2NyaXB0KHtcbiAgbWF0Y2hlczogW1wiPGFsbF91cmxzPlwiXSxcbiAgcnVuQXQ6IFwiZG9jdW1lbnRfc3RhcnRcIixcblxuICBtYWluKGN0eCkge1xuICAgIC8vIEN1c3RvbSB0aGVtZXMgKE1pbnRsaWZ5LWluc3BpcmVkICsgbWRCb29rIGJ1aWx0LWluKVxuICAgIGNvbnN0IENVU1RPTV9USEVNRVMgPSBbXCJtaW50bGlmeVwiLCBcIm1pbnRsaWZ5LWRhcmtcIl0gYXMgY29uc3Q7XG4gICAgY29uc3QgTURCT09LX1RIRU1FUyA9IFtcImxpZ2h0XCIsIFwicnVzdFwiLCBcImNvYWxcIiwgXCJuYXZ5XCIsIFwiYXl1XCJdIGFzIGNvbnN0O1xuICAgIGNvbnN0IEFMTF9USEVNRVMgPSBbLi4uQ1VTVE9NX1RIRU1FUywgLi4uTURCT09LX1RIRU1FU10gYXMgY29uc3Q7XG4gICAgdHlwZSBUaGVtZSA9ICh0eXBlb2YgQUxMX1RIRU1FUylbbnVtYmVyXTtcblxuICAgIGxldCBpc01kQm9vayA9IGZhbHNlO1xuICAgIGxldCBzdHlsZUVsZW1lbnQ6IEhUTUxTdHlsZUVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICAgIC8vIENoZWNrIGlmIGN1cnJlbnQgcGFnZSBpcyBhbiBtZEJvb2sgc2l0ZSBieSBsb29raW5nIGZvciB0aGUgY29tbWVudFxuICAgIGZ1bmN0aW9uIGNoZWNrTWRCb29rQ29tbWVudCgpIHtcbiAgICAgIC8vIENoZWNrIGZvciA8IS0tIEJvb2sgZ2VuZXJhdGVkIHVzaW5nIG1kQm9vayAtLT4gY29tbWVudCBhdCBkb2N1bWVudCBzdGFydFxuICAgICAgY29uc3Qgbm9kZXMgPSBkb2N1bWVudC5oZWFkLmNoaWxkTm9kZXM7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShub2RlcyB8fCBbXSlcbiAgICAgICAgLmZpbHRlcigobm9kZSkgPT4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5DT01NRU5UX05PREUpXG4gICAgICAgIC5zb21lKChub2RlKSA9PlxuICAgICAgICAgIG5vZGUubm9kZVZhbHVlPy50cmltKCkuaW5jbHVkZXMoXCJCb29rIGdlbmVyYXRlZCB1c2luZyBtZEJvb2tcIiksXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gR2V0IGN1cnJlbnQgbWRCb29rIHRoZW1lIGZyb20gcGFnZVxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRNZEJvb2tUaGVtZSgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBmb3IgKGNvbnN0IHRoZW1lIG9mIE1EQk9PS19USEVNRVMpIHtcbiAgICAgICAgaWYgKGh0bWwuY2xhc3NMaXN0LmNvbnRhaW5zKHRoZW1lKSkge1xuICAgICAgICAgIHJldHVybiB0aGVtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gR2V0IENTUyBmb3IgdGhlbWVcbiAgICBmdW5jdGlvbiBnZXRUaGVtZUNTUyh0aGVtZTogVGhlbWUpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgIHN3aXRjaCAodGhlbWUpIHtcbiAgICAgICAgY2FzZSBcIm1pbnRsaWZ5XCI6XG4gICAgICAgICAgcmV0dXJuIG1pbnRsaWZ5TGlnaHRDU1M7XG4gICAgICAgIGNhc2UgXCJtaW50bGlmeS1kYXJrXCI6XG4gICAgICAgICAgcmV0dXJuIG1pbnRsaWZ5RGFya0NTUztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gVXNlIG1kQm9vayBidWlsdC1pbiB0aGVtZXNcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbmplY3Qgb3IgdXBkYXRlIGN1c3RvbSB0aGVtZSBDU1NcbiAgICBmdW5jdGlvbiBpbmplY3RUaGVtZUNTUyhjc3M6IHN0cmluZyB8IG51bGwpIHtcbiAgICAgIGlmICghY3NzKSB7XG4gICAgICAgIC8vIFJlbW92ZSBjdXN0b20gc3R5bGVzLCB1c2UgbWRCb29rIGJ1aWx0LWluXG4gICAgICAgIGlmIChzdHlsZUVsZW1lbnQpIHtcbiAgICAgICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgc3R5bGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghc3R5bGVFbGVtZW50KSB7XG4gICAgICAgIHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgICAgICAgc3R5bGVFbGVtZW50LmlkID0gXCJtZGJvb2stdGhlbWUtZXh0ZW5zaW9uXCI7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVFbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHN0eWxlRWxlbWVudC50ZXh0Q29udGVudCA9IGNzcztcbiAgICB9XG5cbiAgICAvLyBBcHBseSB0aGVtZSB0byBwYWdlXG4gICAgZnVuY3Rpb24gYXBwbHlUaGVtZSh0aGVtZTogVGhlbWUpIHtcbiAgICAgIGNvbnN0IGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBjb25zdCBpc0N1c3RvbVRoZW1lID0gQ1VTVE9NX1RIRU1FUy5pbmNsdWRlcyh0aGVtZSBhcyBhbnkpO1xuXG4gICAgICBpZiAoaXNDdXN0b21UaGVtZSkge1xuICAgICAgICAvLyBGb3IgY3VzdG9tIHRoZW1lcywgc2V0IGJhc2UgbWRCb29rIHRoZW1lIGFuZCBpbmplY3QgQ1NTXG4gICAgICAgIE1EQk9PS19USEVNRVMuZm9yRWFjaCgodCkgPT4gaHRtbC5jbGFzc0xpc3QucmVtb3ZlKHQpKTtcbiAgICAgICAgaHRtbC5jbGFzc0xpc3QuYWRkKHRoZW1lID09PSBcIm1pbnRsaWZ5XCIgPyBcImxpZ2h0XCIgOiBcImNvYWxcIik7XG4gICAgICAgIGluamVjdFRoZW1lQ1NTKGdldFRoZW1lQ1NTKHRoZW1lKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGb3IgbWRCb29rIGJ1aWx0LWluIHRoZW1lc1xuICAgICAgICBNREJPT0tfVEhFTUVTLmZvckVhY2goKHQpID0+IGh0bWwuY2xhc3NMaXN0LnJlbW92ZSh0KSk7XG4gICAgICAgIGh0bWwuY2xhc3NMaXN0LmFkZCh0aGVtZSk7XG4gICAgICAgIGluamVjdFRoZW1lQ1NTKG51bGwpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJtZGJvb2stdGhlbWVcIiwgdGhlbWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gSWdub3JlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTm90aWZ5IHBvcHVwIGFib3V0IHRoZW1lIGNoYW5nZVxuICAgICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogXCJ0aGVtZUNoYW5nZWRcIiwgdGhlbWUgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIHdoZW4gcG9wdXAgaXMgbm90IG9wZW5cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemUgdGhlbWUgZnJvbSBzdG9yYWdlXG4gICAgYXN5bmMgZnVuY3Rpb24gaW5pdFRoZW1lKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbG9jYWxDb25maWcgPSBbXCJtZGJvb2tUaGVtZVwiLCBcImVuYWJsZWRcIl0gYXMgY29uc3Q7XG4gICAgICAgIHR5cGUgTG9jYWxDb25maWcgPSB7XG4gICAgICAgICAgW0sgaW4gKHR5cGVvZiBsb2NhbENvbmZpZylbbnVtYmVyXV0/OiBzdHJpbmc7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHsgbWRib29rVGhlbWUgfSA9IChhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KFxuICAgICAgICAgIGxvY2FsQ29uZmlnIGFzIGFueSxcbiAgICAgICAgKSkgYXMgTG9jYWxDb25maWc7XG5cbiAgICAgICAgY29uc3QgdGhlbWUgPSBtZGJvb2tUaGVtZSB8fCAoXCJtaW50bGlmeVwiIGFzIGFueSk7IC8vIERlZmF1bHQgdG8gbWludGxpZnlcbiAgICAgICAgaWYgKEFMTF9USEVNRVMuaW5jbHVkZXModGhlbWUpKSB7XG4gICAgICAgICAgYXBwbHlUaGVtZSh0aGVtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRGVmYXVsdCB0byBtaW50bGlmeSBvbiBlcnJvclxuICAgICAgICBhcHBseVRoZW1lKFwibWludGxpZnlcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciB0aGVtZSBjaGFuZ2UgbWVzc2FnZXMgZnJvbSBwb3B1cFxuICAgIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UpID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwic2V0VGhlbWVcIiAmJiBBTExfVEhFTUVTLmluY2x1ZGVzKG1lc3NhZ2UudGhlbWUpKSB7XG4gICAgICAgIGFwcGx5VGhlbWUobWVzc2FnZS50aGVtZSk7XG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJnZXRTdGF0dXNcIikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgICBpc01kQm9vayxcbiAgICAgICAgICBjdXJyZW50VGhlbWU6IGdldEN1cnJlbnRNZEJvb2tUaGVtZSgpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhbmQgc2V0dXAgcmlnaHQgc2lkZWJhciBmb3IgcGFnZSBUT0NcbiAgICBmdW5jdGlvbiBzZXR1cFJpZ2h0U2lkZWJhcih0b2NTZWN0aW9uOiBFbGVtZW50KSB7XG4gICAgICBpZiAoIXRvY1NlY3Rpb24pIHJldHVybjtcblxuICAgICAgLy8gQ3JlYXRlIHJpZ2h0IHNpZGViYXIgY29udGFpbmVyXG4gICAgICBjb25zdCByaWdodFNpZGViYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibmF2XCIpO1xuICAgICAgcmlnaHRTaWRlYmFyLmlkID0gXCJyaWdodC1zaWRlYmFyXCI7XG4gICAgICByaWdodFNpZGViYXIuY2xhc3NOYW1lID0gXCJyaWdodC1zaWRlYmFyXCI7XG5cbiAgICAgIC8vIENyZWF0ZSBoZWFkZXJcbiAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBoZWFkZXIuY2xhc3NOYW1lID0gXCJyaWdodC1zaWRlYmFyLWhlYWRlclwiO1xuICAgICAgaGVhZGVyLnRleHRDb250ZW50ID0gXCJPbiB0aGlzIHBhZ2VcIjtcbiAgICAgIHJpZ2h0U2lkZWJhci5hcHBlbmRDaGlsZChoZWFkZXIpO1xuXG4gICAgICAvLyBDbG9uZSBhbmQgbW92ZSB0aGUgc2VjdGlvblxuICAgICAgY29uc3QgY2xvbmVkU2VjdGlvbiA9IHRvY1NlY3Rpb24uY2xvbmVOb2RlKHRydWUpIGFzIEVsZW1lbnQ7XG4gICAgICBjbG9uZWRTZWN0aW9uLmNsYXNzTGlzdC5hZGQoXCJyaWdodC1zaWRlYmFyLXRvY1wiKTtcbiAgICAgIHJpZ2h0U2lkZWJhci5hcHBlbmRDaGlsZChjbG9uZWRTZWN0aW9uKTtcblxuICAgICAgLy8gSGlkZSBvcmlnaW5hbCBzZWN0aW9uIGluIGxlZnQgc2lkZWJhclxuICAgICAgKHRvY1NlY3Rpb24gYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgICAgcmV0dXJuIHJpZ2h0U2lkZWJhcjtcbiAgICB9XG5cbiAgICAvLyBNYWluIGluaXRpYWxpemF0aW9uXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIGlzTWRCb29rID0gY2hlY2tNZEJvb2tDb21tZW50KCk7XG4gICAgICBpZiAoaXNNZEJvb2spIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJlbmFibGVkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgaW5pdFRoZW1lKCk7XG5cbiAgICAgICAgY29uc3QgdWkgPSBjcmVhdGVJbnRlZ3JhdGVkVWkoY3R4LCB7XG4gICAgICAgICAgcG9zaXRpb246IFwiaW5saW5lXCIsXG4gICAgICAgICAgYW5jaG9yOiBcImRpdiNtZGJvb2stY29udGVudFwiLFxuICAgICAgICAgIG9uTW91bnQ6IChwYWdlV3JhcHBlcikgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoXywgb2JzKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgIFwiLnNpZGViYXIgb2wuY2hhcHRlciBkaXYub24tdGhpcy1wYWdlID4gb2wuc2VjdGlvblwiLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0U2lkZWJhciA9IHNldHVwUmlnaHRTaWRlYmFyKGVsZW1lbnQpITtcbiAgICAgICAgICAgICAgICBwYWdlV3JhcHBlci5hcHBlbmQocmlnaHRTaWRlYmFyKTtcbiAgICAgICAgICAgICAgICBwYWdlV3JhcHBlci5jbGFzc0xpc3QuYWRkKFwiaGFzLXJpZ2h0LXNpZGViYXJcIik7XG4gICAgICAgICAgICAgICAgb2JzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsIC8vIOebkeWQrOWtkOiKgueCueeahOaWsOWinuaIluWIoOmZpFxuICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLCAvLyDnm5HlkKzmlbTkuKrlrZDmoJFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICB1aS5hdXRvTW91bnQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciBET00gdG8gYmUgcmVhZHlcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbml0KCk7XG4gICAgfVxuICB9LFxufSk7XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5leHBvcnQgY2xhc3MgV3h0TG9jYXRpb25DaGFuZ2VFdmVudCBleHRlbmRzIEV2ZW50IHtcbiAgY29uc3RydWN0b3IobmV3VXJsLCBvbGRVcmwpIHtcbiAgICBzdXBlcihXeHRMb2NhdGlvbkNoYW5nZUV2ZW50LkVWRU5UX05BTUUsIHt9KTtcbiAgICB0aGlzLm5ld1VybCA9IG5ld1VybDtcbiAgICB0aGlzLm9sZFVybCA9IG9sZFVybDtcbiAgfVxuICBzdGF0aWMgRVZFTlRfTkFNRSA9IGdldFVuaXF1ZUV2ZW50TmFtZShcInd4dDpsb2NhdGlvbmNoYW5nZVwiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRVbmlxdWVFdmVudE5hbWUoZXZlbnROYW1lKSB7XG4gIHJldHVybiBgJHticm93c2VyPy5ydW50aW1lPy5pZH06JHtpbXBvcnQubWV0YS5lbnYuRU5UUllQT0lOVH06JHtldmVudE5hbWV9YDtcbn1cbiIsImltcG9ydCB7IFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQgfSBmcm9tIFwiLi9jdXN0b20tZXZlbnRzLm1qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2F0aW9uV2F0Y2hlcihjdHgpIHtcbiAgbGV0IGludGVydmFsO1xuICBsZXQgb2xkVXJsO1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIEVuc3VyZSB0aGUgbG9jYXRpb24gd2F0Y2hlciBpcyBhY3RpdmVseSBsb29raW5nIGZvciBVUkwgY2hhbmdlcy4gSWYgaXQncyBhbHJlYWR5IHdhdGNoaW5nLFxuICAgICAqIHRoaXMgaXMgYSBub29wLlxuICAgICAqL1xuICAgIHJ1bigpIHtcbiAgICAgIGlmIChpbnRlcnZhbCAhPSBudWxsKSByZXR1cm47XG4gICAgICBvbGRVcmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgaW50ZXJ2YWwgPSBjdHguc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgbmV3VXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgaWYgKG5ld1VybC5ocmVmICE9PSBvbGRVcmwuaHJlZikge1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50KG5ld1VybCwgb2xkVXJsKSk7XG4gICAgICAgICAgb2xkVXJsID0gbmV3VXJsO1xuICAgICAgICB9XG4gICAgICB9LCAxZTMpO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IGJyb3dzZXIgfSBmcm9tIFwid3h0L2Jyb3dzZXJcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCIuLi91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzXCI7XG5pbXBvcnQge1xuICBnZXRVbmlxdWVFdmVudE5hbWVcbn0gZnJvbSBcIi4vaW50ZXJuYWwvY3VzdG9tLWV2ZW50cy5tanNcIjtcbmltcG9ydCB7IGNyZWF0ZUxvY2F0aW9uV2F0Y2hlciB9IGZyb20gXCIuL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzXCI7XG5leHBvcnQgY2xhc3MgQ29udGVudFNjcmlwdENvbnRleHQge1xuICBjb25zdHJ1Y3Rvcihjb250ZW50U2NyaXB0TmFtZSwgb3B0aW9ucykge1xuICAgIHRoaXMuY29udGVudFNjcmlwdE5hbWUgPSBjb250ZW50U2NyaXB0TmFtZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGlmICh0aGlzLmlzVG9wRnJhbWUpIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yTmV3ZXJTY3JpcHRzKHsgaWdub3JlRmlyc3RFdmVudDogdHJ1ZSB9KTtcbiAgICAgIHRoaXMuc3RvcE9sZFNjcmlwdHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JOZXdlclNjcmlwdHMoKTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIFNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRSA9IGdldFVuaXF1ZUV2ZW50TmFtZShcbiAgICBcInd4dDpjb250ZW50LXNjcmlwdC1zdGFydGVkXCJcbiAgKTtcbiAgaXNUb3BGcmFtZSA9IHdpbmRvdy5zZWxmID09PSB3aW5kb3cudG9wO1xuICBhYm9ydENvbnRyb2xsZXI7XG4gIGxvY2F0aW9uV2F0Y2hlciA9IGNyZWF0ZUxvY2F0aW9uV2F0Y2hlcih0aGlzKTtcbiAgcmVjZWl2ZWRNZXNzYWdlSWRzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgZ2V0IHNpZ25hbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICB9XG4gIGFib3J0KHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5hYm9ydChyZWFzb24pO1xuICB9XG4gIGdldCBpc0ludmFsaWQoKSB7XG4gICAgaWYgKGJyb3dzZXIucnVudGltZS5pZCA9PSBudWxsKSB7XG4gICAgICB0aGlzLm5vdGlmeUludmFsaWRhdGVkKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNpZ25hbC5hYm9ydGVkO1xuICB9XG4gIGdldCBpc1ZhbGlkKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0ludmFsaWQ7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgc2NyaXB0J3MgY29udGV4dCBpcyBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogQHJldHVybnMgQSBmdW5jdGlvbiB0byByZW1vdmUgdGhlIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGNiKTtcbiAgICogY29uc3QgcmVtb3ZlSW52YWxpZGF0ZWRMaXN0ZW5lciA9IGN0eC5vbkludmFsaWRhdGVkKCgpID0+IHtcbiAgICogICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKGNiKTtcbiAgICogfSlcbiAgICogLy8gLi4uXG4gICAqIHJlbW92ZUludmFsaWRhdGVkTGlzdGVuZXIoKTtcbiAgICovXG4gIG9uSW52YWxpZGF0ZWQoY2IpIHtcbiAgICB0aGlzLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2IpO1xuICAgIHJldHVybiAoKSA9PiB0aGlzLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2IpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgbmV2ZXIgcmVzb2x2ZXMuIFVzZWZ1bCBpZiB5b3UgaGF2ZSBhbiBhc3luYyBmdW5jdGlvbiB0aGF0IHNob3VsZG4ndCBydW5cbiAgICogYWZ0ZXIgdGhlIGNvbnRleHQgaXMgZXhwaXJlZC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgZ2V0VmFsdWVGcm9tU3RvcmFnZSA9IGFzeW5jICgpID0+IHtcbiAgICogICBpZiAoY3R4LmlzSW52YWxpZCkgcmV0dXJuIGN0eC5ibG9jaygpO1xuICAgKlxuICAgKiAgIC8vIC4uLlxuICAgKiB9XG4gICAqL1xuICBibG9jaygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnNldEludGVydmFsYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2xlYXJzIHRoZSBpbnRlcnZhbCB3aGVuIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBJbnRlcnZhbHMgY2FuIGJlIGNsZWFyZWQgYnkgY2FsbGluZyB0aGUgbm9ybWFsIGBjbGVhckludGVydmFsYCBmdW5jdGlvbi5cbiAgICovXG4gIHNldEludGVydmFsKGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICBjb25zdCBpZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGhhbmRsZXIoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2xlYXJJbnRlcnZhbChpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5zZXRUaW1lb3V0YCB0aGF0IGF1dG9tYXRpY2FsbHkgY2xlYXJzIHRoZSBpbnRlcnZhbCB3aGVuIGludmFsaWRhdGVkLlxuICAgKlxuICAgKiBUaW1lb3V0cyBjYW4gYmUgY2xlYXJlZCBieSBjYWxsaW5nIHRoZSBub3JtYWwgYHNldFRpbWVvdXRgIGZ1bmN0aW9uLlxuICAgKi9cbiAgc2V0VGltZW91dChoYW5kbGVyLCB0aW1lb3V0KSB7XG4gICAgY29uc3QgaWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGhhbmRsZXIoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2xlYXJUaW1lb3V0KGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZWAgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgdGhlIHJlcXVlc3Qgd2hlblxuICAgKiBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogQ2FsbGJhY2tzIGNhbiBiZSBjYW5jZWxlZCBieSBjYWxsaW5nIHRoZSBub3JtYWwgYGNhbmNlbEFuaW1hdGlvbkZyYW1lYCBmdW5jdGlvbi5cbiAgICovXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaykge1xuICAgIGNvbnN0IGlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9KTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFja2AgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgdGhlIHJlcXVlc3Qgd2hlblxuICAgKiBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogQ2FsbGJhY2tzIGNhbiBiZSBjYW5jZWxlZCBieSBjYWxsaW5nIHRoZSBub3JtYWwgYGNhbmNlbElkbGVDYWxsYmFja2AgZnVuY3Rpb24uXG4gICAqL1xuICByZXF1ZXN0SWRsZUNhbGxiYWNrKGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgY29uc3QgaWQgPSByZXF1ZXN0SWRsZUNhbGxiYWNrKCguLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc2lnbmFsLmFib3J0ZWQpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgIH0sIG9wdGlvbnMpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjYW5jZWxJZGxlQ2FsbGJhY2soaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgYWRkRXZlbnRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZSA9PT0gXCJ3eHQ6bG9jYXRpb25jaGFuZ2VcIikge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgdGhpcy5sb2NhdGlvbldhdGNoZXIucnVuKCk7XG4gICAgfVxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyPy4oXG4gICAgICB0eXBlLnN0YXJ0c1dpdGgoXCJ3eHQ6XCIpID8gZ2V0VW5pcXVlRXZlbnROYW1lKHR5cGUpIDogdHlwZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIHNpZ25hbDogdGhpcy5zaWduYWxcbiAgICAgIH1cbiAgICApO1xuICB9XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICogQWJvcnQgdGhlIGFib3J0IGNvbnRyb2xsZXIgYW5kIGV4ZWN1dGUgYWxsIGBvbkludmFsaWRhdGVkYCBsaXN0ZW5lcnMuXG4gICAqL1xuICBub3RpZnlJbnZhbGlkYXRlZCgpIHtcbiAgICB0aGlzLmFib3J0KFwiQ29udGVudCBzY3JpcHQgY29udGV4dCBpbnZhbGlkYXRlZFwiKTtcbiAgICBsb2dnZXIuZGVidWcoXG4gICAgICBgQ29udGVudCBzY3JpcHQgXCIke3RoaXMuY29udGVudFNjcmlwdE5hbWV9XCIgY29udGV4dCBpbnZhbGlkYXRlZGBcbiAgICApO1xuICB9XG4gIHN0b3BPbGRTY3JpcHRzKCkge1xuICAgIHdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogQ29udGVudFNjcmlwdENvbnRleHQuU0NSSVBUX1NUQVJURURfTUVTU0FHRV9UWVBFLFxuICAgICAgICBjb250ZW50U2NyaXB0TmFtZTogdGhpcy5jb250ZW50U2NyaXB0TmFtZSxcbiAgICAgICAgbWVzc2FnZUlkOiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKVxuICAgICAgfSxcbiAgICAgIFwiKlwiXG4gICAgKTtcbiAgfVxuICB2ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBpc1NjcmlwdFN0YXJ0ZWRFdmVudCA9IGV2ZW50LmRhdGE/LnR5cGUgPT09IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRTtcbiAgICBjb25zdCBpc1NhbWVDb250ZW50U2NyaXB0ID0gZXZlbnQuZGF0YT8uY29udGVudFNjcmlwdE5hbWUgPT09IHRoaXMuY29udGVudFNjcmlwdE5hbWU7XG4gICAgY29uc3QgaXNOb3REdXBsaWNhdGUgPSAhdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuaGFzKGV2ZW50LmRhdGE/Lm1lc3NhZ2VJZCk7XG4gICAgcmV0dXJuIGlzU2NyaXB0U3RhcnRlZEV2ZW50ICYmIGlzU2FtZUNvbnRlbnRTY3JpcHQgJiYgaXNOb3REdXBsaWNhdGU7XG4gIH1cbiAgbGlzdGVuRm9yTmV3ZXJTY3JpcHRzKG9wdGlvbnMpIHtcbiAgICBsZXQgaXNGaXJzdCA9IHRydWU7XG4gICAgY29uc3QgY2IgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLnZlcmlmeVNjcmlwdFN0YXJ0ZWRFdmVudChldmVudCkpIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VJZHMuYWRkKGV2ZW50LmRhdGEubWVzc2FnZUlkKTtcbiAgICAgICAgY29uc3Qgd2FzRmlyc3QgPSBpc0ZpcnN0O1xuICAgICAgICBpc0ZpcnN0ID0gZmFsc2U7XG4gICAgICAgIGlmICh3YXNGaXJzdCAmJiBvcHRpb25zPy5pZ25vcmVGaXJzdEV2ZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMubm90aWZ5SW52YWxpZGF0ZWQoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gcmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgY2IpKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbImRlZmluaXRpb24iLCJicm93c2VyIiwiX2Jyb3dzZXIiLCJwcmludCIsImxvZ2dlciIsInJlc3VsdCIsInJlbW92ZURldGVjdG9yIiwibW91bnREZXRlY3RvciJdLCJtYXBwaW5ncyI6Ijs7QUFBTyxXQUFTLG9CQUFvQkEsYUFBWTtBQUM5QyxXQUFPQTtBQUFBLEVBQ1Q7QUNETyxRQUFNQyxZQUFVLFdBQVcsU0FBUyxTQUFTLEtBQ2hELFdBQVcsVUFDWCxXQUFXO0FDRlIsUUFBTSxVQUFVQztBQ0R2QixRQUFNLFVBQVUsdUJBQU8sTUFBTTtBQUU3QixNQUFJLGFBQWE7QUFBQSxFQUVGLE1BQU0sb0JBQW9CLElBQUk7QUFBQSxJQUM1QyxjQUFjO0FBQ2IsWUFBSztBQUVMLFdBQUssZ0JBQWdCLG9CQUFJLFFBQU87QUFDaEMsV0FBSyxnQkFBZ0Isb0JBQUk7QUFDekIsV0FBSyxjQUFjLG9CQUFJLElBQUc7QUFFMUIsWUFBTSxDQUFDLEtBQUssSUFBSTtBQUNoQixVQUFJLFVBQVUsUUFBUSxVQUFVLFFBQVc7QUFDMUM7QUFBQSxNQUNEO0FBRUEsVUFBSSxPQUFPLE1BQU0sT0FBTyxRQUFRLE1BQU0sWUFBWTtBQUNqRCxjQUFNLElBQUksVUFBVSxPQUFPLFFBQVEsaUVBQWlFO0FBQUEsTUFDckc7QUFFQSxpQkFBVyxDQUFDLE1BQU0sS0FBSyxLQUFLLE9BQU87QUFDbEMsYUFBSyxJQUFJLE1BQU0sS0FBSztBQUFBLE1BQ3JCO0FBQUEsSUFDRDtBQUFBLElBRUEsZUFBZSxNQUFNLFNBQVMsT0FBTztBQUNwQyxVQUFJLENBQUMsTUFBTSxRQUFRLElBQUksR0FBRztBQUN6QixjQUFNLElBQUksVUFBVSxxQ0FBcUM7QUFBQSxNQUMxRDtBQUVBLFlBQU0sYUFBYSxLQUFLLGVBQWUsTUFBTSxNQUFNO0FBRW5ELFVBQUk7QUFDSixVQUFJLGNBQWMsS0FBSyxZQUFZLElBQUksVUFBVSxHQUFHO0FBQ25ELG9CQUFZLEtBQUssWUFBWSxJQUFJLFVBQVU7QUFBQSxNQUM1QyxXQUFXLFFBQVE7QUFDbEIsb0JBQVksQ0FBQyxHQUFHLElBQUk7QUFDcEIsYUFBSyxZQUFZLElBQUksWUFBWSxTQUFTO0FBQUEsTUFDM0M7QUFFQSxhQUFPLEVBQUMsWUFBWSxVQUFTO0FBQUEsSUFDOUI7QUFBQSxJQUVBLGVBQWUsTUFBTSxTQUFTLE9BQU87QUFDcEMsWUFBTSxjQUFjLENBQUE7QUFDcEIsZUFBUyxPQUFPLE1BQU07QUFDckIsWUFBSSxRQUFRLE1BQU07QUFDakIsZ0JBQU07QUFBQSxRQUNQO0FBRUEsY0FBTSxTQUFTLE9BQU8sUUFBUSxZQUFZLE9BQU8sUUFBUSxhQUFhLGtCQUFtQixPQUFPLFFBQVEsV0FBVyxrQkFBa0I7QUFFckksWUFBSSxDQUFDLFFBQVE7QUFDWixzQkFBWSxLQUFLLEdBQUc7QUFBQSxRQUNyQixXQUFXLEtBQUssTUFBTSxFQUFFLElBQUksR0FBRyxHQUFHO0FBQ2pDLHNCQUFZLEtBQUssS0FBSyxNQUFNLEVBQUUsSUFBSSxHQUFHLENBQUM7QUFBQSxRQUN2QyxXQUFXLFFBQVE7QUFDbEIsZ0JBQU0sYUFBYSxhQUFhLFlBQVk7QUFDNUMsZUFBSyxNQUFNLEVBQUUsSUFBSSxLQUFLLFVBQVU7QUFDaEMsc0JBQVksS0FBSyxVQUFVO0FBQUEsUUFDNUIsT0FBTztBQUNOLGlCQUFPO0FBQUEsUUFDUjtBQUFBLE1BQ0Q7QUFFQSxhQUFPLEtBQUssVUFBVSxXQUFXO0FBQUEsSUFDbEM7QUFBQSxJQUVBLElBQUksTUFBTSxPQUFPO0FBQ2hCLFlBQU0sRUFBQyxVQUFTLElBQUksS0FBSyxlQUFlLE1BQU0sSUFBSTtBQUNsRCxhQUFPLE1BQU0sSUFBSSxXQUFXLEtBQUs7QUFBQSxJQUNsQztBQUFBLElBRUEsSUFBSSxNQUFNO0FBQ1QsWUFBTSxFQUFDLFVBQVMsSUFBSSxLQUFLLGVBQWUsSUFBSTtBQUM1QyxhQUFPLE1BQU0sSUFBSSxTQUFTO0FBQUEsSUFDM0I7QUFBQSxJQUVBLElBQUksTUFBTTtBQUNULFlBQU0sRUFBQyxVQUFTLElBQUksS0FBSyxlQUFlLElBQUk7QUFDNUMsYUFBTyxNQUFNLElBQUksU0FBUztBQUFBLElBQzNCO0FBQUEsSUFFQSxPQUFPLE1BQU07QUFDWixZQUFNLEVBQUMsV0FBVyxXQUFVLElBQUksS0FBSyxlQUFlLElBQUk7QUFDeEQsYUFBTyxRQUFRLGFBQWEsTUFBTSxPQUFPLFNBQVMsS0FBSyxLQUFLLFlBQVksT0FBTyxVQUFVLENBQUM7QUFBQSxJQUMzRjtBQUFBLElBRUEsUUFBUTtBQUNQLFlBQU0sTUFBSztBQUNYLFdBQUssY0FBYyxNQUFLO0FBQ3hCLFdBQUssWUFBWSxNQUFLO0FBQUEsSUFDdkI7QUFBQSxJQUVBLEtBQUssT0FBTyxXQUFXLElBQUk7QUFDMUIsYUFBTztBQUFBLElBQ1I7QUFBQSxJQUVBLElBQUksT0FBTztBQUNWLGFBQU8sTUFBTTtBQUFBLElBQ2Q7QUFBQSxFQUNEO0FDdEdBLFdBQVMsY0FBYyxPQUFPO0FBQzVCLFFBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLGFBQU87QUFBQSxJQUNUO0FBQ0EsVUFBTSxZQUFZLE9BQU8sZUFBZSxLQUFLO0FBQzdDLFFBQUksY0FBYyxRQUFRLGNBQWMsT0FBTyxhQUFhLE9BQU8sZUFBZSxTQUFTLE1BQU0sTUFBTTtBQUNyRyxhQUFPO0FBQUEsSUFDVDtBQUNBLFFBQUksT0FBTyxZQUFZLE9BQU87QUFDNUIsYUFBTztBQUFBLElBQ1Q7QUFDQSxRQUFJLE9BQU8sZUFBZSxPQUFPO0FBQy9CLGFBQU8sT0FBTyxVQUFVLFNBQVMsS0FBSyxLQUFLLE1BQU07QUFBQSxJQUNuRDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxNQUFNLFlBQVksVUFBVSxZQUFZLEtBQUssUUFBUTtBQUM1RCxRQUFJLENBQUMsY0FBYyxRQUFRLEdBQUc7QUFDNUIsYUFBTyxNQUFNLFlBQVksSUFBSSxXQUFXLE1BQU07QUFBQSxJQUNoRDtBQUNBLFVBQU0sU0FBUyxPQUFPLE9BQU8sQ0FBQSxHQUFJLFFBQVE7QUFDekMsZUFBVyxPQUFPLFlBQVk7QUFDNUIsVUFBSSxRQUFRLGVBQWUsUUFBUSxlQUFlO0FBQ2hEO0FBQUEsTUFDRjtBQUNBLFlBQU0sUUFBUSxXQUFXLEdBQUc7QUFDNUIsVUFBSSxVQUFVLFFBQVEsVUFBVSxRQUFRO0FBQ3RDO0FBQUEsTUFDRjtBQUNBLFVBQUksVUFBVSxPQUFPLFFBQVEsS0FBSyxPQUFPLFNBQVMsR0FBRztBQUNuRDtBQUFBLE1BQ0Y7QUFDQSxVQUFJLE1BQU0sUUFBUSxLQUFLLEtBQUssTUFBTSxRQUFRLE9BQU8sR0FBRyxDQUFDLEdBQUc7QUFDdEQsZUFBTyxHQUFHLElBQUksQ0FBQyxHQUFHLE9BQU8sR0FBRyxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQ3pDLFdBQVcsY0FBYyxLQUFLLEtBQUssY0FBYyxPQUFPLEdBQUcsQ0FBQyxHQUFHO0FBQzdELGVBQU8sR0FBRyxJQUFJO0FBQUEsVUFDWjtBQUFBLFVBQ0EsT0FBTyxHQUFHO0FBQUEsV0FDVCxZQUFZLEdBQUcsU0FBUyxNQUFNLE1BQU0sSUFBSSxTQUFRO0FBQUEsVUFDakQ7QUFBQSxRQUNSO0FBQUEsTUFDSSxPQUFPO0FBQ0wsZUFBTyxHQUFHLElBQUk7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsV0FBVyxRQUFRO0FBQzFCLFdBQU8sSUFBSTtBQUFBO0FBQUEsTUFFVCxXQUFXLE9BQU8sQ0FBQyxHQUFHLE1BQU0sTUFBTSxHQUFHLEdBQUcsSUFBSSxNQUFNLEdBQUcsQ0FBQSxDQUFFO0FBQUE7QUFBQSxFQUUzRDtBQUNBLFFBQU0sT0FBTyxXQUFVO0FDdER2QixRQUFNLFVBQVUsQ0FBQyxZQUFZO0FBQzNCLFdBQU8sWUFBWSxPQUFPLEVBQUUsWUFBWSxNQUFNLFFBQVEsUUFBTyxJQUFLLEVBQUUsWUFBWSxNQUFLO0FBQUEsRUFDdkY7QUFDQSxRQUFNLGFBQWEsQ0FBQyxZQUFZO0FBQzlCLFdBQU8sWUFBWSxPQUFPLEVBQUUsWUFBWSxNQUFNLFFBQVEsS0FBSSxJQUFLLEVBQUUsWUFBWSxNQUFLO0FBQUEsRUFDcEY7QUNEQSxRQUFNLG9CQUFvQixPQUFPO0FBQUEsSUFDL0IsUUFBUSxXQUFXO0FBQUEsSUFDbkIsY0FBYztBQUFBLElBQ2QsVUFBVTtBQUFBLElBQ1YsZ0JBQWdCO0FBQUEsTUFDZCxXQUFXO0FBQUEsTUFDWCxTQUFTO0FBQUEsTUFDVCxZQUFZO0FBQUEsSUFDaEI7QUFBQSxJQUNFLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxFQUNqQjtBQUNBLFFBQU0sZUFBZSxDQUFDLGlCQUFpQixtQkFBbUI7QUFDeEQsV0FBTyxLQUFLLGlCQUFpQixjQUFjO0FBQUEsRUFDN0M7QUFFQSxRQUFNLGFBQWEsSUFBSSxZQUFXO0FBQ2xDLFdBQVMsa0JBQWtCLGlCQUFpQjtBQUMxQyxVQUFNLEVBQUUsZUFBYyxJQUFLO0FBQzNCLFdBQU8sQ0FBQyxVQUFVLFlBQVk7QUFDNUIsWUFBTTtBQUFBLFFBQ0o7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ04sSUFBUSxhQUFhLFNBQVMsY0FBYztBQUN4QyxZQUFNLGtCQUFrQjtBQUFBLFFBQ3RCO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDTjtBQUNJLFlBQU0sZ0JBQWdCLFdBQVcsSUFBSSxlQUFlO0FBQ3BELFVBQUksZ0JBQWdCLGVBQWU7QUFDakMsZUFBTztBQUFBLE1BQ1Q7QUFDQSxZQUFNLGdCQUFnQixJQUFJO0FBQUE7QUFBQSxRQUV4QixPQUFPLFNBQVMsV0FBVztBQUN6QixjQUFJLFFBQVEsU0FBUztBQUNuQixtQkFBTyxPQUFPLE9BQU8sTUFBTTtBQUFBLFVBQzdCO0FBQ0EsZ0JBQU0sV0FBVyxJQUFJO0FBQUEsWUFDbkIsT0FBTyxjQUFjO0FBQ25CLHlCQUFXLEtBQUssV0FBVztBQUN6QixvQkFBSSxRQUFRLFNBQVM7QUFDbkIsMkJBQVMsV0FBVTtBQUNuQjtBQUFBLGdCQUNGO0FBQ0Esc0JBQU0sZ0JBQWdCLE1BQU0sY0FBYztBQUFBLGtCQUN4QztBQUFBLGtCQUNBO0FBQUEsa0JBQ0E7QUFBQSxrQkFDQTtBQUFBLGdCQUNoQixDQUFlO0FBQ0Qsb0JBQUksY0FBYyxZQUFZO0FBQzVCLDJCQUFTLFdBQVU7QUFDbkIsMEJBQVEsY0FBYyxNQUFNO0FBQzVCO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ1Y7QUFDUSxrQkFBUTtBQUFBLFlBQ047QUFBQSxZQUNBLE1BQU07QUFDSix1QkFBUyxXQUFVO0FBQ25CLHFCQUFPLE9BQU8sT0FBTyxNQUFNO0FBQUEsWUFDN0I7QUFBQSxZQUNBLEVBQUUsTUFBTSxLQUFJO0FBQUEsVUFDdEI7QUFDUSxnQkFBTSxlQUFlLE1BQU0sY0FBYztBQUFBLFlBQ3ZDO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDVixDQUFTO0FBQ0QsY0FBSSxhQUFhLFlBQVk7QUFDM0IsbUJBQU8sUUFBUSxhQUFhLE1BQU07QUFBQSxVQUNwQztBQUNBLG1CQUFTLFFBQVEsUUFBUSxjQUFjO0FBQUEsUUFDekM7QUFBQSxNQUNOLEVBQU0sUUFBUSxNQUFNO0FBQ2QsbUJBQVcsT0FBTyxlQUFlO0FBQUEsTUFDbkMsQ0FBQztBQUNELGlCQUFXLElBQUksaUJBQWlCLGFBQWE7QUFDN0MsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQ0EsaUJBQWUsY0FBYztBQUFBLElBQzNCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRixHQUFHO0FBQ0QsVUFBTSxVQUFVLGdCQUFnQixjQUFjLFFBQVEsSUFBSSxPQUFPLGNBQWMsUUFBUTtBQUN2RixXQUFPLE1BQU0sU0FBUyxPQUFPO0FBQUEsRUFDL0I7QUFDQSxRQUFNLGNBQWMsa0JBQWtCO0FBQUEsSUFDcEMsZ0JBQWdCLGtCQUFpQjtBQUFBLEVBQ25DLENBQUM7QUM3R0QsV0FBU0MsUUFBTSxXQUFXLE1BQU07QUFFOUIsUUFBSSxPQUFPLEtBQUssQ0FBQyxNQUFNLFVBQVU7QUFDL0IsWUFBTSxVQUFVLEtBQUssTUFBQTtBQUNyQixhQUFPLFNBQVMsT0FBTyxJQUFJLEdBQUcsSUFBSTtBQUFBLElBQ3BDLE9BQU87QUFDTCxhQUFPLFNBQVMsR0FBRyxJQUFJO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQ08sUUFBTUMsV0FBUztBQUFBLElBQ3BCLE9BQU8sSUFBSSxTQUFTRCxRQUFNLFFBQVEsT0FBTyxHQUFHLElBQUk7QUFBQSxJQUNoRCxLQUFLLElBQUksU0FBU0EsUUFBTSxRQUFRLEtBQUssR0FBRyxJQUFJO0FBQUEsSUFDNUMsTUFBTSxJQUFJLFNBQVNBLFFBQU0sUUFBUSxNQUFNLEdBQUcsSUFBSTtBQUFBLElBQzlDLE9BQU8sSUFBSSxTQUFTQSxRQUFNLFFBQVEsT0FBTyxHQUFHLElBQUk7QUFBQSxFQUNsRDtBQ1JPLFdBQVMsY0FBYyxNQUFNLG1CQUFtQixTQUFTO0FBQzlELFFBQUksUUFBUSxhQUFhLFNBQVU7QUFDbkMsUUFBSSxRQUFRLFVBQVUsS0FBTSxNQUFLLE1BQU0sU0FBUyxPQUFPLFFBQVEsTUFBTTtBQUNyRSxTQUFLLE1BQU0sV0FBVztBQUN0QixTQUFLLE1BQU0sV0FBVztBQUN0QixTQUFLLE1BQU0sUUFBUTtBQUNuQixTQUFLLE1BQU0sU0FBUztBQUNwQixTQUFLLE1BQU0sVUFBVTtBQUFBLEVBa0J2QjtBQUNPLFdBQVMsVUFBVSxTQUFTO0FBQ2pDLFFBQUksUUFBUSxVQUFVLEtBQU0sUUFBTyxTQUFTO0FBQzVDLFFBQUksV0FBVyxPQUFPLFFBQVEsV0FBVyxhQUFhLFFBQVEsV0FBVyxRQUFRO0FBQ2pGLFFBQUksT0FBTyxhQUFhLFVBQVU7QUFDaEMsVUFBSSxTQUFTLFdBQVcsR0FBRyxHQUFHO0FBQzVCLGNBQU1FLFVBQVMsU0FBUztBQUFBLFVBQ3RCO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBLFlBQVk7QUFBQSxVQUNaO0FBQUEsUUFDUjtBQUNNLGVBQU9BLFFBQU8sbUJBQW1CO0FBQUEsTUFDbkMsT0FBTztBQUNMLGVBQU8sU0FBUyxjQUFjLFFBQVEsS0FBSztBQUFBLE1BQzdDO0FBQUEsSUFDRjtBQUNBLFdBQU8sWUFBWTtBQUFBLEVBQ3JCO0FBQ08sV0FBUyxRQUFRLE1BQU0sU0FBUztBQUNyQyxVQUFNLFNBQVMsVUFBVSxPQUFPO0FBQ2hDLFFBQUksVUFBVTtBQUNaLFlBQU07QUFBQSxRQUNKO0FBQUEsTUFDTjtBQUNFLFlBQVEsUUFBUSxRQUFNO0FBQUEsTUFDcEIsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNILGVBQU8sT0FBTyxJQUFJO0FBQ2xCO0FBQUEsTUFDRixLQUFLO0FBQ0gsZUFBTyxRQUFRLElBQUk7QUFDbkI7QUFBQSxNQUNGLEtBQUs7QUFDSCxlQUFPLFlBQVksSUFBSTtBQUN2QjtBQUFBLE1BQ0YsS0FBSztBQUNILGVBQU8sZUFBZSxhQUFhLE1BQU0sT0FBTyxrQkFBa0I7QUFDbEU7QUFBQSxNQUNGLEtBQUs7QUFDSCxlQUFPLGVBQWUsYUFBYSxNQUFNLE1BQU07QUFDL0M7QUFBQSxNQUNGO0FBQ0UsZ0JBQVEsT0FBTyxRQUFRLElBQUk7QUFDM0I7QUFBQSxJQUNOO0FBQUEsRUFDQTtBQUNPLFdBQVMscUJBQXFCLGVBQWUsU0FBUztBQUMzRCxRQUFJLG9CQUFvQjtBQUN4QixVQUFNLGdCQUFnQixNQUFNO0FBQzFCLHlCQUFtQixjQUFhO0FBQ2hDLDBCQUFvQjtBQUFBLElBQ3RCO0FBQ0EsVUFBTSxRQUFRLE1BQU07QUFDbEIsb0JBQWMsTUFBSztBQUFBLElBQ3JCO0FBQ0EsVUFBTSxVQUFVLGNBQWM7QUFDOUIsVUFBTSxTQUFTLE1BQU07QUFDbkIsb0JBQWE7QUFDYixvQkFBYyxPQUFNO0FBQUEsSUFDdEI7QUFDQSxVQUFNLFlBQVksQ0FBQyxxQkFBcUI7QUFDdEMsVUFBSSxtQkFBbUI7QUFDckJELGlCQUFPLEtBQUssMkJBQTJCO0FBQUEsTUFDekM7QUFDQSwwQkFBb0I7QUFBQSxRQUNsQixFQUFFLE9BQU8sU0FBUyxjQUFhO0FBQUEsUUFDL0I7QUFBQSxVQUNFLEdBQUc7QUFBQSxVQUNILEdBQUc7QUFBQSxRQUNYO0FBQUEsTUFDQTtBQUFBLElBQ0U7QUFDQSxXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0E7QUFDQSxXQUFTLFlBQVksYUFBYSxTQUFTO0FBQ3pDLFVBQU0sa0JBQWtCLElBQUksZ0JBQWU7QUFDM0MsVUFBTSx1QkFBdUI7QUFDN0IsVUFBTSxpQkFBaUIsTUFBTTtBQUMzQixzQkFBZ0IsTUFBTSxvQkFBb0I7QUFDMUMsY0FBUSxTQUFNO0FBQUEsSUFDaEI7QUFDQSxRQUFJLGlCQUFpQixPQUFPLFFBQVEsV0FBVyxhQUFhLFFBQVEsV0FBVyxRQUFRO0FBQ3ZGLFFBQUksMEJBQTBCLFNBQVM7QUFDckMsWUFBTTtBQUFBLFFBQ0o7QUFBQSxNQUNOO0FBQUEsSUFDRTtBQUNBLG1CQUFlLGVBQWUsVUFBVTtBQUN0QyxVQUFJLGdCQUFnQixDQUFDLENBQUMsVUFBVSxPQUFPO0FBQ3ZDLFVBQUksZUFBZTtBQUNqQixvQkFBWSxNQUFLO0FBQUEsTUFDbkI7QUFDQSxhQUFPLENBQUMsZ0JBQWdCLE9BQU8sU0FBUztBQUN0QyxZQUFJO0FBQ0YsZ0JBQU0sZ0JBQWdCLE1BQU0sWUFBWSxZQUFZLFFBQVE7QUFBQSxZQUMxRCxlQUFlLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFBQSxZQUMzQyxVQUFVLGdCQUFnQkUsYUFBaUJDO0FBQUFBLFlBQzNDLFFBQVEsZ0JBQWdCO0FBQUEsVUFDbEMsQ0FBUztBQUNELDBCQUFnQixDQUFDLENBQUM7QUFDbEIsY0FBSSxlQUFlO0FBQ2pCLHdCQUFZLE1BQUs7QUFBQSxVQUNuQixPQUFPO0FBQ0wsd0JBQVksUUFBTztBQUNuQixnQkFBSSxRQUFRLE1BQU07QUFDaEIsMEJBQVksY0FBYTtBQUFBLFlBQzNCO0FBQUEsVUFDRjtBQUFBLFFBQ0YsU0FBUyxPQUFPO0FBQ2QsY0FBSSxnQkFBZ0IsT0FBTyxXQUFXLGdCQUFnQixPQUFPLFdBQVcsc0JBQXNCO0FBQzVGO0FBQUEsVUFDRixPQUFPO0FBQ0wsa0JBQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsbUJBQWUsY0FBYztBQUM3QixXQUFPLEVBQUUsZUFBZSxlQUFjO0FBQUEsRUFDeEM7QUMzSk8sV0FBUyxtQkFBbUIsS0FBSyxTQUFTO0FBQy9DLFVBQU0sVUFBVSxTQUFTLGNBQWMsUUFBUSxPQUFPLEtBQUs7QUFDM0QsUUFBSSxVQUFVO0FBQ2QsVUFBTSxRQUFRLE1BQU07QUFDbEIsb0JBQWMsU0FBUyxRQUFRLE9BQU87QUFDdEMsY0FBUSxTQUFTLE9BQU87QUFDeEIsZ0JBQVUsUUFBUSxVQUFVLE9BQU87QUFBQSxJQUNyQztBQUNBLFVBQU0sU0FBUyxNQUFNO0FBQ25CLGNBQVEsV0FBVyxPQUFPO0FBQzFCLGNBQVEsZ0JBQWU7QUFDdkIsY0FBUSxPQUFNO0FBQ2QsZ0JBQVU7QUFBQSxJQUNaO0FBQ0EsVUFBTSxpQkFBaUI7QUFBQSxNQUNyQjtBQUFBLFFBQ0U7QUFBQSxRQUNBO0FBQUEsTUFDTjtBQUFBLE1BQ0k7QUFBQSxJQUNKO0FBQ0UsUUFBSSxjQUFjLE1BQU07QUFDeEIsV0FBTztBQUFBLE1BQ0wsSUFBSSxVQUFVO0FBQ1osZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQSxHQUFHO0FBQUEsSUFDUDtBQUFBLEVBQ0E7QUM5QkEsUUFBQSxtQkFBZTtBQ0FmLFFBQUEsa0JBQWU7QUNPZixRQUFBLGFBQUEsb0JBQUE7QUFBQSxJQUFtQyxTQUFBLENBQUEsWUFBQTtBQUFBLElBQ1gsT0FBQTtBQUFBLElBQ2YsS0FBQSxLQUFBO0FBSUwsWUFBQSxnQkFBQSxDQUFBLFlBQUEsZUFBQTtBQUNBLFlBQUEsZ0JBQUEsQ0FBQSxTQUFBLFFBQUEsUUFBQSxRQUFBLEtBQUE7QUFDQSxZQUFBLGFBQUEsQ0FBQSxHQUFBLGVBQUEsR0FBQSxhQUFBO0FBR0EsVUFBQSxXQUFBO0FBQ0EsVUFBQSxlQUFBO0FBR0EsZUFBQSxxQkFBQTtBQUVFLGNBQUEsUUFBQSxTQUFBLEtBQUE7QUFDQSxlQUFBLE1BQUEsS0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsYUFBQSxLQUFBLFlBQUEsRUFBQTtBQUFBLFVBRUcsQ0FBQSxTQUFBLEtBQUEsV0FBQSxLQUFBLEVBQUEsU0FBQSw2QkFBQTtBQUFBLFFBQzhEO0FBQUEsTUFDL0Q7QUFJSixlQUFBLHdCQUFBO0FBQ0UsY0FBQSxPQUFBLFNBQUE7QUFDQSxtQkFBQSxTQUFBLGVBQUE7QUFDRSxjQUFBLEtBQUEsVUFBQSxTQUFBLEtBQUEsR0FBQTtBQUNFLG1CQUFBO0FBQUEsVUFBTztBQUFBLFFBQ1Q7QUFFRixlQUFBO0FBQUEsTUFBTztBQUlULGVBQUEsWUFBQSxPQUFBO0FBQ0UsZ0JBQUEsT0FBQTtBQUFBLFVBQWUsS0FBQTtBQUVYLG1CQUFBO0FBQUEsVUFBTyxLQUFBO0FBRVAsbUJBQUE7QUFBQSxVQUFPO0FBRVAsbUJBQUE7QUFBQSxRQUFPO0FBQUEsTUFDWDtBQUlGLGVBQUEsZUFBQSxLQUFBO0FBQ0UsWUFBQSxDQUFBLEtBQUE7QUFFRSxjQUFBLGNBQUE7QUFDRSx5QkFBQSxPQUFBO0FBQ0EsMkJBQUE7QUFBQSxVQUFlO0FBRWpCO0FBQUEsUUFBQTtBQUdGLFlBQUEsQ0FBQSxjQUFBO0FBQ0UseUJBQUEsU0FBQSxjQUFBLE9BQUE7QUFDQSx1QkFBQSxLQUFBO0FBQ0EsbUJBQUEsS0FBQSxZQUFBLFlBQUE7QUFBQSxRQUFzQztBQUV4QyxxQkFBQSxjQUFBO0FBQUEsTUFBMkI7QUFJN0IsZUFBQSxXQUFBLE9BQUE7QUFDRSxjQUFBLE9BQUEsU0FBQTtBQUNBLGNBQUEsZ0JBQUEsY0FBQSxTQUFBLEtBQUE7QUFFQSxZQUFBLGVBQUE7QUFFRSx3QkFBQSxRQUFBLENBQUEsTUFBQSxLQUFBLFVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxlQUFBLFVBQUEsSUFBQSxVQUFBLGFBQUEsVUFBQSxNQUFBO0FBQ0EseUJBQUEsWUFBQSxLQUFBLENBQUE7QUFBQSxRQUFpQyxPQUFBO0FBR2pDLHdCQUFBLFFBQUEsQ0FBQSxNQUFBLEtBQUEsVUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsVUFBQSxJQUFBLEtBQUE7QUFDQSx5QkFBQSxJQUFBO0FBRUEsY0FBQTtBQUNFLHlCQUFBLFFBQUEsZ0JBQUEsS0FBQTtBQUFBLFVBQTBDLFNBQUEsR0FBQTtBQUFBLFVBQ2hDO0FBQUEsUUFFWjtBQUlGLGdCQUFBLFFBQUEsWUFBQSxFQUFBLE1BQUEsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsTUFBQSxNQUFBO0FBQUEsUUFBeUUsQ0FBQTtBQUFBLE1BRXhFO0FBSUgscUJBQUEsWUFBQTtBQUNFLFlBQUE7QUFDRSxnQkFBQSxjQUFBLENBQUEsZUFBQSxTQUFBO0FBSUEsZ0JBQUEsRUFBQSxZQUFBLElBQUEsTUFBQSxRQUFBLFFBQUEsTUFBQTtBQUFBLFlBQXFEO0FBQUEsVUFDbkQ7QUFHRixnQkFBQSxRQUFBLGVBQUE7QUFDQSxjQUFBLFdBQUEsU0FBQSxLQUFBLEdBQUE7QUFDRSx1QkFBQSxLQUFBO0FBQUEsVUFBZ0I7QUFBQSxRQUNsQixTQUFBLEdBQUE7QUFHQSxxQkFBQSxVQUFBO0FBQUEsUUFBcUI7QUFBQSxNQUN2QjtBQUlGLGNBQUEsUUFBQSxVQUFBLFlBQUEsQ0FBQSxZQUFBO0FBQ0UsWUFBQSxRQUFBLFNBQUEsY0FBQSxXQUFBLFNBQUEsUUFBQSxLQUFBLEdBQUE7QUFDRSxxQkFBQSxRQUFBLEtBQUE7QUFBQSxRQUF3QixXQUFBLFFBQUEsU0FBQSxhQUFBO0FBRXhCLGlCQUFBLFFBQUEsUUFBQTtBQUFBLFlBQXVCO0FBQUEsWUFDckIsY0FBQSxzQkFBQTtBQUFBLFVBQ29DLENBQUE7QUFBQSxRQUNyQztBQUFBLE1BQ0gsQ0FBQTtBQUlGLGVBQUEsa0JBQUEsWUFBQTtBQUNFLFlBQUEsQ0FBQSxXQUFBO0FBR0EsY0FBQSxlQUFBLFNBQUEsY0FBQSxLQUFBO0FBQ0EscUJBQUEsS0FBQTtBQUNBLHFCQUFBLFlBQUE7QUFHQSxjQUFBLFNBQUEsU0FBQSxjQUFBLEtBQUE7QUFDQSxlQUFBLFlBQUE7QUFDQSxlQUFBLGNBQUE7QUFDQSxxQkFBQSxZQUFBLE1BQUE7QUFHQSxjQUFBLGdCQUFBLFdBQUEsVUFBQSxJQUFBO0FBQ0Esc0JBQUEsVUFBQSxJQUFBLG1CQUFBO0FBQ0EscUJBQUEsWUFBQSxhQUFBO0FBR0EsbUJBQUEsTUFBQSxVQUFBO0FBRUEsZUFBQTtBQUFBLE1BQU87QUFJVCxlQUFBLE9BQUE7QUFDRSxtQkFBQSxtQkFBQTtBQUNBLFlBQUEsVUFBQTtBQUNFLHVCQUFBLFFBQUEsV0FBQSxNQUFBO0FBQ0Esb0JBQUE7QUFFQSxnQkFBQSxLQUFBLG1CQUFBLEtBQUE7QUFBQSxZQUFtQyxVQUFBO0FBQUEsWUFDdkIsUUFBQTtBQUFBLFlBQ0YsU0FBQSxDQUFBLGdCQUFBO0FBRU4sb0JBQUEsV0FBQSxJQUFBLGlCQUFBLENBQUEsR0FBQSxRQUFBO0FBQ0Usc0JBQUEsVUFBQSxTQUFBO0FBQUEsa0JBQXlCO0FBQUEsZ0JBQ3ZCO0FBRUYsb0JBQUEsU0FBQTtBQUNFLHdCQUFBLGVBQUEsa0JBQUEsT0FBQTtBQUNBLDhCQUFBLE9BQUEsWUFBQTtBQUNBLDhCQUFBLFVBQUEsSUFBQSxtQkFBQTtBQUNBLHNCQUFBLFdBQUE7QUFBQSxnQkFBZTtBQUFBLGNBQ2pCLENBQUE7QUFHRix1QkFBQSxRQUFBLFNBQUEsTUFBQTtBQUFBLGdCQUFnQyxXQUFBO0FBQUE7QUFBQSxnQkFDbkIsU0FBQTtBQUFBO0FBQUEsY0FDRixDQUFBO0FBQUEsWUFDVjtBQUFBLFVBQ0gsQ0FBQTtBQUVGLGFBQUEsVUFBQTtBQUFBLFFBQWE7QUFBQSxNQUNmO0FBSUYsVUFBQSxTQUFBLGVBQUEsV0FBQTtBQUNFLGlCQUFBLGlCQUFBLG9CQUFBLElBQUE7QUFBQSxNQUFrRCxPQUFBO0FBRWxELGFBQUE7QUFBQSxNQUFLO0FBQUEsSUFDUDtBQUFBLEVBRUosQ0FBQTtBQUFBLEVDek1PLE1BQU0sK0JBQStCLE1BQU07QUFBQSxJQUNoRCxZQUFZLFFBQVEsUUFBUTtBQUMxQixZQUFNLHVCQUF1QixZQUFZLEVBQUU7QUFDM0MsV0FBSyxTQUFTO0FBQ2QsV0FBSyxTQUFTO0FBQUEsSUFDaEI7QUFBQSxJQUNBLE9BQU8sYUFBYSxtQkFBbUIsb0JBQW9CO0FBQUEsRUFDN0Q7QUFDTyxXQUFTLG1CQUFtQixXQUFXO0FBQzVDLFdBQU8sR0FBRyxTQUFTLFNBQVMsRUFBRSxJQUFJLFNBQTBCLElBQUksU0FBUztBQUFBLEVBQzNFO0FDVk8sV0FBUyxzQkFBc0IsS0FBSztBQUN6QyxRQUFJO0FBQ0osUUFBSTtBQUNKLFdBQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0wsTUFBTTtBQUNKLFlBQUksWUFBWSxLQUFNO0FBQ3RCLGlCQUFTLElBQUksSUFBSSxTQUFTLElBQUk7QUFDOUIsbUJBQVcsSUFBSSxZQUFZLE1BQU07QUFDL0IsY0FBSSxTQUFTLElBQUksSUFBSSxTQUFTLElBQUk7QUFDbEMsY0FBSSxPQUFPLFNBQVMsT0FBTyxNQUFNO0FBQy9CLG1CQUFPLGNBQWMsSUFBSSx1QkFBdUIsUUFBUSxNQUFNLENBQUM7QUFDL0QscUJBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRixHQUFHLEdBQUc7QUFBQSxNQUNSO0FBQUEsSUFDSjtBQUFBLEVBQ0E7QUFBQSxFQ2ZPLE1BQU0scUJBQXFCO0FBQUEsSUFDaEMsWUFBWSxtQkFBbUIsU0FBUztBQUN0QyxXQUFLLG9CQUFvQjtBQUN6QixXQUFLLFVBQVU7QUFDZixXQUFLLGtCQUFrQixJQUFJLGdCQUFlO0FBQzFDLFVBQUksS0FBSyxZQUFZO0FBQ25CLGFBQUssc0JBQXNCLEVBQUUsa0JBQWtCLEtBQUksQ0FBRTtBQUNyRCxhQUFLLGVBQWM7QUFBQSxNQUNyQixPQUFPO0FBQ0wsYUFBSyxzQkFBcUI7QUFBQSxNQUM1QjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU8sOEJBQThCO0FBQUEsTUFDbkM7QUFBQSxJQUNKO0FBQUEsSUFDRSxhQUFhLE9BQU8sU0FBUyxPQUFPO0FBQUEsSUFDcEM7QUFBQSxJQUNBLGtCQUFrQixzQkFBc0IsSUFBSTtBQUFBLElBQzVDLHFCQUFxQyxvQkFBSSxJQUFHO0FBQUEsSUFDNUMsSUFBSSxTQUFTO0FBQ1gsYUFBTyxLQUFLLGdCQUFnQjtBQUFBLElBQzlCO0FBQUEsSUFDQSxNQUFNLFFBQVE7QUFDWixhQUFPLEtBQUssZ0JBQWdCLE1BQU0sTUFBTTtBQUFBLElBQzFDO0FBQUEsSUFDQSxJQUFJLFlBQVk7QUFDZCxVQUFJLFFBQVEsUUFBUSxNQUFNLE1BQU07QUFDOUIsYUFBSyxrQkFBaUI7QUFBQSxNQUN4QjtBQUNBLGFBQU8sS0FBSyxPQUFPO0FBQUEsSUFDckI7QUFBQSxJQUNBLElBQUksVUFBVTtBQUNaLGFBQU8sQ0FBQyxLQUFLO0FBQUEsSUFDZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFjQSxjQUFjLElBQUk7QUFDaEIsV0FBSyxPQUFPLGlCQUFpQixTQUFTLEVBQUU7QUFDeEMsYUFBTyxNQUFNLEtBQUssT0FBTyxvQkFBb0IsU0FBUyxFQUFFO0FBQUEsSUFDMUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFZQSxRQUFRO0FBQ04sYUFBTyxJQUFJLFFBQVEsTUFBTTtBQUFBLE1BQ3pCLENBQUM7QUFBQSxJQUNIO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsWUFBWSxTQUFTLFNBQVM7QUFDNUIsWUFBTSxLQUFLLFlBQVksTUFBTTtBQUMzQixZQUFJLEtBQUssUUFBUyxTQUFPO0FBQUEsTUFDM0IsR0FBRyxPQUFPO0FBQ1YsV0FBSyxjQUFjLE1BQU0sY0FBYyxFQUFFLENBQUM7QUFDMUMsYUFBTztBQUFBLElBQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNQSxXQUFXLFNBQVMsU0FBUztBQUMzQixZQUFNLEtBQUssV0FBVyxNQUFNO0FBQzFCLFlBQUksS0FBSyxRQUFTLFNBQU87QUFBQSxNQUMzQixHQUFHLE9BQU87QUFDVixXQUFLLGNBQWMsTUFBTSxhQUFhLEVBQUUsQ0FBQztBQUN6QyxhQUFPO0FBQUEsSUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBT0Esc0JBQXNCLFVBQVU7QUFDOUIsWUFBTSxLQUFLLHNCQUFzQixJQUFJLFNBQVM7QUFDNUMsWUFBSSxLQUFLLFFBQVMsVUFBUyxHQUFHLElBQUk7QUFBQSxNQUNwQyxDQUFDO0FBQ0QsV0FBSyxjQUFjLE1BQU0scUJBQXFCLEVBQUUsQ0FBQztBQUNqRCxhQUFPO0FBQUEsSUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBT0Esb0JBQW9CLFVBQVUsU0FBUztBQUNyQyxZQUFNLEtBQUssb0JBQW9CLElBQUksU0FBUztBQUMxQyxZQUFJLENBQUMsS0FBSyxPQUFPLFFBQVMsVUFBUyxHQUFHLElBQUk7QUFBQSxNQUM1QyxHQUFHLE9BQU87QUFDVixXQUFLLGNBQWMsTUFBTSxtQkFBbUIsRUFBRSxDQUFDO0FBQy9DLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxpQkFBaUIsUUFBUSxNQUFNLFNBQVMsU0FBUztBQUMvQyxVQUFJLFNBQVMsc0JBQXNCO0FBQ2pDLFlBQUksS0FBSyxRQUFTLE1BQUssZ0JBQWdCLElBQUc7QUFBQSxNQUM1QztBQUNBLGFBQU87QUFBQSxRQUNMLEtBQUssV0FBVyxNQUFNLElBQUksbUJBQW1CLElBQUksSUFBSTtBQUFBLFFBQ3JEO0FBQUEsUUFDQTtBQUFBLFVBQ0UsR0FBRztBQUFBLFVBQ0gsUUFBUSxLQUFLO0FBQUEsUUFDckI7QUFBQSxNQUNBO0FBQUEsSUFDRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxvQkFBb0I7QUFDbEIsV0FBSyxNQUFNLG9DQUFvQztBQUMvQ0gsZUFBTztBQUFBLFFBQ0wsbUJBQW1CLEtBQUssaUJBQWlCO0FBQUEsTUFDL0M7QUFBQSxJQUNFO0FBQUEsSUFDQSxpQkFBaUI7QUFDZixhQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTSxxQkFBcUI7QUFBQSxVQUMzQixtQkFBbUIsS0FBSztBQUFBLFVBQ3hCLFdBQVcsS0FBSyxPQUFNLEVBQUcsU0FBUyxFQUFFLEVBQUUsTUFBTSxDQUFDO0FBQUEsUUFDckQ7QUFBQSxRQUNNO0FBQUEsTUFDTjtBQUFBLElBQ0U7QUFBQSxJQUNBLHlCQUF5QixPQUFPO0FBQzlCLFlBQU0sdUJBQXVCLE1BQU0sTUFBTSxTQUFTLHFCQUFxQjtBQUN2RSxZQUFNLHNCQUFzQixNQUFNLE1BQU0sc0JBQXNCLEtBQUs7QUFDbkUsWUFBTSxpQkFBaUIsQ0FBQyxLQUFLLG1CQUFtQixJQUFJLE1BQU0sTUFBTSxTQUFTO0FBQ3pFLGFBQU8sd0JBQXdCLHVCQUF1QjtBQUFBLElBQ3hEO0FBQUEsSUFDQSxzQkFBc0IsU0FBUztBQUM3QixVQUFJLFVBQVU7QUFDZCxZQUFNLEtBQUssQ0FBQyxVQUFVO0FBQ3BCLFlBQUksS0FBSyx5QkFBeUIsS0FBSyxHQUFHO0FBQ3hDLGVBQUssbUJBQW1CLElBQUksTUFBTSxLQUFLLFNBQVM7QUFDaEQsZ0JBQU0sV0FBVztBQUNqQixvQkFBVTtBQUNWLGNBQUksWUFBWSxTQUFTLGlCQUFrQjtBQUMzQyxlQUFLLGtCQUFpQjtBQUFBLFFBQ3hCO0FBQUEsTUFDRjtBQUNBLHVCQUFpQixXQUFXLEVBQUU7QUFDOUIsV0FBSyxjQUFjLE1BQU0sb0JBQW9CLFdBQVcsRUFBRSxDQUFDO0FBQUEsSUFDN0Q7QUFBQSxFQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzAsMSwyLDMsNCw1LDYsNyw4LDksMTMsMTQsMTVdfQ==
content;