import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Authenticator, ThemeProvider, useAuthenticator, View, Image, Text } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

import logoImage from './assets/logo.png';
import producto1 from './assets/producto1.jpeg';
import producto2 from './assets/producto2_.jpeg';
import producto3 from './assets/producto3.jpeg';
import paginainicio1 from './assets/paginainicio1.png';
import paginainicio2 from './assets/paginainicio2.png';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_SAazwJL7u',
      userPoolClientId: '4u81010p7vri9a6g7749k8n491',
      loginWith: { email: true, username: true }
    }
  }
});

const API_URL = 'http://54.245.68.19:3000';

const temaJeudi = {
  name: 'tema-jeudi',
  tokens: {
    colors: { brand: { primary: { 10: '#fce4ec', 80: '#f06292', 90: '#ec407a', 100: '#d81b60' } } },
    components: {
      authenticator: { router: { borderWidth: '1px', borderColor: '#f8bbd0', backgroundColor: '#fff' } },
      tabs: { item: { _active: { color: '#f06292', borderColor: '#f06292' }, _hover: { color: '#ec407a' } } },
      button: { primary: { backgroundColor: '#1a1a1a', _hover: { backgroundColor: '#f06292' } }, link: { color: '#f06292' } },
      fieldcontrol: { borderColor: '#f8bbd0', _focus: { borderColor: '#f06292', boxShadow: '0 0 0 1px #f06292' } },
    },
  },
};

