import { CalendarPlus, Link2, QrCode, UserPlus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Appointment={id:string;start_at:string;status:string;price_cents:number;customer_name_snapshot:string;service_name:string;professional_name:string}
type Summary={today_count:number;confirmed_count:number;scheduled_count:number;revenue_cents:number;month_customers:number;upcoming:Appointment[]}
function brl(cents:number){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format((cents||0)/100)}

export default function DashboardClient({businessName,slug,summary}:{businessName:string;slug:string;summary:Summary}){
 const appointments=summary.upcoming||[]
 return <div className="page">
  <div className="hello"><h2>Olá, {businessName}.</h2><p>Sua operação de agendamentos em um só lugar.</p></div>
  <div className="stats">
    <div className="stat"><div className="statHead"><span>Hoje</span><span>↗</span></div><strong>{summary.today_count||0}</strong><div className="delta">{summary.confirmed_count||0} confirmados</div></div>
    <div className="stat"><div className="statHead"><span>Receita prevista</span><span>R$</span></div><strong>{brl(summary.revenue_cents||0)}</strong><div className="delta">agendamentos de hoje</div></div>
    <div className="stat"><div className="statHead"><span>Aguardando</span><span>!</span></div><strong>{summary.scheduled_count||0}</strong><div className="delta">a confirmar</div></div>
    <div className="stat"><div className="statHead"><span>Clientes no mês</span><span>↗</span></div><strong>{summary.month_customers||0}</strong><div className="delta">clientes únicos</div></div>
  </div>
  <div className="panelGrid">
    <section className="card"><div className="cardTitle"><h3>Próximos atendimentos</h3><Link className="btn sm" href="/dashboard/agenda">Ver agenda <ArrowRight size={14}/></Link></div>
      <div className="timeline">{appointments.length?appointments.map(a=><div className="row" key={a.id}><div className="time">{new Date(a.start_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'})}</div><div><b style={{fontSize:13}}>{a.customer_name_snapshot}</b><br/><small>{a.service_name} · {a.professional_name}</small></div><span className={`tag ${a.status==='confirmed'?'green':'yellow'}`}>{a.status==='confirmed'?'Confirmado':'Aguardando'}</span></div>):<div className="notice"><strong>Nenhum próximo atendimento</strong><p>Compartilhe sua página pública para começar a receber reservas.</p></div>}</div>
    </section>
    <div><section className="card"><div className="cardTitle"><h3>Ações recomendadas</h3></div><div className="notice"><strong>{summary.scheduled_count||0} aguardando confirmação</strong><p>Use os lembretes para reduzir faltas e cancelamentos de última hora.</p></div><div className="notice"><strong>Página de agendamento ativa</strong><p>Seu link pode ser divulgado no Instagram, WhatsApp e QR Code.</p><Link href={`/agendar/${slug}`} className="btn sm dark" style={{marginTop:10}}>Abrir página</Link></div></section>
      <section className="card" style={{marginTop:14}}><div className="cardTitle"><h3>Acesso rápido</h3></div><div className="quick"><Link className="btn" href="/dashboard/agenda"><CalendarPlus size={16}/>Agenda</Link><Link className="btn" href="/dashboard/clientes"><UserPlus size={16}/>Clientes</Link><Link className="btn" href={`/agendar/${slug}`}><Link2 size={16}/>Página pública</Link><button className="btn"><QrCode size={16}/>QR Code</button></div></section></div>
  </div>
 </div>
}
