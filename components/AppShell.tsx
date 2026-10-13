"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Users, Scissors, UserRound, Clock3, Bell, Settings, ShieldCheck, Building2, CreditCard, LogOut } from "lucide-react";
import Logo from "./Logo";

const clientLinks = [
  ["/dashboard", "Visão geral", LayoutDashboard],
  ["/dashboard/agenda", "Agenda", CalendarDays],
  ["/dashboard/clientes", "Clientes", Users],
  ["/dashboard/servicos", "Serviços", Scissors],
  ["/dashboard/profissionais", "Profissionais", UserRound],
  ["/dashboard/horarios", "Horários", Clock3],
  ["/dashboard/notificacoes", "Notificações", Bell],
  ["/dashboard/configuracoes", "Configurações", Settings],
] as const;

const adminLinks = [
  ["/admin", "Visão geral", ShieldCheck],
  ["/admin/empresas", "Empresas", Building2],
  ["/admin/assinaturas", "Assinaturas", CreditCard],
  ["/admin/configuracoes", "Configurações", Settings],
] as const;

export default function AppShell({ children, admin=false, title="TAJO Agenda" }: {children:React.ReactNode;admin?:boolean;title?:string}) {
  const path = usePathname();
  const links = admin ? adminLinks : clientLinks;
  return <div className="shell">
    <aside className="sidebar">
      <div className="sidebrand"><Logo light /></div>
      <nav className="sideNav">
        {links.map(([href,label,Icon]) => <Link key={href} className={`sideLink ${path===href?"active":""}`} href={href}><Icon size={17}/>{label}</Link>)}
      </nav>
      <div className="sideBottom">
        <div className="account"><div className="avatar">{admin?"TA":"BC"}</div><div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:800}}>{admin?"TAJO Digital":"Barbearia Central"}</div><div style={{fontSize:10,color:"#777"}}>{admin?"Super Admin":"Plano Pro"}</div></div><LogOut size={15} style={{marginLeft:"auto"}}/></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><h1>{title}</h1><div className="actions"><Link className="btn sm ghost hideMobile" href={admin?"/dashboard":"/admin"}>{admin?"Ver painel cliente":"Super Admin"}</Link><button className="btn sm"><Bell size={15}/> <span className="hideMobile">Notificações</span></button></div></header>
      {children}
    </main>
    <nav className="mobileNav">
      {links.slice(0,5).map(([href,label,Icon])=><Link key={href} href={href} style={path===href?{color:"#fff"}:{}}><Icon size={19}/>{label}</Link>)}
    </nav>
  </div>
}
