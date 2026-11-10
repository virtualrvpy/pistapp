import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CalendarDays, ChevronRight, Clock3, Edit3, Flag, Home, Medal, Plus, Route, Settings, Sparkles, Trophy, X } from 'lucide-react'
import './style.css'
import { supabase } from './supabase'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`))
}

type Training = { id:string; date:string; title:string; distance:number; reps:number; micro:string; macro:string; pace:string; feeling:number; notes:string }
type PB = { distance:string; time:string; date:string; place:string }
const distances = [100,200,300,400,500,600,800,1000,1200,1600,2000,3000,5000]
const pbDistances = ['400 m','1000 m','1500 m','3000 m','5K','10K','21K','42K']
const sample:Training[] = [
  { id:'seed1', date:'2026-11-10', title:'Series de ritmo', distance:400, reps:8, micro:'1:00', macro:'3:00', pace:'3:48/km', feeling:4, notes:'Buena técnica al final.' },
  { id:'seed2', date:'2026-11-07', title:'Fondo progresivo', distance:1000, reps:5, micro:'1:30', macro:'4:00', pace:'4:10/km', feeling:3, notes:'Controlado.' }
]
const stored = <T,>(key:string, fallback:T):T => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
const seconds = (text:string) => { const [m,s] = text.split(':').map(Number); return (isNaN(s) ? 0 : m*60+s) }
const format = (s:number) => `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`
const equivalent = (time:string, d:number) => { const base=seconds(time); return base ? format(base*d/400) : '—' }

function App() {
  const [tab,setTab]=useState<'home'|'trainings'|'paces'|'trophies'>('home')
  const [trainings,setTrainings]=useState<Training[]>(()=>stored('pista-trainings', sample))
  const [pbs,setPbs]=useState<PB[]>(()=>stored('pista-pbs', pbDistances.map(distance=>({distance,time:'',date:'',place:''}))))
  const [open,setOpen]=useState(false)
  const [pace,setPace]=useState('1:30')
  const [user,setUser]=useState<any>(null)
  const [email,setEmail]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>setUser(data.session?.user??null));const {data}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user??null));return()=>data.subscription.unsubscribe()},[])
  useEffect(()=>{if(!supabase||!user)return;let active=true;(async()=>{const [{data:ts,error:te},{data:ps,error:pe}]=await Promise.all([supabase!.from('trainings').select('*').order('date',{ascending:false}),supabase!.from('personal_bests').select('*')]);if(!active)return;if(te||pe){setMessage('No se pudo sincronizar con la nube.');return}if(ts)setTrainings(ts.map((t:any)=>({id:t.id,date:t.date,title:t.title,distance:t.distance,reps:t.reps,micro:t.micro_pause||'',macro:t.macro_pause||'',pace:t.target_pace||'',feeling:t.feeling||3,notes:t.notes||''})));if(ps)setPbs(pbDistances.map(distance=>{const x=ps.find((p:any)=>p.distance===distance);return{distance,time:x?.time||'',date:x?.date||'',place:x?.place||''}}))})();return()=>{active=false}},[user])
  const signIn=async(e:React.FormEvent)=>{e.preventDefault();if(!supabase){setMessage('Configuración de Supabase pendiente.');return}setBusy(true);const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:'https://virtualrvpy.github.io/pistapp/'}});setMessage(error?.message||'Te enviamos el enlace. Revisá tu correo.');setBusy(false)}
  useEffect(()=>localStorage.setItem('pista-trainings',JSON.stringify(trainings)),[trainings])
  useEffect(()=>localStorage.setItem('pista-pbs',JSON.stringify(pbs)),[pbs])
  const today=trainings[0]
  const donePB=pbs.filter(p=>p.time).length
  const saveTraining=(data:Training)=>{ setTrainings(x=>[data,...x]); if(supabase&&user)void supabase.from('trainings').insert({date:data.date,title:data.title,distance:data.distance,reps:data.reps,micro_pause:data.micro,macro_pause:data.macro,target_pace:data.pace,feeling:data.feeling,notes:data.notes}).then(({error})=>error&&setMessage('Error al sincronizar entrenamiento.'));setOpen(false);setTab('trainings') }
  return <main className="shell">
    <header className="top"><div><p className="eyebrow">ENTRENAMIENTO</p><h1>{tab==='home'?'Hoy':tab==='trainings'?'Entrenos':tab==='paces'?'Equivalencias':'Marcas personales'}</h1></div><button className="profile" onClick={()=>user&&supabase?.auth.signOut()} title={user?'Cerrar sesión':'Cuenta'}><span>{user?'✓':'R'}</span></button></header>
    {!user&&<form className="signin card" onSubmit={signIn}><strong>Accedé para sincronizar tus datos</strong><input type="email" required placeholder="Tu correo electrónico" value={email} onChange={e=>setEmail(e.target.value)}/><button className="primary" disabled={busy}>{busy?'Enviando…':'Enviar enlace de acceso'}</button>{message&&<small>{message}</small>}</form>}{user&&message&&<p className="notice">{message}</p>}
    {tab==='home' && <HomeView training={today} setTab={setTab} donePB={donePB} />}
    {tab==='trainings' && <Trainings items={trainings} onAdd={()=>setOpen(true)} />}
    {tab==='paces' && <Paces pace={pace} setPace={setPace} />}
    {tab==='trophies' && <Trophies pbs={pbs} setPbs={setPbs} />}
    <nav className="nav">
      <Nav icon={<Home/>} label="Inicio" active={tab==='home'} onClick={()=>setTab('home')}/><Nav icon={<CalendarDays/>} label="Entrenos" active={tab==='trainings'} onClick={()=>setTab('trainings')}/><Nav icon={<Route/>} label="Ritmos" active={tab==='paces'} onClick={()=>setTab('paces')}/><Nav icon={<Trophy/>} label="Trofeos" active={tab==='trophies'} onClick={()=>setTab('trophies')}/>
    </nav>
    {tab==='home' && <button className="fab" onClick={()=>setOpen(true)} aria-label="Registrar entrenamiento"><Plus/></button>}
    {open && <TrainingForm onClose={()=>setOpen(false)} onSave={saveTraining}/>} 
  </main>
}
function Nav({icon,label,active,onClick}:{icon:React.ReactNode;label:string;active:boolean;onClick:()=>void}) { return <button className={'nav-item '+(active?'active':'')} onClick={onClick}>{icon}<span>{label}</span></button> }
function HomeView({training,setTab,donePB}:{training:Training;setTab:(v:any)=>void;donePB:number}) { return <section className="content home">
  <div className="welcome"><p>martes, 10 de noviembre</p><h2>Listo para <em>sumar</em></h2></div>
  <article className="next card"><div className="card-label"><span className="dot"/> PRÓXIMA SESIÓN</div><h3>{training.title}</h3><div className="metrics"><b>{training.reps} × {training.distance}<small>metros</small></b><span/><b>{training.pace}<small>ritmo objetivo</small></b></div><div className="details"><span><Clock3/> Micro {training.micro}</span><span><Clock3/> Macro {training.macro}</span></div></article>
  <button className="section-title" onClick={()=>setTab('trophies')}><span><Trophy/> Mural de trofeos</span><ChevronRight/></button>
  <article className="trophy-preview card" onClick={()=>setTab('trophies')}><div className="mini-cup"><Medal/></div><div><strong>{donePB} de 8 marcas configuradas</strong><p>Tu próxima marca está esperando.</p></div><div className="progress"><i style={{width:`${donePB/8*100}%`}}/></div></article>
  <button className="section-title" onClick={()=>setTab('trainings')}><span><CalendarDays/> Últimos entrenos</span><ChevronRight/></button>
  <article className="recent card"><strong>7 NOV · Fondo progresivo</strong><span>5 × 1000 m <b>·</b> 4:10/km</span><div className="feel">● ● ● <i>●</i> <i>●</i></div></article>
</section> }
function Trainings({items,onAdd}:{items:Training[];onAdd:()=>void}) { return <section className="content"><button className="primary add" onClick={onAdd}><Plus/> Registrar entrenamiento</button><div className="list">{items.map(t=><article className="training card" key={t.id}><div className="training-head"><p>{new Date(t.date+'T12:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'}).toUpperCase()}</p><span>{'●'.repeat(t.feeling)}<i>{'●'.repeat(5-t.feeling)}</i></span></div><h3>{t.title}</h3><div className="training-grid"><b>{t.reps} × {t.distance}<small>m</small></b><b>{t.pace}<small>objetivo</small></b></div><p className="notes">{t.notes || 'Sin notas.'}</p></article>)}</div></section> }
function Paces({pace,setPace}:{pace:string;setPace:(v:string)=>void}) { return <section className="content"><div className="calculator card"><p className="card-label">REFERENCIA DE RITMO</p><label>Tiempo para 400 metros<input value={pace} onChange={e=>setPace(e.target.value)} inputMode="numeric" placeholder="1:30"/></label><p>Ingresá minutos y segundos, por ejemplo <b>1:30</b>.</p></div><div className="pace-table"><div className="thead"><span>Distancia</span><span>Tiempo</span><span>Ritmo/km</span></div>{distances.map(d=>{const t=equivalent(pace,d);const p=seconds(pace)?format(seconds(pace)*1000/400):'—';return <div className="trow" key={d}><strong>{d} m</strong><b>{t}</b><span>{p}</span></div>})}</div></section> }
function Trophies({pbs,setPbs}:{pbs:PB[];setPbs:(v:PB[])=>void}) { const update=(i:number,k:keyof PB,v:string)=>{const next=pbs.map((p,n)=>n===i?{...p,[k]:v}:p);setPbs(next);if(supabase?.auth.getSession)void supabase.auth.getSession().then(({data})=>{if(data.session)void supabase!.from('personal_bests').upsert({distance:next[i].distance,time:next[i].time,date:next[i].date||null,place:next[i].place||null,user_id:data.session.user.id},{onConflict:'user_id,distance'})})}; return <section className="content"><p className="intro">Tus mejores marcas, siempre a la vista.</p><div className="trophy-grid">{pbs.map((p,i)=><article className={'pb card '+(p.time?'earned':'')} key={p.distance}><div className="pb-top"><span>{p.time?<Trophy/>:<Flag/>}</span><label className="distance">{p.distance}</label></div><input className="pb-time" value={p.time} onChange={e=>update(i,'time',e.target.value)} placeholder="—:——" inputMode="numeric" aria-label={`Marca ${p.distance}`}/><div className="pb-meta"><input value={p.date} onChange={e=>update(i,'date',e.target.value)} placeholder="Fecha"/><input value={p.place} onChange={e=>update(i,'place',e.target.value)} placeholder="Lugar"/></div>{p.time&&<div className="shine"/>}</article>)}</div></section> }
function TrainingForm({onClose,onSave}:{onClose:()=>void;onSave:(x:Training)=>void}) { const [f,setF]=useState({title:'Series en pista',date:new Date().toISOString().slice(0,10),distance:'400',reps:'6',micro:'1:00',macro:'3:00',pace:'3:50/km',feeling:'4',notes:''}); const field=(k:keyof typeof f)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setF({...f,[k]:e.target.value}); return <div className="overlay"><form className="modal" onSubmit={e=>{e.preventDefault();onSave({id:crypto.randomUUID(),...f,distance:+f.distance,reps:+f.reps,feeling:+f.feeling})}}><header><div><p className="eyebrow">NUEVO REGISTRO</p><h2>Entrenamiento</h2></div><button type="button" onClick={onClose}><X/></button></header><label>Nombre<input value={f.title} onChange={field('title')}/></label><div className="two"><label>Fecha<input type="date" value={f.date} onChange={field('date')}/></label><label>Sensaciones (1–5)<input type="number" min="1" max="5" value={f.feeling} onChange={field('feeling')}/></label></div><div className="two"><label>Distancia (m)<input inputMode="numeric" value={f.distance} onChange={field('distance')}/></label><label>Repeticiones<input inputMode="numeric" value={f.reps} onChange={field('reps')}/></label></div><div className="two"><label>Micropausa<input value={f.micro} onChange={field('micro')}/></label><label>Macropausa<input value={f.macro} onChange={field('macro')}/></label></div><label>Ritmo objetivo<input value={f.pace} onChange={field('pace')}/></label><label>Notas<textarea value={f.notes} onChange={field('notes')}/></label><button className="primary" type="submit">Guardar entrenamiento</button></form></div> }
createRoot(document.getElementById('root')!).render(<App />)

