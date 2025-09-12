// Router principal (vue-router standard)
import { ref, defineComponent, h, type App } from 'vue'
import Home from '../views/Home.vue'
import Whiteboard from '../views/Whiteboard.vue'
import Room from '../views/Room.vue'
import RoomList from '../views/RoomList.vue'
import Compte from '../views/Compte.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import TestCollaboration from '../views/TestCollaboration.vue'
import AuthTest from '../views/AuthTest.vue'
import NotFound from '../views/NotFound.vue'

interface BasicRoute { path:string; name:string; component:any; props?:boolean }
const routes: BasicRoute[] = [
  { path:'/', name:'Home', component: Home },
  { path:'/whiteboard', name:'Whiteboard', component: Whiteboard },
  { path:'/whiteboard/:roomId', name:'WhiteboardRoom', component: Whiteboard, props:true },
  { path:'/room', name:'Room', component: Room },
  { path:'/room/:id', name:'RoomDetail', component: Room, props:true },
  { path:'/roomList', name:'RoomList', component: RoomList, props:true },
  { path:'/compte', name:'Compte', component: Compte },
  { path:'/login', name:'Login', component: Login },
  { path:'/register', name:'Register', component: Register },
  { path:'/test-collaboration', name:'TestCollaboration', component: TestCollaboration },
  { path:'/auth-test', name:'AuthTest', component: AuthTest },
  { path:'/:pathMatch(.*)*', name:'NotFound', component: NotFound }
]

const currentRoute = ref({ name:'Home', path:'/', params:{} as Record<string,string> })

function parseParams(pattern:string, actual:string) {
  const pSeg = pattern.split('/').filter(Boolean)
  const aSeg = actual.split('/').filter(Boolean)
  const params:Record<string,string> = {}
  pSeg.forEach((seg,i)=>{ if(seg.startsWith(':')) params[seg.substring(1)] = aSeg[i] })
  return params
}

function match(path:string) {
  const exact = routes.find(r=>r.path===path)
  if (exact) return { def: exact, params:{} }
  const segs = path.split('/').filter(Boolean)
  for (const r of routes) {
    const pat = r.path.split('/').filter(Boolean)
    if (pat.length!==segs.length) continue
    let ok = true
    for (let i=0;i<pat.length;i++) { if(!pat[i].startsWith(':') && pat[i]!==segs[i]) { ok=false; break } }
    if (ok) return { def:r, params: parseParams(r.path, path) }
  }
  const nf = routes.find(r=>r.name==='NotFound')!
  return { def: nf, params:{} }
}

const router: any = {
  currentRoute,
  push(to:string) { window.history.pushState({},'',to); this.update(to) },
  replace(to:string) { window.history.replaceState({},'',to); this.update(to) },
  back() { window.history.back() },
  update(p:string) {
    const path = p.split('?')[0]
    const { def, params } = match(path)
    currentRoute.value = { name:def.name, path, params }
    document.title = 'Synkro - ' + def.name
  },
  install(app:App) {
    app.config.globalProperties.$router = router
    app.component('router-link', defineComponent({
      props:{ to:{ type:String, required:true } },
      setup(props,{slots}){ return ()=> h('a',{href:props.to, onClick:(e:MouseEvent)=>{e.preventDefault();router.push(props.to)}}, slots.default?slots.default():props.to) }
    }))
    app.component('router-view', defineComponent({
      setup(){ return ()=> { const r = currentRoute.value; const { def } = match(r.path); return h(def.component,{ key:r.path, ...(r.params||{}) }) } }
    }))
  }
}

window.addEventListener('popstate', ()=> router.update(window.location.pathname))
router.update(window.location.pathname)

export default router
