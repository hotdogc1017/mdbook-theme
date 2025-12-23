var content=(function(){"use strict";function I(t){return t}const s=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,f={matches:["<all_urls>"],runAt:"document_start",main(){const t=["mintlify","mintlify-dark"],e=["light","rust","coal","navy","ayu"],r=[...t,...e];let o=!1,i=null;function m(){return document.documentElement.outerHTML.includes("<!-- Book generated using mdBook -->")}function S(){const a=document.documentElement;for(const n of e)if(a.classList.contains(n))return n;return null}const y=`
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
    `,T=`
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
    `;function E(a){switch(a){case"mintlify":return y;case"mintlify-dark":return T;default:return null}}function p(a){if(!a){i&&(i.remove(),i=null);return}i||(i=document.createElement("style"),i.id="mdbook-theme-extension",document.head.appendChild(i)),i.textContent=a}function u(a){const n=document.documentElement;if(t.includes(a))e.forEach(b=>n.classList.remove(b)),n.classList.add(a==="mintlify"?"light":"coal"),p(E(a));else{e.forEach(b=>n.classList.remove(b)),n.classList.add(a),p(null);try{localStorage.setItem("mdbook-theme",a)}catch{}}s.runtime.sendMessage({type:"themeChanged",theme:a}).catch(()=>{})}async function M(){try{const a=await s.storage.local.get(["mdbookTheme","enabled"]);if(a.enabled===!1)return;const n=a.mdbookTheme||"mintlify";r.includes(n)&&u(n)}catch{u("mintlify")}}s.runtime.onMessage.addListener(a=>{if(a.type==="setTheme"&&r.includes(a.theme))u(a.theme);else if(a.type==="getStatus")return Promise.resolve({isMdBook:o,currentTheme:S()})});function v(){o=m(),o&&M()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",v):v()}};function d(t,...e){}const x={debug:(...t)=>d(console.debug,...t),log:(...t)=>d(console.log,...t),warn:(...t)=>d(console.warn,...t),error:(...t)=>d(console.error,...t)};class h extends Event{constructor(e,r){super(h.EVENT_NAME,{}),this.newUrl=e,this.oldUrl=r}static EVENT_NAME=g("wxt:locationchange")}function g(t){return`${s?.runtime?.id}:content:${t}`}function k(t){let e,r;return{run(){e==null&&(r=new URL(location.href),e=t.setInterval(()=>{let o=new URL(location.href);o.href!==r.href&&(window.dispatchEvent(new h(o,r)),r=o)},1e3))}}}class l{constructor(e,r){this.contentScriptName=e,this.options=r,this.abortController=new AbortController,this.isTopFrame?(this.listenForNewerScripts({ignoreFirstEvent:!0}),this.stopOldScripts()):this.listenForNewerScripts()}static SCRIPT_STARTED_MESSAGE_TYPE=g("wxt:content-script-started");isTopFrame=window.self===window.top;abortController;locationWatcher=k(this);receivedMessageIds=new Set;get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return s.runtime.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener("abort",e),()=>this.signal.removeEventListener("abort",e)}block(){return new Promise(()=>{})}setInterval(e,r){const o=setInterval(()=>{this.isValid&&e()},r);return this.onInvalidated(()=>clearInterval(o)),o}setTimeout(e,r){const o=setTimeout(()=>{this.isValid&&e()},r);return this.onInvalidated(()=>clearTimeout(o)),o}requestAnimationFrame(e){const r=requestAnimationFrame((...o)=>{this.isValid&&e(...o)});return this.onInvalidated(()=>cancelAnimationFrame(r)),r}requestIdleCallback(e,r){const o=requestIdleCallback((...i)=>{this.signal.aborted||e(...i)},r);return this.onInvalidated(()=>cancelIdleCallback(o)),o}addEventListener(e,r,o,i){r==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),e.addEventListener?.(r.startsWith("wxt:")?g(r):r,o,{...i,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),x.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){window.postMessage({type:l.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:Math.random().toString(36).slice(2)},"*")}verifyScriptStartedEvent(e){const r=e.data?.type===l.SCRIPT_STARTED_MESSAGE_TYPE,o=e.data?.contentScriptName===this.contentScriptName,i=!this.receivedMessageIds.has(e.data?.messageId);return r&&o&&i}listenForNewerScripts(e){let r=!0;const o=i=>{if(this.verifyScriptStartedEvent(i)){this.receivedMessageIds.add(i.data.messageId);const m=r;if(r=!1,m&&e?.ignoreFirstEvent)return;this.notifyInvalidated()}};addEventListener("message",o),this.onInvalidated(()=>removeEventListener("message",o))}}function L(){}function c(t,...e){}const w={debug:(...t)=>c(console.debug,...t),log:(...t)=>c(console.log,...t),warn:(...t)=>c(console.warn,...t),error:(...t)=>c(console.error,...t)};return(async()=>{try{const{main:t,...e}=f,r=new l("content",e);return await t(r)}catch(t){throw w.error('The content script "content" crashed on startup!',t),t}})()})();
content;