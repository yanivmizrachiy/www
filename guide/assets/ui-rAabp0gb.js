import{r as Ct}from"./vendor-DbHggdX7.js";function gt(e,t){for(var r=0;r<t.length;r++){const n=t[r];if(typeof n!="string"&&!Array.isArray(n)){for(const o in n)if(o!=="default"&&!(o in e)){const a=Object.getOwnPropertyDescriptor(n,o);a&&Object.defineProperty(e,o,a.get?a:{enumerable:!0,get:()=>n[o]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}function bt(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var _e={exports:{}},Z={},Se={exports:{}},v={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var V=Symbol.for("react.element"),Mt=Symbol.for("react.portal"),wt=Symbol.for("react.fragment"),_t=Symbol.for("react.strict_mode"),St=Symbol.for("react.profiler"),Rt=Symbol.for("react.provider"),At=Symbol.for("react.context"),It=Symbol.for("react.forward_ref"),Et=Symbol.for("react.suspense"),jt=Symbol.for("react.memo"),Tt=Symbol.for("react.lazy"),Ce=Symbol.iterator;function Pt(e){return e===null||typeof e!="object"?null:(e=Ce&&e[Ce]||e["@@iterator"],typeof e=="function"?e:null)}var Re={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Ae=Object.assign,Ie={};function L(e,t,r){this.props=e,this.context=t,this.refs=Ie,this.updater=r||Re}L.prototype.isReactComponent={};L.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};L.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Ee(){}Ee.prototype=L.prototype;function se(e,t,r){this.props=e,this.context=t,this.refs=Ie,this.updater=r||Re}var ce=se.prototype=new Ee;ce.constructor=se;Ae(ce,L.prototype);ce.isPureReactComponent=!0;var ge=Array.isArray,je=Object.prototype.hasOwnProperty,ie={current:null},Te={key:!0,ref:!0,__self:!0,__source:!0};function Pe(e,t,r){var n,o={},a=null,s=null;if(t!=null)for(n in t.ref!==void 0&&(s=t.ref),t.key!==void 0&&(a=""+t.key),t)je.call(t,n)&&!Te.hasOwnProperty(n)&&(o[n]=t[n]);var c=arguments.length-2;if(c===1)o.children=r;else if(1<c){for(var l=Array(c),u=0;u<c;u++)l[u]=arguments[u+2];o.children=l}if(e&&e.defaultProps)for(n in c=e.defaultProps,c)o[n]===void 0&&(o[n]=c[n]);return{$$typeof:V,type:e,key:a,ref:s,props:o,_owner:ie.current}}function Nt(e,t){return{$$typeof:V,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function le(e){return typeof e=="object"&&e!==null&&e.$$typeof===V}function Ot(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(r){return t[r]})}var be=/\/+/g;function ne(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Ot(""+e.key):t.toString(36)}function G(e,t,r,n,o){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(a){case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case V:case Mt:s=!0}}if(s)return s=e,o=o(s),e=n===""?"."+ne(s,0):n,ge(o)?(r="",e!=null&&(r=e.replace(be,"$&/")+"/"),G(o,t,r,"",function(u){return u})):o!=null&&(le(o)&&(o=Nt(o,r+(!o.key||s&&s.key===o.key?"":(""+o.key).replace(be,"$&/")+"/")+e)),t.push(o)),1;if(s=0,n=n===""?".":n+":",ge(e))for(var c=0;c<e.length;c++){a=e[c];var l=n+ne(a,c);s+=G(a,t,r,l,o)}else if(l=Pt(e),typeof l=="function")for(e=l.call(e),c=0;!(a=e.next()).done;)a=a.value,l=n+ne(a,c++),s+=G(a,t,r,l,o);else if(a==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return s}function U(e,t,r){if(e==null)return e;var n=[],o=0;return G(e,n,"","",function(a){return t.call(r,a,o++)}),n}function Lt(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(r){(e._status===0||e._status===-1)&&(e._status=1,e._result=r)},function(r){(e._status===0||e._status===-1)&&(e._status=2,e._result=r)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var R={current:null},W={transition:null},Ft={ReactCurrentDispatcher:R,ReactCurrentBatchConfig:W,ReactCurrentOwner:ie};function Ne(){throw Error("act(...) is not supported in production builds of React.")}v.Children={map:U,forEach:function(e,t,r){U(e,function(){t.apply(this,arguments)},r)},count:function(e){var t=0;return U(e,function(){t++}),t},toArray:function(e){return U(e,function(t){return t})||[]},only:function(e){if(!le(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};v.Component=L;v.Fragment=wt;v.Profiler=St;v.PureComponent=se;v.StrictMode=_t;v.Suspense=Et;v.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Ft;v.act=Ne;v.cloneElement=function(e,t,r){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var n=Ae({},e.props),o=e.key,a=e.ref,s=e._owner;if(t!=null){if(t.ref!==void 0&&(a=t.ref,s=ie.current),t.key!==void 0&&(o=""+t.key),e.type&&e.type.defaultProps)var c=e.type.defaultProps;for(l in t)je.call(t,l)&&!Te.hasOwnProperty(l)&&(n[l]=t[l]===void 0&&c!==void 0?c[l]:t[l])}var l=arguments.length-2;if(l===1)n.children=r;else if(1<l){c=Array(l);for(var u=0;u<l;u++)c[u]=arguments[u+2];n.children=c}return{$$typeof:V,type:e.type,key:o,ref:a,props:n,_owner:s}};v.createContext=function(e){return e={$$typeof:At,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Rt,_context:e},e.Consumer=e};v.createElement=Pe;v.createFactory=function(e){var t=Pe.bind(null,e);return t.type=e,t};v.createRef=function(){return{current:null}};v.forwardRef=function(e){return{$$typeof:It,render:e}};v.isValidElement=le;v.lazy=function(e){return{$$typeof:Tt,_payload:{_status:-1,_result:e},_init:Lt}};v.memo=function(e,t){return{$$typeof:jt,type:e,compare:t===void 0?null:t}};v.startTransition=function(e){var t=W.transition;W.transition={};try{e()}finally{W.transition=t}};v.unstable_act=Ne;v.useCallback=function(e,t){return R.current.useCallback(e,t)};v.useContext=function(e){return R.current.useContext(e)};v.useDebugValue=function(){};v.useDeferredValue=function(e){return R.current.useDeferredValue(e)};v.useEffect=function(e,t){return R.current.useEffect(e,t)};v.useId=function(){return R.current.useId()};v.useImperativeHandle=function(e,t,r){return R.current.useImperativeHandle(e,t,r)};v.useInsertionEffect=function(e,t){return R.current.useInsertionEffect(e,t)};v.useLayoutEffect=function(e,t){return R.current.useLayoutEffect(e,t)};v.useMemo=function(e,t){return R.current.useMemo(e,t)};v.useReducer=function(e,t,r){return R.current.useReducer(e,t,r)};v.useRef=function(e){return R.current.useRef(e)};v.useState=function(e){return R.current.useState(e)};v.useSyncExternalStore=function(e,t,r){return R.current.useSyncExternalStore(e,t,r)};v.useTransition=function(){return R.current.useTransition()};v.version="18.3.1";Se.exports=v;var i=Se.exports;const M=bt(i),Oe=gt({__proto__:null,default:M},[i]);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var $t=i,Dt=Symbol.for("react.element"),Vt=Symbol.for("react.fragment"),zt=Object.prototype.hasOwnProperty,qt=$t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Ht={key:!0,ref:!0,__self:!0,__source:!0};function Le(e,t,r){var n,o={},a=null,s=null;r!==void 0&&(a=""+r),t.key!==void 0&&(a=""+t.key),t.ref!==void 0&&(s=t.ref);for(n in t)zt.call(t,n)&&!Ht.hasOwnProperty(n)&&(o[n]=t[n]);if(e&&e.defaultProps)for(n in t=e.defaultProps,t)o[n]===void 0&&(o[n]=t[n]);return{$$typeof:Dt,type:e,key:a,ref:s,props:o,_owner:qt.current}}Z.Fragment=Vt;Z.jsx=Le;Z.jsxs=Le;_e.exports=Z;var y=_e.exports;/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ut=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Fe=(...e)=>e.filter((t,r,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Bt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gt=i.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:n,className:o="",children:a,iconNode:s,...c},l)=>i.createElement("svg",{ref:l,...Bt,width:t,height:t,stroke:e,strokeWidth:n?Number(r)*24/Number(t):r,className:Fe("lucide",o),...c},[...s.map(([u,p])=>i.createElement(u,p)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=(e,t)=>{const r=i.forwardRef(({className:n,...o},a)=>i.createElement(Gt,{ref:a,iconNode:t,className:Fe(`lucide-${Ut(e)}`,n),...o}));return r.displayName=`${e}`,r};/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kn=d("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zn=d("ArrowLeftRight",[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yn=d("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xn=d("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jn=d("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qn=d("Boxes",[["path",{d:"M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z",key:"lc1i9w"}],["path",{d:"m7 16.5-4.74-2.85",key:"1o9zyk"}],["path",{d:"m7 16.5 5-3",key:"va8pkn"}],["path",{d:"M7 16.5v5.17",key:"jnp8gn"}],["path",{d:"M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z",key:"8zsnat"}],["path",{d:"m17 16.5-5-3",key:"8arw3v"}],["path",{d:"m17 16.5 4.74-2.85",key:"8rfmw"}],["path",{d:"M17 16.5v5.17",key:"k6z78m"}],["path",{d:"M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z",key:"1xygjf"}],["path",{d:"M12 8 7.26 5.15",key:"1vbdud"}],["path",{d:"m12 8 4.74-2.85",key:"3rx089"}],["path",{d:"M12 13.5V8",key:"1io7kd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const er=d("CalendarDays",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tr=d("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nr=d("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rr=d("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const or=d("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ar=d("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sr=d("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cr=d("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ir=d("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lr=d("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ur=d("CircleMinus",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dr=d("CirclePlay",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polygon",{points:"10 8 16 12 10 16 10 8",key:"1cimsy"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pr=d("CircleUser",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}],["path",{d:"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662",key:"154egf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fr=d("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yr=d("ClipboardCheck",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hr=d("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mr=d("Clock3",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16.5 12",key:"1aq6pp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vr=d("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kr=d("CloudUpload",[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xr=d("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cr=d("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gr=d("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const br=d("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mr=d("EyeOff",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wr=d("FileBox",[["path",{d:"M14.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4",key:"16lz6z"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M3 13.1a2 2 0 0 0-1 1.76v3.24a2 2 0 0 0 .97 1.78L6 21.7a2 2 0 0 0 2.03.01L11 19.9a2 2 0 0 0 1-1.76V14.9a2 2 0 0 0-.97-1.78L8 11.3a2 2 0 0 0-2.03-.01Z",key:"99pj1s"}],["path",{d:"M7 17v5",key:"1yj1jh"}],["path",{d:"M11.7 14.2 7 17l-4.7-2.8",key:"1yk8tc"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _r=d("FileChartColumn",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 18v-1",key:"zg0ygc"}],["path",{d:"M12 18v-6",key:"17g6i2"}],["path",{d:"M16 18v-3",key:"j5jt4h"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sr=d("FileCheck2",[["path",{d:"M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4",key:"1pf5j1"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m3 15 2 2 4-4",key:"1lhrkk"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rr=d("FileSpreadsheet",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ar=d("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ir=d("FileUp",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M12 12v6",key:"3ahymv"}],["path",{d:"m15 15-3-3-3 3",key:"15xj92"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Er=d("FileWarning",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jr=d("GraduationCap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tr=d("History",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pr=d("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nr=d("Import",[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m8 11 4 4 4-4",key:"1dohi6"}],["path",{d:"M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4",key:"1ywtjm"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Or=d("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lr=d("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fr=d("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $r=d("Link2Off",[["path",{d:"M9 17H7A5 5 0 0 1 7 7",key:"10o201"}],["path",{d:"M15 7h2a5 5 0 0 1 4 8",key:"1d3206"}],["line",{x1:"8",x2:"12",y1:"12",y2:"12",key:"rvw6j4"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dr=d("Link2",[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vr=d("List",[["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 18h.01",key:"1tta3j"}],["path",{d:"M3 6h.01",key:"1rqtza"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 18h13",key:"1lx6n3"}],["path",{d:"M8 6h13",key:"ik3vkj"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zr=d("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qr=d("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hr=d("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ur=d("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Br=d("MessagesSquare",[["path",{d:"M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z",key:"p1xzt8"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1",key:"1cx29u"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gr=d("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wr=d("MonitorCheck",[["path",{d:"m9 10 2 2 4-4",key:"1gnqz4"}],["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["path",{d:"M12 17v4",key:"1riwvh"}],["path",{d:"M8 21h8",key:"1ev6f3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kr=d("MousePointerClick",[["path",{d:"M14 4.1 12 6",key:"ita8i4"}],["path",{d:"m5.1 8-2.9-.8",key:"1go3kf"}],["path",{d:"m6 12-1.9 2",key:"mnht97"}],["path",{d:"M7.2 2.2 8 5.1",key:"1cfko1"}],["path",{d:"M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",key:"s0h3yz"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zr=d("PanelsTopLeft",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M9 21V9",key:"1oto5p"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yr=d("Presentation",[["path",{d:"M2 3h20",key:"91anmk"}],["path",{d:"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3",key:"2k9sn8"}],["path",{d:"m7 21 5-5 5 5",key:"bip4we"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xr=d("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jr=d("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qr=d("Server",[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const eo=d("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const to=d("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const no=d("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ro=d("Sigma",[["path",{d:"M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2",key:"wuwx1p"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oo=d("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ao=d("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const so=d("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const co=d("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const io=d("UserCheck",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lo=d("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const uo=d("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const po=d("Workflow",[["rect",{width:"8",height:"8",x:"3",y:"3",rx:"2",key:"by2w9f"}],["path",{d:"M7 11v4a2 2 0 0 0 2 2h4",key:"xkn7yn"}],["rect",{width:"8",height:"8",x:"13",y:"13",rx:"2",key:"1cgmvn"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fo=d("Wrench",[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",key:"cbrjhi"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yo=d("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ho=d("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);function Me(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function ue(...e){return t=>{let r=!1;const n=e.map(o=>{const a=Me(o,t);return!r&&typeof a=="function"&&(r=!0),a});if(r)return()=>{for(let o=0;o<n.length;o++){const a=n[o];typeof a=="function"?a():Me(e[o],null)}}}}function O(...e){return i.useCallback(ue(...e),e)}function A(e,t,{checkForDefaultPrevented:r=!0}={}){return function(o){if(e==null||e(o),r===!1||!o.defaultPrevented)return t==null?void 0:t(o)}}function z(e,t=[]){let r=[];function n(a,s){const c=i.createContext(s),l=r.length;r=[...r,s];const u=f=>{var b;const{scope:m,children:x,..._}=f,C=((b=m==null?void 0:m[e])==null?void 0:b[l])||c,h=i.useMemo(()=>_,Object.values(_));return y.jsx(C.Provider,{value:h,children:x})};u.displayName=a+"Provider";function p(f,m){var C;const x=((C=m==null?void 0:m[e])==null?void 0:C[l])||c,_=i.useContext(x);if(_)return _;if(s!==void 0)return s;throw new Error(`\`${f}\` must be used within \`${a}\``)}return[u,p]}const o=()=>{const a=r.map(s=>i.createContext(s));return function(c){const l=(c==null?void 0:c[e])||a;return i.useMemo(()=>({[`__scope${e}`]:{...c,[e]:l}}),[c,l])}};return o.scopeName=e,[n,Wt(o,...t)]}function Wt(...e){const t=e[0];if(e.length===1)return t;const r=()=>{const n=e.map(o=>({useScope:o(),scopeName:o.scopeName}));return function(a){const s=n.reduce((c,{useScope:l,scopeName:u})=>{const f=l(a)[`__scope${u}`];return{...c,...f}},{});return i.useMemo(()=>({[`__scope${t.scopeName}`]:s}),[s])}};return r.scopeName=t.scopeName,r}function Kt(e){const t=Zt(e),r=i.forwardRef((n,o)=>{const{children:a,...s}=n,c=i.Children.toArray(a),l=c.find(Xt);if(l){const u=l.props.children,p=c.map(f=>f===l?i.Children.count(u)>1?i.Children.only(null):i.isValidElement(u)?u.props.children:null:f);return y.jsx(t,{...s,ref:o,children:i.isValidElement(u)?i.cloneElement(u,void 0,p):null})}return y.jsx(t,{...s,ref:o,children:a})});return r.displayName=`${e}.Slot`,r}function Zt(e){const t=i.forwardRef((r,n)=>{const{children:o,...a}=r;if(i.isValidElement(o)){const s=Qt(o),c=Jt(a,o.props);return o.type!==i.Fragment&&(c.ref=n?ue(n,s):s),i.cloneElement(o,c)}return i.Children.count(o)>1?i.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var Yt=Symbol("radix.slottable");function Xt(e){return i.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===Yt}function Jt(e,t){const r={...t};for(const n in t){const o=e[n],a=t[n];/^on[A-Z]/.test(n)?o&&a?r[n]=(...c)=>{const l=a(...c);return o(...c),l}:o&&(r[n]=o):n==="style"?r[n]={...o,...a}:n==="className"&&(r[n]=[o,a].filter(Boolean).join(" "))}return{...e,...r}}function Qt(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}var en=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],I=en.reduce((e,t)=>{const r=Kt(`Primitive.${t}`),n=i.forwardRef((o,a)=>{const{asChild:s,...c}=o,l=s?r:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),y.jsx(l,{...c,ref:a})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{});function mo(e,t){e&&Ct.flushSync(()=>e.dispatchEvent(t))}function tn(e){const t=i.useRef(e);return i.useEffect(()=>{t.current=e}),i.useMemo(()=>(...r)=>{var n;return(n=t.current)==null?void 0:n.call(t,...r)},[])}var D=globalThis!=null&&globalThis.document?i.useLayoutEffect:()=>{},nn=Oe[" useId ".trim().toString()]||(()=>{}),rn=0;function Y(e){const[t,r]=i.useState(nn());return D(()=>{r(n=>n??String(rn++))},[e]),e||(t?`radix-${t}`:"")}function on(e,t){return i.useReducer((r,n)=>t[r][n]??r,e)}var de=e=>{const{present:t,children:r}=e,n=an(t),o=typeof r=="function"?r({present:n.isPresent}):i.Children.only(r),a=O(n.ref,sn(o));return typeof r=="function"||n.isPresent?i.cloneElement(o,{ref:a}):null};de.displayName="Presence";function an(e){const[t,r]=i.useState(),n=i.useRef(null),o=i.useRef(e),a=i.useRef("none"),s=e?"mounted":"unmounted",[c,l]=on(s,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return i.useEffect(()=>{const u=B(n.current);a.current=c==="mounted"?u:"none"},[c]),D(()=>{const u=n.current,p=o.current;if(p!==e){const m=a.current,x=B(u);e?l("MOUNT"):x==="none"||(u==null?void 0:u.display)==="none"?l("UNMOUNT"):l(p&&m!==x?"ANIMATION_OUT":"UNMOUNT"),o.current=e}},[e,l]),D(()=>{if(t){let u;const p=t.ownerDocument.defaultView??window,f=x=>{const C=B(n.current).includes(CSS.escape(x.animationName));if(x.target===t&&C&&(l("ANIMATION_END"),!o.current)){const h=t.style.animationFillMode;t.style.animationFillMode="forwards",u=p.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=h)})}},m=x=>{x.target===t&&(a.current=B(n.current))};return t.addEventListener("animationstart",m),t.addEventListener("animationcancel",f),t.addEventListener("animationend",f),()=>{p.clearTimeout(u),t.removeEventListener("animationstart",m),t.removeEventListener("animationcancel",f),t.removeEventListener("animationend",f)}}else l("ANIMATION_END")},[t,l]),{isPresent:["mounted","unmountSuspended"].includes(c),ref:i.useCallback(u=>{n.current=u?getComputedStyle(u):null,r(u)},[])}}function B(e){return(e==null?void 0:e.animationName)||"none"}function sn(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}var cn=Oe[" useInsertionEffect ".trim().toString()]||D;function q({prop:e,defaultProp:t,onChange:r=()=>{},caller:n}){const[o,a,s]=ln({defaultProp:t,onChange:r}),c=e!==void 0,l=c?e:o;{const p=i.useRef(e!==void 0);i.useEffect(()=>{const f=p.current;f!==c&&console.warn(`${n} is changing from ${f?"controlled":"uncontrolled"} to ${c?"controlled":"uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`),p.current=c},[c,n])}const u=i.useCallback(p=>{var f;if(c){const m=un(p)?p(e):p;m!==e&&((f=s.current)==null||f.call(s,m))}else a(p)},[c,e,a,s]);return[l,u]}function ln({defaultProp:e,onChange:t}){const[r,n]=i.useState(e),o=i.useRef(r),a=i.useRef(t);return cn(()=>{a.current=t},[t]),i.useEffect(()=>{var s;o.current!==r&&((s=a.current)==null||s.call(a,r),o.current=r)},[r,o]),[r,n,a]}function un(e){return typeof e=="function"}function we(e){const t=dn(e),r=i.forwardRef((n,o)=>{const{children:a,...s}=n,c=i.Children.toArray(a),l=c.find(fn);if(l){const u=l.props.children,p=c.map(f=>f===l?i.Children.count(u)>1?i.Children.only(null):i.isValidElement(u)?u.props.children:null:f);return y.jsx(t,{...s,ref:o,children:i.isValidElement(u)?i.cloneElement(u,void 0,p):null})}return y.jsx(t,{...s,ref:o,children:a})});return r.displayName=`${e}.Slot`,r}function dn(e){const t=i.forwardRef((r,n)=>{const{children:o,...a}=r;if(i.isValidElement(o)){const s=hn(o),c=yn(a,o.props);return o.type!==i.Fragment&&(c.ref=n?ue(n,s):s),i.cloneElement(o,c)}return i.Children.count(o)>1?i.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var pn=Symbol("radix.slottable");function fn(e){return i.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===pn}function yn(e,t){const r={...t};for(const n in t){const o=e[n],a=t[n];/^on[A-Z]/.test(n)?o&&a?r[n]=(...c)=>{const l=a(...c);return o(...c),l}:o&&(r[n]=o):n==="style"?r[n]={...o,...a}:n==="className"&&(r[n]=[o,a].filter(Boolean).join(" "))}return{...e,...r}}function hn(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}function $e(e){const t=e+"CollectionProvider",[r,n]=z(t),[o,a]=r(t,{collectionRef:{current:null},itemMap:new Map}),s=C=>{const{scope:h,children:b}=C,k=M.useRef(null),g=M.useRef(new Map).current;return y.jsx(o,{scope:h,itemMap:g,collectionRef:k,children:b})};s.displayName=t;const c=e+"CollectionSlot",l=we(c),u=M.forwardRef((C,h)=>{const{scope:b,children:k}=C,g=a(c,b),w=O(h,g.collectionRef);return y.jsx(l,{ref:w,children:k})});u.displayName=c;const p=e+"CollectionItemSlot",f="data-radix-collection-item",m=we(p),x=M.forwardRef((C,h)=>{const{scope:b,children:k,...g}=C,w=M.useRef(null),j=O(h,w),T=a(p,b);return M.useEffect(()=>(T.itemMap.set(w,{ref:w,...g}),()=>void T.itemMap.delete(w))),y.jsx(m,{[f]:"",ref:j,children:k})});x.displayName=p;function _(C){const h=a(e+"CollectionConsumer",C);return M.useCallback(()=>{const k=h.collectionRef.current;if(!k)return[];const g=Array.from(k.querySelectorAll(`[${f}]`));return Array.from(h.itemMap.values()).sort((T,N)=>g.indexOf(T.ref.current)-g.indexOf(N.ref.current))},[h.collectionRef,h.itemMap])}return[{Provider:s,Slot:u,ItemSlot:x},_,n]}var mn=i.createContext(void 0);function pe(e){const t=i.useContext(mn);return e||t||"ltr"}var re="rovingFocusGroup.onEntryFocus",vn={bubbles:!1,cancelable:!0},H="RovingFocusGroup",[oe,De,kn]=$e(H),[xn,Ve]=z(H,[kn]),[Cn,gn]=xn(H),ze=i.forwardRef((e,t)=>y.jsx(oe.Provider,{scope:e.__scopeRovingFocusGroup,children:y.jsx(oe.Slot,{scope:e.__scopeRovingFocusGroup,children:y.jsx(bn,{...e,ref:t})})}));ze.displayName=H;var bn=i.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:r,orientation:n,loop:o=!1,dir:a,currentTabStopId:s,defaultCurrentTabStopId:c,onCurrentTabStopIdChange:l,onEntryFocus:u,preventScrollOnEntryFocus:p=!1,...f}=e,m=i.useRef(null),x=O(t,m),_=pe(a),[C,h]=q({prop:s,defaultProp:c??null,onChange:l,caller:H}),[b,k]=i.useState(!1),g=tn(u),w=De(r),j=i.useRef(!1),[T,N]=i.useState(0);return i.useEffect(()=>{const S=m.current;if(S)return S.addEventListener(re,g),()=>S.removeEventListener(re,g)},[g]),y.jsx(Cn,{scope:r,orientation:n,dir:_,loop:o,currentTabStopId:C,onItemFocus:i.useCallback(S=>h(S),[h]),onItemShiftTab:i.useCallback(()=>k(!0),[]),onFocusableItemAdd:i.useCallback(()=>N(S=>S+1),[]),onFocusableItemRemove:i.useCallback(()=>N(S=>S-1),[]),children:y.jsx(I.div,{tabIndex:b||T===0?-1:0,"data-orientation":n,...f,ref:x,style:{outline:"none",...e.style},onMouseDown:A(e.onMouseDown,()=>{j.current=!0}),onFocus:A(e.onFocus,S=>{const F=!j.current;if(S.target===S.currentTarget&&F&&!b){const $=new CustomEvent(re,vn);if(S.currentTarget.dispatchEvent($),!$.defaultPrevented){const te=w().filter(P=>P.focusable),vt=te.find(P=>P.active),kt=te.find(P=>P.id===C),xt=[vt,kt,...te].filter(Boolean).map(P=>P.ref.current);Ue(xt,p)}}j.current=!1}),onBlur:A(e.onBlur,()=>k(!1))})})}),qe="RovingFocusGroupItem",He=i.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:r,focusable:n=!0,active:o=!1,tabStopId:a,children:s,...c}=e,l=Y(),u=a||l,p=gn(qe,r),f=p.currentTabStopId===u,m=De(r),{onFocusableItemAdd:x,onFocusableItemRemove:_,currentTabStopId:C}=p;return i.useEffect(()=>{if(n)return x(),()=>_()},[n,x,_]),y.jsx(oe.ItemSlot,{scope:r,id:u,focusable:n,active:o,children:y.jsx(I.span,{tabIndex:f?0:-1,"data-orientation":p.orientation,...c,ref:t,onMouseDown:A(e.onMouseDown,h=>{n?p.onItemFocus(u):h.preventDefault()}),onFocus:A(e.onFocus,()=>p.onItemFocus(u)),onKeyDown:A(e.onKeyDown,h=>{if(h.key==="Tab"&&h.shiftKey){p.onItemShiftTab();return}if(h.target!==h.currentTarget)return;const b=_n(h,p.orientation,p.dir);if(b!==void 0){if(h.metaKey||h.ctrlKey||h.altKey||h.shiftKey)return;h.preventDefault();let g=m().filter(w=>w.focusable).map(w=>w.ref.current);if(b==="last")g.reverse();else if(b==="prev"||b==="next"){b==="prev"&&g.reverse();const w=g.indexOf(h.currentTarget);g=p.loop?Sn(g,w+1):g.slice(w+1)}setTimeout(()=>Ue(g))}}),children:typeof s=="function"?s({isCurrentTabStop:f,hasTabStop:C!=null}):s})})});He.displayName=qe;var Mn={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function wn(e,t){return t!=="rtl"?e:e==="ArrowLeft"?"ArrowRight":e==="ArrowRight"?"ArrowLeft":e}function _n(e,t,r){const n=wn(e.key,r);if(!(t==="vertical"&&["ArrowLeft","ArrowRight"].includes(n))&&!(t==="horizontal"&&["ArrowUp","ArrowDown"].includes(n)))return Mn[n]}function Ue(e,t=!1){const r=document.activeElement;for(const n of e)if(n===r||(n.focus({preventScroll:t}),document.activeElement!==r))return}function Sn(e,t){return e.map((r,n)=>e[(t+n)%e.length])}var Rn=ze,An=He,X="Tabs",[In]=z(X,[Ve]),Be=Ve(),[En,fe]=In(X),Ge=i.forwardRef((e,t)=>{const{__scopeTabs:r,value:n,onValueChange:o,defaultValue:a,orientation:s="horizontal",dir:c,activationMode:l="automatic",...u}=e,p=pe(c),[f,m]=q({prop:n,onChange:o,defaultProp:a??"",caller:X});return y.jsx(En,{scope:r,baseId:Y(),value:f,onValueChange:m,orientation:s,dir:p,activationMode:l,children:y.jsx(I.div,{dir:p,"data-orientation":s,...u,ref:t})})});Ge.displayName=X;var We="TabsList",Ke=i.forwardRef((e,t)=>{const{__scopeTabs:r,loop:n=!0,...o}=e,a=fe(We,r),s=Be(r);return y.jsx(Rn,{asChild:!0,...s,orientation:a.orientation,dir:a.dir,loop:n,children:y.jsx(I.div,{role:"tablist","aria-orientation":a.orientation,...o,ref:t})})});Ke.displayName=We;var Ze="TabsTrigger",Ye=i.forwardRef((e,t)=>{const{__scopeTabs:r,value:n,disabled:o=!1,...a}=e,s=fe(Ze,r),c=Be(r),l=Qe(s.baseId,n),u=et(s.baseId,n),p=n===s.value;return y.jsx(An,{asChild:!0,...c,focusable:!o,active:p,children:y.jsx(I.button,{type:"button",role:"tab","aria-selected":p,"aria-controls":u,"data-state":p?"active":"inactive","data-disabled":o?"":void 0,disabled:o,id:l,...a,ref:t,onMouseDown:A(e.onMouseDown,f=>{!o&&f.button===0&&f.ctrlKey===!1?s.onValueChange(n):f.preventDefault()}),onKeyDown:A(e.onKeyDown,f=>{[" ","Enter"].includes(f.key)&&s.onValueChange(n)}),onFocus:A(e.onFocus,()=>{const f=s.activationMode!=="manual";!p&&!o&&f&&s.onValueChange(n)})})})});Ye.displayName=Ze;var Xe="TabsContent",Je=i.forwardRef((e,t)=>{const{__scopeTabs:r,value:n,forceMount:o,children:a,...s}=e,c=fe(Xe,r),l=Qe(c.baseId,n),u=et(c.baseId,n),p=n===c.value,f=i.useRef(p);return i.useEffect(()=>{const m=requestAnimationFrame(()=>f.current=!1);return()=>cancelAnimationFrame(m)},[]),y.jsx(de,{present:o||p,children:({present:m})=>y.jsx(I.div,{"data-state":p?"active":"inactive","data-orientation":c.orientation,role:"tabpanel","aria-labelledby":l,hidden:!m,id:u,tabIndex:0,...s,ref:t,style:{...e.style,animationDuration:f.current?"0s":void 0},children:m&&a})})});Je.displayName=Xe;function Qe(e,t){return`${e}-trigger-${t}`}function et(e,t){return`${e}-content-${t}`}var vo=Ge,ko=Ke,xo=Ye,Co=Je,J="Collapsible",[jn,tt]=z(J),[Tn,ye]=jn(J),nt=i.forwardRef((e,t)=>{const{__scopeCollapsible:r,open:n,defaultOpen:o,disabled:a,onOpenChange:s,...c}=e,[l,u]=q({prop:n,defaultProp:o??!1,onChange:s,caller:J});return y.jsx(Tn,{scope:r,disabled:a,contentId:Y(),open:l,onOpenToggle:i.useCallback(()=>u(p=>!p),[u]),children:y.jsx(I.div,{"data-state":me(l),"data-disabled":a?"":void 0,...c,ref:t})})});nt.displayName=J;var rt="CollapsibleTrigger",ot=i.forwardRef((e,t)=>{const{__scopeCollapsible:r,...n}=e,o=ye(rt,r);return y.jsx(I.button,{type:"button","aria-controls":o.contentId,"aria-expanded":o.open||!1,"data-state":me(o.open),"data-disabled":o.disabled?"":void 0,disabled:o.disabled,...n,ref:t,onClick:A(e.onClick,o.onOpenToggle)})});ot.displayName=rt;var he="CollapsibleContent",at=i.forwardRef((e,t)=>{const{forceMount:r,...n}=e,o=ye(he,e.__scopeCollapsible);return y.jsx(de,{present:r||o.open,children:({present:a})=>y.jsx(Pn,{...n,ref:t,present:a})})});at.displayName=he;var Pn=i.forwardRef((e,t)=>{const{__scopeCollapsible:r,present:n,children:o,...a}=e,s=ye(he,r),[c,l]=i.useState(n),u=i.useRef(null),p=O(t,u),f=i.useRef(0),m=f.current,x=i.useRef(0),_=x.current,C=s.open||c,h=i.useRef(C),b=i.useRef(void 0);return i.useEffect(()=>{const k=requestAnimationFrame(()=>h.current=!1);return()=>cancelAnimationFrame(k)},[]),D(()=>{const k=u.current;if(k){b.current=b.current||{transitionDuration:k.style.transitionDuration,animationName:k.style.animationName},k.style.transitionDuration="0s",k.style.animationName="none";const g=k.getBoundingClientRect();f.current=g.height,x.current=g.width,h.current||(k.style.transitionDuration=b.current.transitionDuration,k.style.animationName=b.current.animationName),l(n)}},[s.open,n]),y.jsx(I.div,{"data-state":me(s.open),"data-disabled":s.disabled?"":void 0,id:s.contentId,hidden:!C,...a,ref:p,style:{"--radix-collapsible-content-height":m?`${m}px`:void 0,"--radix-collapsible-content-width":_?`${_}px`:void 0,...e.style},children:C&&o})});function me(e){return e?"open":"closed"}var Nn=nt,On=ot,Ln=at,E="Accordion",Fn=["Home","End","ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],[ve,$n,Dn]=$e(E),[Q]=z(E,[Dn,tt]),ke=tt(),st=M.forwardRef((e,t)=>{const{type:r,...n}=e,o=n,a=n;return y.jsx(ve.Provider,{scope:e.__scopeAccordion,children:r==="multiple"?y.jsx(Hn,{...a,ref:t}):y.jsx(qn,{...o,ref:t})})});st.displayName=E;var[ct,Vn]=Q(E),[it,zn]=Q(E,{collapsible:!1}),qn=M.forwardRef((e,t)=>{const{value:r,defaultValue:n,onValueChange:o=()=>{},collapsible:a=!1,...s}=e,[c,l]=q({prop:r,defaultProp:n??"",onChange:o,caller:E});return y.jsx(ct,{scope:e.__scopeAccordion,value:M.useMemo(()=>c?[c]:[],[c]),onItemOpen:l,onItemClose:M.useCallback(()=>a&&l(""),[a,l]),children:y.jsx(it,{scope:e.__scopeAccordion,collapsible:a,children:y.jsx(lt,{...s,ref:t})})})}),Hn=M.forwardRef((e,t)=>{const{value:r,defaultValue:n,onValueChange:o=()=>{},...a}=e,[s,c]=q({prop:r,defaultProp:n??[],onChange:o,caller:E}),l=M.useCallback(p=>c((f=[])=>[...f,p]),[c]),u=M.useCallback(p=>c((f=[])=>f.filter(m=>m!==p)),[c]);return y.jsx(ct,{scope:e.__scopeAccordion,value:s,onItemOpen:l,onItemClose:u,children:y.jsx(it,{scope:e.__scopeAccordion,collapsible:!0,children:y.jsx(lt,{...a,ref:t})})})}),[Un,ee]=Q(E),lt=M.forwardRef((e,t)=>{const{__scopeAccordion:r,disabled:n,dir:o,orientation:a="vertical",...s}=e,c=M.useRef(null),l=O(c,t),u=$n(r),f=pe(o)==="ltr",m=A(e.onKeyDown,x=>{var S;if(!Fn.includes(x.key))return;const _=x.target,C=u().filter(F=>{var $;return!(($=F.ref.current)!=null&&$.disabled)}),h=C.findIndex(F=>F.ref.current===_),b=C.length;if(h===-1)return;x.preventDefault();let k=h;const g=0,w=b-1,j=()=>{k=h+1,k>w&&(k=g)},T=()=>{k=h-1,k<g&&(k=w)};switch(x.key){case"Home":k=g;break;case"End":k=w;break;case"ArrowRight":a==="horizontal"&&(f?j():T());break;case"ArrowDown":a==="vertical"&&j();break;case"ArrowLeft":a==="horizontal"&&(f?T():j());break;case"ArrowUp":a==="vertical"&&T();break}const N=k%b;(S=C[N].ref.current)==null||S.focus()});return y.jsx(Un,{scope:r,disabled:n,direction:o,orientation:a,children:y.jsx(ve.Slot,{scope:r,children:y.jsx(I.div,{...s,"data-orientation":a,ref:l,onKeyDown:n?void 0:m})})})}),K="AccordionItem",[Bn,xe]=Q(K),ut=M.forwardRef((e,t)=>{const{__scopeAccordion:r,value:n,...o}=e,a=ee(K,r),s=Vn(K,r),c=ke(r),l=Y(),u=n&&s.value.includes(n)||!1,p=a.disabled||e.disabled;return y.jsx(Bn,{scope:r,open:u,disabled:p,triggerId:l,children:y.jsx(Nn,{"data-orientation":a.orientation,"data-state":mt(u),...c,...o,ref:t,disabled:p,open:u,onOpenChange:f=>{f?s.onItemOpen(n):s.onItemClose(n)}})})});ut.displayName=K;var dt="AccordionHeader",pt=M.forwardRef((e,t)=>{const{__scopeAccordion:r,...n}=e,o=ee(E,r),a=xe(dt,r);return y.jsx(I.h3,{"data-orientation":o.orientation,"data-state":mt(a.open),"data-disabled":a.disabled?"":void 0,...n,ref:t})});pt.displayName=dt;var ae="AccordionTrigger",ft=M.forwardRef((e,t)=>{const{__scopeAccordion:r,...n}=e,o=ee(E,r),a=xe(ae,r),s=zn(ae,r),c=ke(r);return y.jsx(ve.ItemSlot,{scope:r,children:y.jsx(On,{"aria-disabled":a.open&&!s.collapsible||void 0,"data-orientation":o.orientation,id:a.triggerId,...c,...n,ref:t})})});ft.displayName=ae;var yt="AccordionContent",ht=M.forwardRef((e,t)=>{const{__scopeAccordion:r,...n}=e,o=ee(E,r),a=xe(yt,r),s=ke(r);return y.jsx(Ln,{role:"region","aria-labelledby":a.triggerId,"data-orientation":o.orientation,...s,...n,ref:t,style:{"--radix-accordion-content-height":"var(--radix-collapsible-content-height)","--radix-accordion-content-width":"var(--radix-collapsible-content-width)",...e.style}})});ht.displayName=yt;function mt(e){return e?"open":"closed"}var go=st,bo=ut,Mo=pt,wo=ft,_o=ht;export{xo as $,Kn as A,Jn as B,cr as C,gr as D,br as E,_r as F,jr as G,no as H,Nr as I,to as J,vr as K,Fr as L,nr as M,ao as N,ur as O,I as P,Yn as Q,Oe as R,eo as S,so as T,uo as U,ro as V,fo as W,sr as X,or as Y,vo as Z,ko as _,M as a,Co as a0,lo as a1,Tr as a2,go as a3,bo as a4,Mo as a5,wo as a6,_o as a7,Br as a8,Qn as a9,Jr as aA,Pr as aB,Gr as aC,Hr as aD,Vr as aE,yo as aF,dr as aG,rr as aH,Dr as aa,wr as ab,Yr as ac,Ar as ad,Sr as ae,Wr as af,Zr as ag,Lr as ah,ar as ai,$r as aj,er as ak,mr as al,Er as am,Rr as an,kr as ao,Or as ap,Zn as aq,ho as ar,po as as,Qr as at,yr as au,Kr as av,xr as aw,oo as ax,ue as ay,Ur as az,O as b,A as c,mo as d,D as e,z as f,bt as g,de as h,co as i,y as j,qr as k,ir as l,fr as m,pr as n,Ir as o,Xr as p,hr as q,i as r,Cr as s,tr as t,tn as u,Xn as v,zr as w,io as x,Mr as y,lr as z};
