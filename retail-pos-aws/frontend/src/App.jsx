import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Authenticator, ThemeProvider, useAuthenticator, View, Image, Text } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

// ASSETS
import logoImage from './assets/logo.png';
import producto1 from './assets/producto1.jpeg';
import producto2 from './assets/producto2_.jpeg';
import producto3 from './assets/producto3.jpeg';
import paginainicio1 from './assets/paginainicio1.png';
import paginainicio2 from './assets/paginainicio2.png';

// ✅ CORREGIDO: IDs de Cognito actualizados a tu cuenta
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_SAazwJL7u',
      userPoolClientId: '6d5729jibb5pnpmqvsa10a5fmk',
      loginWith: { email: true, username: true }
    }
  }
});

// URL del backend
const API_URL = 'http://44.249.69.170:3000';

// ===============================
// TEMA PERSONALIZADO (ROSA & NEGRO)
// ===============================
const temaJeudi = {
  name: 'tema-jeudi',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: '#fce4ec',
          80: '#f06292',
          90: '#ec407a',
          100: '#d81b60',
        },
      },
    },
    components: {
      authenticator: {
        router: {
          borderWidth: '1px',
          borderColor: '#f8bbd0',
          backgroundColor: '#fff',
        },
      },
      tabs: {
        item: {
          _active: { color: '#f06292', borderColor: '#f06292' },
          _hover: { color: '#ec407a' },
        },
      },
      button: {
        primary: {
          backgroundColor: '#1a1a1a',
          _hover: { backgroundColor: '#f06292' },
        },
        link: { color: '#f06292' },
      },
      fieldcontrol: {
        borderColor: '#f8bbd0',
        _focus: { borderColor: '#f06292', boxShadow: '0 0 0 1px #f06292' },
      },
    },
  },
};

const textos = {
  es: {
    inicio: 'INICIO', productos: 'PRODUCTOS', pedidos: 'PEDIDOS', roles: 'ROLES',
    entrar: 'ENTRAR', salir: 'SALIR', hero: 'Hecho a mano. Para ti.',
    verCatalogo: 'VER CATÁLOGO', panel: 'Panel de Control', usuario: 'Usuario',
    rol: 'Rol', cliente: 'cliente', gestionPedidos: 'Gestión de Pedidos',
    nuevoPedido: 'Nuevo Pedido', clienteTabla: 'Cliente', producto: 'Producto',
    estatus: 'Estatus', nombre: 'Tu nombre/Email', descripcion: 'Descripción adicional',
    enviar: 'ENVIAR PEDIDO', vistaPublica: 'Vista Pública',
    soloAdmin: 'Solo los administradores pueden acceder.', gestionRoles: 'Gestión de Roles',
    correo: 'Correo/Usuario', guardar: 'GUARDAR', noPedidos: 'Sin pedidos registrados',
    exito: 'Éxito', pedidoEnviado: 'Pedido enviado correctamente', error: 'Error',
    noEnviar: 'No se pudo enviar', pedirAhora: 'PEDIR AHORA',
    sobreNosotros: 'Nuestra Historia',
    sobreTexto: 'Jeudi Shop nace del amor por los accesorios hechos a mano. Cada bolso, sombrero y tote bag es creado con dedicación y materiales de calidad para acompañarte por muchos años.',
    derechosReservados: '© 2025 Jeudi Shop. Todos los derechos reservados.',
    siguenos: 'Síguenos',
    contacto: 'Contacto',
    seleccionarProducto: 'Seleccionar producto',
    sinPedidos: 'No tienes pedidos aún.',
    pendiente: 'pendiente', terminado: 'terminado', entregado: 'entregado',
  },
  en: {
    inicio: 'HOME', productos: 'PRODUCTS', pedidos: 'ORDERS', roles: 'ROLES',
    entrar: 'LOGIN', salir: 'LOGOUT', hero: 'Handmade. For you.',
    verCatalogo: 'VIEW CATALOG', panel: 'Control Panel', usuario: 'User',
    rol: 'Role', cliente: 'client', gestionPedidos: 'Orders Management',
    nuevoPedido: 'New Order', clienteTabla: 'Client', producto: 'Product',
    estatus: 'Status', nombre: 'Name/Email', descripcion: 'Additional description',
    enviar: 'SEND ORDER', vistaPublica: 'Public View',
    soloAdmin: 'Admins only.', gestionRoles: 'Role Management',
    correo: 'User/Email', guardar: 'SAVE', noPedidos: 'No orders found',
    exito: 'Success', pedidoEnviado: 'Order sent', error: 'Error', noEnviar: 'Failed',
    pedirAhora: 'ORDER NOW',
    sobreNosotros: 'Our Story',
    sobreTexto: 'Jeudi Shop was born from a love of handmade accessories. Each bag, hat, and tote is crafted with care and quality materials to last for years.',
    derechosReservados: '© 2025 Jeudi Shop. All rights reserved.',
    siguenos: 'Follow us',
    contacto: 'Contact',
    seleccionarProducto: 'Select product',
    sinPedidos: "You don't have any orders yet.",
    pendiente: 'pending', terminado: 'finished', entregado: 'delivered',
  }
};

