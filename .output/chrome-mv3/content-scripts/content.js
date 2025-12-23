var content=(function(){"use strict";function I(r){return r}const s=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,f=`/* Mintlify-inspired Light Theme for mdBook */
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
`,x=`/* Mintlify-inspired Dark Theme for mdBook */
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
`,k={matches:["<all_urls>"],runAt:"document_start",main(){const r=["mintlify","mintlify-dark"],n=["light","rust","coal","navy","ayu"],e=[...r,...n];let t=!1,a=null;function m(){const o=document.head.childNodes;return Array.from(o||[]).filter(i=>i.nodeType===Node.COMMENT_NODE).some(i=>i.nodeValue?.trim().includes("Book generated using mdBook"))}function T(){const o=document.documentElement;for(const i of n)if(o.classList.contains(i))return i;return null}function E(o){switch(o){case"mintlify":return f;case"mintlify-dark":return x;default:return null}}function u(o){if(!o){a&&(a.remove(),a=null);return}a||(a=document.createElement("style"),a.id="mdbook-theme-extension",document.head.appendChild(a)),a.textContent=o}function p(o){const i=document.documentElement;if(r.includes(o))n.forEach(b=>i.classList.remove(b)),i.classList.add(o==="mintlify"?"light":"coal"),u(E(o));else{n.forEach(b=>i.classList.remove(b)),i.classList.add(o),u(null);try{localStorage.setItem("mdbook-theme",o)}catch{}}s.runtime.sendMessage({type:"themeChanged",theme:o}).catch(()=>{})}async function M(){try{const o=await s.storage.local.get(["mdbookTheme","enabled"]);if(o.enabled===!1)return;const i=o.mdbookTheme||"mintlify";e.includes(i)&&p(i)}catch{p("mintlify")}}s.runtime.onMessage.addListener(o=>{if(o.type==="setTheme"&&e.includes(o.theme))p(o.theme);else if(o.type==="getStatus")return Promise.resolve({isMdBook:t,currentTheme:T()})});function v(){t=m(),t&&M()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",v):v()}};function d(r,...n){}const w={debug:(...r)=>d(console.debug,...r),log:(...r)=>d(console.log,...r),warn:(...r)=>d(console.warn,...r),error:(...r)=>d(console.error,...r)};class h extends Event{constructor(n,e){super(h.EVENT_NAME,{}),this.newUrl=n,this.oldUrl=e}static EVENT_NAME=g("wxt:locationchange")}function g(r){return`${s?.runtime?.id}:content:${r}`}function S(r){let n,e;return{run(){n==null&&(e=new URL(location.href),n=r.setInterval(()=>{let t=new URL(location.href);t.href!==e.href&&(window.dispatchEvent(new h(t,e)),e=t)},1e3))}}}class l{constructor(n,e){this.contentScriptName=n,this.options=e,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}static SCRIPT_STARTED_MESSAGE_TYPE=g("wxt:content-script-started");isTopFrame=window.self===window.top;abortController;locationWatcher=S(this);receivedMessageIds=new Set;get signal(){return this.abortController.signal}abort(n){return this.abortController.abort(n)}get isInvalid(){return s.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(n){return this.signal.addEventListener("abort",n),()=>this.signal.removeEventListener("abort",n)}block(){return new Promise(()=>{})}setInterval(n,e){const t=setInterval(()=>{this.isValid&&n()},e);return this.onInvalidated(()=>clearInterval(t)),t}setTimeout(n,e){const t=setTimeout(()=>{this.isValid&&n()},e);return this.onInvalidated(()=>clearTimeout(t)),t}requestAnimationFrame(n){const e=requestAnimationFrame((...t)=>{this.isValid&&n(...t)});return this.onInvalidated(()=>cancelAnimationFrame(e)),e}requestIdleCallback(n,e){const t=requestIdleCallback((...a)=>{this.signal.aborted||n(...a)},e);return this.onInvalidated(()=>cancelIdleCallback(t)),t}addEventListener(n,e,t,a){e==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),n.addEventListener?.(e.startsWith("wxt:")?g(e):e,t,{...a,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),w.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:l.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(n){const e=n.data?.type===l.SCRIPT_STARTED_MESSAGE_TYPE,t=n.data?.contentScriptName===this.contentScriptName,a=!this.receivedMessageIds.has(n.data?.messageId);return e&&t&&a}listenForNewerScripts(n){let e=!0;const t=a=>{if(this.verifyScriptStartedEvent(a)){this.receivedMessageIds.add(a.data.messageId);const m=e;if(e=!1,m&&n?.ignoreFirstEvent)return;this.notifyInvalidated()}};addEventListener("message",t),this.onInvalidated(()=>removeEventListener("message",t))}}function L(){}function c(r,...n){}const y={debug:(...r)=>c(console.debug,...r),log:(...r)=>c(console.log,...r),warn:(...r)=>c(console.warn,...r),error:(...r)=>c(console.error,...r)};return(async()=>{try{const{main:r,...n}=k,e=new l("content",n);return await r(e)}catch(r){throw y.error('The content script "content" crashed on startup!',r),r}})()})();
content;