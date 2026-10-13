"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { MapPin, Star } from "lucide-react";
const services=[["Corte tradicional","30 min","35"],["Corte + barba","50 min","55"],["Barba","20 min","25"],["Design de sobrancelhas","25 min","45"]];
const dates=[["SEG","12"],["TER","13"],["QUA","14"],["QUI","15"],["SEX","16"]];
const slots=["08:30","09:00","10:00","10:30","13:30","14:00","15:00","16:00","17:30"];
export default function Booking(){
 const [service,setService]=useState(1),[date,setDate]=useState(2),[slot,setSlot]=useState("14:00");
 return <div className="bookingPage"><div className="container"><div className="bookingHead"><Logo/><Link href="/" className="btn sm">Conhecer TAJO Agenda</Link></div><div className="bookingGrid">
  <aside className="businessCard"><div className="businessHero"><div><small>DEMONSTRAÇÃO</small><h2 style={{margin:"4px 0"}}>Barbearia Central</h2></div></div><div style={{padding:"18px 2px 0"}}><div style={{display:"flex",gap:6,alignItems:"center",fontSize:13}}><Star size={14} fill="currentColor"/> 4,9 · Atendimento profissional</div><p style={{color:"#777",fontSize:13,lineHeight:1.5}}>Cortes, barba e cuidados masculinos com atendimento por horário marcado.</p><div style={{display:"flex",gap:6,alignItems:"center",fontSize:13}}><MapPin size={14}/> Centro · Afonso Cláudio — ES</div></div></aside>
  <section className="bookingCard"><span className="eyebrow">Agendamento online</span><h1 style={{fontSize:32,letterSpacing:"-.04em",marginBottom:8}}>Escolha seu atendimento</h1><p style={{color:"#777",fontSize:14}}>Selecione serviço, data e horário. Você não precisa criar uma conta.</p>
   <h3 style={{fontSize:14,marginTop:26}}>1. Serviço</h3>{services.map((s,i)=><div onClick={()=>setService(i)} className={`service ${service===i?"selected":""}`} key={s[0]}><div className="serviceTop"><div><b>{s[0]}</b><br/><small>{s[1]}</small></div><b>R$ {s[2]}</b></div></div>)}
   <h3 style={{fontSize:14,marginTop:26}}>2. Data</h3><div className="dates">{dates.map((d,i)=><button onClick={()=>setDate(i)} className={`dateBtn ${date===i?"active":""}`} key={d[1]}><small>{d[0]}</small><b>{d[1]}</b></button>)}</div>
   <h3 style={{fontSize:14,marginTop:22}}>3. Horário</h3><div className="slots">{slots.map(s=><button onClick={()=>setSlot(s)} className={`slot ${slot===s?"active":""}`} key={s}>{s}</button>)}</div>
   <div className="bookingSummary"><div><span>Serviço</span><b>{services[service][0]}</b></div><div><span>Data</span><b>{dates[date][1]}/10/2026</b></div><div><span>Horário</span><b>{slot}</b></div><div><span>Valor</span><b>R$ {services[service][2]}</b></div></div>
   <div className="formGrid" style={{marginTop:16}}><div className="field"><label>Seu nome</label><input placeholder="Nome completo"/></div><div className="field"><label>WhatsApp</label><input placeholder="(27) 99999-9999"/></div></div>
   <Link href="/agendar/barbearia-central/confirmado" className="btn dark" style={{width:"100%",marginTop:16}}>Confirmar agendamento</Link><p style={{fontSize:11,color:"#888",textAlign:"center"}}>Ao confirmar, o horário ficará reservado para você.</p>
  </section>
 </div></div></div>
}
