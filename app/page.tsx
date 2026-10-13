import Link from "next/link";
import { BellRing, CalendarCheck2, Clock3, QrCode, ShieldCheck, UsersRound } from "lucide-react";
import Logo from "@/components/Logo";

export default function Home(){
 return <>
  <header className="container nav"><Logo/><nav className="navlinks"><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#publico">Para quem é</a></nav><div className="actions"><Link className="btn ghost hideMobile" href="/login">Entrar</Link><Link className="btn dark" href="/agendar/barbearia-central">Ver demonstração</Link></div></header>
  <main>
   <section className="container hero">
    <div><span className="eyebrow"><span>●</span> Agenda profissional, sem complicação</span><h1>Menos conversa.<br/>Mais horários preenchidos.</h1><p>Organize serviços, profissionais e clientes em uma agenda simples. Receba agendamentos online e prepare sua operação para confirmações e lembretes automáticos.</p><div className="heroBtns"><Link className="btn dark" href="/agendar/barbearia-central">Testar experiência do cliente</Link><Link className="btn" href="/dashboard">Ver painel profissional</Link></div><div className="micro">Pensado para barbearias, salões, estética, fotografia, consultorias e outros serviços.</div></div>
    <div className="mock"><div className="mockInner"><div className="mockTop"><Logo/><div className="dots"><i/><i/><i/></div></div><div className="mockBody"><small style={{color:"#777"}}>SEGUNDA, 12 OUT</small><h3 style={{margin:"6px 0 16px",fontSize:22}}>Sua agenda de hoje</h3><div className="kpis"><div className="kpi"><small>Atendimentos</small><strong>8</strong></div><div className="kpi"><small>Confirmados</small><strong>6</strong></div><div className="kpi"><small>Previsto</small><strong>R$485</strong></div></div><div className="appt"><div><b>14:30 · Carlos</b><br/><small style={{color:"#777"}}>Corte + barba</small></div><span className="pill">Confirmado</span></div><div className="appt"><div><b>16:00 · Horário livre</b><br/><small style={{color:"#777"}}>Compartilhe para preencher</small></div><button className="btn sm dark">Compartilhar</button></div></div></div></div>
   </section>
   <section id="recursos" className="section"><div className="container"><div className="sectionHead"><h2>Uma agenda que ajuda a operação a andar.</h2><p>O produto foi desenhado para resolver tarefas recorrentes sem transformar o pequeno negócio em operador de software.</p></div><div className="grid3">
    <div className="feature"><div className="icon"><CalendarCheck2 size={19}/></div><h3>Agendamento online</h3><p>O cliente escolhe serviço, profissional, data e horário em uma página pública responsiva.</p></div>
    <div className="feature"><div className="icon"><BellRing size={19}/></div><h3>Lembretes preparados</h3><p>Arquitetura pronta para push e lembretes configuráveis antes do atendimento.</p></div>
    <div className="feature"><div className="icon"><Clock3 size={19}/></div><h3>Horários e bloqueios</h3><p>Defina expediente, intervalos, folgas e períodos indisponíveis sem conflito de agenda.</p></div>
    <div className="feature"><div className="icon"><UsersRound size={19}/></div><h3>Equipe e clientes</h3><p>Organize profissionais, serviços e histórico de clientes em um único ambiente.</p></div>
    <div className="feature"><div className="icon"><QrCode size={19}/></div><h3>Link e QR Code</h3><p>Transforme balcão, Instagram e WhatsApp em portas de entrada para o agendamento.</p></div>
    <div className="feature"><div className="icon"><ShieldCheck size={19}/></div><h3>Multiempresa</h3><p>Cada negócio tem seu ambiente isolado, enquanto a TAJO administra a plataforma central.</p></div>
   </div></div></section>
   <section id="como-funciona" className="section"><div className="container"><div className="sectionHead"><h2>Do link ao horário confirmado.</h2></div><div className="steps"><div className="step"><b>01</b><h3>Serviço</h3><p>O cliente escolhe o que deseja agendar.</p></div><div className="step"><b>02</b><h3>Horário</h3><p>Visualiza somente os horários realmente disponíveis.</p></div><div className="step"><b>03</b><h3>Dados</h3><p>Informa nome e contato sem criar uma conta complexa.</p></div><div className="step"><b>04</b><h3>Confirmação</h3><p>O profissional recebe o agendamento no painel.</p></div></div></div></section>
   <section id="publico" className="section"><div className="container"><div className="cta"><div><h2>Seu negócio vende tempo? Então sua agenda precisa trabalhar com você.</h2><p>Uma base neutra para diferentes marcas e segmentos.</p></div><Link className="btn" href="/agendar/barbearia-central">Abrir demonstração</Link></div></div></section>
  </main>
  <footer className="container footer"><div>© 2026 TAJO Digital · TAJO Agenda</div><div>Soluções digitais para negócios.</div></footer>
 </>
}
