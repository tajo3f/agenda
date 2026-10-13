export default function Logo({ light=false }: { light?: boolean }) {
  return <div className="brand"><span className="brandmark" style={light?{background:"#fff",color:"#111"}:{}}>TA</span><span>TAJO Agenda</span></div>
}
