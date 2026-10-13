import Link from "next/link";
import Logo from "@/components/Logo";
export default function Login(){
 return <div className="success"><div style={{width:"min(430px,100%)"}}><div style={{marginBottom:22}}><Logo/></div><div className="card" style={{padding:26}}><h1 style={{fontSize:28,letterSpacing:"-.04em",marginTop:0}}>Acesse sua agenda</h1><p style={{color:"#6d6d69",fontSize:14}}>Entre no painel da sua empresa.</p><div className="field" style={{marginTop:22}}><label>E-mail</label><input placeholder="voce@empresa.com.br"/></div><div className="field" style={{marginTop:12}}><label>Senha</label><input type="password" placeholder="••••••••"/></div><Link href="/dashboard" className="btn dark" style={{width:"100%",marginTop:18}}>Entrar</Link><div style={{textAlign:"center",marginTop:15,fontSize:12,color:"#777"}}>Demonstração: clique em Entrar sem preencher.</div></div></div></div>
}
