import{ae as G,af as Q,aD as X,bB as Z,bQ as _,ag as h,aR as aa,aV as ta,r as S,aA as P,P as ea,d0 as na,bM as la,w as A,E as ia,d1 as oa,Y as sa,aI as ra,cH as M,b as t,p as j,b_ as ca,ba,ai as ua,aX as ka,aZ as Va,bC as ma,bz as da,cI as Sa,bO as pa,au as fa,bK as va,b5 as Ba,b3 as ga,d as V,ad as ya,aL as xa,c as T,o as x,e,s as n,a4 as d,a6 as p,l as u,$ as y,F as O,f as Ia}from"./main-DbV2gK6P.js";import{_ as Ta}from"./AppCardCode-BifOrYxl.js";import{V as wa,a as I}from"./VRow-Cwvi9FpP.js";import"./vue3-perfect-scrollbar-BgKIb4Hq.js";import"./VCard-DLkbjUww.js";import"./VAvatar-CdUhxLhZ.js";import"./VCardText-C7KAVc3q.js";import"./VDivider-DjAALrpp.js";function Ca(b){const i=P(b());let s=-1;function a(){clearInterval(s)}function r(){a(),fa(()=>i.value=b())}function c(v){const o=v?getComputedStyle(v):{transitionDuration:.2},m=parseFloat(o.transitionDuration)*1e3||200;if(a(),i.value<=0)return;const g=performance.now();s=window.setInterval(()=>{const w=performance.now()-g+m;i.value=Math.max(b()-w,0),i.value<=0&&a()},m)}return pa(a),{clear:a,time:i,start:c,reset:r}}const Oa=Q({multiLine:Boolean,text:String,timer:[Boolean,String],timeout:{type:[Number,String],default:5e3},vertical:Boolean,...da({location:"bottom"}),...ma(),...Va(),...ka(),...ua(),...ba(Sa({transition:"v-snackbar-transition"}),["persistent","noClickAnimation","scrim","scrollStrategy","stickToTarget"])},"VSnackbar"),f=G()({name:"VSnackbar",props:Oa(),emits:{"update:modelValue":b=>!0},setup(b,i){let{slots:s}=i;const a=X(b,"modelValue"),{positionClasses:r}=Z(b),{scopeId:c}=_(),{themeClasses:v}=h(b),{colorClasses:o,colorStyles:m,variantClasses:g}=aa(b),{roundedClasses:w}=ta(b),l=Ca(()=>Number(b.timeout)),k=S(),E=S(),$=P(!1),F=P(0),R=S(),H=ea(na,void 0);la(()=>!!H,()=>{const B=va();Ba(()=>{R.value=B.mainStyles.value})}),A(a,D),A(()=>b.timeout,D),ia(()=>{a.value&&D()});let U=-1;function D(){l.reset(),window.clearTimeout(U);const B=Number(b.timeout);if(!a.value||B===-1)return;const C=oa(E.value);l.start(C),U=window.setTimeout(()=>{a.value=!1},B)}function q(){l.reset(),window.clearTimeout(U)}function N(){$.value=!0,q()}function L(){$.value=!1,D()}function z(B){F.value=B.touches[0].clientY}function Y(B){Math.abs(F.value-B.changedTouches[0].clientY)>50&&(a.value=!1)}function J(){$.value&&L()}const W=sa(()=>b.location.split(" ").reduce((B,C)=>(B[`v-snackbar--${C}`]=!0,B),{}));return ra(()=>{const B=M.filterProps(b),C=!!(s.default||s.text||b.text);return t(M,j({ref:k,class:["v-snackbar",{"v-snackbar--active":a.value,"v-snackbar--multi-line":b.multiLine&&!b.vertical,"v-snackbar--timer":!!b.timer,"v-snackbar--vertical":b.vertical},W.value,r.value,b.class],style:[R.value,b.style]},B,{modelValue:a.value,"onUpdate:modelValue":K=>a.value=K,contentProps:j({class:["v-snackbar__wrapper",v.value,o.value,w.value,g.value],style:[m.value],onPointerenter:N,onPointerleave:L},B.contentProps),persistent:!0,noClickAnimation:!0,scrim:!1,scrollStrategy:"none",_disableGlobalStack:!0,onTouchstartPassive:z,onTouchend:Y,onAfterLeave:J},c),{default:()=>[ga(!1,"v-snackbar"),b.timer&&!$.value&&V("div",{key:"timer",class:"v-snackbar__timer"},[t(ya,{ref:E,color:typeof b.timer=="string"?b.timer:"info",max:b.timeout,modelValue:l.time.value},null)]),C&&V("div",{key:"content",class:"v-snackbar__content",role:"status","aria-live":"polite"},[s.text?.()??b.text,s.default?.()]),s.actions&&t(xa,{defaults:{VBtn:{variant:"text",ripple:!1,slim:!0}}},{default:()=>[V("div",{class:"v-snackbar__actions"},[s.actions({isActive:a})])]})],activator:s.activator})}),ca({},k)}}),$a={class:"demo-space-x"},Da={__name:"DemoSnackbarTransition",setup(b){const i=S(!1),s=S(!1),a=S(!1);return(r,c)=>(x(),T("div",$a,[t(d,{onClick:c[0]||(c[0]=v=>i.value=!0)},{default:e(()=>[...c[6]||(c[6]=[n(" fade snackbar ",-1)])]),_:1}),t(f,{modelValue:u(i),"onUpdate:modelValue":c[1]||(c[1]=v=>p(i)?i.value=v:null),transition:"fade-transition",location:"top start"},{default:e(()=>[...c[7]||(c[7]=[n(" I'm a fade transition snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{onClick:c[2]||(c[2]=v=>s.value=!0)},{default:e(()=>[...c[8]||(c[8]=[n(" Scale snackbar ",-1)])]),_:1}),t(f,{modelValue:u(s),"onUpdate:modelValue":c[3]||(c[3]=v=>p(s)?s.value=v:null),transition:"scale-transition",location:"bottom end"},{default:e(()=>[...c[9]||(c[9]=[n(" I'm a scale transition snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{onClick:c[4]||(c[4]=v=>a.value=!0)},{default:e(()=>[...c[10]||(c[10]=[n(" scroll y reverse ",-1)])]),_:1}),t(f,{modelValue:u(a),"onUpdate:modelValue":c[5]||(c[5]=v=>p(a)?a.value=v:null),transition:"scroll-y-reverse-transition",location:"top end"},{default:e(()=>[...c[11]||(c[11]=[n(" I'm a scroll y reverse transition snackbar. ",-1)])]),_:1},8,["modelValue"])]))}},Ua={class:"demo-space-x"},Pa={__name:"DemoSnackbarVariants",setup(b){const i=S(!1),s=S(!1),a=S(!1),r=S(!1),c=S(!1);return(v,o)=>(x(),T("div",Ua,[t(d,{onClick:o[0]||(o[0]=m=>i.value=!0)},{default:e(()=>[...o[10]||(o[10]=[n(" Default ",-1)])]),_:1}),t(f,{modelValue:u(i),"onUpdate:modelValue":o[1]||(o[1]=m=>p(i)?i.value=m:null),location:"top start"},{default:e(()=>[...o[11]||(o[11]=[n(" Jelly chocolate bar candy canes apple pie. ",-1)])]),_:1},8,["modelValue"]),t(d,{onClick:o[2]||(o[2]=m=>s.value=!0)},{default:e(()=>[...o[12]||(o[12]=[n(" tonal ",-1)])]),_:1}),t(f,{modelValue:u(s),"onUpdate:modelValue":o[3]||(o[3]=m=>p(s)?s.value=m:null),location:"top end",variant:"tonal"},{default:e(()=>[...o[13]||(o[13]=[n(" Ice cream cake candy canes. ",-1)])]),_:1},8,["modelValue"]),t(d,{onClick:o[4]||(o[4]=m=>a.value=!0)},{default:e(()=>[...o[14]||(o[14]=[n(" Text ",-1)])]),_:1}),t(f,{modelValue:u(a),"onUpdate:modelValue":o[5]||(o[5]=m=>p(a)?a.value=m:null),location:"end center",variant:"text"},{default:e(()=>[...o[15]||(o[15]=[n(" Pie icing biscuit soufflé liquorice topping. ",-1)])]),_:1},8,["modelValue"]),t(d,{onClick:o[6]||(o[6]=m=>r.value=!0)},{default:e(()=>[...o[16]||(o[16]=[n(" Outlined ",-1)])]),_:1}),t(f,{modelValue:u(r),"onUpdate:modelValue":o[7]||(o[7]=m=>p(r)?r.value=m:null),location:"bottom end",variant:"outlined",color:"error"},{default:e(()=>[...o[17]||(o[17]=[n(" Oat cake caramels sesame snaps candy. ",-1)])]),_:1},8,["modelValue"]),t(d,{onClick:o[8]||(o[8]=m=>c.value=!0)},{default:e(()=>[...o[18]||(o[18]=[n(" Flat ",-1)])]),_:1}),t(f,{modelValue:u(c),"onUpdate:modelValue":o[9]||(o[9]=m=>p(c)?c.value=m:null),location:"bottom start",variant:"flat",color:"error"},{default:e(()=>[...o[19]||(o[19]=[n(" Oat cake caramels sesame snaps candy. ",-1)])]),_:1},8,["modelValue"])]))}},Ea={class:"demo-space-x"},Fa={__name:"DemoSnackbarPosition",setup(b){const i=S(!1),s=S(!1),a=S(!1),r=S(!1),c=S(!1),v=S(!1),o=S(!1),m=S(!1),g=S(!1);return(w,l)=>(x(),T("div",Ea,[t(d,{icon:"",variant:"text",onClick:l[0]||(l[0]=k=>s.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrow-up"})]),_:1}),t(f,{modelValue:u(s),"onUpdate:modelValue":l[1]||(l[1]=k=>p(s)?s.value=k:null),location:"top"},{default:e(()=>[...l[18]||(l[18]=[n(" I'm a top snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{icon:"",variant:"text",onClick:l[2]||(l[2]=k=>a.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrow-up-right"})]),_:1}),t(f,{modelValue:u(a),"onUpdate:modelValue":l[3]||(l[3]=k=>p(a)?a.value=k:null),location:"top end"},{default:e(()=>[...l[19]||(l[19]=[n(" I'm a top right snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{icon:"",variant:"text",onClick:l[4]||(l[4]=k=>o.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrow-right"})]),_:1}),t(f,{modelValue:u(o),"onUpdate:modelValue":l[5]||(l[5]=k=>p(o)?o.value=k:null),location:"end center"},{default:e(()=>[...l[20]||(l[20]=[n(" I'm a center end snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{icon:"",variant:"text",onClick:l[6]||(l[6]=k=>r.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrow-down-right"})]),_:1}),t(f,{modelValue:u(r),"onUpdate:modelValue":l[7]||(l[7]=k=>p(r)?r.value=k:null),location:"bottom end"},{default:e(()=>[...l[21]||(l[21]=[n(" I'm a bottom end snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{icon:"",variant:"text",onClick:l[8]||(l[8]=k=>c.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrow-down"})]),_:1}),t(f,{modelValue:u(c),"onUpdate:modelValue":l[9]||(l[9]=k=>p(c)?c.value=k:null)},{default:e(()=>[...l[22]||(l[22]=[n(" I'm a bottom snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{icon:"",variant:"text",onClick:l[10]||(l[10]=k=>v.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrow-down-left"})]),_:1}),t(f,{modelValue:u(v),"onUpdate:modelValue":l[11]||(l[11]=k=>p(v)?v.value=k:null),location:"bottom start"},{default:e(()=>[...l[23]||(l[23]=[n(" I'm a bottom start snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{icon:"",variant:"text",onClick:l[12]||(l[12]=k=>m.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrow-left"})]),_:1}),t(f,{modelValue:u(m),"onUpdate:modelValue":l[13]||(l[13]=k=>p(m)?m.value=k:null),location:"start center"},{default:e(()=>[...l[24]||(l[24]=[n(" I'm a center start snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{icon:"",variant:"text",onClick:l[14]||(l[14]=k=>i.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrow-up-left"})]),_:1}),t(f,{modelValue:u(i),"onUpdate:modelValue":l[15]||(l[15]=k=>p(i)?i.value=k:null),location:"top start"},{default:e(()=>[...l[25]||(l[25]=[n(" I'm a top start snackbar. ",-1)])]),_:1},8,["modelValue"]),t(d,{icon:"",variant:"text",onClick:l[16]||(l[16]=k=>g.value=!0)},{default:e(()=>[t(y,{icon:"tabler-arrows-minimize"})]),_:1}),t(f,{modelValue:u(g),"onUpdate:modelValue":l[17]||(l[17]=k=>p(g)?g.value=k:null),location:"center"},{default:e(()=>[...l[26]||(l[26]=[n(" I'm a center snackbar. ",-1)])]),_:1},8,["modelValue"])]))}},Ra={__name:"DemoSnackbarVertical",setup(b){const i=S(!1);return(s,a)=>(x(),T(O,null,[t(d,{onClick:a[0]||(a[0]=r=>i.value=!0)},{default:e(()=>[...a[4]||(a[4]=[n(" Open Snackbar ",-1)])]),_:1}),t(f,{modelValue:u(i),"onUpdate:modelValue":a[3]||(a[3]=r=>p(i)?i.value=r:null),vertical:""},{actions:e(()=>[t(d,{color:"success",onClick:a[1]||(a[1]=r=>i.value=!1)},{default:e(()=>[...a[5]||(a[5]=[n(" Undo ",-1)])]),_:1}),t(d,{color:"error",onClick:a[2]||(a[2]=r=>i.value=!1)},{default:e(()=>[...a[6]||(a[6]=[n(" Close ",-1)])]),_:1})]),default:e(()=>[a[7]||(a[7]=n(" Sugar plum chocolate bar halvah sesame snaps apple pie donut croissant marshmallow. Sweet roll donut gummies sesame snaps icing bear claw tiramisu cotton candy. ",-1))]),_:1},8,["modelValue"])],64))}},La={__name:"DemoSnackbarTimeout",setup(b){const i=S(!1);return(s,a)=>(x(),T(O,null,[t(d,{onClick:a[0]||(a[0]=r=>i.value=!0)},{default:e(()=>[...a[2]||(a[2]=[n(" Open Snackbar ",-1)])]),_:1}),t(f,{modelValue:u(i),"onUpdate:modelValue":a[1]||(a[1]=r=>p(i)?i.value=r:null),timeout:2e3},{default:e(()=>[...a[3]||(a[3]=[n(" My timeout is set to 2000. ",-1)])]),_:1},8,["modelValue"])],64))}},Aa={__name:"DemoSnackbarMultiLine",setup(b){const i=S(!1);return(s,a)=>(x(),T(O,null,[t(d,{onClick:a[0]||(a[0]=r=>i.value=!0)},{default:e(()=>[...a[3]||(a[3]=[n(" Open Snackbar ",-1)])]),_:1}),t(f,{modelValue:u(i),"onUpdate:modelValue":a[2]||(a[2]=r=>p(i)?i.value=r:null),"multi-line":""},{actions:e(()=>[t(d,{color:"error",onClick:a[1]||(a[1]=r=>i.value=!1)},{default:e(()=>[...a[4]||(a[4]=[n(" Close ",-1)])]),_:1})]),default:e(()=>[a[5]||(a[5]=n(" I am a multi-line snackbar. I can have more than one line. This is another line that is quite long. ",-1))]),_:1},8,["modelValue"])],64))}},Ma={__name:"DemoSnackbarWithAction",setup(b){const i=S(!1);return(s,a)=>(x(),T(O,null,[t(d,{onClick:a[0]||(a[0]=r=>i.value=!0)},{default:e(()=>[...a[3]||(a[3]=[n(" Open Snackbar ",-1)])]),_:1}),t(f,{modelValue:u(i),"onUpdate:modelValue":a[2]||(a[2]=r=>p(i)?i.value=r:null)},{actions:e(()=>[t(d,{color:"error",onClick:a[1]||(a[1]=r=>i.value=!1)},{default:e(()=>[...a[4]||(a[4]=[n(" Close ",-1)])]),_:1})]),default:e(()=>[a[5]||(a[5]=n(" Hello, I'm a snackbar with actions. ",-1))]),_:1},8,["modelValue"])],64))}},ja={__name:"DemoSnackbarBasic",setup(b){const i=S(!1);return(s,a)=>(x(),T(O,null,[t(d,{onClick:a[0]||(a[0]=r=>i.value=!0)},{default:e(()=>[...a[2]||(a[2]=[n(" Open Snackbar ",-1)])]),_:1}),t(f,{modelValue:u(i),"onUpdate:modelValue":a[1]||(a[1]=r=>p(i)?i.value=r:null)},{default:e(()=>[...a[3]||(a[3]=[n(" Hello, I'm a snackbar ",-1)])]),_:1},8,["modelValue"])],64))}},Ha={ts:`<script lang="ts" setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- SnackBar -->
  <VSnackbar v-model="isSnackbarVisible">
    Hello, I'm a snackbar
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- SnackBar -->
  <VSnackbar v-model="isSnackbarVisible">
    Hello, I'm a snackbar
  </VSnackbar>
</template>
`},qa={ts:`<script lang="ts" setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    multi-line
  >
    I am a multi-line snackbar. I can have more than one line. This is another line that is quite long.

    <template #actions>
      <VBtn
        color="error"
        @click="isSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    multi-line
  >
    I am a multi-line snackbar. I can have more than one line. This is another line that is quite long.

    <template #actions>
      <VBtn
        color="error"
        @click="isSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`},Na={ts:`<script lang="ts" setup>
const isSnackbarTopStartVisible = ref(false)
const isSnackbarTopVisible = ref(false)
const isSnackbarTopEndVisible = ref(false)
const isSnackbarBottomEndVisible = ref(false)
const isSnackbarBottomVisible = ref(false)
const isSnackbarBottomStartVisible = ref(false)
const isSnackbarEndVisible = ref(false)
const isSnackbarStartVisible = ref(false)
const isSnackbarCenteredVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- top  -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopVisible = true"
    >
      <VIcon icon="tabler-arrow-up" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopVisible"
      location="top"
    >
      I'm a top snackbar.
    </VSnackbar>

    <!-- top end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopEndVisible = true"
    >
      <VIcon icon="tabler-arrow-up-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopEndVisible"
      location="top end"
    >
      I'm a top right snackbar.
    </VSnackbar>

    <!-- center end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarEndVisible = true"
    >
      <VIcon icon="tabler-arrow-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarEndVisible"
      location="end center"
    >
      I'm a center end snackbar.
    </VSnackbar>

    <!-- bottom end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomEndVisible = true"
    >
      <VIcon icon="tabler-arrow-down-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarBottomEndVisible"
      location="bottom end"
    >
      I'm a bottom end snackbar.
    </VSnackbar>

    <!-- bottom -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomVisible = true"
    >
      <VIcon icon="tabler-arrow-down" />
    </VBtn>

    <VSnackbar v-model="isSnackbarBottomVisible">
      I'm a bottom snackbar.
    </VSnackbar>

    <!-- bottom start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomStartVisible = true"
    >
      <VIcon icon="tabler-arrow-down-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarBottomStartVisible"
      location="bottom start"
    >
      I'm a bottom start snackbar.
    </VSnackbar>

    <!-- center start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarStartVisible = true"
    >
      <VIcon icon="tabler-arrow-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarStartVisible"
      location="start center"
    >
      I'm a center start snackbar.
    </VSnackbar>

    <!-- top start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopStartVisible = true"
    >
      <VIcon icon="tabler-arrow-up-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopStartVisible"
      location="top start"
    >
      I'm a top start snackbar.
    </VSnackbar>

    <!-- center -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarCenteredVisible = true"
    >
      <VIcon icon="tabler-arrows-minimize" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarCenteredVisible"
      location="center"
    >
      I'm a center snackbar.
    </VSnackbar>
  </div>
</template>
`,js:`<script setup>
const isSnackbarTopStartVisible = ref(false)
const isSnackbarTopVisible = ref(false)
const isSnackbarTopEndVisible = ref(false)
const isSnackbarBottomEndVisible = ref(false)
const isSnackbarBottomVisible = ref(false)
const isSnackbarBottomStartVisible = ref(false)
const isSnackbarEndVisible = ref(false)
const isSnackbarStartVisible = ref(false)
const isSnackbarCenteredVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- top  -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopVisible = true"
    >
      <VIcon icon="tabler-arrow-up" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopVisible"
      location="top"
    >
      I'm a top snackbar.
    </VSnackbar>

    <!-- top end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopEndVisible = true"
    >
      <VIcon icon="tabler-arrow-up-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopEndVisible"
      location="top end"
    >
      I'm a top right snackbar.
    </VSnackbar>

    <!-- center end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarEndVisible = true"
    >
      <VIcon icon="tabler-arrow-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarEndVisible"
      location="end center"
    >
      I'm a center end snackbar.
    </VSnackbar>

    <!-- bottom end -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomEndVisible = true"
    >
      <VIcon icon="tabler-arrow-down-right" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarBottomEndVisible"
      location="bottom end"
    >
      I'm a bottom end snackbar.
    </VSnackbar>

    <!-- bottom -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomVisible = true"
    >
      <VIcon icon="tabler-arrow-down" />
    </VBtn>

    <VSnackbar v-model="isSnackbarBottomVisible">
      I'm a bottom snackbar.
    </VSnackbar>

    <!-- bottom start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarBottomStartVisible = true"
    >
      <VIcon icon="tabler-arrow-down-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarBottomStartVisible"
      location="bottom start"
    >
      I'm a bottom start snackbar.
    </VSnackbar>

    <!-- center start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarStartVisible = true"
    >
      <VIcon icon="tabler-arrow-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarStartVisible"
      location="start center"
    >
      I'm a center start snackbar.
    </VSnackbar>

    <!-- top start -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarTopStartVisible = true"
    >
      <VIcon icon="tabler-arrow-up-left" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarTopStartVisible"
      location="top start"
    >
      I'm a top start snackbar.
    </VSnackbar>

    <!-- center -->
    <VBtn
      icon
      variant="text"
      @click="isSnackbarCenteredVisible = true"
    >
      <VIcon icon="tabler-arrows-minimize" />
    </VBtn>

    <VSnackbar
      v-model="isSnackbarCenteredVisible"
      location="center"
    >
      I'm a center snackbar.
    </VSnackbar>
  </div>
</template>
`},za={ts:`<script lang="ts" setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    :timeout="2000"
  >
    My timeout is set to 2000.
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar
    v-model="isSnackbarVisible"
    :timeout="2000"
  >
    My timeout is set to 2000.
  </VSnackbar>
</template>
`},Ya={ts:`<script lang="ts" setup>
const isSnackbarFadeVisible = ref(false)
const isSnackbarScaleVisible = ref(false)
const isSnackbarScrollReverseVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- fade -->
    <VBtn @click="isSnackbarFadeVisible = true">
      fade snackbar
    </VBtn>

    <VSnackbar
      v-model="isSnackbarFadeVisible"
      transition="fade-transition"
      location="top start"
    >
      I'm a fade transition snackbar.
    </VSnackbar>

    <!-- scale -->
    <VBtn @click="isSnackbarScaleVisible = true">
      Scale snackbar
    </VBtn>

    <VSnackbar
      v-model="isSnackbarScaleVisible"
      transition="scale-transition"
      location="bottom end"
    >
      I'm a scale transition snackbar.
    </VSnackbar>

    <!-- scroll y reverse -->
    <VBtn @click="isSnackbarScrollReverseVisible = true">
      scroll y reverse
    </VBtn>

    <VSnackbar
      v-model="isSnackbarScrollReverseVisible"
      transition="scroll-y-reverse-transition"
      location="top end"
    >
      I'm a scroll y reverse transition snackbar.
    </VSnackbar>
  </div>
</template>
`,js:`<script setup>
const isSnackbarFadeVisible = ref(false)
const isSnackbarScaleVisible = ref(false)
const isSnackbarScrollReverseVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- fade -->
    <VBtn @click="isSnackbarFadeVisible = true">
      fade snackbar
    </VBtn>

    <VSnackbar
      v-model="isSnackbarFadeVisible"
      transition="fade-transition"
      location="top start"
    >
      I'm a fade transition snackbar.
    </VSnackbar>

    <!-- scale -->
    <VBtn @click="isSnackbarScaleVisible = true">
      Scale snackbar
    </VBtn>

    <VSnackbar
      v-model="isSnackbarScaleVisible"
      transition="scale-transition"
      location="bottom end"
    >
      I'm a scale transition snackbar.
    </VSnackbar>

    <!-- scroll y reverse -->
    <VBtn @click="isSnackbarScrollReverseVisible = true">
      scroll y reverse
    </VBtn>

    <VSnackbar
      v-model="isSnackbarScrollReverseVisible"
      transition="scroll-y-reverse-transition"
      location="top end"
    >
      I'm a scroll y reverse transition snackbar.
    </VSnackbar>
  </div>
</template>
`},Ja={ts:`<script lang="ts" setup>
const isDefaultSnackbarVisible = ref(false)
const isTonalSnackbarVisible = ref(false)
const isTextSnackbarVisible = ref(false)
const isOutlinedSnackbarVisible = ref(false)
const isFlatSnackbarVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- Default toggle btn -->
    <VBtn @click="isDefaultSnackbarVisible = true">
      Default
    </VBtn>

    <!-- Default snackbar -->
    <VSnackbar
      v-model="isDefaultSnackbarVisible"
      location="top start"
    >
      Jelly chocolate bar candy canes apple pie.
    </VSnackbar>

    <!-- tonal toggle btn -->
    <VBtn @click="isTonalSnackbarVisible = true">
      tonal
    </VBtn>

    <!-- tonal snackbar -->
    <VSnackbar
      v-model="isTonalSnackbarVisible"
      location="top end"
      variant="tonal"
    >
      Ice cream cake candy canes.
    </VSnackbar>

    <!-- Text toggle btn -->
    <VBtn @click="isTextSnackbarVisible = true">
      Text
    </VBtn>

    <!-- Text snackbar -->
    <VSnackbar
      v-model="isTextSnackbarVisible"
      location="end center"
      variant="text"
    >
      Pie icing biscuit soufflé liquorice topping.
    </VSnackbar>

    <!-- Outline toggle btn -->
    <VBtn @click="isOutlinedSnackbarVisible = true">
      Outlined
    </VBtn>

    <!-- Outline snackbar -->
    <VSnackbar
      v-model="isOutlinedSnackbarVisible"
      location="bottom end"
      variant="outlined"
      color="error"
    >
      Oat cake caramels sesame snaps candy.
    </VSnackbar>

    <!-- flat toggle btn -->
    <VBtn @click="isFlatSnackbarVisible = true">
      Flat
    </VBtn>

    <!-- flat snackbar -->
    <VSnackbar
      v-model="isFlatSnackbarVisible"
      location="bottom start"
      variant="flat"
      color="error"
    >
      Oat cake caramels sesame snaps candy.
    </VSnackbar>
  </div>
</template>
`,js:`<script setup>
const isDefaultSnackbarVisible = ref(false)
const isTonalSnackbarVisible = ref(false)
const isTextSnackbarVisible = ref(false)
const isOutlinedSnackbarVisible = ref(false)
const isFlatSnackbarVisible = ref(false)
<\/script>

<template>
  <div class="demo-space-x">
    <!-- Default toggle btn -->
    <VBtn @click="isDefaultSnackbarVisible = true">
      Default
    </VBtn>

    <!-- Default snackbar -->
    <VSnackbar
      v-model="isDefaultSnackbarVisible"
      location="top start"
    >
      Jelly chocolate bar candy canes apple pie.
    </VSnackbar>

    <!-- tonal toggle btn -->
    <VBtn @click="isTonalSnackbarVisible = true">
      tonal
    </VBtn>

    <!-- tonal snackbar -->
    <VSnackbar
      v-model="isTonalSnackbarVisible"
      location="top end"
      variant="tonal"
    >
      Ice cream cake candy canes.
    </VSnackbar>

    <!-- Text toggle btn -->
    <VBtn @click="isTextSnackbarVisible = true">
      Text
    </VBtn>

    <!-- Text snackbar -->
    <VSnackbar
      v-model="isTextSnackbarVisible"
      location="end center"
      variant="text"
    >
      Pie icing biscuit soufflé liquorice topping.
    </VSnackbar>

    <!-- Outline toggle btn -->
    <VBtn @click="isOutlinedSnackbarVisible = true">
      Outlined
    </VBtn>

    <!-- Outline snackbar -->
    <VSnackbar
      v-model="isOutlinedSnackbarVisible"
      location="bottom end"
      variant="outlined"
      color="error"
    >
      Oat cake caramels sesame snaps candy.
    </VSnackbar>

    <!-- flat toggle btn -->
    <VBtn @click="isFlatSnackbarVisible = true">
      Flat
    </VBtn>

    <!-- flat snackbar -->
    <VSnackbar
      v-model="isFlatSnackbarVisible"
      location="bottom start"
      variant="flat"
      color="error"
    >
      Oat cake caramels sesame snaps candy.
    </VSnackbar>
  </div>
</template>
`},Wa={ts:`<script lang="ts" setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <VSnackbar
    v-model="isSnackbarVisible"
    vertical
  >
    Sugar plum chocolate bar halvah sesame snaps apple pie donut croissant marshmallow. Sweet roll donut gummies sesame snaps icing bear claw tiramisu cotton candy.

    <template #actions>
      <VBtn
        color="success"
        @click="isSnackbarVisible = false"
      >
        Undo
      </VBtn>

      <VBtn
        color="error"
        @click="isSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisible = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisible = true">
    Open Snackbar
  </VBtn>

  <VSnackbar
    v-model="isSnackbarVisible"
    vertical
  >
    Sugar plum chocolate bar halvah sesame snaps apple pie donut croissant marshmallow. Sweet roll donut gummies sesame snaps icing bear claw tiramisu cotton candy.

    <template #actions>
      <VBtn
        color="success"
        @click="isSnackbarVisible = false"
      >
        Undo
      </VBtn>

      <VBtn
        color="error"
        @click="isSnackbarVisible = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`},Ka={ts:`<script lang="ts" setup>
const isSnackbarVisibility = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisibility = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar v-model="isSnackbarVisibility">
    Hello, I'm a snackbar with actions.

    <template #actions>
      <VBtn
        color="error"
        @click="isSnackbarVisibility = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`,js:`<script setup>
const isSnackbarVisibility = ref(false)
<\/script>

<template>
  <VBtn @click="isSnackbarVisibility = true">
    Open Snackbar
  </VBtn>

  <!-- Snackbar -->
  <VSnackbar v-model="isSnackbarVisibility">
    Hello, I'm a snackbar with actions.

    <template #actions>
      <VBtn
        color="error"
        @click="isSnackbarVisibility = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>
`},et={__name:"snackbar",setup(b){return(i,s)=>{const a=ja,r=Ta,c=Ma,v=Aa,o=La,m=Ra,g=Fa,w=Pa,l=Da;return x(),Ia(wa,{class:"match-height"},{default:e(()=>[t(I,{cols:"12",md:"6"},{default:e(()=>[t(r,{title:"Basic",code:u(Ha)},{default:e(()=>[s[0]||(s[0]=V("p",null,[n("The "),V("code",null,"v-snackbar"),n(" component is used to display a quick message to a user. Snackbars support positioning, removal delay, and callbacks.")],-1)),t(a)]),_:1},8,["code"])]),_:1}),t(I,{cols:"12",md:"6"},{default:e(()=>[t(r,{title:"With Action",code:u(Ka)},{default:e(()=>[s[1]||(s[1]=V("p",null,[n("Use "),V("code",null,"actions"),n(" slot to add action button. A "),V("code",null,"v-snackbar"),n(" in its simplest form displays a temporary and closable notification to the user.")],-1)),t(c)]),_:1},8,["code"])]),_:1}),t(I,{cols:"12",md:"6"},{default:e(()=>[t(r,{title:"Multi Line",code:u(qa)},{default:e(()=>[s[2]||(s[2]=V("p",null,[n("The "),V("code",null,"multi-line"),n(" property extends the height of the "),V("code",null,"v-snackbar"),n(" to give you a little more room for content.")],-1)),t(v)]),_:1},8,["code"])]),_:1}),t(I,{cols:"12",md:"6"},{default:e(()=>[t(r,{title:"Timeout",code:u(za)},{default:e(()=>[s[3]||(s[3]=V("p",null,[n("The "),V("code",null,"timeout"),n(" property lets you customize the delay before the "),V("code",null,"v-snackbar"),n(" is hidden.")],-1)),t(o)]),_:1},8,["code"])]),_:1}),t(I,{cols:"12",md:"6"},{default:e(()=>[t(r,{title:"Vertical",code:u(Wa)},{default:e(()=>[s[4]||(s[4]=V("p",null,[n("The "),V("code",null,"vertical"),n(" property allows you to stack the content of your "),V("code",null,"v-snackbar"),n(".")],-1)),t(m)]),_:1},8,["code"])]),_:1}),t(I,{cols:"12",md:"6"},{default:e(()=>[t(r,{title:"Position",code:u(Na)},{default:e(()=>[s[5]||(s[5]=V("p",null,[n("Use "),V("code",null,"location"),n(" prop to change the position of snackbar.")],-1)),t(g)]),_:1},8,["code"])]),_:1}),t(I,{cols:"12",md:"6"},{default:e(()=>[t(r,{title:"Variants",code:u(Ja)},{default:e(()=>[s[6]||(s[6]=V("p",null,[n("Apply different styles to the snackbar using props such as "),V("code",null,"shaped"),n(", "),V("code",null,"rounded"),n(", "),V("code",null,"color"),n(", "),V("code",null,"text"),n(", "),V("code",null,"outlined"),n(", "),V("code",null,"tile"),n(" and more.")],-1)),t(w)]),_:1},8,["code"])]),_:1}),t(I,{cols:"12",md:"6"},{default:e(()=>[t(r,{title:"Transition",code:u(Ya)},{default:e(()=>[s[7]||(s[7]=V("p",null,"Use transition prop to sets the component transition.",-1)),t(l)]),_:1},8,["code"])]),_:1})]),_:1})}}};export{et as default};