const textos = {
  es: {
    inicio: 'INICIO', productos: 'PRODUCTOS', pedidos: 'PEDIDOS', roles: 'ROLES', perfil: 'PERFIL',
    entrar: 'ENTRAR', salir: 'SALIR', hero: 'Hecho a mano. Para ti.',
    verCatalogo: 'VER CATALOGO', panel: 'Panel de Control', usuario: 'Usuario',
    rol: 'Rol', cliente: 'cliente', gestionPedidos: 'Gestion de Pedidos',
    nuevoPedido: 'Nuevo Pedido', clienteTabla: 'Cliente', producto: 'Producto',
    estatus: 'Estatus', nombre: 'Tu nombre/Email', descripcion: 'Descripcion adicional',
    enviar: 'ENVIAR PEDIDO', vistaPublica: 'Vista Publica',
    soloAdmin: 'Solo los administradores pueden acceder.', gestionRoles: 'Gestion de Roles',
    correo: 'Correo/Usuario', guardar: 'GUARDAR', noPedidos: 'Sin pedidos registrados',
    exito: 'Exito', pedidoEnviado: 'Pedido enviado correctamente', error: 'Error',
    noEnviar: 'No se pudo enviar', pedirAhora: 'PEDIR AHORA',
    sobreNosotros: 'Nuestra Historia',
    sobreTexto: 'Jeudi Shop nace del amor por los accesorios hechos a mano. Cada bolso, sombrero y tote bag es creado con dedicacion y materiales de calidad para acompañarte por muchos años.',
    derechosReservados: '© 2025 Jeudi Shop. Todos los derechos reservados.',
    contacto: 'Contacto', sinPedidos: 'No tienes pedidos aun.',
    pendiente: 'Pendiente', terminado: 'Terminado', entregado: 'Entregado',
    verDetalle: 'VER DETALLE', volver: 'VOLVER AL CATALOGO',
    miPerfil: 'Mi Perfil', email: 'Correo electronico', rolAsignado: 'Rol asignado',
    misPedidos: 'Mis pedidos recientes',
  },
  en: {
    inicio: 'HOME', productos: 'PRODUCTS', pedidos: 'ORDERS', roles: 'ROLES', perfil: 'PROFILE',
    entrar: 'LOGIN', salir: 'LOGOUT', hero: 'Handmade. For you.',
    verCatalogo: 'VIEW CATALOG', panel: 'Control Panel', usuario: 'User',
    rol: 'Role', cliente: 'client', gestionPedidos: 'Orders Management',
    nuevoPedido: 'New Order', clienteTabla: 'Client', producto: 'Product',
    estatus: 'Status', nombre: 'Name/Email', descripcion: 'Additional description',
    enviar: 'SEND ORDER', vistaPublica: 'Public View',
    soloAdmin: 'Admins only.', gestionRoles: 'Role Management',
    correo: 'User/Email', guardar: 'SAVE', noPedidos: 'No orders found',
    exito: 'Success', pedidoEnviado: 'Order sent', error: 'Error', noEnviar: 'Failed',
    pedirAhora: 'ORDER NOW', sobreNosotros: 'Our Story',
    sobreTexto: 'Jeudi Shop was born from a love of handmade accessories.',
    derechosReservados: '© 2025 Jeudi Shop. All rights reserved.',
    contacto: 'Contact', sinPedidos: "You don't have any orders yet.",
    pendiente: 'Pending', terminado: 'Finished', entregado: 'Delivered',
    verDetalle: 'VIEW DETAIL', volver: 'BACK TO CATALOG',
    miPerfil: 'My Profile', email: 'Email address', rolAsignado: 'Assigned role',
    misPedidos: 'My recent orders',
  }
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Jost', sans-serif; }
  .nav-link { background: none; border: none; cursor: pointer; font-weight: 500; font-family: 'Jost', sans-serif; font-size: 0.82rem; letter-spacing: 0.08em; padding: 4px 0; transition: color 0.2s; }
  .nav-link:hover { color: #f06292 !important; }
  .producto-card { text-align: center; border: 1px solid #fce4ec; padding: 20px; background: #fff; transition: transform 0.3s, box-shadow 0.3s; display: flex; flex-direction: column; }
  .producto-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(240,98,146,0.15); }
  .btn-pedir { background: #1a1a1a; color: #fff; border: none; padding: 11px 20px; cursor: pointer; width: 100%; margin-top: 14px; font-family: 'Jost', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; transition: background 0.25s; }
  .btn-pedir:hover { background: #f06292; }
  .estatus-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.05em; }
  .estatus-pendiente { background: #fff3cd; color: #856404; }
  .estatus-terminado { background: #d1ecf1; color: #0c5460; }
  .estatus-entregado { background: #d4edda; color: #155724; }
  .form-input { width: 100%; padding: 12px 14px; margin-bottom: 16px; border: 1px solid #f8bbd0; outline: none; font-family: 'Jost', sans-serif; font-size: 0.95rem; transition: border-color 0.2s; background: #fff; }
  .form-input:focus { border-color: #f06292; }
  .hero-section { position: relative; min-height: 82vh; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; }
  .sobre-nosotros { background: #fce4ec; padding: 80px 8%; text-align: center; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.7s ease forwards; }
  .table-row:hover { background: #fdf0f5; }
  .table-row-selected { background: #fce4ec !important; }
  select.form-select { padding: 6px 10px; border: 1px solid #f8bbd0; font-family: 'Jost', sans-serif; font-size: 0.85rem; cursor: pointer; outline: none; background: #fff; }
  select.form-select:focus { border-color: #f06292; }
  .crud-btn { border: none; padding: 6px 14px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.75rem; letter-spacing: 0.06em; border-radius: 2px; transition: all 0.2s; }
  .crud-btn-edit { background: #1a1a1a; color: #fff; }
  .crud-btn-edit:hover { background: #f06292; }
  .crud-btn-delete { background: #fff; color: #c0392b; border: 1px solid #c0392b; }
  .crud-btn-delete:hover { background: #c0392b; color: #fff; }
  .crud-btn-clone { background: #fff; color: #1a1a1a; border: 1px solid #1a1a1a; }
  .crud-btn-clone:hover { background: #fce4ec; }
  .search-input { padding: 9px 14px; border: 1px solid #f8bbd0; outline: none; font-family: 'Jost', sans-serif; font-size: 0.85rem; width: 240px; transition: border-color 0.2s; }
  .search-input:focus { border-color: #f06292; }
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; }
  .modal-box { background: #fff; padding: 40px; width: 100%; max-width: 500px; border-top: 4px solid #f06292; }
  .tab-btn { background: none; border: none; padding: 10px 20px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.82rem; letter-spacing: 0.08em; border-bottom: 2px solid transparent; transition: all 0.2s; color: #888; }
  .tab-btn.active { color: #f06292; border-bottom-color: #f06292; font-weight: 500; }
  .tab-btn:hover { color: #f06292; }
  .pagination-btn { background: none; border: 1px solid #f8bbd0; padding: 6px 12px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.8rem; transition: all 0.2s; }
  .pagination-btn:hover, .pagination-btn.active { background: #f06292; color: #fff; border-color: #f06292; }
  .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .checkbox-custom { width: 16px; height: 16px; cursor: pointer; accent-color: #f06292; }

  /* TIMELINE */
  .timeline-card { background: #fff; border: 1px solid #fce4ec; padding: 24px 28px; margin-bottom: 20px; border-radius: 4px; transition: box-shadow 0.2s; }
  .timeline-card:hover { box-shadow: 0 8px 24px rgba(240,98,146,0.1); }
  .timeline-steps { display: flex; align-items: center; margin-top: 20px; }
  .timeline-step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; border: 2px solid; transition: all 0.3s; z-index: 1; }
  .timeline-step-label { font-size: 0.7rem; margin-top: 6px; letter-spacing: 0.05em; text-align: center; }
  .timeline-line { flex: 1; height: 2px; margin-top: -20px; transition: background 0.3s; }
  .step-active { background: #f06292; border-color: #f06292; color: #fff; }
  .step-done { background: #d4edda; border-color: #27ae60; color: #27ae60; }
  .step-pending { background: #fff; border-color: #ddd; color: #ccc; }
  .line-done { background: #27ae60; }
  .line-pending { background: #eee; }

  /* CONFIRMACION */
  .confirmacion-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 3000; display: flex; align-items: center; justify-content: center; }
  .confirmacion-box { background: #fff; padding: 50px 40px; max-width: 480px; width: 90%; text-align: center; border-top: 5px solid #f06292; border-radius: 4px; animation: fadeUp 0.4s ease; }
  .check-icon { width: 64px; height: 64px; border-radius: 50%; background: #d4edda; border: 2px solid #27ae60; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .check-icon svg { width: 28px; height: 28px; stroke: #27ae60; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

  /* BUSCADOR CATALOGO */
  .catalogo-toolbar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 36px; padding: 16px 20px; background: #fafafa; border: 1px solid #fce4ec; }
  .precio-range { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #666; }
  .precio-range input { width: 80px; padding: 8px 10px; border: 1px solid #f8bbd0; outline: none; font-family: 'Jost', sans-serif; font-size: 0.85rem; }
  .precio-range input:focus { border-color: #f06292; }
  .no-results { text-align: center; padding: 60px 20px; color: #999; }

  /* BADGE NOTIFICACION */
  .nav-badge-wrap { position: relative; display: inline-flex; align-items: center; }
  .nav-badge { position: absolute; top: -8px; right: -10px; background: #e53935; color: #fff; border-radius: 50%; width: 17px; height: 17px; display: flex; align-items: center; justify-content: center; font-size: 0.62rem; font-weight: 700; font-family: 'Jost', sans-serif; }

  /* DETALLE PRODUCTO */
  .detalle-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; padding: 60px 8%; }
  @media (max-width: 768px) { .detalle-hero { grid-template-columns: 1fr; gap: 30px; } }

  /* PERFIL */
  .perfil-avatar { width: 80px; height: 80px; border-radius: 50%; background: #fce4ec; border: 2px solid #f8bbd0; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .perfil-avatar svg { width: 36px; height: 36px; stroke: #f06292; fill: none; stroke-width: 1.5; }
  .perfil-campo { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #fce4ec; }
  .perfil-label { font-size: 0.78rem; color: #999; letter-spacing: 0.05em; text-transform: uppercase; }
  .perfil-valor { font-size: 0.92rem; color: #1a1a1a; font-weight: 500; }
  .rol-chip { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.05em; }
  .rol-admin { background: #fce4ec; color: #c2185b; }
  .rol-empleado { background: #e3f2fd; color: #1565c0; }
  .rol-cliente { background: #f3e5f5; color: #6a1b9a; }
`;

// ===============================
// NAVBAR — con badge de pendientes
// ===============================
function Navbar({ user, signOut, pantalla, setPantalla, idioma, setIdioma, grupos, pedidosPendientes }) {
  const t = textos[idioma];
  const esAdmin = grupos.some(g => ['admin', 'Admin'].includes(g));
  const getLinkStyle = (p) => ({ color: pantalla === p ? '#f06292' : '#1a1a1a', borderBottom: pantalla === p ? '2px solid #f06292' : '2px solid transparent' });

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #fce4ec', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', color: '#fce4ec', display: 'flex', justifyContent: 'space-between', padding: '5px 8%', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
        <span>TEL: 4531257355</span><span>INSTAGRAM: @jeudi_shoop</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 8%', background: '#fce4ec' }}>
        <div onClick={() => setPantalla('inicio')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <img src={logoImage} alt="logo" style={{ width: '52px' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a', fontSize: '1.3rem', fontWeight: 700 }}>JEUDI SHOP</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="nav-link" style={getLinkStyle('inicio')} onClick={() => setPantalla('inicio')}>{t.inicio}</button>
          <button className="nav-link" style={getLinkStyle('catalogo')} onClick={() => setPantalla('catalogo')}>{t.productos}</button>
          {user && (
            <div className="nav-badge-wrap">
              <button className="nav-link" style={getLinkStyle('pedido')} onClick={() => setPantalla('pedido')}>{t.pedidos}</button>
              {esAdmin && pedidosPendientes > 0 && (
                <span className="nav-badge">{pedidosPendientes > 9 ? '9+' : pedidosPendientes}</span>
              )}
            </div>
          )}
          {user && esAdmin && <button className="nav-link" style={getLinkStyle('roles')} onClick={() => setPantalla('roles')}>{t.roles}</button>}
          {user && <button className="nav-link" style={getLinkStyle('perfil')} onClick={() => setPantalla('perfil')}>{t.perfil}</button>}
          <button onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}
            style={{ background: '#fff', border: '1px solid #f8bbd0', padding: '5px 10px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Jost', sans-serif" }}>
            {idioma.toUpperCase()}
          </button>
          {user
            ? <button onClick={signOut} style={{ background: 'none', border: '1px solid #1a1a1a', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.8rem', transition: 'all 0.2s' }}
                onMouseOver={e => { e.target.style.background='#1a1a1a'; e.target.style.color='#fff'; }}
                onMouseOut={e => { e.target.style.background='none'; e.target.style.color='#1a1a1a'; }}>{t.salir}</button>
            : <button onClick={() => setPantalla('login')} style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '9px 20px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.8rem', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background='#f06292'} onMouseOut={e => e.target.style.background='#1a1a1a'}>{t.entrar}</button>
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
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '12px' }}>JEUDI SHOP</h3>
          <p style={{ fontSize: '0.85rem', color: '#f8bbd0', lineHeight: '1.7' }}>Hecho a mano. Para ti.<br />Cada pieza, unica.</p>
        </div>
        <div>
          <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', marginBottom: '16px', color: '#f06292' }}>NAVEGACION</h4>
          {['inicio', 'catalogo'].map(p => (
            <div key={p} onClick={() => setPantalla(p)} style={{ fontSize: '0.85rem', marginBottom: '8px', cursor: 'pointer', color: '#fce4ec' }}
              onMouseOver={e => e.target.style.color='#f06292'} onMouseOut={e => e.target.style.color='#fce4ec'}>
              {p === 'inicio' ? t.inicio : t.productos}
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', marginBottom: '16px', color: '#f06292' }}>{t.contacto.toUpperCase()}</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Tel: 4531257355</p>
          <p style={{ fontSize: '0.85rem' }}>Instagram: @jeudi_shoop</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #333', paddingTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
        {t.derechosReservados}
      </div>
    </footer>
  );
}

// ===============================
// VISTA INICIO
// ===============================
function VistaInicio({ idioma, setPantalla, productos, setProductoDetalle }) {
  const t = textos[idioma];
  const destacados = productos.slice(0, 3);
  return (
    <>
      <section className="hero-section">
        <div style={{ position: 'relative', zIndex: 2 }} className="fade-up">
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#f06292', marginBottom: '16px' }}>— HANDMADE WITH LOVE —</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#1a1a1a', lineHeight: 1.2, marginBottom: '32px' }}>{t.hero}</h1>
          <button onClick={() => setPantalla('catalogo')}
            style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '14px 36px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.15em', transition: 'background 0.25s' }}
            onMouseOver={e => e.target.style.background='#f06292'} onMouseOut={e => e.target.style.background='#1a1a1a'}>
            {t.verCatalogo}
          </button>
        </div>
        <img src={paginainicio1} style={{ position: 'absolute', left: 0, bottom: 0, width: '28%', opacity: 0.9 }} alt="" />
        <img src={paginainicio2} style={{ position: 'absolute', right: 0, top: 0, width: '23%', opacity: 0.9 }} alt="" />
      </section>
      <section className="sobre-nosotros">
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#f06292', marginBottom: '12px' }}>— NUESTRA HISTORIA —</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#1a1a1a', marginBottom: '20px' }}>{t.sobreNosotros}</h2>
        <p style={{ maxWidth: '580px', margin: '0 auto', lineHeight: '1.85', color: '#444', fontSize: '0.95rem' }}>{t.sobreTexto}</p>
      </section>
      <section style={{ padding: '70px 8%', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#f06292', marginBottom: '10px' }}>— DESTACADOS —</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '40px', color: '#1a1a1a' }}>{t.productos}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {destacados.map((p, i) => (
            <div key={i} className="producto-card" onClick={() => { setProductoDetalle(p); setPantalla('detalle'); }} style={{ cursor: 'pointer' }}>
              <img src={p.imagen} style={{ width: '100%', height: '260px', objectFit: 'cover' }} alt={p.nombre}
                onError={e => e.target.src='https://via.placeholder.com/260x260/fce4ec/f06292?text=J'} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", marginTop: '14px', fontSize: '1rem' }}>{p.nombre}</h3>
              <p style={{ color: '#f06292', fontWeight: 500, marginTop: '6px' }}>${p.precio.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ===============================
// DETALLE DE PRODUCTO (MEJORA 4)
// ===============================
function VistaDetalle({ producto, setPantalla, user, t }) {
  if (!producto) { setPantalla('catalogo'); return null; }
  return (
    <div style={{ minHeight: '70vh' }}>
      <div style={{ padding: '24px 8% 0', borderBottom: '1px solid #fce4ec' }}>
        <button onClick={() => setPantalla('catalogo')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 0 16px' }}
          onMouseOver={e => e.target.style.color='#f06292'} onMouseOut={e => e.target.style.color='#888'}>
          &larr; {t.volver}
        </button>
      </div>
      <div className="detalle-hero">
        {/* Imagen */}
        <div>
          <img src={producto.imagen} alt={producto.nombre}
            style={{ width: '100%', maxHeight: '580px', objectFit: 'cover', border: '1px solid #fce4ec' }}
            onError={e => e.target.src='https://via.placeholder.com/600x580/fce4ec/f06292?text=Jeudi'} />
        </div>
        {/* Info */}
        <div style={{ paddingTop: '20px' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#f06292', marginBottom: '12px' }}>— JEUDI SHOP —</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#1a1a1a', lineHeight: 1.2, marginBottom: '20px' }}>
            {producto.nombre}
          </h1>
          <p style={{ fontSize: '1.6rem', color: '#f06292', fontWeight: 600, marginBottom: '28px', letterSpacing: '0.02em' }}>
            ${producto.precio.toLocaleString()}
          </p>
          <div style={{ width: '40px', height: '2px', background: '#fce4ec', marginBottom: '24px' }} />
          <p style={{ color: '#555', lineHeight: '1.85', fontSize: '0.95rem', marginBottom: '36px' }}>{producto.desc}</p>
          <div style={{ background: '#fafafa', border: '1px solid #fce4ec', padding: '16px 20px', marginBottom: '32px', borderRadius: '4px' }}>
            <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.7' }}>
              Cada pieza es creada a mano con materiales de calidad seleccionados.
              El tiempo de elaboracion puede variar segun el articulo.
            </p>
          </div>
          <button
            onClick={() => user ? setPantalla('pedido') : setPantalla('login')}
            style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '15px 40px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.15em', transition: 'background 0.25s', width: '100%' }}
            onMouseOver={e => e.target.style.background='#f06292'} onMouseOut={e => e.target.style.background='#1a1a1a'}>
            {t.pedirAhora}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===============================
// PERFIL DE USUARIO (MEJORA 6)
// ===============================
function VistaPerfil({ idioma, grupos, historial }) {
  const t = textos[idioma];
  const { user } = useAuthenticator((context) => [context.user]);
  const email = user?.signInDetails?.loginId || user?.username || '—';
  const username = user?.username || '—';

  const getRolChip = () => {
    if (grupos.some(g => ['admin', 'Admin'].includes(g))) return <span className="rol-chip rol-admin">Admin</span>;
    if (grupos.some(g => ['empleado', 'Empleado'].includes(g))) return <span className="rol-chip rol-empleado">Empleado</span>;
    return <span className="rol-chip rol-cliente">Cliente</span>;
  };

  const pedidosPendientes = historial.filter(p => !p.estatus || p.estatus === 'pendiente').length;
  const pedidosEntregados = historial.filter(p => p.estatus === 'entregado').length;

  return (
    <div style={{ padding: '60px 8%', maxWidth: '700px' }}>
      <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#f06292', marginBottom: '10px' }}>— CUENTA —</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#1a1a1a', marginBottom: '36px' }}>{t.miPerfil}</h1>

      <div style={{ background: '#fff', border: '1px solid #fce4ec', padding: '36px', marginBottom: '28px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid #fce4ec' }}>
          <div className="perfil-avatar">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '6px' }}>{username}</h3>
            {getRolChip()}
          </div>
        </div>

        {/* Campos */}
        <div className="perfil-campo">
          <span className="perfil-label">{t.usuario}</span>
          <span className="perfil-valor">{username}</span>
        </div>
        <div className="perfil-campo">
          <span className="perfil-label">{t.email}</span>
          <span className="perfil-valor">{email}</span>
        </div>
        <div className="perfil-campo" style={{ borderBottom: 'none' }}>
          <span className="perfil-label">{t.rolAsignado}</span>
          <span>{getRolChip()}</span>
        </div>
      </div>

      {/* Resumen de pedidos */}
      <div style={{ background: '#fff', border: '1px solid #fce4ec', padding: '36px' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '20px' }}>{t.misPedidos}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total', valor: historial.length },
            { label: t.pendiente, valor: pedidosPendientes },
            { label: t.entregado, valor: pedidosEntregados },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '20px', background: '#fafafa', border: '1px solid #fce4ec', borderRadius: '4px' }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f06292', marginBottom: '6px' }}>{s.valor}</p>
              <p style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===============================
// CONFIRMACION PEDIDO
// ===============================
function ConfirmacionPedido({ pedido, onCerrar }) {
  return (
    <div className="confirmacion-overlay">
      <div className="confirmacion-box">
        <div className="check-icon">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: '#f06292', marginBottom: '8px' }}>— PEDIDO CONFIRMADO —</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '8px' }}>Gracias por tu pedido</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '28px' }}>Tu pedido ha sido recibido y esta siendo procesado.</p>
        <div style={{ background: '#fafafa', border: '1px solid #fce4ec', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
          <p style={{ fontSize: '0.75rem', color: '#f06292', letterSpacing: '0.1em', marginBottom: '12px' }}>RESUMEN DEL PEDIDO</p>
          {[
            { label: 'Cliente', valor: pedido.nombre_cliente },
            { label: 'Producto', valor: pedido.tipo_articulo },
            ...(pedido.descripcion_extra ? [{ label: 'Notas', valor: pedido.descripcion_extra }] : [])
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>{r.label}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: '220px', textAlign: 'right' }}>{r.valor}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '10px 16px', marginBottom: '24px', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.82rem', color: '#856404' }}>Estatus inicial: <strong>Pendiente</strong> — Te avisaremos cuando este listo.</p>
        </div>
        {pedido.init_point && (
          <a href={pedido.init_point} target="_blank" rel="noreferrer"
            style={{ display: 'block', background: '#009ee3', color: '#fff', padding: '13px 36px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.12em', width: '100%', textAlign: 'center', textDecoration: 'none', marginBottom: '12px', transition: 'background 0.25s', borderRadius: '2px' }}
            onMouseOver={e => e.target.style.background='#007bb5'}
            onMouseOut={e => e.target.style.background='#009ee3'}>
            PAGAR CON MERCADO PAGO
          </a>
        )}
        <button onClick={onCerrar}
          style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '13px 36px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.12em', width: '100%', transition: 'background 0.25s' }}
          onMouseOver={e => e.target.style.background='#f06292'} onMouseOut={e => e.target.style.background='#1a1a1a'}>
          VER MIS PEDIDOS
        </button>
      </div>
    </div>
  );
}

// ===============================
// TIMELINE CARD
// ===============================
function TimelineCard({ pedido, t }) {
  const pasos = [
    { key: 'pendiente', label: t.pendiente, num: '1' },
    { key: 'terminado', label: t.terminado, num: '2' },
    { key: 'entregado', label: t.entregado, num: '3' },
  ];
  const indexActual = pasos.findIndex(p => p.key === (pedido.estatus || 'pendiente'));

  return (
    <div className="timeline-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ color: '#f06292', fontWeight: 700, fontSize: '0.9rem' }}>Pedido #{pedido.id}</span>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', marginTop: '4px', color: '#1a1a1a' }}>{pedido.tipo_articulo}</h3>
          {pedido.descripcion_extra && <p style={{ fontSize: '0.82rem', color: '#888', marginTop: '4px' }}>{pedido.descripcion_extra}</p>}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#aaa' }}>
          {pedido.fecha_creacion ? new Date(pedido.fecha_creacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha'}
        </p>
      </div>
      <div className="timeline-steps">
        {pasos.map((paso, i) => {
          const isDone = i < indexActual;
          const isActive = i === indexActual;
          const circleClass = isDone ? 'step-done' : isActive ? 'step-active' : 'step-pending';
          return (
            <div key={paso.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={`timeline-step-circle ${circleClass}`}>{isDone ? '✓' : paso.num}</div>
                <span className="timeline-step-label" style={{ color: isActive ? '#f06292' : isDone ? '#27ae60' : '#ccc' }}>{paso.label}</span>
              </div>
              {i < pasos.length - 1 && (
                <div className={`timeline-line ${isDone ? 'line-done' : 'line-pending'}`} style={{ flex: 1, margin: '0 4px', marginBottom: '20px' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===============================
// MODAL PRODUCTO CRUD
// ===============================
function ModalProducto({ producto, onClose, onSave }) {
  const [form, setForm] = useState(producto || { nombre: '', precio: '', imagen: '', desc: '' });
  const esEdicion = !!producto?.id;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.desc) return;
    onSave({ ...form, precio: parseFloat(form.precio), id: form.id || Date.now(), fechaCreacion: form.fechaCreacion || new Date().toISOString() });
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '24px', color: '#1a1a1a' }}>
          {esEdicion ? 'Editar Producto' : 'Agregar Producto'}
        </h2>
        <form onSubmit={handleSubmit}>
          <input className="form-input" placeholder="Nombre del producto *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          <input className="form-input" type="number" placeholder="Precio ($) *" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
          <input className="form-input" placeholder="URL de imagen (opcional)" value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} />
          <textarea className="form-input" rows={3} placeholder="Descripcion *" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} required />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" style={{ flex: 1, background: '#1a1a1a', color: '#fff', border: 'none', padding: '13px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.1em', transition: 'background 0.25s' }}
              onMouseOver={e => e.target.style.background='#f06292'} onMouseOut={e => e.target.style.background='#1a1a1a'}>
              {esEdicion ? 'GUARDAR' : 'AGREGAR'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '13px 20px', background: '#fff', border: '1px solid #ddd', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem' }}>CANCELAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===============================
// CRUD PRODUCTOS
// ===============================
function CRUDProductos({ productos, setProductos }) {
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha-desc');
  const [seleccionados, setSeleccionados] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const POR_PAGINA = 5;

  const productosFiltrados = useMemo(() => {
    let lista = [...productos];
    if (busqueda) lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.desc.toLowerCase().includes(busqueda.toLowerCase()));
    switch (ordenarPor) {
      case 'nombre-asc': lista.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case 'nombre-desc': lista.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
      case 'precio-asc': lista.sort((a, b) => a.precio - b.precio); break;
      case 'precio-desc': lista.sort((a, b) => b.precio - a.precio); break;
      case 'fecha-asc': lista.sort((a, b) => new Date(a.fechaCreacion||0) - new Date(b.fechaCreacion||0)); break;
      default: lista.sort((a, b) => new Date(b.fechaCreacion||0) - new Date(a.fechaCreacion||0));
    }
    return lista;
  }, [productos, busqueda, ordenarPor]);

  const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA);
  const productosPagina = productosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  const toggleSeleccion = (id) => setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleTodos = () => setSeleccionados(seleccionados.length === productosPagina.length ? [] : productosPagina.map(p => p.id));

  const handleGuardar = (prod) => {
    setProductos(prev => prod.id && prev.find(p => p.id === prod.id) ? prev.map(p => p.id === prod.id ? prod : p) : [prod, ...prev]);
    Swal.fire({ icon: 'success', title: 'Listo', text: productoEditando ? 'Producto actualizado' : 'Producto agregado', confirmButtonColor: '#f06292', timer: 1800, showConfirmButton: false });
  };

  const handleClonar = (prod) => {
    const clon = { ...prod, id: Date.now(), nombre: `${prod.nombre} (copia)`, fechaCreacion: new Date().toISOString() };
    setProductos(prev => [clon, ...prev]);
    Swal.fire({ icon: 'success', title: 'Clonado', text: `"${prod.nombre}" fue clonado`, confirmButtonColor: '#f06292', timer: 1500, showConfirmButton: false });
  };

  const handleEliminar = (id) => {
    Swal.fire({ title: 'Eliminar producto', text: 'Esta accion no se puede deshacer', icon: 'warning', showCancelButton: true, confirmButtonColor: '#c0392b', cancelButtonColor: '#888', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' })
      .then(r => { if (r.isConfirmed) { setProductos(prev => prev.filter(p => p.id !== id)); setSeleccionados(prev => prev.filter(x => x !== id)); } });
  };

  const handleEliminarSeleccionados = () => {
    Swal.fire({ title: `Eliminar ${seleccionados.length} productos`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#c0392b', cancelButtonColor: '#888', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' })
      .then(r => { if (r.isConfirmed) { setProductos(prev => prev.filter(p => !seleccionados.includes(p.id))); setSeleccionados([]); } });
  };

  return (
    <div style={{ marginBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#f06292', marginBottom: '4px' }}>— ADMINISTRACION —</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#1a1a1a' }}>Gestion de Productos</h2>
        </div>
        <button onClick={() => { setProductoEditando(null); setModalAbierto(true); }}
          style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '11px 24px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.82rem', letterSpacing: '0.1em', transition: 'background 0.25s' }}
          onMouseOver={e => e.target.style.background='#f06292'} onMouseOut={e => e.target.style.background='#1a1a1a'}>
          + NUEVO PRODUCTO
        </button>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fafafa', padding: '14px 16px', border: '1px solid #fce4ec' }}>
        <input className="search-input" placeholder="Buscar producto..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }} />
        <select className="form-select" value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)} style={{ padding: '9px 12px' }}>
          <option value="fecha-desc">Mas recientes</option>
          <option value="fecha-asc">Mas antiguos</option>
          <option value="nombre-asc">Nombre A-Z</option>
          <option value="nombre-desc">Nombre Z-A</option>
          <option value="precio-asc">Precio menor</option>
          <option value="precio-desc">Precio mayor</option>
        </select>
        <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: 'auto' }}>
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
          {seleccionados.length > 0 && ` · ${seleccionados.length} seleccionado${seleccionados.length !== 1 ? 's' : ''}`}
        </span>
        {seleccionados.length > 0 && (
          <button className="crud-btn crud-btn-delete" onClick={handleEliminarSeleccionados}>Eliminar ({seleccionados.length})</button>
        )}
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid #fce4ec' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#fce4ec' }}>
              <th style={{ ...thStyle, width: '40px' }}><input type="checkbox" className="checkbox-custom" checked={seleccionados.length === productosPagina.length && productosPagina.length > 0} onChange={toggleTodos} /></th>
              <th style={{ ...thStyle, width: '60px' }}>IMG</th>
              <th style={thStyle}>NOMBRE</th>
              <th style={thStyle}>PRECIO</th>
              <th style={thStyle}>DESCRIPCION</th>
              <th style={thStyle}>FECHA</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.length === 0
              ? <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No se encontraron productos</td></tr>
              : productosPagina.map(p => (
                <tr key={p.id} className={`table-row${seleccionados.includes(p.id) ? ' table-row-selected' : ''}`}>
                  <td style={tdStyle}><input type="checkbox" className="checkbox-custom" checked={seleccionados.includes(p.id)} onChange={() => toggleSeleccion(p.id)} /></td>
                  <td style={tdStyle}><img src={p.imagen} alt={p.nombre} style={{ width: '44px', height: '44px', objectFit: 'cover', border: '1px solid #fce4ec' }} onError={e => e.target.src='https://via.placeholder.com/44/fce4ec/f06292?text=J'} /></td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{p.nombre}</td>
                  <td style={{ ...tdStyle, color: '#f06292', fontWeight: 600 }}>${p.precio.toLocaleString()}</td>
                  <td style={{ ...tdStyle, color: '#666', maxWidth: '200px' }}><span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.desc}</span></td>
                  <td style={{ ...tdStyle, color: '#999', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button className="crud-btn crud-btn-edit" onClick={() => { setProductoEditando(p); setModalAbierto(true); }}>Editar</button>
                      <button className="crud-btn crud-btn-clone" onClick={() => handleClonar(p)}>Clonar</button>
                      <button className="crud-btn crud-btn-delete" onClick={() => handleEliminar(p.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <button className="pagination-btn" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1}>«</button>
          <button className="pagination-btn" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}>‹</button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
            <button key={n} className={`pagination-btn${paginaActual === n ? ' active' : ''}`} onClick={() => setPaginaActual(n)}>{n}</button>
          ))}
          <button className="pagination-btn" onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>›</button>
          <button className="pagination-btn" onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas}>»</button>
        </div>
      )}
      {modalAbierto && <ModalProducto producto={productoEditando} onClose={() => setModalAbierto(false)} onSave={handleGuardar} />}
    </div>
  );
}

// ===============================
// VISTA CATALOGO — con buscador y contador (MEJORA 3 y 5)
// ===============================
function VistaCatalogo({ user, setPantalla, idioma, productos, setProductos, grupos, setProductoDetalle }) {
  const t = textos[idioma];
  const esAdmin = grupos.some(g => ['admin', 'Admin'].includes(g));
  const [tabActiva, setTabActiva] = useState('catalogo');
  const [busqueda, setBusqueda] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [ordenar, setOrdenar] = useState('default');

  const productosFiltrados = useMemo(() => {
    let lista = [...productos];
    if (busqueda) lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.desc.toLowerCase().includes(busqueda.toLowerCase()));
    if (precioMin) lista = lista.filter(p => p.precio >= parseFloat(precioMin));
    if (precioMax) lista = lista.filter(p => p.precio <= parseFloat(precioMax));
    if (ordenar === 'precio-asc') lista.sort((a, b) => a.precio - b.precio);
    if (ordenar === 'precio-desc') lista.sort((a, b) => b.precio - a.precio);
    if (ordenar === 'nombre-asc') lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return lista;
  }, [productos, busqueda, precioMin, precioMax, ordenar]);

  const limpiarFiltros = () => { setBusqueda(''); setPrecioMin(''); setPrecioMax(''); setOrdenar('default'); };
  const hayFiltros = busqueda || precioMin || precioMax || ordenar !== 'default';

  return (
    <section style={{ padding: '50px 8%' }}>
      {esAdmin && (
        <div style={{ borderBottom: '1px solid #fce4ec', marginBottom: '36px', display: 'flex' }}>
          <button className={`tab-btn${tabActiva === 'catalogo' ? ' active' : ''}`} onClick={() => setTabActiva('catalogo')}>Vista Catalogo</button>
          <button className={`tab-btn${tabActiva === 'gestionar' ? ' active' : ''}`} onClick={() => setTabActiva('gestionar')}>Gestionar Productos</button>
        </div>
      )}

      {esAdmin && tabActiva === 'gestionar' && <CRUDProductos productos={productos} setProductos={setProductos} />}

      {tabActiva === 'catalogo' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: '#f06292', marginBottom: '10px' }}>— COLECCION —</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '8px' }}>{t.productos}</h1>
            {/* CONTADOR (MEJORA 5) */}
            <p style={{ fontSize: '0.82rem', color: '#aaa', letterSpacing: '0.08em' }}>
              {productos.length} pieza{productos.length !== 1 ? 's' : ''} disponible{productos.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* BUSCADOR (MEJORA 3) */}
          <div className="catalogo-toolbar">
            <input className="search-input" placeholder="Buscar por nombre o descripcion..." value={busqueda}
              onChange={e => setBusqueda(e.target.value)} style={{ width: '280px' }} />
            <div className="precio-range">
              <span>$</span>
              <input placeholder="Min" value={precioMin} onChange={e => setPrecioMin(e.target.value)} type="number" />
              <span>—</span>
              <input placeholder="Max" value={precioMax} onChange={e => setPrecioMax(e.target.value)} type="number" />
            </div>
            <select className="form-select" value={ordenar} onChange={e => setOrdenar(e.target.value)} style={{ padding: '9px 12px' }}>
              <option value="default">Ordenar</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre-asc">Nombre A-Z</option>
            </select>
            {hayFiltros && (
              <button onClick={limpiarFiltros} style={{ background: 'none', border: '1px solid #ddd', padding: '9px 14px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.8rem', color: '#888', transition: 'all 0.2s' }}
                onMouseOver={e => { e.target.style.borderColor='#f06292'; e.target.style.color='#f06292'; }}
                onMouseOut={e => { e.target.style.borderColor='#ddd'; e.target.style.color='#888'; }}>
                Limpiar
              </button>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#888' }}>
              {productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {productosFiltrados.length === 0
            ? <div className="no-results">
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '8px', color: '#1a1a1a' }}>Sin resultados</p>
                <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Intenta con otros filtros</p>
                <button onClick={limpiarFiltros} style={{ background: 'none', border: '1px solid #f06292', padding: '9px 20px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.82rem', color: '#f06292' }}>
                  Ver todos los productos
                </button>
              </div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                {productosFiltrados.map((p) => (
                  <div key={p.id} className="producto-card">
                    <img src={p.imagen} style={{ width: '100%', height: '380px', objectFit: 'cover', cursor: 'pointer' }} alt={p.nombre}
                      onClick={() => { setProductoDetalle(p); setPantalla('detalle'); }}
                      onError={e => e.target.src='https://via.placeholder.com/300x380/fce4ec/f06292?text=Jeudi'} />
                    <div style={{ padding: '8px 0 0', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", marginTop: '12px', fontSize: '1.2rem', cursor: 'pointer' }}
                        onClick={() => { setProductoDetalle(p); setPantalla('detalle'); }}>{p.nombre}</h3>
                      <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '8px', lineHeight: '1.6', flexGrow: 1 }}>{p.desc}</p>
                      <p style={{ color: '#f06292', fontWeight: 600, fontSize: '1.1rem', marginTop: '12px' }}>${p.precio.toLocaleString()}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        <button style={{ flex: 1, background: 'none', border: '1px solid #1a1a1a', padding: '10px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.75rem', letterSpacing: '0.1em', transition: 'all 0.2s' }}
                          onMouseOver={e => { e.target.style.background='#fce4ec'; }} onMouseOut={e => { e.target.style.background='none'; }}
                          onClick={() => { setProductoDetalle(p); setPantalla('detalle'); }}>
                          {t.verDetalle}
                        </button>
                        <button className="btn-pedir" style={{ flex: 1, marginTop: 0 }} onClick={() => user ? setPantalla('pedido') : setPantalla('login')}>{t.pedirAhora}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </>
      )}
    </section>
  );
}

// ===============================
// VISTA PEDIDOS
// ===============================
function VistaPedidos({ idioma, grupos, productos, onHistorialCargado }) {
  const t = textos[idioma];
  const { user } = useAuthenticator((context) => [context.user]);
  const [historial, setHistorial] = useState([]);
  const [pedido, setPedido] = useState({ nombre_cliente: '', tipo_articulo: '', descripcion_extra: '' });
  const [cargando, setCargando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  const esAdmin = grupos.some(g => ['admin', 'Admin'].includes(g));
  const esEmpleado = grupos.some(g => ['empleado', 'Empleado'].includes(g));
  const esStaff = esAdmin || esEmpleado;

  const cargarPedidos = useCallback(async () => {
    if (!user) return;
    try {
      const userLogin = user?.signInDetails?.loginId || user?.username;
      const url = esStaff ? `${API_URL}/pedidos` : `${API_URL}/pedidos?email=${encodeURIComponent(userLogin)}`;
      const res = await axios.get(url);
      setHistorial(res.data);
      if (onHistorialCargado) onHistorialCargado(res.data);
    } catch (err) { console.error(err); }
  }, [user, esStaff, onHistorialCargado]);

  useEffect(() => { cargarPedidos(); }, [cargarPedidos]);

  const enviarPedido = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      // 1. Guardar el pedido en la base de datos
      await axios.post(`${API_URL}/pedidos`, pedido);

      // 2. Buscar el precio del producto seleccionado
      const precioProducto = productos.find(p =>
        p.nombre.toLowerCase().trim() === pedido.tipo_articulo.toLowerCase().trim()
      )?.precio || 100;

      // 3. Crear preferencia de pago en Mercado Pago
      const { data } = await axios.post(`${API_URL}/crear-preferencia`, {
        nombre_producto: pedido.tipo_articulo,
        precio: precioProducto,
        nombre_cliente: pedido.nombre_cliente
      });

      // 4. Mostrar confirmacion con link de pago
      setPedidoConfirmado({ ...pedido, init_point: data.init_point });
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

  const totalPedidos = historial.length;
  const pedidosPendientes = historial.filter(p => !p.estatus || p.estatus === 'pendiente').length;
  const pedidosEntregados = historial.filter(p => p.estatus === 'entregado').length;
  const totalVentas = historial.reduce((sum, order) => {
    const match = productos.find(p => p.nombre.toLowerCase().trim() === order.tipo_articulo.toLowerCase().trim());
    return sum + (match ? match.precio : 0);
  }, 0);

  return (
    <div style={{ padding: '60px 8%' }}>
      {pedidoConfirmado && <ConfirmacionPedido pedido={pedidoConfirmado} onCerrar={() => { setPedidoConfirmado(null); cargarPedidos(); }} />}

      <div style={{ padding: '28px 32px', marginBottom: '40px', borderRadius: '4px', background: esStaff ? '#1a1a1a' : '#fce4ec', color: esStaff ? '#fff' : '#1a1a1a', borderLeft: '5px solid #f06292' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>{t.panel}</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{t.usuario}: <strong>{user?.signInDetails?.loginId || user?.username}</strong></p>
        <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{t.rol}: <strong>{grupos.join(', ') || t.cliente}</strong></p>
      </div>

      {esAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'TOTAL PEDIDOS', valor: totalPedidos },
            { label: 'PENDIENTES', valor: pedidosPendientes },
            { label: 'ENTREGADOS', valor: pedidosEntregados },
            { label: 'VENTAS EST.', valor: `$${totalVentas.toLocaleString()}` },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #fce4ec', padding: '20px 24px', borderRadius: '4px' }}>
              <h4 style={{ fontSize: '0.75rem', color: '#f06292', letterSpacing: '0.05em', marginBottom: '10px' }}>{s.label}</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>{s.valor}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: '24px', color: '#1a1a1a' }}>
          {esStaff ? t.gestionPedidos : 'Mis Pedidos'}
        </h2>
        {historial.length === 0
          ? <p style={{ color: '#999', textAlign: 'center', padding: '40px', border: '1px dashed #f8bbd0' }}>{t.sinPedidos}</p>
          : esStaff
            ? <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#fce4ec' }}>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>{t.clienteTabla}</th>
                      <th style={thStyle}>{t.producto}</th>
                      <th style={thStyle}>{t.estatus}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((p) => (
                      <tr key={p.id} className="table-row">
                        <td style={tdStyle}><span style={{ color: '#f06292', fontWeight: 600 }}>#{p.id}</span></td>
                        <td style={tdStyle}>{p.nombre_cliente}</td>
                        <td style={tdStyle}>{p.tipo_articulo}</td>
                        <td style={tdStyle}>
                          <select className="form-select" value={p.estatus || 'pendiente'} onChange={e => actualizarEstado(p.id, e.target.value)}>
                            <option value="pendiente">{t.pendiente}</option>
                            <option value="terminado">{t.terminado}</option>
                            <option value="entregado">{t.entregado}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            : <div>{historial.map(p => <TimelineCard key={p.id} pedido={p} t={t} />)}</div>
        }
      </div>

      {!esStaff && (
        <div style={{ background: '#fff', border: '1px solid #fce4ec', padding: '36px', maxWidth: '600px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', marginBottom: '24px', color: '#1a1a1a' }}>{t.nuevoPedido}</h2>
          <form onSubmit={enviarPedido}>
            <input className="form-input" placeholder={t.nombre} value={pedido.nombre_cliente} onChange={e => setPedido({ ...pedido, nombre_cliente: e.target.value })} required />
            <input className="form-input" placeholder={t.producto} value={pedido.tipo_articulo} onChange={e => setPedido({ ...pedido, tipo_articulo: e.target.value })} required />
            <textarea className="form-input" rows={3} placeholder={t.descripcion} value={pedido.descripcion_extra} onChange={e => setPedido({ ...pedido, descripcion_extra: e.target.value })} />
            <button type="submit" disabled={cargando}
              style={{ background: cargando ? '#999' : '#1a1a1a', color: '#fff', border: 'none', padding: '13px 32px', cursor: cargando ? 'not-allowed' : 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.12em', transition: 'background 0.25s', marginTop: '8px' }}
              onMouseOver={e => { if (!cargando) e.target.style.background='#f06292'; }}
              onMouseOut={e => { if (!cargando) e.target.style.background='#1a1a1a'; }}>
              {cargando ? '...' : t.enviar}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ===============================
// VISTA ROLES
// ===============================
function VistaRoles({ idioma, grupos }) {
  const t = textos[idioma];
  const [datos, setDatos] = useState({ username: '', rol: 'Cliente' });
  const [nuevoUsuario, setNuevoUsuario] = useState({ username: '', password: '', rol: 'Cliente' });
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
    } catch (err) { Swal.fire({ icon: 'error', title: t.error, text: 'Error al asignar rol', confirmButtonColor: '#f06292' }); }
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/crear-usuario`, nuevoUsuario);
      Swal.fire({ icon: 'success', title: t.exito, text: `Usuario ${nuevoUsuario.username} creado`, confirmButtonColor: '#f06292' });
      setNuevoUsuario({ username: '', password: '', rol: 'Cliente' });
    } catch (err) { Swal.fire({ icon: 'error', title: t.error, text: err.response?.data?.error || err.message, confirmButtonColor: '#f06292' }); }
  };

  return (
    <div style={{ padding: '60px 8%' }}>
      <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#f06292', marginBottom: '10px' }}>— ADMINISTRACION —</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '36px', color: '#1a1a1a' }}>{t.gestionRoles}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '1px solid #fce4ec', padding: '36px' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: '20px' }}>Asignar Rol a Usuario Existente</h3>
          <form onSubmit={asignarRol}>
            <input className="form-input" placeholder={t.correo} value={datos.username} onChange={e => setDatos({ ...datos, username: e.target.value })} required />
            <select className="form-input" value={datos.rol} onChange={e => setDatos({ ...datos, rol: e.target.value })}>
              <option value="Cliente">Cliente</option><option value="Empleado">Empleado</option><option value="Admin">Admin</option>
            </select>
            <button type="submit" style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '13px 32px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.12em', width: '100%' }}
              onMouseOver={e => e.target.style.background='#f06292'} onMouseOut={e => e.target.style.background='#1a1a1a'}>ASIGNAR ROL</button>
          </form>
        </div>
        <div style={{ background: '#fff', border: '1px solid #fce4ec', padding: '36px' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: '20px' }}>Crear Nuevo Usuario</h3>
          <form onSubmit={crearUsuario}>
            <input className="form-input" type="email" placeholder="Correo electronico" value={nuevoUsuario.username} onChange={e => setNuevoUsuario({ ...nuevoUsuario, username: e.target.value })} required />
            <input className="form-input" type="password" placeholder="Contrasena inicial" value={nuevoUsuario.password} onChange={e => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} required />
            <select className="form-input" value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
              <option value="Cliente">Cliente</option><option value="Empleado">Empleado</option><option value="Admin">Admin</option>
            </select>
            <button type="submit" style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '13px 32px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: '0.85rem', letterSpacing: '0.12em', width: '100%' }}
              onMouseOver={e => e.target.style.background='#f06292'} onMouseOut={e => e.target.style.background='#1a1a1a'}>CREAR USUARIO</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ===============================
// LOGIN HEADER
// ===============================
const components = {
  Header() {
    return (
      <View textAlign="center" padding="large">
        <Image src={logoImage} alt="Jeudi Shop Logo" style={{ width: '70px' }} />
        <Text variation="primary" fontWeight="bold" fontSize="1.4rem" marginTop="10px" style={{ fontFamily: "'Playfair Display', serif" }}>JEUDI SHOP</Text>
      </View>
    );
  },
};

// ===============================
// CONTENT PRINCIPAL
// ===============================
function Content({ pantalla, setPantalla, idioma, setIdioma }) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [grupos, setGrupos] = useState([]);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [historialGlobal, setHistorialGlobal] = useState([]);
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Bolso Lucia', precio: 2400, imagen: producto1, desc: 'Bolso artesanal de cuero vegano. Perfecto para el dia a dia.', fechaCreacion: '2025-01-10T10:00:00Z' },
    { id: 2, nombre: 'Tote Elena', precio: 2900, imagen: producto2, desc: 'Tote bag de lona resistente con bordados exclusivos.', fechaCreacion: '2025-02-15T10:00:00Z' },
    { id: 3, nombre: 'Sombrero Gabrielle', precio: 1200, imagen: producto3, desc: 'Sombrero tejido a mano con hilo de algodon natural.', fechaCreacion: '2025-03-20T10:00:00Z' },
  ]);

  useEffect(() => {
    if (user) fetchAuthSession().then(s => setGrupos(s.tokens?.idToken?.payload?.['cognito:groups'] || [])).catch(() => setGrupos([]));
    else setGrupos([]);
  }, [user]);

  useEffect(() => { if (user && pantalla === 'login') setPantalla('inicio'); }, [user, pantalla, setPantalla]);

  const esAdmin = grupos.some(g => ['admin', 'Admin'].includes(g));
  const pedidosPendientes = esAdmin ? historialGlobal.filter(p => !p.estatus || p.estatus === 'pendiente').length : 0;

  return (
    <>
      <style>{globalStyles}</style>
      <Navbar user={user} signOut={signOut} pantalla={pantalla} setPantalla={setPantalla} idioma={idioma} setIdioma={setIdioma} grupos={grupos} pedidosPendientes={pedidosPendientes} />
      <main>
        {pantalla === 'inicio' && <VistaInicio idioma={idioma} setPantalla={setPantalla} productos={productos} setProductoDetalle={setProductoDetalle} />}
        {pantalla === 'catalogo' && <VistaCatalogo user={user} setPantalla={setPantalla} idioma={idioma} productos={productos} setProductos={setProductos} grupos={grupos} setProductoDetalle={setProductoDetalle} />}
        {pantalla === 'detalle' && <VistaDetalle producto={productoDetalle} setPantalla={setPantalla} user={user} t={textos[idioma]} />}
        {pantalla === 'pedido' && user && <VistaPedidos idioma={idioma} grupos={grupos} productos={productos} onHistorialCargado={setHistorialGlobal} />}
        {pantalla === 'perfil' && user && <VistaPerfil idioma={idioma} grupos={grupos} historial={historialGlobal} />}
        {pantalla === 'roles' && <VistaRoles idioma={idioma} grupos={grupos} />}
        {pantalla === 'login' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
            <Authenticator components={components} loginMechanisms={['username', 'email']} signUpAttributes={['email']} />
          </div>
        )}
      </main>
      <Footer idioma={idioma} setPantalla={setPantalla} />
    </>
  );
}

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

const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 500, color: '#1a1a1a', borderBottom: '2px solid #f8bbd0' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #fce4ec', verticalAlign: 'middle' };
