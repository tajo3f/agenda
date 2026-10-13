'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star } from 'lucide-react'

type Service={id:string;name:string;description?:string;price_cents:number;duration_minutes:number}
type Professional={id:string;display_name:string;bio?:string;service_ids:string[]}
type Org={id:string;name:string;slug:string;segment?:string;description?:string;city?:string;state?:string;timezone:string}

function isoDate(d: Date){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function brl(cents:number){ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100) }

export default function PublicBooking({organization,services,professionals}:{organization:Org;services:Service[];professionals:Professional[]}){
 const router=useRouter(); const [serviceId,setServiceId]=useState(services[0]?.id||'');
 const eligible=useMemo(()=>professionals.filter(p=>p.service_ids.includes(serviceId)),[professionals,serviceId]);
 const [professionalId,setProfessionalId]=useState(''); const dates=useMemo(()=>Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return d}),[])
 const [date,setDate]=useState(isoDate(dates[1]||dates[0])); const [slots,setSlots]=useState<any[]>([]); const [slot,setSlot]=useState('');
 const [loading,setLoading]=useState(false); const [booking,setBooking]=useState(false); const [error,setError]=useState('');
 const service=services.find(s=>s.id===serviceId)

 useEffect(()=>{ if(!eligible.some(p=>p.id===professionalId)) setProfessionalId(eligible[0]?.id||'') },[eligible,professionalId])
 useEffect(()=>{ if(!serviceId||!professionalId||!date)return; setLoading(true);setSlot('');fetch(`/api/public/slots?slug=${encodeURIComponent(organization.slug)}&serviceId=${serviceId}&professionalId=${professionalId}&date=${date}`).then(r=>r.json()).then(j=>setSlots(j.slots||[])).finally(()=>setLoading(false)) },[serviceId,professionalId,date,organization.slug])

 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setError('');if(!slot)return setError('Escolha um horário.');setBooking(true);const fd=new FormData(e.currentTarget);const r=await fetch('/api/public/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:organization.slug,serviceId,professionalId,date,time:slot,customerName:fd.get('name'),customerPhone:fd.get('phone')})});const j=await r.json();setBooking(false);if(!r.ok)return setError(j.error||'Não foi possível agendar.');router.push(`/agendar/${organization.slug}/confirmado?id=${j.appointmentId}`)}

 return <div className="bookingGrid">
  <aside className="businessCard"><div className="businessHero"><div><small>AGENDAMENTO ONLINE</small><h2 style={{margin:'4px 0'}}>{organization.name}</h2></div></div><div style={{padding:'18px 2px 0'}}><div style={{display:'flex',gap:6,alignItems:'center',fontSize:13}}><Star size={14} fill="currentColor"/> Atendimento por horário marcado</div><p style={{color:'#777',fontSize:13,lineHeight:1.5}}>{organization.description||'Escolha seu serviço e reserve o melhor horário disponível.'}</p>{organization.city&&<div style={{display:'flex',gap:6,alignItems:'center',fontSize:13}}><MapPin size={14}/>{organization.city}{organization.state?` — ${organization.state}`:''}</div>}</div></aside>
  <form className="bookingCard" onSubmit={submit}><span className="eyebrow">Agenda disponível</span><h1 style={{fontSize:32,letterSpacing:'-.04em',marginBottom:8}}>Escolha seu atendimento</h1><p style={{color:'#777',fontSize:14}}>Você não precisa criar uma conta para reservar.</p>
   <h3 style={{fontSize:14,marginTop:26}}>1. Serviço</h3>{services.map(s=><button type="button" onClick={()=>setServiceId(s.id)} className={`service ${serviceId===s.id?'selected':''}`} style={{width:'100%',textAlign:'left',background:'#fff'}} key={s.id}><div className="serviceTop"><div><b>{s.name}</b><br/><small>{s.duration_minutes} min</small></div><b>{brl(s.price_cents)}</b></div></button>)}
   {eligible.length>1&&<><h3 style={{fontSize:14,marginTop:26}}>2. Profissional</h3><div className="dates">{eligible.map(p=><button type="button" className={`dateBtn ${professionalId===p.id?'active':''}`} style={{minWidth:130}} onClick={()=>setProfessionalId(p.id)} key={p.id}><b>{p.display_name}</b></button>)}</div></>}
   <h3 style={{fontSize:14,marginTop:26}}>{eligible.length>1?'3':'2'}. Data</h3><div className="dates">{dates.map(d=><button type="button" onClick={()=>setDate(isoDate(d))} className={`dateBtn ${date===isoDate(d)?'active':''}`} key={isoDate(d)}><small>{d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','').toUpperCase()}</small><b>{d.getDate()}</b></button>)}</div>
   <h3 style={{fontSize:14,marginTop:22}}>{eligible.length>1?'4':'3'}. Horário</h3>{loading?<p style={{color:'#777'}}>Consultando horários...</p>:<div className="slots">{slots.map(s=><button type="button" onClick={()=>setSlot(String(s.slot_time).slice(0,5))} className={`slot ${slot===String(s.slot_time).slice(0,5)?'active':''}`} key={s.start_at}>{String(s.slot_time).slice(0,5)}</button>)}</div>}{!loading&&slots.length===0&&<div className="notice"><strong>Sem horários disponíveis</strong><p>Tente outra data ou profissional.</p></div>}
   <div className="bookingSummary"><div><span>Serviço</span><b>{service?.name||'—'}</b></div><div><span>Data</span><b>{date.split('-').reverse().join('/')}</b></div><div><span>Horário</span><b>{slot||'Escolha acima'}</b></div><div><span>Valor</span><b>{service?brl(service.price_cents):'—'}</b></div></div>
   <div className="formGrid" style={{marginTop:16}}><div className="field"><label>Seu nome</label><input required name="name" placeholder="Nome completo"/></div><div className="field"><label>WhatsApp</label><input required name="phone" placeholder="(27) 99999-9999"/></div></div>
   {error&&<div className="notice" style={{borderColor:'#d9b5b5'}}><strong>Revise o agendamento</strong><p>{error}</p></div>}
   <button disabled={booking||!slot} className="btn dark" style={{width:'100%',marginTop:16,opacity:(booking||!slot)?0.65:1}} type="submit">{booking?'Reservando...':'Confirmar agendamento'}</button><p style={{fontSize:11,color:'#888',textAlign:'center'}}>O sistema valida o horário novamente antes de confirmar.</p>
  </form>
 </div>
}
