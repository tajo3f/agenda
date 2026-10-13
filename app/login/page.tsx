import Logo from '@/components/Logo'
import { login } from './actions'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams
  return <div className="success"><div style={{width:'min(430px,100%)'}}>
    <div style={{marginBottom:22}}><Logo/></div>
    <form action={login} className="card" style={{padding:26}}>
      <h1 style={{fontSize:28,letterSpacing:'-.04em',marginTop:0}}>Acesse sua agenda</h1>
      <p style={{color:'#6d6d69',fontSize:14}}>Entre com o acesso criado pela TAJO.</p>
      {params.error && <div className="notice" style={{borderColor:'#d9b5b5'}}><strong>Não foi possível entrar</strong><p>{params.error}</p></div>}
      <input type="hidden" name="next" value={params.next || '/dashboard'}/>
      <div className="field" style={{marginTop:22}}><label>E-mail</label><input required name="email" type="email" autoComplete="email" placeholder="voce@empresa.com.br"/></div>
      <div className="field" style={{marginTop:12}}><label>Senha</label><input required name="password" type="password" autoComplete="current-password" placeholder="••••••••"/></div>
      <button className="btn dark" style={{width:'100%',marginTop:18}} type="submit">Entrar</button>
    </form>
  </div></div>
}
