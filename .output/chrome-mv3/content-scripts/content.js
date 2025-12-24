var content=(function(){"use strict";function nn(t){return t}const g=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,N=Symbol("null");let O=0;class K extends Map{constructor(){super(),this._objectHashes=new WeakMap,this._symbolHashes=new Map,this._publicKeys=new Map;const[n]=arguments;if(n!=null){if(typeof n[Symbol.iterator]!="function")throw new TypeError(typeof n+" is not iterable (cannot read property Symbol(Symbol.iterator))");for(const[e,r]of n)this.set(e,r)}}_getPublicKeys(n,e=!1){if(!Array.isArray(n))throw new TypeError("The keys parameter must be an array");const r=this._getPrivateKey(n,e);let o;return r&&this._publicKeys.has(r)?o=this._publicKeys.get(r):e&&(o=[...n],this._publicKeys.set(r,o)),{privateKey:r,publicKey:o}}_getPrivateKey(n,e=!1){const r=[];for(let o of n){o===null&&(o=N);const a=typeof o=="object"||typeof o=="function"?"_objectHashes":typeof o=="symbol"?"_symbolHashes":!1;if(!a)r.push(o);else if(this[a].has(o))r.push(this[a].get(o));else if(e){const d=`@@mkm-ref-${O++}@@`;this[a].set(o,d),r.push(d)}else return!1}return JSON.stringify(r)}set(n,e){const{publicKey:r}=this._getPublicKeys(n,!0);return super.set(r,e)}get(n){const{publicKey:e}=this._getPublicKeys(n);return super.get(e)}has(n){const{publicKey:e}=this._getPublicKeys(n);return super.has(e)}delete(n){const{publicKey:e,privateKey:r}=this._getPublicKeys(n);return!!(e&&super.delete(e)&&this._publicKeys.delete(r))}clear(){super.clear(),this._symbolHashes.clear(),this._publicKeys.clear()}get[Symbol.toStringTag](){return"ManyKeysMap"}get size(){return super.size}}function S(t){if(t===null||typeof t!="object")return!1;const n=Object.getPrototypeOf(t);return n!==null&&n!==Object.prototype&&Object.getPrototypeOf(n)!==null||Symbol.iterator in t?!1:Symbol.toStringTag in t?Object.prototype.toString.call(t)==="[object Module]":!0}function E(t,n,e=".",r){if(!S(n))return E(t,{},e,r);const o=Object.assign({},n);for(const a in t){if(a==="__proto__"||a==="constructor")continue;const d=t[a];d!=null&&(r&&r(o,a,d,e)||(Array.isArray(d)&&Array.isArray(o[a])?o[a]=[...d,...o[a]]:S(d)&&S(o[a])?o[a]=E(d,o[a],(e?`${e}.`:"")+a.toString(),r):o[a]=d))}return o}function q(t){return(...n)=>n.reduce((e,r)=>E(e,r,"",t),{})}const z=q(),C=t=>t!==null?{isDetected:!0,result:t}:{isDetected:!1},R=t=>t===null?{isDetected:!0,result:null}:{isDetected:!1},D=()=>({target:globalThis.document,unifyProcess:!0,detector:C,observeConfigs:{childList:!0,subtree:!0,attributes:!0},signal:void 0,customMatcher:void 0}),F=(t,n)=>z(t,n),M=new K;function B(t){const{defaultOptions:n}=t;return(e,r)=>{const{target:o,unifyProcess:a,observeConfigs:d,detector:h,signal:l,customMatcher:u}=F(r,n),p=[e,o,a,d,h,l,u],w=M.get(p);if(a&&w)return w;const k=new Promise(async(m,i)=>{if(l?.aborted)return i(l.reason);const s=new MutationObserver(async b=>{for(const L of b){if(l?.aborted){s.disconnect();break}const f=await A({selector:e,target:o,detector:h,customMatcher:u});if(f.isDetected){s.disconnect(),m(f.result);break}}});l?.addEventListener("abort",()=>(s.disconnect(),i(l.reason)),{once:!0});const c=await A({selector:e,target:o,detector:h,customMatcher:u});if(c.isDetected)return m(c.result);s.observe(o,d)}).finally(()=>{M.delete(p)});return M.set(p,k),k}}async function A({target:t,selector:n,detector:e,customMatcher:r}){const o=r?r(n):t.querySelector(n);return await e(o)}const U=B({defaultOptions:D()});function v(t,...n){}const P={debug:(...t)=>v(console.debug,...t),log:(...t)=>v(console.log,...t),warn:(...t)=>v(console.warn,...t),error:(...t)=>v(console.error,...t)};function j(t,n,e){e.position!=="inline"&&(e.zIndex!=null&&(t.style.zIndex=String(e.zIndex)),t.style.overflow="visible",t.style.position="relative",t.style.width="0",t.style.height="0",t.style.display="block")}function T(t){if(t.anchor==null)return document.body;let n=typeof t.anchor=="function"?t.anchor():t.anchor;return typeof n=="string"?n.startsWith("/")?document.evaluate(n,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue??void 0:document.querySelector(n)??void 0:n??void 0}function $(t,n){const e=T(n);if(e==null)throw Error("Failed to mount content script UI: could not find anchor element");switch(n.append){case void 0:case"last":e.append(t);break;case"first":e.prepend(t);break;case"replace":e.replaceWith(t);break;case"after":e.parentElement?.insertBefore(t,e.nextElementSibling);break;case"before":e.parentElement?.insertBefore(t,e);break;default:n.append(e,t);break}}function H(t,n){let e;const r=()=>{e?.stopAutoMount(),e=void 0},o=()=>{t.mount()},a=t.remove;return{mount:o,remove:()=>{r(),t.remove()},autoMount:l=>{e&&P.warn("autoMount is already set."),e=V({mount:o,unmount:a,stopAutoMount:r},{...n,...l})}}}function V(t,n){const e=new AbortController,r="explicit_stop_auto_mount",o=()=>{e.abort(r),n.onStop?.()};let a=typeof n.anchor=="function"?n.anchor():n.anchor;if(a instanceof Element)throw Error("autoMount and Element anchor option cannot be combined. Avoid passing `Element` directly or `() => Element` to the anchor.");async function d(h){let l=!!T(n);for(l&&t.mount();!e.signal.aborted;)try{l=!!await U(h??"body",{customMatcher:()=>T(n)??null,detector:l?R:C,signal:e.signal}),l?t.mount():(t.unmount(),n.once&&t.stopAutoMount())}catch(u){if(e.signal.aborted&&e.signal.reason===r)break;throw u}}return d(a),{stopAutoMount:o}}function W(t,n){const e=document.createElement(n.tag||"div");let r;const o=()=>{j(e,void 0,n),$(e,n),r=n.onMount?.(e)},a=()=>{n.onRemove?.(r),e.replaceChildren(),e.remove(),r=void 0},d=H({mount:o,remove:a},n);return t.onInvalidated(a),{get mounted(){return r},wrapper:e,...d}}const G=`/* Mintlify-inspired Light Theme for mdBook */
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
    --order-weight: 400;
    --order-display: none;
    --chapter-nav-display: none;
    --sidebar-text-size: 16px;
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
    color: var(--fg);
    scroll-behavior: smooth;
}

body {
    background: var(--bg);
    color: var(--fg);
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

span.chapter-link-wrapper a {
    display: block;
    width: 100%;
    height: 100%;
}
span.chapter-link-wrapper {
    cursor: pointer;
    color: var(--sidebar-fg);
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.15s ease;
    font-size: var(--sidebar-text-size);
}

/*.sidebar ol.chapter > li.chapter-item > span.chapter-link-wrapper {
    font-weight: bold;
}*/

/*.sidebar ol.chapter li .chapter-item.expanded > a,*/
span.chapter-link-wrapper:has(a.active),
span.chapter-link-wrapper:hover {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active);
    text-decoration: none;
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

h1 {
    font-size: 2.25rem;
    margin-top: 0;
}
h2 {
    font-size: 1.75rem;
    border-bottom: 1px solid var(--table-border);
    padding-bottom: 0.5rem;
}
h3 {
    font-size: 1.375rem;
}
h4 {
    font-size: 1.125rem;
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

#mdbook-content {
    max-width: 100%;
    padding: 4rem;
    display: grid;
    grid-template-columns: 1fr 36rem;
    gap: 3rem;
}

/* Right Sidebar (TOC) */
.page-wrapper.has-right-sidebar {
    display: grid;
    grid-template-columns: auto 1fr 220px;
}

.right-sidebar {
    top: 60px;
    right: 0px;
    height: fit-content;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    border-left: 1px solid var(--table-border);
    background: var(--bg);
    margin-left: 2.5rem;
    padding-left: 1rem;
}

.right-sidebar-header {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
`,Y=`/* Mintlify-inspired Dark Theme for mdBook */
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

/* Right Sidebar (TOC) */
.page-wrapper.has-right-sidebar {
  display: grid;
  grid-template-columns: auto 1fr 220px;
}

.right-sidebar {
  position: sticky;
  top: 60px;
  height: fit-content;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  padding: 24px 16px;
  border-left: 1px solid var(--table-border);
  background: var(--bg);
}

.right-sidebar-header {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.right-sidebar-toc li a {
  display: block;
  padding: 6px 8px;
  font-size: 13px;
  color: var(--sidebar-fg);
  border-radius: 4px;
  transition: all 0.15s ease;
  border-left: 2px solid transparent;
}

.right-sidebar-toc li a:hover {
  color: var(--sidebar-active);
  background: var(--sidebar-active-bg);
  text-decoration: none;
}

.right-sidebar-toc li a.active {
  color: var(--sidebar-active);
  border-left-color: var(--sidebar-active);
  background: var(--sidebar-active-bg);
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
`,J={matches:["<all_urls>"],runAt:"document_start",main(t){const n=["mintlify","mintlify-dark"],e=["light","rust","coal","navy","ayu"],r=[...n,...e];let o=!1,a=null;function d(){const i=document.head.childNodes;return Array.from(i||[]).filter(s=>s.nodeType===Node.COMMENT_NODE).some(s=>s.nodeValue?.trim().includes("Book generated using mdBook"))}function h(){const i=document.documentElement;for(const s of e)if(i.classList.contains(s))return s;return null}function l(i){switch(i){case"mintlify":return G;case"mintlify-dark":return Y;default:return null}}function u(i){if(!i){a&&(a.remove(),a=null);return}a||(a=document.createElement("style"),a.id="mdbook-theme-extension",document.head.appendChild(a)),a.textContent=i}function p(i){const s=document.documentElement;if(n.includes(i))e.forEach(b=>s.classList.remove(b)),s.classList.add(i==="mintlify"?"light":"coal"),u(l(i));else{e.forEach(b=>s.classList.remove(b)),s.classList.add(i),u(null);try{localStorage.setItem("mdbook-theme",i)}catch{}}g.runtime.sendMessage({type:"themeChanged",theme:i}).catch(()=>{})}async function w(){try{const i=["mdbookTheme","enabled"],{mdbookTheme:s}=await g.storage.local.get(i),c=s||"mintlify";r.includes(c)&&p(c)}catch{p("mintlify")}}g.runtime.onMessage.addListener(i=>{if(i.type==="setTheme"&&r.includes(i.theme))p(i.theme);else if(i.type==="getStatus")return Promise.resolve({isMdBook:o,currentTheme:h()})});function k(i){if(!i)return;const s=document.createElement("nav");s.id="right-sidebar",s.className="right-sidebar";const c=document.createElement("div");c.className="right-sidebar-header",c.textContent="On this page",s.appendChild(c);const b=i.cloneNode(!0);return b.classList.add("right-sidebar-toc"),s.appendChild(b),i.style.display="none",s}function m(){o=d(),o&&(localStorage.setItem("enabled","true"),w(),W(t,{position:"inline",anchor:"div#mdbook-content",onMount:s=>{new MutationObserver((b,L)=>{const f=document.querySelector(".sidebar ol.chapter div.on-this-page > ol.section");if(f){const Z=k(f);s.append(Z),s.classList.add("has-right-sidebar"),L.disconnect()}}).observe(document.body,{childList:!0,subtree:!0})}}).autoMount())}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",m):m()}};class _ extends Event{constructor(n,e){super(_.EVENT_NAME,{}),this.newUrl=n,this.oldUrl=e}static EVENT_NAME=I("wxt:locationchange")}function I(t){return`${g?.runtime?.id}:content:${t}`}function X(t){let n,e;return{run(){n==null&&(e=new URL(location.href),n=t.setInterval(()=>{let r=new URL(location.href);r.href!==e.href&&(window.dispatchEvent(new _(r,e)),e=r)},1e3))}}}class y{constructor(n,e){this.contentScriptName=n,this.options=e,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}static SCRIPT_STARTED_MESSAGE_TYPE=I("wxt:content-script-started");isTopFrame=window.self===window.top;abortController;locationWatcher=X(this);receivedMessageIds=new Set;get signal(){return this.abortController.signal}abort(n){return this.abortController.abort(n)}get isInvalid(){return g.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(n){return this.signal.addEventListener("abort",n),()=>this.signal.removeEventListener("abort",n)}block(){return new Promise(()=>{})}setInterval(n,e){const r=setInterval(()=>{this.isValid&&n()},e);return this.onInvalidated(()=>clearInterval(r)),r}setTimeout(n,e){const r=setTimeout(()=>{this.isValid&&n()},e);return this.onInvalidated(()=>clearTimeout(r)),r}requestAnimationFrame(n){const e=requestAnimationFrame((...r)=>{this.isValid&&n(...r)});return this.onInvalidated(()=>cancelAnimationFrame(e)),e}requestIdleCallback(n,e){const r=requestIdleCallback((...o)=>{this.signal.aborted||n(...o)},e);return this.onInvalidated(()=>cancelIdleCallback(r)),r}addEventListener(n,e,r,o){e==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),n.addEventListener?.(e.startsWith("wxt:")?I(e):e,r,{...o,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),P.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:y.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(n){const e=n.data?.type===y.SCRIPT_STARTED_MESSAGE_TYPE,r=n.data?.contentScriptName===this.contentScriptName,o=!this.receivedMessageIds.has(n.data?.messageId);return e&&r&&o}listenForNewerScripts(n){let e=!0;const r=o=>{if(this.verifyScriptStartedEvent(o)){this.receivedMessageIds.add(o.data.messageId);const a=e;if(e=!1,a&&n?.ignoreFirstEvent)return;this.notifyInvalidated()}};addEventListener("message",r),this.onInvalidated(()=>removeEventListener("message",r))}}function tn(){}function x(t,...n){}const Q={debug:(...t)=>x(console.debug,...t),log:(...t)=>x(console.log,...t),warn:(...t)=>x(console.warn,...t),error:(...t)=>x(console.error,...t)};return(async()=>{try{const{main:t,...n}=J,e=new y("content",n);return await t(e)}catch(t){throw Q.error('The content script "content" crashed on startup!',t),t}})()})();
content;