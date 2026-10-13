"use client";
import { CalendarPlus, Link2, QrCode, UserPlus, ArrowRight } from "lucide-react";

const appointments = [
  ["08:30","Mariana Lopes","Design de sobrancelhas","Confirmado"],
  ["10:00","Carlos Henrique","Corte + barba","Confirmado"],
  ["13:30","Ana Paula","Escova","Aguardando"],
  ["15:00","João Martins","Corte tradicional","Confirmado"],
  ["17:30","Pedro Lima","Barba","Confirmado"]
];

export default function DashboardClient(){
 return <div className="page">
  <div className="hello"><h2>Boa tarde, Barbearia Central.</h2><p>Segunda-feira, 12 de outubro · sua operação em um só lugar.</p></div>
  <div className="stats">
    <div className="stat"><div className="statHead"><span>Hoje</span><span>↗</span></div><strong>8</strong><div className="delta">6 confirmados</div></div>
    <div className="stat"><div className="statHead"><span>Receita prevista</span><span>R$</span></div><strong>R$ 485</strong><div className="delta">+12% vs. seg. passada</div></div>
    <div className="stat"><div className="statHead"><span>Taxa de ocupação</span><span>%</span></div><strong>78%</strong><div className="delta">3 horários disponíveis</div></div>
    <div className="stat"><div className="statHead"><span>Clientes no mês</span><span>↗</span></div><strong>94</strong><div className="delta">11 novos clientes</div></div>
  </div>
  <div className="panelGrid">
    <section className="card">
      <div className="cardTitle"><h3>Próximos atendimentos</h3><button className="btn sm">Ver agenda <ArrowRight size={14}/></button></div>
      <div className="timeline">{appointments.map((a,i)=><div className="row" key={i}><div className="time">{a[0]}</div><div><b style={{fontSize:13}}>{a[1]}</b><br/><small>{a[2]}</small></div><span className={`tag ${a[3]==="Confirmado"?"green":"yellow"}`}>{a[3]}</span></div>)}</div>
    </section>
    <div>
      <section className="card">
        <div className="cardTitle"><h3>Ações recomendadas</h3></div>
        <div className="notice"><strong>Horário livre às 16:00</strong><p>Compartilhe o horário disponível e tente preencher sua agenda.</p><button className="btn sm dark" style={{marginTop:10}}>Compartilhar horário</button></div>
        <div className="notice"><strong>2 clientes aguardam confirmação</strong><p>Revise os agendamentos de amanhã antes do fim do dia.</p></div>
        <div className="notice"><strong>Ative as notificações</strong><p>Receba novos agendamentos e cancelamentos direto no celular.</p></div>
      </section>
      <section className="card" style={{marginTop:14}}>
        <div className="cardTitle"><h3>Acesso rápido</h3></div>
        <div className="quick"><button className="btn"><CalendarPlus size={16}/>Agendar</button><button className="btn"><UserPlus size={16}/>Cliente</button><button className="btn"><Link2 size={16}/>Página pública</button><button className="btn"><QrCode size={16}/>QR Code</button></div>
      </section>
    </div>
  </div>
 </div>
}
