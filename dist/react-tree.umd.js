var __defProp=Object.defineProperty,__defProps=Object.defineProperties,__getOwnPropDescs=Object.getOwnPropertyDescriptors,__getOwnPropSymbols=Object.getOwnPropertySymbols,__hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable,__defNormalProp=(e,t,r)=>t in e?__defProp(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,__spreadValues=(e,t)=>{for(var r in t||(t={}))__hasOwnProp.call(t,r)&&__defNormalProp(e,r,t[r]);if(__getOwnPropSymbols)for(var r of __getOwnPropSymbols(t))__propIsEnum.call(t,r)&&__defNormalProp(e,r,t[r]);return e},__spreadProps=(e,t)=>__defProps(e,__getOwnPropDescs(t)),__objRest=(e,t)=>{var r={};for(var n in e)__hasOwnProp.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&__getOwnPropSymbols)for(var n of __getOwnPropSymbols(e))t.indexOf(n)<0&&__propIsEnum.call(e,n)&&(r[n]=e[n]);return r};!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("react")):"function"==typeof define&&define.amd?define(["react"],t):(e="undefined"!=typeof globalThis?globalThis:e||self).ReactTree=t(e.React)}(this,(function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var r=t(e);const n=e.createContext({selected:null,focused:null,expanded:[],onItemSelect(){},renderLabel(){}});n.displayName="TreeContext";const o=t=>{const{selected:a,focused:l,expanded:d,onItemSelect:s,renderLabel:i}=e.useContext(n),c=t.nodes.length>0,p=c?d.includes(t.id):null;return r.default.createElement("li",{role:"treeitem",tabIndex:l===t.id?0:-1,"aria-expanded":p,"aria-selected":a===t.id||null,"data-id":`treeitem-${t.id}`},"function"==typeof i?i(__spreadValues({isExpanded:p,isExpandable:c,toggleItem(){s(t.id,c)}},t)):r.default.createElement("div",{onClick:()=>s(t.id,c)},t.label),p&&c&&r.default.createElement("ul",{role:"group"},t.nodes.map((e=>r.default.createElement(o,__spreadProps(__spreadValues({},e),{key:e.id}))))))},a=(e,t)=>{const r=[];for(const n of e)r.push(n),t.includes(n.id)&&r.push(...a(n.nodes,t));return r};return function(t){var l=t,{nodes:d,selected:s,focused:i,onFocusChange:c,expanded:p,onExpandChange:u,onSelect:f,renderLabel:_}=l,m=__objRest(l,["nodes","selected","focused","onFocusChange","expanded","onExpandChange","onSelect","renderLabel"]);const b=e.useRef(null),y=(e,t)=>{t&&u(p.includes(e)?p.filter((t=>t!==e)):p.concat(e)),c(e),f(e)},x=e=>{const t=a(d,p),r=t.findIndex((e=>e.id===i));let n=e?0:1;r>-1&&(n=e?r-1:r+1);const o=t[n];if(o){c(o.id);const e=b.current.querySelector(`[data-id="treeitem-${o.id}"]`);e.focus(),e.firstElementChild.scrollIntoView({block:"center"})}},P=e=>{const t=b.current.querySelector(`[data-id="treeitem-${e}"]`);return{treeItem:t,isExpandable:t.hasAttribute("aria-expanded"),isExpanded:"true"===t.getAttribute("aria-expanded")}},E=e=>{if(e){e.focus(),e.firstElementChild.scrollIntoView({block:"center"});const t=e.dataset.id.replace("treeitem-","");c(t)}};return r.default.createElement(n.Provider,{value:{selected:s,focused:i,expanded:p,onItemSelect:y,renderLabel:_}},r.default.createElement("ul",__spreadProps(__spreadValues({ref:b,role:"tree"},m),{onKeyDown:e=>{if(d.length&&!e.altKey&&!e.ctrlKey&&!e.metaKey)if("ArrowUp"===e.key)e.preventDefault(),x(!0);else if("ArrowDown"===e.key)e.preventDefault(),x(!1);else if("ArrowLeft"===e.key){e.preventDefault();const{treeItem:t,isExpandable:r,isExpanded:n}=P(i);r&&n?u(p.filter((e=>e!==i))):E(t.closest('[role="treeitem"]:not([tabindex="0"])'))}else if("ArrowRight"===e.key){e.preventDefault();const{treeItem:t,isExpandable:r,isExpanded:n}=P(i);r&&(n?E(t.querySelector('[role="treeitem"]')):u(p.concat(i)))}else if("Enter"===e.key||" "===e.key){e.preventDefault();const t=b.current.querySelector(`[data-id="treeitem-${i}"]`).hasAttribute("aria-expanded");y(i,t)}}}),d.map((e=>r.default.createElement(o,__spreadProps(__spreadValues({},e),{key:e.id}))))))}}));