// ===============================
// ESTILOS GLOBALES INYECTADOS
// ===============================
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Jost', sans-serif; }

  .nav-link {
    background: none; border: none; cursor: pointer; font-weight: 500;
    font-family: 'Jost', sans-serif; font-size: 0.82rem; letter-spacing: 0.08em;
    padding: 4px 0; transition: color 0.2s;
  }
  .nav-link:hover { color: #f06292 !important; }

  .producto-card {
    cursor: pointer; text-align: center;
    border: 1px solid #fce4ec; padding: 20px;
    background: #fff; transition: transform 0.3s, box-shadow 0.3s;
    display: flex; flex-direction: column;
  }
  .producto-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(240,98,146,0.15); }

  .btn-pedir {
    background: #1a1a1a; color: #fff; border: none;
    padding: 11px 20px; cursor: pointer; width: 100%; margin-top: 14px;
    font-family: 'Jost', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em;
    transition: background 0.25s;
  }
  .btn-pedir:hover { background: #f06292; }

  .estatus-badge {
    display: inline-block; padding: 4px 12px; border-radius: 20px;
    font-size: 0.78rem; font-weight: 500; letter-spacing: 0.05em;
  }
  .estatus-pendiente { background: #fff3cd; color: #856404; }
  .estatus-terminado { background: #d1ecf1; color: #0c5460; }
  .estatus-entregado { background: #d4edda; color: #155724; }

  .form-input {
    width: 100%; padding: 12px 14px; margin-bottom: 16px;
    border: 1px solid #f8bbd0; outline: none; font-family: 'Jost', sans-serif;
    font-size: 0.95rem; transition: border-color 0.2s;
  }
  .form-input:focus { border-color: #f06292; }

  .hero-section {
    position: relative; min-height: 82vh;
    display: flex; align-items: center; justify-content: center;
    text-align: center; overflow: hidden;
  }

  .sobre-nosotros {
    background: #fce4ec; padding: 80px 8%; text-align: center;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.7s ease forwards; }

  .table-row:hover { background: #fdf0f5; }

  select.form-select {
    padding: 6px 10px; border: 1px solid #f8bbd0;
    font-family: 'Jost', sans-serif; font-size: 0.85rem; cursor: pointer;
    outline: none; background: #fff;
  }
  select.form-select:focus { border-color: #f06292; }
`;

// ===============================
// NAVBAR
// ===============================
function Navbar({ user, signOut, pantalla, setPantalla, idioma, setIdioma }) {
  const t = textos[idioma];
  const [menuOpen, setMenuOpen] = useState(false);

  const getLinkStyle = (p) => ({
    color: pantalla === p ? '#f06292' : '#1a1a1a',
    borderBottom: pantalla === p ? '2px solid #f06292' : '2px solid transparent',
  });

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #fce4ec', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Top bar */}
      <div style={{ background: '#1a1a1a', color: '#fce4ec', display: 'flex', justifyContent: 'space-between', padding: '5px 8%', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
        <span>TEL: 4531257355</span>
        <span>INSTAGRAM: @jeudi_shoop</span>
      </div>
      {/* Main nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 8%', background: '#fce4ec' }}>
        {/* Logo */}
        <div onClick={() => setPantalla('inicio')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <img src={logoImage} alt="logo" style={{ width: '52px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a', fontSize: '1.3rem', fontWeight: 700 }}>JEUDI SHOP</h2>
        </div>
        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="nav-link" style={getLinkStyle('inicio')} onClick={() => setPantalla('inicio')}>{t.inicio}</button>
          <button className="nav-link" style={getLinkStyle('catalogo')} onClick={() => setPantalla('catalogo')}>{t.productos}</button>
          {user && <button className="nav-link" style={getLinkStyle('pedido')} onClick={() => setPantalla('pedido')}>{t.pedidos}</button>}
          {user && <button className="nav-link" style={getLinkStyle('roles')} onClick={() => setPantalla('roles')}>{t.roles}</button>}
          {/* Idioma */}
          <button onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}
            style={{ background: '#fff', border: '1px solid #f8bbd0', padding: '5px 10px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Jost', sans-serif", letterSpacing: '0.05em' }}>
            {idioma.toUpperCase()}
          </button>
          {/* Entrar / Salir */}
          {user
            ? <button onClick={signOut} style={{ background: 'none', border: '1px solid #1a1a1a', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.8rem', letterSpacing: '0.08em', transition: 'all 0.2s' }}
                onMouseOver={e => { e.target.style.background='#1a1a1a'; e.target.style.color='#fff'; }}
                onMouseOut={e => { e.target.style.background='none'; e.target.style.color='#1a1a1a'; }}>
                {t.salir}
              </button>
            : <button onClick={() => setPantalla('login')} style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '9px 20px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background='#f06292'}
                onMouseOut={e => e.target.style.background='#1a1a1a'}>
                {t.entrar}
              </button>
          }
        </div>
      </div>
    </nav>
  );
}

// ===============================
// FOOTER
// ===============================
function Footer({ idioma, setPantalla }) {
  const t = textos[idioma];
  return (
    <footer style={{ background: '#1a1a1a', color: '#fce4ec', padding: '50px 8% 30px', marginTop: '80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        {/* Columna 1 — Marca */}
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '12px' }}>JEUDI SHOP</h3>
          <p style={{ fontSize: '0.85rem', color: '#f8bbd0', lineHeight: '1.7' }}>Hecho a mano. Para ti.<br />Cada pieza, única.</p>
        </div>
        {/* Columna 2 — Navegación */}
        <div>
          <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', marginBottom: '16px', color: '#f06292' }}>NAVEGACIÓN</h4>
          {['inicio', 'catalogo'].map(p => (
            <div key={p} onClick={() => setPantalla(p)}
              style={{ fontSize: '0.85rem', marginBottom: '8px', cursor: 'pointer', color: '#fce4ec', transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color='#f06292'}
              onMouseOut={e => e.target.style.color='#fce4ec'}>
              {p === 'inicio' ? t.inicio : t.productos}
            </div>
          ))}
        </div>
        {/* Columna 3 — Contacto */}
        <div>
          <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', marginBottom: '16px', color: '#f06292' }}>{t.contacto.toUpperCase()}</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>📞 4531257355</p>
          <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>📸 @jeudi_shoop</p>
        </div>
      </div>
      {/* Línea inferior */}
      <div style={{ borderTop: '1px solid #333', paddingTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#888', letterSpacing: '0.05em' }}>
        {t.derechosReservados}
      </div>
    </footer>
  );
}

// ===============================
// VISTA INICIO
// ===============================
function VistaInicio({ idioma, setPantalla }) {
  const t = textos[idioma];
  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <div style={{ position: 'relative', zIndex: 2 }} className="fade-up">
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#f06292', marginBottom: '16px', fontFamily: "'Jost', sans-serif" }}>
            — HANDMADE WITH LOVE —
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#1a1a1a', lineHeight: 1.2, marginBottom: '32px' }}>
            {t.hero}
          </h1>
          <button onClick={() => setPantalla('catalogo')}
            style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '14px 36px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.15em', transition: 'background 0.25s' }}
            onMouseOver={e => e.target.style.background='#f06292'}
            onMouseOut={e => e.target.style.background='#1a1a1a'}>
            {t.verCatalogo}
          </button>
        </div>
        <img src={paginainicio1} style={{ position: 'absolute', left: 0, bottom: 0, width: '28%', opacity: 0.9 }} alt="decor" />
        <img src={paginainicio2} style={{ position: 'absolute', right: 0, top: 0, width: '23%', opacity: 0.9 }} alt="decor" />
      </section>

      {/* SOBRE NOSOTROS */}
      <section className="sobre-nosotros">
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#f06292', marginBottom: '12px', fontFamily: "'Jost', sans-serif" }}>
          — NUESTRA HISTORIA —
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#1a1a1a', marginBottom: '20px' }}>
          {t.sobreNosotros}
        </h2>
        <p style={{ maxWidth: '580px', margin: '0 auto', lineHeight: '1.85', color: '#444', fontSize: '0.95rem' }}>
          {t.sobreTexto}
        </p>
      </section>

      {/* DESTACADOS — 3 productos mini */}
      <section style={{ padding: '70px 8%', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#f06292', marginBottom: '10px' }}>— DESTACADOS —</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '40px', color: '#1a1a1a' }}>
          {textos[idioma].productos}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { nombre: 'Bolso Lucia', precio: 2400, img: producto1 },
            { nombre: 'Tote Elena', precio: 2900, img: producto2 },
            { nombre: 'Sombrero Gabrielle', precio: 1200, img: producto3 },
          ].map((p, i) => (
            <div key={i} className="producto-card" onClick={() => setPantalla('catalogo')}>
              <img src={p.img} style={{ width: '100%', height: '260px', objectFit: 'cover' }} alt={p.nombre} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", marginTop: '14px', fontSize: '1rem' }}>{p.nombre}</h3>
              <p style={{ color: '#f06292', fontWeight: 500, marginTop: '6px' }}>${p.precio}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ===============================
// VISTA CATÁLOGO
// ===============================
function VistaCatalogo({ user, setPantalla, idioma }) {
  const t = textos[idioma];
  const productos = [
    { id: 1, nombre: 'Bolso Lucia', precio: 2400, imagen: producto1, desc: 'Bolso artesanal de cuero vegano. Perfecto para el día a día.' },
    { id: 2, nombre: 'Tote Elena', precio: 2900, imagen: producto2, desc: 'Tote bag de lona resistente con bordados exclusivos.' },
    { id: 3, nombre: 'Sombrero Gabrielle', precio: 1200, imagen: producto3, desc: 'Sombrero tejido a mano con hilo de algodón natural.' }
  ];

  return (
    <section style={{ padding: '50px 8%' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#f06292', marginBottom: '10px' }}>— COLECCIÓN —</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#1a1a1a' }}>{t.productos}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {productos.map((p) => (
          <div key={p.id} className="producto-card">
            <img src={p.imagen} style={{ width: '100%', height: '420px', objectFit: 'cover' }} alt={p.nombre} />
            <div style={{ padding: '8px 0 0', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", marginTop: '12px', fontSize: '1.2rem' }}>{p.nombre}</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '8px', lineHeight: '1.6', flexGrow: 1 }}>{p.desc}</p>
              <p style={{ color: '#f06292', fontWeight: 600, fontSize: '1.1rem', marginTop: '12px' }}>${p.precio}</p>
              <button className="btn-pedir" onClick={() => user ? setPantalla('pedido') : setPantalla('login')}>
                {t.pedirAhora}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===============================
// VISTA PEDIDOS
// ===============================
function VistaPedidos({ idioma }) {
  const t = textos[idioma];
  const { user } = useAuthenticator((context) => [context.user]);
  const [grupos, setGrupos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [pedido, setPedido] = useState({ nombre_cliente: '', tipo_articulo: '', descripcion_extra: '' });
  const [cargando, setCargando] = useState(false);

  const cargarPedidos = useCallback(async () => {
    if (!user) return;
    try {
      const session = await fetchAuthSession();
      const roles = session.tokens?.idToken?.payload?.['cognito:groups'] || [];
      setGrupos(roles);
      const userLogin = user?.signInDetails?.loginId || user?.username;
      const esStaff = roles.includes('admin') || roles.includes('empleado') || roles.includes('Admin') || roles.includes('Empleado');
      const url = esStaff
        ? `${API_URL}/pedidos`
        : `${API_URL}/pedidos?email=${encodeURIComponent(userLogin)}`;
      const res = await axios.get(url);
      setHistorial(res.data);
    } catch (err) { console.error(err); }
  }, [user]);

  useEffect(() => { cargarPedidos(); }, [cargarPedidos]);

  const esStaff = grupos.some(g => ['admin', 'empleado', 'Admin', 'Empleado'].includes(g));

  const enviarPedido = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await axios.post(`${API_URL}/pedidos`, pedido);
      Swal.fire({ icon: 'success', title: t.exito, text: t.pedidoEnviado, confirmButtonColor: '#f06292' });
      setPedido({ nombre_cliente: '', tipo_articulo: '', descripcion_extra: '' });
      setTimeout(() => cargarPedidos(), 800);
    } catch (err) {
      Swal.fire({ icon: 'error', title: t.error, text: t.noEnviar, confirmButtonColor: '#f06292' });
    } finally { setCargando(false); }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      await axios.patch(`${API_URL}/pedidos/${id}/estatus`, { nuevo_estatus: estado });
      cargarPedidos();
    } catch (err) { console.error(err); }
  };

  const getBadgeClass = (estatus) => {
    if (!estatus) return 'estatus-badge estatus-pendiente';
    if (estatus === 'terminado') return 'estatus-badge estatus-terminado';
    if (estatus === 'entregado') return 'estatus-badge estatus-entregado';
    return 'estatus-badge estatus-pendiente';
  };

  return (
    <div style={{ padding: '60px 8%' }}>
      {/* Panel de usuario */}
      <div style={{ padding: '28px 32px', marginBottom: '40px', borderRadius: '4px', background: esStaff ? '#1a1a1a' : '#fce4ec', color: esStaff ? '#fff' : '#1a1a1a', borderLeft: `5px solid #f06292` }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>{t.panel}</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{t.usuario}: <strong>{user?.signInDetails?.loginId || user?.username}</strong></p>
        <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{t.rol}: <strong>{grupos.join(', ') || t.cliente}</strong></p>
      </div>

      {/* Tabla de pedidos */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>
          {esStaff ? t.gestionPedidos : t.pedidos}
        </h2>
        {historial.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px', border: '1px dashed #f8bbd0' }}>{t.sinPedidos}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#fce4ec' }}>
                  <th style={tableCellStyle}>ID</th>
                  <th style={tableCellStyle}>{t.clienteTabla}</th>
                  <th style={tableCellStyle}>{t.producto}</th>
                  <th style={tableCellStyle}>{t.estatus}</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td style={tableCellStyle}><span style={{ color: '#f06292', fontWeight: 600 }}>#{p.id}</span></td>
                    <td style={tableCellStyle}>{p.nombre_cliente}</td>
                    <td style={tableCellStyle}>{p.tipo_articulo}</td>
                    <td style={tableCellStyle}>
                      {esStaff ? (
                        <select className="form-select" value={p.estatus || 'pendiente'} onChange={(e) => actualizarEstado(p.id, e.target.value)}>
                          <option value="pendiente">{t.pendiente}</option>
                          <option value="terminado">{t.terminado}</option>
                          <option value="entregado">{t.entregado}</option>
                        </select>
                      ) : (
                        <span className={getBadgeClass(p.estatus)}>{p.estatus || t.pendiente}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulario nuevo pedido */}
      <div style={{ background: '#fff', border: '1px solid #fce4ec', padding: '36px', maxWidth: '600px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', marginBottom: '24px', color: '#1a1a1a' }}>{t.nuevoPedido}</h2>
        <form onSubmit={enviarPedido}>
          <input className="form-input" placeholder={t.nombre} value={pedido.nombre_cliente}
            onChange={(e) => setPedido({ ...pedido, nombre_cliente: e.target.value })} required />
          <input className="form-input" placeholder={t.producto} value={pedido.tipo_articulo}
            onChange={(e) => setPedido({ ...pedido, tipo_articulo: e.target.value })} required />
          <textarea className="form-input" rows={3} placeholder={t.descripcion} value={pedido.descripcion_extra}
            onChange={(e) => setPedido({ ...pedido, descripcion_extra: e.target.value })} />
          <button type="submit" disabled={cargando}
            style={{ background: cargando ? '#999' : '#1a1a1a', color: '#fff', border: 'none', padding: '13px 32px', cursor: cargando ? 'not-allowed' : 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.12em', transition: 'background 0.25s', marginTop: '8px' }}
            onMouseOver={e => { if (!cargando) e.target.style.background='#f06292'; }}
            onMouseOut={e => { if (!cargando) e.target.style.background='#1a1a1a'; }}>
            {cargando ? '...' : t.enviar}
          </button>
        </form>
      </div>
    </div>
  );
}

// ===============================
// VISTA ROLES
// ===============================
function VistaRoles({ idioma }) {
  const t = textos[idioma];
  const { user } = useAuthenticator((context) => [context.user]);
  const [grupos, setGrupos] = useState([]);
  const [datos, setDatos] = useState({ username: '', rol: 'Cliente' });

  useEffect(() => {
    if (user) fetchAuthSession().then(s => setGrupos(s.tokens?.idToken?.payload?.['cognito:groups'] || []));
  }, [user]);

  const esAdmin = grupos.some(g => ['admin', 'Admin'].includes(g));

  if (!esAdmin) return (
    <div style={{ padding: '100px 8%', textAlign: 'center' }}>
      <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#f06292', marginBottom: '12px' }}>— ACCESO RESTRINGIDO —</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '16px' }}>{t.vistaPublica}</h1>
      <p style={{ color: '#888' }}>{t.soloAdmin}</p>
    </div>
  );

  const asignarRol = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/asignar-rol`, datos);
      Swal.fire({ icon: 'success', title: t.exito, text: 'Rol actualizado', confirmButtonColor: '#f06292' });
      setDatos({ username: '', rol: 'Cliente' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: t.error, text: 'Error al asignar rol', confirmButtonColor: '#f06292' });
    }
  };

  return (
    <div style={{ padding: '60px 8%' }}>
      <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#f06292', marginBottom: '10px' }}>— ADMINISTRACIÓN —</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '36px', color: '#1a1a1a' }}>{t.gestionRoles}</h1>
      <form onSubmit={asignarRol} style={{ maxWidth: '480px' }}>
        <input className="form-input" placeholder={t.correo} value={datos.username}
          onChange={(e) => setDatos({ ...datos, username: e.target.value })} required />
        <select className="form-input" value={datos.rol} onChange={(e) => setDatos({ ...datos, rol: e.target.value })}>
          <option value="Cliente">Cliente</option>
          <option value="Empleado">Empleado</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit"
          style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '13px 32px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.12em', transition: 'background 0.25s' }}
          onMouseOver={e => e.target.style.background='#f06292'}
          onMouseOut={e => e.target.style.background='#1a1a1a'}>
          {t.guardar}
        </button>
      </form>
    </div>
  );
}

// ===============================
// COMPONENTE HEADER LOGIN
// ===============================
const components = {
  Header() {
    return (
      <View textAlign="center" padding="large">
        <Image src={logoImage} alt="Jeudi Shop Logo" style={{ width: '70px' }} />
        <Text variation="primary" fontWeight="bold" fontSize="1.4rem" marginTop="10px"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          JEUDI SHOP
        </Text>
      </View>
    );
  },
};

// ===============================
// CONTENT PRINCIPAL
// ===============================
function Content({ pantalla, setPantalla, idioma, setIdioma }) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  useEffect(() => { if (user && pantalla === 'login') setPantalla('inicio'); }, [user, pantalla, setPantalla]);

  return (
    <>
      <style>{globalStyles}</style>
      <Navbar user={user} signOut={signOut} pantalla={pantalla} setPantalla={setPantalla} idioma={idioma} setIdioma={setIdioma} />
      <main>
        {pantalla === 'inicio' && <VistaInicio idioma={idioma} setPantalla={setPantalla} />}
        {pantalla === 'catalogo' && <VistaCatalogo user={user} setPantalla={setPantalla} idioma={idioma} />}
        {pantalla === 'pedido' && user && <VistaPedidos idioma={idioma} />}
        {pantalla === 'roles' && <VistaRoles idioma={idioma} />}
        {pantalla === 'login' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
            <Authenticator
              components={components}
              loginMechanisms={['username', 'email']}
              signUpAttributes={['email']}
            />
          </div>
        )}
      </main>
      <Footer idioma={idioma} setPantalla={setPantalla} />
    </>
  );
}

// ===============================
// APP PRINCIPAL
// ===============================
export default function App() {
  const [pantalla, setPantalla] = useState('inicio');
  const [idioma, setIdioma] = useState('es');
  return (
    <ThemeProvider theme={temaJeudi}>
      <Authenticator.Provider>
        <Content pantalla={pantalla} setPantalla={setPantalla} idioma={idioma} setIdioma={setIdioma} />
      </Authenticator.Provider>
    </ThemeProvider>
  );
}

// ESTILOS DE TABLA
const tableCellStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid #fce4ec',
  textAlign: 'left',
  fontSize: '0.9rem',
};
