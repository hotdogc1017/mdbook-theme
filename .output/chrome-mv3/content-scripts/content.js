var content=(function(){"use strict";function Z(t){return t}const m=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,P=Symbol("null");let K=0;class O extends Map{constructor(){super(),this._objectHashes=new WeakMap,this._symbolHashes=new Map,this._publicKeys=new Map;const[e]=arguments;if(e!=null){if(typeof e[Symbol.iterator]!="function")throw new TypeError(typeof e+" is not iterable (cannot read property Symbol(Symbol.iterator))");for(const[n,r]of e)this.set(n,r)}}_getPublicKeys(e,n=!1){if(!Array.isArray(e))throw new TypeError("The keys parameter must be an array");const r=this._getPrivateKey(e,n);let o;return r&&this._publicKeys.has(r)?o=this._publicKeys.get(r):n&&(o=[...e],this._publicKeys.set(r,o)),{privateKey:r,publicKey:o}}_getPrivateKey(e,n=!1){const r=[];for(let o of e){o===null&&(o=P);const i=typeof o=="object"||typeof o=="function"?"_objectHashes":typeof o=="symbol"?"_symbolHashes":!1;if(!i)r.push(o);else if(this[i].has(o))r.push(this[i].get(o));else if(n){const c=`@@mkm-ref-${K++}@@`;this[i].set(o,c),r.push(c)}else return!1}return JSON.stringify(r)}set(e,n){const{publicKey:r}=this._getPublicKeys(e,!0);return super.set(r,n)}get(e){const{publicKey:n}=this._getPublicKeys(e);return super.get(n)}has(e){const{publicKey:n}=this._getPublicKeys(e);return super.has(n)}delete(e){const{publicKey:n,privateKey:r}=this._getPublicKeys(e);return!!(n&&super.delete(n)&&this._publicKeys.delete(r))}clear(){super.clear(),this._symbolHashes.clear(),this._publicKeys.clear()}get[Symbol.toStringTag](){return"ManyKeysMap"}get size(){return super.size}}function E(t){if(t===null||typeof t!="object")return!1;const e=Object.getPrototypeOf(t);return e!==null&&e!==Object.prototype&&Object.getPrototypeOf(e)!==null||Symbol.iterator in t?!1:Symbol.toStringTag in t?Object.prototype.toString.call(t)==="[object Module]":!0}function S(t,e,n=".",r){if(!E(e))return S(t,{},n,r);const o=Object.assign({},e);for(const i in t){if(i==="__proto__"||i==="constructor")continue;const c=t[i];c!=null&&(r&&r(o,i,c,n)||(Array.isArray(c)&&Array.isArray(o[i])?o[i]=[...c,...o[i]]:E(c)&&E(o[i])?o[i]=S(c,o[i],(n?`${n}.`:"")+i.toString(),r):o[i]=c))}return o}function q(t){return(...e)=>e.reduce((n,r)=>S(n,r,"",t),{})}const z=q(),C=t=>t!==null?{isDetected:!0,result:t}:{isDetected:!1},D=t=>t===null?{isDetected:!0,result:null}:{isDetected:!1},R=()=>({target:globalThis.document,unifyProcess:!0,detector:C,observeConfigs:{childList:!0,subtree:!0,attributes:!0},signal:void 0,customMatcher:void 0}),F=(t,e)=>z(t,e),M=new O;function j(t){const{defaultOptions:e}=t;return(n,r)=>{const{target:o,unifyProcess:i,observeConfigs:c,detector:h,signal:l,customMatcher:b}=F(r,e),p=[n,o,i,c,h,l,b],k=M.get(p);if(i&&k)return k;const x=new Promise(async(g,a)=>{if(l?.aborted)return a(l.reason);const s=new MutationObserver(async d=>{for(const N of d){if(l?.aborted){s.disconnect();break}const f=await A({selector:n,target:o,detector:h,customMatcher:b});if(f.isDetected){s.disconnect(),g(f.result);break}}});l?.addEventListener("abort",()=>(s.disconnect(),a(l.reason)),{once:!0});const u=await A({selector:n,target:o,detector:h,customMatcher:b});if(u.isDetected)return g(u.result);s.observe(o,c)}).finally(()=>{M.delete(p)});return M.set(p,x),x}}async function A({target:t,selector:e,detector:n,customMatcher:r}){const o=r?r(e):t.querySelector(e);return await n(o)}const B=j({defaultOptions:R()});function v(t,...e){}const L={debug:(...t)=>v(console.debug,...t),log:(...t)=>v(console.log,...t),warn:(...t)=>v(console.warn,...t),error:(...t)=>v(console.error,...t)};function U(t,e,n){n.position!=="inline"&&(n.zIndex!=null&&(t.style.zIndex=String(n.zIndex)),t.style.overflow="visible",t.style.position="relative",t.style.width="0",t.style.height="0",t.style.display="block")}function T(t){if(t.anchor==null)return document.body;let e=typeof t.anchor=="function"?t.anchor():t.anchor;return typeof e=="string"?e.startsWith("/")?document.evaluate(e,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue??void 0:document.querySelector(e)??void 0:e??void 0}function V(t,e){const n=T(e);if(n==null)throw Error("Failed to mount content script UI: could not find anchor element");switch(e.append){case void 0:case"last":n.append(t);break;case"first":n.prepend(t);break;case"replace":n.replaceWith(t);break;case"after":n.parentElement?.insertBefore(t,n.nextElementSibling);break;case"before":n.parentElement?.insertBefore(t,n);break;default:e.append(n,t);break}}function $(t,e){let n;const r=()=>{n?.stopAutoMount(),n=void 0},o=()=>{t.mount()},i=t.remove;return{mount:o,remove:()=>{r(),t.remove()},autoMount:l=>{n&&L.warn("autoMount is already set."),n=H({mount:o,unmount:i,stopAutoMount:r},{...e,...l})}}}function H(t,e){const n=new AbortController,r="explicit_stop_auto_mount",o=()=>{n.abort(r),e.onStop?.()};let i=typeof e.anchor=="function"?e.anchor():e.anchor;if(i instanceof Element)throw Error("autoMount and Element anchor option cannot be combined. Avoid passing `Element` directly or `() => Element` to the anchor.");async function c(h){let l=!!T(e);for(l&&t.mount();!n.signal.aborted;)try{l=!!await B(h??"body",{customMatcher:()=>T(e)??null,detector:l?D:C,signal:n.signal}),l?t.mount():(t.unmount(),e.once&&t.stopAutoMount())}catch(b){if(n.signal.aborted&&n.signal.reason===r)break;throw b}}return c(i),{stopAutoMount:o}}function W(t,e){const n=document.createElement(e.tag||"div");let r;const o=()=>{U(n,void 0,e),V(n,e),r=e.onMount?.(n)},i=()=>{e.onRemove?.(r),n.replaceChildren(),n.remove(),r=void 0},c=$({mount:o,remove:i},e);return t.onInvalidated(i),{get mounted(){return r},wrapper:n,...c}}const G=`/* Mintlify-inspired Light Theme for mdBook */
:root {
    --bg: #ffffff;
    --fg: #0a0d0d;
    --sidebar-bg: #f8faf9;
    --sidebar-fg: #374151;
    --sidebar-active: #166e3f;
    --sidebar-active-bg: rgba(22, 110, 63, 0.1);
    --sidebar-header-border-color: var(--sidebar-active);
    --links: #166e3f;
    --links-hover: #26bd6c;
    --inline-code-bg: #f3f6f4;
    --inline-code-color: rgba(238, 241, 239, 0.5);
    --code-bg: #0a0d0d;
    --code-fg: #e5e7eb;
    --quote-bg: #f3f6f4;
    --quote-border: #26bd6c;
    --quote-block-border: rgb(16 185 129 / 0.2);
    --quote-block-bg: rgb(236 253 245 / 0.5);
    --table-border: #e5e7eb;
    --table-header-bg: #f3f6f4;
    --search-bg: #ffffff;
    --search-border: #e5e7eb;
    --searchbar-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --scrollbar: #d1d5db;
    --scrollbar-hover: #9ca3af;
    --order-weight: 400;
    --order-display: none;
    --chapter-nav-display: none;
    --sidebar-text-size: 16px;
    --body-text-color: rgb(63, 65, 64);
    --text-color: rgb(17, 24, 39);
    --content-size: 36rem;
    --root-font-size: 18px;
    --mono-font:
        "Geist Mono", "Menlo", "Monaco", "Lucida Console", "Liberation Mono",
        "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace;
    font-size: var(--root-font-size);
}

:not(pre) > code.hljs {
    background-color: var(--inline-code-color);
    color: var(--text-color);
    font-weight: 500;
    box-sizing: border-box;
    padding: 0.125rem 0.5rem;
    margin: 0 0.125rem;
}

html {
    font-family:
        "Inter",
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        sans-serif;
    background: var(--bg);
    color: var(--text-color);
    height: 100dvh;
}

body {
    background: var(--bg);
    color: var(--body-text-color);
    font-size: inherit;
}

nav.nav-wide-wrapper a.nav-chapters {
    display: var(--chapter-nav-display);
}

/* Sidebar */
.sidebar {
    background: var(--sidebar-bg);
    border-right: 1px solid var(--table-border);
}

.sidebar .sidebar-scrollbox {
    background: var(--sidebar-bg);
}

li.chapter-item:not(:has(span.chapter-link-wrapper)) a,
span.chapter-link-wrapper a {
    display: block;
    width: 100%;
    height: 100%;
}
li.chapter-item:not(:has(span.chapter-link-wrapper)),
span.chapter-link-wrapper {
    cursor: pointer;
    color: var(--sidebar-fg);
    padding: 4px 16px;
    border-radius: 8px;
    transition: all 0.15s ease;
    font-size: var(--sidebar-text-size);
}

/*.sidebar ol.chapter > li.chapter-item > span.chapter-link-wrapper {
    font-weight: bold;
}*/

/*.sidebar ol.chapter li .chapter-item.expanded > a,*/
li.chapter-item:not(:has(span.chapter-link-wrapper)):hover,
li.chapter-item:not(:has(span.chapter-link-wrapper)):has(a.active),
span.chapter-link-wrapper:has(a.active),
span.chapter-link-wrapper:hover {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active);
    text-decoration: none;
}

/* Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
    color: var(--fg);
    font-weight: 600;
    margin-top: 2em;
    margin-bottom: 0.5em;
    line-height: 1.3;
}

h1.menu-title {
    font-size: 1.75em;
    margin-top: 0;
}
h2 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--table-border);
    padding-bottom: 0.5em;
}
h3 {
    font-size: 1.25em;
}
h4 {
    font-size: 1em;
}

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
    font-family: "Geist Mono", "Fira Code", "JetBrains Mono", monospace;
    font-size: 0.875em;
}

strong {
    display: var(--order-display);
    font-weight: var(--order-weight);
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
section[aria-role="note"],
blockquote {
    background: var(--quote-block-bg);
    border: 1px solid var(--quote-block-border);
    margin: 1.5em 0;
    padding: 1rem 1.25rem;
    border-radius: 1rem;
}

:is(blockquote, section[aria-role="note"]) p {
    margin: 0;
}
:is(blockquote, section[aria-role="note"]) h1,
:is(blockquote, section[aria-role="note"]) h2,
:is(blockquote, section[aria-role="note"]) h3,
:is(blockquote, section[aria-role="note"]) h4,
:is(blockquote, section[aria-role="note"]) h5 {
    margin: 0;
    margin-bottom: 1em;
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

th,
td {
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
    box-shadow: var(--searchbar-shadow);
    border-radius: 8px;
    padding: 8px 12px;
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

div#mdbook-menu-bar,
div#mdbook-menu-bar-hover-placeholder {
    box-sizing: border-box;
    padding: 1rem 0;
}

div#mdbook-content,
div#content {
    max-height: calc(100vh - 80px);
    box-sizing: border-box;
    padding: 2rem 4rem;
    display: grid;
    grid-template-columns: var(--content-size) 28rem;
    justify-content: center;
    gap: 3rem;
    overflow-y: auto;
    scroll-behavior: smooth;
}

:is(div#mdbook-content, div#content) p {
    line-height: 1.75;
}

:is(div#mdbook-content, div#content) main {
    max-width: 100%;
    /*letter-spacing: 0.5px;*/
}

:is(div#mdbook-content, div#content) main a.header:hover,
:is(div#mdbook-content, div#content) main a {
    font-weight: 600;
    color: var(--text-color);
    border-bottom: 1px solid var(--text-color);
    text-decoration: none;
}
:is(div#mdbook-content, div#content) main a:hover {
    border-bottom-width: 2px;
}

:is(div#mdbook-content, div#content) main a.header {
    border-bottom: none;
}

/* Right Sidebar (TOC) */
.page-wrapper.has-right-sidebar {
    display: grid;
    grid-template-columns: auto 1fr 220px;
}

.right-sidebar {
    position: sticky;
    top: 60px;
    right: 0px;
    height: fit-content;
    max-height: calc(100vh - 8px);
    overflow-y: auto;
    border-left: 1px solid var(--table-border);
    background: var(--bg);
    margin-left: 2.5rem;
    padding-left: 1rem;
}

.right-sidebar-header {
    color: var(--sidebar-fg);
    margin-bottom: 12px;
    padding-left: 8px;
}

.right-sidebar-toc {
    list-style: none;
    padding: 0;
    margin: 0;
}

.right-sidebar-toc ol {
    list-style: none;
    padding-left: 12px;
    margin: 0;
}

.right-sidebar-toc li {
    margin: 0;
}

/* Adjust content width when right sidebar exists */
.page-wrapper.has-right-sidebar .content {
    max-width: 100%;
}

/* Hide right sidebar on small screens */
@media (max-width: 1100px) {
    .page-wrapper.has-right-sidebar {
        grid-template-columns: auto 1fr;
    }

    .right-sidebar {
        display: none;
    }
}
`,Y={matches:["<all_urls>"],runAt:"document_start",main(t){const e=["mintlify","mintlify-dark"],n=["light","rust","coal","navy","ayu"],r=[...e,...n];let o=!1,i=null;function c(){const a=document.head.childNodes;return Array.from(a||[]).filter(s=>s.nodeType===Node.COMMENT_NODE).some(s=>s.nodeValue?.trim().includes("Book generated using mdBook"))}function h(){const a=document.documentElement;for(const s of n)if(a.classList.contains(s))return s;return null}function l(a){return a==="mintlify"?G:null}function b(a){if(!a){i&&(i.remove(),i=null);return}i||(i=document.createElement("style"),i.id="mdbook-theme-extension",document.head.appendChild(i)),i.textContent=a}function p(a){const s=document.documentElement;if(e.includes(a))n.forEach(d=>s.classList.remove(d)),s.classList.add(a==="mintlify"?"light":"coal"),b(l(a));else{n.forEach(d=>s.classList.remove(d)),s.classList.add(a),b(null);try{localStorage.setItem("mdbook-theme",a)}catch{}}m.runtime.sendMessage({type:"themeChanged",theme:a}).catch(()=>{})}async function k(){try{const a=["mdbookTheme","enabled"],{mdbookTheme:s,enabled:u}=await m.storage.local.get(a);if(!u)return;const d=s||"mintlify";r.includes(d)&&p(d)}catch{p("mintlify")}}m.runtime.onMessage.addListener((a,s,u)=>{a.type==="setTheme"&&r.includes(a.theme)?p(a.theme):a.type==="getStatus"&&u({isMdBook:o,currentTheme:h()})});function x(a){if(!a)return;const s=document.createElement("nav");s.id="right-sidebar",s.className="right-sidebar";const u=document.createElement("div");u.className="right-sidebar-header",u.textContent="On this page",s.appendChild(u);const d=a.cloneNode(!0);return d.classList.add("right-sidebar-toc"),s.appendChild(d),a.style.display="none",s}function g(){o=c(),o&&(localStorage.setItem("enabled","false"),k(),W(t,{position:"inline",anchor:"div#mdbook-content",onMount:s=>{new MutationObserver((d,N)=>{const f=document.querySelector(".sidebar ol.chapter div.on-this-page > ol.section");if(f){const Q=x(f);s.append(Q),s.classList.add("has-right-sidebar"),N.disconnect()}}).observe(document.body,{childList:!0,subtree:!0})}}).autoMount())}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",g):g()}};class _ extends Event{constructor(e,n){super(_.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=n}static EVENT_NAME=I("wxt:locationchange")}function I(t){return`${m?.runtime?.id}:content:${t}`}function J(t){let e,n;return{run(){e==null&&(n=new URL(location.href),e=t.setInterval(()=>{let r=new URL(location.href);r.href!==n.href&&(window.dispatchEvent(new _(r,n)),n=r)},1e3))}}}class y{constructor(e,n){this.contentScriptName=e,this.options=n,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}static SCRIPT_STARTED_MESSAGE_TYPE=I("wxt:content-script-started");isTopFrame=window.self===window.top;abortController;locationWatcher=J(this);receivedMessageIds=new Set;get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return m.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,n){const r=setInterval(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearInterval(r)),r}setTimeout(e,n){const r=setTimeout(()=>{this.isValid&&e()},n);return this.onInvalidated(()=>clearTimeout(r)),r}requestAnimationFrame(e){const n=requestAnimationFrame((...r)=>{this.isValid&&e(...r)});return this.onInvalidated(()=>cancelAnimationFrame(n)),n}requestIdleCallback(e,n){const r=requestIdleCallback((...o)=>{this.signal.aborted||e(...o)},n);return this.onInvalidated(()=>cancelIdleCallback(r)),r}addEventListener(e,n,r,o){n==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),e.addEventListener?.(n.startsWith("wxt:")?I(n):n,r,{...o,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),L.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:y.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){const n=e.data?.type===y.SCRIPT_STARTED_MESSAGE_TYPE,r=e.data?.contentScriptName===this.contentScriptName,o=!this.receivedMessageIds.has(e.data?.messageId);return n&&r&&o}listenForNewerScripts(e){let n=!0;const r=o=>{if(this.verifyScriptStartedEvent(o)){this.receivedMessageIds.add(o.data.messageId);const i=n;if(n=!1,i&&e?.ignoreFirstEvent)return;this.notifyInvalidated()}};addEventListener("message",r),this.onInvalidated(()=>removeEventListener("message",r))}}function ne(){}function w(t,...e){}const X={debug:(...t)=>w(console.debug,...t),log:(...t)=>w(console.log,...t),warn:(...t)=>w(console.warn,...t),error:(...t)=>w(console.error,...t)};return(async()=>{try{const{main:t,...e}=Y,n=new y("content",e);return await t(n)}catch(t){throw X.error('The content script "content" crashed on startup!',t),t}})()})();
content;