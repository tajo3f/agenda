import AppShell from '@/components/AppShell'
import { createCompany } from './actions'

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return <AppShell admin title="Nova empresa"><div className="page">
    <div className="hello"><h2>Criar cliente TAJO Agenda</h2><p>Cria a empresa, assinatura inicial e acesso do proprietário.</p></div>
    <form action={createCompany} className="card" style={{marginTop:20,maxWidth:820}}>
      {params.error && <div className="notice" style={{borderColor:'#d9b5b5'}}><strong>Não foi possível criar</strong><p>{params.error}</p></div>}
      <div className="formGrid">
        <div className="field"><label>Nome da empresa</label><input required name="name" placeholder="Barbearia Central"/></div>
        <div className="field"><label>Segmento</label><input name="segment" placeholder="Barbearia, estética, fotografia..."/></div>
        <div className="field"><label>Responsável</label><input required name="owner_name" placeholder="Nome completo"/></div>
        <div className="field"><label>E-mail do responsável</label><input required type="email" name="owner_email" placeholder="cliente@email.com"/></div>
        <div className="field"><label>WhatsApp</label><input name="phone" placeholder="(27) 99999-9999"/></div>
        <div className="field"><label>Plano</label><select name="plan" defaultValue="PRO"><option>START</option><option>PRO</option><option>BUSINESS</option></select></div>
        <div className="field full"><label>Link público (opcional)</label><input name="slug" placeholder="barbearia-central"/><small style={{color:'#777'}}>Se vazio, será gerado pelo nome. Ex.: agenda.tajodigital.com.br/agendar/barbearia-central</small></div>
      </div>
      <button className="btn dark" type="submit" style={{marginTop:20}}>Criar empresa e enviar convite</button>
    </form>
  </div></AppShell>
}
