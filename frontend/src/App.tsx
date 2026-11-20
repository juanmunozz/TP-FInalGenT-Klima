import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const services = [
  {icon:'✳', title:'Limpieza y sanitización', text:'Limpieza de filtros y componentes para mantener tu equipo en buenas condiciones.'},
  {icon:'⌁', title:'Mantenimiento', text:'Revisión preventiva del funcionamiento general del equipo.'},
  {icon:'↗', title:'Instalación', text:'Instalación de equipos split y puesta en marcha.'},
  {icon:'⇄', title:'Desinstalación', text:'Retiro cuidadoso del equipo y preparación para traslado.'},
  {icon:'⌕', title:'Reparación', text:'Revisión de fallas y propuesta de solución según el diagnóstico.'}
];
type RequestItem = {id:number; customer_name:string; phone:string; service_name:string; status:string; created_at:string; description:string};
export default function App() {
  const [form,setForm] = useState({name:'',phone:'',email:'',zone:'',service:'Limpieza y sanitización',description:''});
  const [notice,setNotice] = useState('');
  const [admin,setAdmin] = useState(false);
  const [token,setToken] = useState(localStorage.getItem('klima_token') || '');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [requests,setRequests] = useState<RequestItem[]>([]);
  const [busy,setBusy] = useState(false);
  const [loginError,setLoginError] = useState('');

  async function submitRequest(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setNotice('');
    try {
      const r=await fetch(`${API}/api/requests`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await r.json(); if(!r.ok) throw new Error(data.error || 'No se pudo enviar la solicitud.');
      setNotice('¡Solicitud enviada! Klima recibió tus datos. Nos pondremos en contacto para coordinar.');
      setForm({name:'',phone:'',email:'',zone:'',service:'Limpieza y sanitización',description:''});
    } catch(err) { setNotice(err instanceof Error ? err.message : 'Error de conexión. Intentá nuevamente.'); }
    finally { setBusy(false); }
  }
  async function loadRequests(t=token) {
    const r=await fetch(`${API}/api/admin/requests`,{headers:{Authorization:`Bearer ${t}`}});
    const data=await r.json(); if(!r.ok) throw new Error(data.error || 'No se pudieron cargar las solicitudes.');
    setRequests(data);
  }
  async function login(e:React.FormEvent) {
    e.preventDefault(); setLoginError('');
    try {
      const r=await fetch(`${API}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const data=await r.json(); if(!r.ok) throw new Error(data.error || 'Credenciales inválidas.');
      localStorage.setItem('klima_token',data.token); setToken(data.token); setAdmin(true); await loadRequests(data.token);
    } catch(err) { setLoginError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.'); }
  }
  async function updateStatus(id:number,status:string) {
    const r=await fetch(`${API}/api/admin/requests/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({status})});
    if(!r.ok) { const d=await r.json(); alert(d.error || 'No se pudo actualizar.'); return; }
    await loadRequests();
  }
  useEffect(()=>{ if(token) { setAdmin(true); loadRequests().catch(()=>{localStorage.removeItem('klima_token');setToken('');setAdmin(false);}); } },[]);
  return <div>
    <header className="nav"><a className="brand" href="#"><span className="brand-mark">K</span> klima<span className="dot">.</span></a><nav><a href="#servicios">Servicios</a><a href="#nosotros">Nosotros</a><a href="#trabajos">Trabajos</a></nav><a className="nav-cta" href="#contacto">Solicitar servicio <span>↗</span></a></header>
    <main>
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span></span> CLIMATIZACIÓN · SERVICIO TÉCNICO</div><h1>El clima ideal<br/>empieza con <em>Klima.</em></h1><p className="hero-lead">Instalación, mantenimiento y servicio técnico de aire acondicionado. Soluciones claras para que estés cómodo todo el año.</p><div className="hero-actions"><a className="btn primary" href="#contacto">Solicitar atención <b>↗</b></a><a className="text-link" href="#servicios">Conocé nuestros servicios <span>→</span></a></div><div className="hero-proof"><div className="proof-icon">✓</div><div><strong>Atención personalizada</strong><small>Evaluamos cada necesidad antes de avanzar.</small></div></div></div><div className="hero-visual"><div className="visual-orbit"></div><div className="visual-card"><div className="visual-top"><span>CONFORT EN CADA ESPACIO</span><span>01 / 05</span></div><div className="ac-unit"><div className="ac-logo">K.</div><div className="ac-vent"></div><div className="ac-light"></div></div><div className="visual-bottom"><span>CLIMATIZACIÓN<br/><b>INTELIGENTE</b></span><span className="temperature">22°</span></div></div><div className="floating-tag"><span>✳</span> Aire limpio. Confort real.</div><div className="vertical-note">KLIMA · SERVICIO TÉCNICO</div></div></section>
      <section className="ticker"><span>CONFORT</span><i>✳</i><span>CONFIANZA</span><i>✳</i><span>CLIMATIZACIÓN</span><i>✳</i><span>BIENESTAR</span></section>
      <section className="section services" id="servicios"><div className="section-head"><div><div className="eyebrow dark">QUÉ HACEMOS</div><h2>Soluciones para<br/><em>cada estación.</em></h2></div><p>Te acompañamos desde la instalación hasta el mantenimiento de tu equipo. Elegí el servicio que necesitás y contanos qué está pasando.</p></div><div className="service-grid">{services.map((s,i)=><article className="service-card" key={s.title}><div className="service-number">0{i+1}</div><div className="service-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.text}</p><a href="#contacto">Consultar servicio <span>↗</span></a></article>)}</div></section>
      <section className="about" id="nosotros"><div className="about-art"><div className="about-circle">K<span>.</span></div><div className="about-stamp">CUIDAMOS<br/>TU CONFORT</div></div><div className="about-copy"><div className="eyebrow">SOMOS KLIMA</div><h2>El servicio que<br/>tu equipo <em>necesita.</em></h2><p>En Klima creemos que un buen servicio empieza escuchando. Trabajamos para ofrecerte una atención directa, explicaciones claras y soluciones acordes a cada equipo.</p><div className="values"><div><b>01</b><span>Atención cercana</span></div><div><b>02</b><span>Trabajo responsable</span></div><div><b>03</b><span>Claridad en cada paso</span></div></div><a className="btn light" href="#contacto">Hablemos de tu equipo <b>↗</b></a></div></section>
      <section className="section process" id="trabajos"><div className="eyebrow dark">CÓMO TRABAJAMOS</div><div className="section-head"><h2>Simple, claro<br/><em>y sin vueltas.</em></h2><p>Nos contás qué necesitás. Revisamos el caso y coordinamos el siguiente paso con vos.</p></div><div className="steps"><div><span>01</span><h3>Nos contactás</h3><p>Completás el formulario con tus datos y lo que necesita tu equipo.</p></div><div><span>02</span><h3>Evaluamos</h3><p>Revisamos la solicitud y coordinamos una visita si hace falta.</p></div><div><span>03</span><h3>Lo resolvemos</h3><p>Te explicamos el trabajo y avanzamos con tu aprobación.</p></div></div></section>
      <section className="contact" id="contacto"><div className="contact-intro"><div className="eyebrow">ESTAMOS PARA AYUDARTE</div><h2>Contanos qué<br/>necesitás <em>resolver.</em></h2><p>Dejanos tus datos y una descripción breve. Vamos a revisar tu solicitud para ponernos en contacto.</p><div className="contact-note"><span>✳</span><div><b>¿No sabés qué servicio elegir?</b><small>Elegí la opción más cercana y describinos el problema.</small></div></div></div><form className="contact-form" onSubmit={submitRequest}><div className="form-title">Solicitá tu servicio <span>FORMULARIO DE CONTACTO</span></div><div className="form-row"><label>Nombre y apellido<input required minLength={2} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Tu nombre"/></label><label>Teléfono<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="11 1234 5678"/></label></div><div className="form-row"><label>Email (opcional)<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="nombre@email.com"/></label><label>Localidad / zona<input required value={form.zone} onChange={e=>setForm({...form,zone:e.target.value})} placeholder="Ej. Caballito"/></label></div><label>¿Qué servicio necesitás?<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}>{services.map(s=><option key={s.title}>{s.title}</option>)}</select></label><label>Contanos un poco más<textarea required minLength={10} rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Marca del equipo, capacidad, qué problema presenta..."/></label><button className="btn primary submit" disabled={busy}>{busy?'Enviando...':'Enviar solicitud'} <b>↗</b></button>{notice&&<div className="notice" role="status">{notice}</div>}<small className="privacy">Al enviar el formulario, autorizás a Klima a utilizar estos datos para responder tu consulta.</small></form></section>
    </main>
    <footer><a className="brand footer-brand" href="#"><span className="brand-mark">K</span> klima<span className="dot">.</span></a><p>Climatización y servicio técnico.<br/>Confort en cada espacio.</p><div className="footer-right"><a href="#servicios">Servicios</a><a href="#contacto">Contacto</a><button onClick={()=>{setAdmin(!admin);document.getElementById('admin')?.scrollIntoView({behavior:'smooth'});}}>Acceso administración ↗</button></div><div className="copyright">© {new Date().getFullYear()} Klima. Todos los derechos reservados.</div></footer>
    <section className="admin-section" id="admin"><div className="admin-inner"><div className="eyebrow dark">ÁREA INTERNA</div><h2>Gestión <em>Klima.</em></h2>{!admin?<form className="login-card" onSubmit={login}><h3>Acceso administrador</h3><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Contraseña<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn primary">Ingresar <b>↗</b></button>{loginError&&<p className="error">{loginError}</p>}</form>:<div className="admin-panel"><div className="admin-toolbar"><p>Solicitudes recibidas</p><button onClick={()=>loadRequests().catch(e=>setLoginError(e.message))}>Actualizar ↻</button><button onClick={()=>{localStorage.removeItem('klima_token');setToken('');setAdmin(false);}}>Cerrar sesión</button></div>{requests.length===0?<p className="empty">Todavía no hay solicitudes registradas.</p>:<div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th>Contacto</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{requests.map(x=><tr key={x.id}><td><b>{x.customer_name}</b><small>{x.description}</small></td><td>{x.service_name}</td><td>{x.phone}</td><td>{new Date(x.created_at).toLocaleDateString('es-AR')}</td><td><select value={x.status} onChange={e=>updateStatus(x.id,e.target.value)}><option>PENDIENTE</option><option>CONTACTADO</option><option>ACEPTADO</option><option>CANCELADO</option></select></td></tr>)}</tbody></table></div>}</div>}</div></section>
  </div>;
}
