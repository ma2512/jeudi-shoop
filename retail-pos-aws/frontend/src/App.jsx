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

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_VdZApaQEQ',
      userPoolClientId: '6459s64r15eifr9lmbkr6kb80f',
      loginWith: { email: true, username: true }
    }
  }
});

// ===============================
// TEMA PERSONALIZADO (ROSA & NEGRO)
// ===============================
const temaJeudi = {
  name: 'tema-jeudi',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: '#fce4ec', // Rosa muy clarito
          80: '#f06292', // Rosa acento
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
          _active: {
            color: '#f06292',
            borderColor: '#f06292',
          },
          _hover: {
            color: '#ec407a',
          },
        },
      },
      button: {
        primary: {
          backgroundColor: '#1a1a1a', // Botón negro
          _hover: {
            backgroundColor: '#f06292', // Rosa al pasar el mouse
          },
        },
        link: {
          color: '#f06292', // Enlaces en rosa
        },
      },
      fieldcontrol: {
        borderColor: '#f8bbd0', // Bordes de inputs rosas
        _focus: {
          borderColor: '#f06292',
          boxShadow: '0 0 0 1px #f06292',
        },
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
    estatus: 'Estatus', nombre: 'Tu nombre/Email', descripcion: 'Descripción',
    enviar: 'ENVIAR PEDIDO', vistaPublica: 'Vista Pública',
    soloAdmin: 'Solo los administradores pueden acceder.', gestionRoles: 'Gestión de Roles',
    correo: 'Correo/Usuario', guardar: 'GUARDAR', noPedidos: 'Sin pedidos registrados',
    exito: 'Éxito', pedidoEnviado: 'Pedido enviado correctamente', error: 'Error', noEnviar: 'No se pudo enviar'
  },
  en: {
    inicio: 'HOME', productos: 'PRODUCTS', pedidos: 'ORDERS', roles: 'ROLES',
    entrar: 'LOGIN', salir: 'LOGOUT', hero: 'Handmade. For you.',
    verCatalogo: 'VIEW CATALOG', panel: 'Control Panel', usuario: 'User',
    rol: 'Role', cliente: 'client', gestionPedidos: 'Orders Management',
    nuevoPedido: 'New Order', clienteTabla: 'Client', producto: 'Product',
    estatus: 'Status', nombre: 'Name/Email', descripcion: 'Description',
    enviar: 'SEND ORDER', vistaPublica: 'Public View',
    soloAdmin: 'Admins only.', gestionRoles: 'Role Management',
    correo: 'User/Email', guardar: 'SAVE', noPedidos: 'No orders found',
    exito: 'Success', pedidoEnviado: 'Order sent', error: 'Error', noEnviar: 'Failed'
  }
};

// ===============================
// NAVBAR (DISEÑO ROSA BAJITO)
// ===============================
function Navbar({ user, signOut, pantalla, setPantalla, idioma, setIdioma }) {
  const t = textos[idioma];
  const getButtonStyle = (p) => ({
    background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold',
    color: pantalla === p ? '#f06292' : '#1a1a1a', borderBottom: pantalla === p ? '2px solid #f06292' : 'none'
  });

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #fce4ec', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', color: '#fce4ec', display: 'flex', justifyContent: 'space-between', padding: '6px 8%', fontSize: '0.7rem' }}>
        <span>TEL: 4531257355</span>
        <span>INSTAGRAM: @jeudi_shoop</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8%', background: '#fce4ec' }}>
        <div onClick={() => setPantalla('inicio')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <img src={logoImage} alt="logo" style={{ width: '55px' }} />
          <h2 style={{ fontFamily: 'serif', color: '#1a1a1a' }}>JEUDI SHOP</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button style={getButtonStyle('inicio')} onClick={() => setPantalla('inicio')}>{t.inicio}</button>
          <button style={getButtonStyle('catalogo')} onClick={() => setPantalla('catalogo')}>{t.productos}</button>
          {user && <button style={getButtonStyle('pedido')} onClick={() => setPantalla('pedido')}>{t.pedidos}</button>}
          <button style={getButtonStyle('roles')} onClick={() => setPantalla('roles')}>{t.roles}</button>
          <button style={botonIdiomaStyle} onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}>{idioma.toUpperCase()}</button>
          {user ? <button style={botonNegroClaro} onClick={signOut}>{t.salir}</button> 
                 : <button style={botonNegroStyleSmall} onClick={() => setPantalla('login')}>{t.entrar}</button>}
        </div>
      </div>
    </nav>
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

  const cargarPedidos = useCallback(async () => {
    if (!user) return;
    try {
      const session = await fetchAuthSession();
      const roles = session.tokens?.idToken?.payload?.['cognito:groups'] || [];
      setGrupos(roles);
      const userLogin = user?.signInDetails?.loginId || user?.username;
      const esStaff = roles.includes('admin') || roles.includes('empleado');
      const url = esStaff ? 'http://localhost:3000/pedidos' : `http://localhost:3000/pedidos?email=${encodeURIComponent(userLogin)}`;
      const res = await axios.get(url);
      setHistorial(res.data);
    } catch (err) { console.error(err); }
  }, [user]);

  useEffect(() => { cargarPedidos(); }, [cargarPedidos]);

  const esStaff = grupos.includes('admin') || grupos.includes('empleado');

  const enviarPedido = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/pedidos', pedido);
      Swal.fire(t.exito, t.pedidoEnviado, 'success');
      setPedido({ nombre_cliente: '', tipo_articulo: '', descripcion_extra: '' });
      setTimeout(() => { cargarPedidos(); }, 800);
    } catch (err) { Swal.fire(t.error, t.noEnviar, 'error'); }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      await axios.patch(`http://localhost:3000/pedidos/${id}/estatus`, { nuevo_estatus: estado });
      cargarPedidos();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: '60px 8%' }}>
      <div style={{ padding: '30px', marginBottom: '40px', borderRadius: '8px', background: esStaff ? '#1a1a1a' : '#fce4ec', color: esStaff ? '#fff' : '#000' }}>
        <h2>{t.panel}</h2>
        <p>{t.usuario}: {user?.signInDetails?.loginId || user?.username}</p>
        <p>{t.rol}: {grupos.join(', ') || t.cliente}</p>
      </div>
      <div style={{ marginBottom: '50px' }}>
        <h2>{esStaff ? t.gestionPedidos : t.pedidos}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableCellStyle}>ID</th>
              <th style={tableCellStyle}>{t.clienteTabla}</th>
              <th style={tableCellStyle}>{t.producto}</th>
              <th style={tableCellStyle}>{t.estatus}</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((p) => (
              <tr key={p.id}><td style={tableCellStyle}>#{p.id}</td><td style={tableCellStyle}>{p.nombre_cliente}</td><td style={tableCellStyle}>{p.tipo_articulo}</td><td style={tableCellStyle}>
                {esStaff ? (
                  <select value={p.estatus} onChange={(e) => actualizarEstado(p.id, e.target.value)}>
                    <option value="pendiente">pendiente</option><option value="terminado">terminado</option><option value="entregado">entregado</option>
                  </select>
                ) : <span style={{ color: '#f06292', fontWeight: 'bold' }}>{p.estatus}</span>}
              </td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ background: '#fff', border: '1px solid #fce4ec', padding: '30px' }}>
        <h2>{t.nuevoPedido}</h2>
        <form onSubmit={enviarPedido}>
          <input style={formInputStyle} placeholder={t.nombre} value={pedido.nombre_cliente} onChange={(e) => setPedido({ ...pedido, nombre_cliente: e.target.value })} required />
          <input style={formInputStyle} placeholder={t.producto} value={pedido.tipo_articulo} onChange={(e) => setPedido({ ...pedido, tipo_articulo: e.target.value })} required />
          <textarea style={formInputStyle} placeholder={t.descripcion} value={pedido.descripcion_extra} onChange={(e) => setPedido({ ...pedido, descripcion_extra: e.target.value })} />
          <button type="submit" style={botonNegroStyle}>{t.enviar}</button>
        </form>
      </div>
    </div>
  );
}

// VISTAS ADICIONALES
function VistaInicio({ idioma, setPantalla }) {
  const t = textos[idioma];
  return (
    <section style={{ position: 'relative', minHeight: '80vh', textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '3.5rem', color: '#1a1a1a' }}>{t.hero}</h1>
        <button style={botonNegroStyle} onClick={() => setPantalla('catalogo')}>{t.verCatalogo}</button>
      </div>
      <img src={paginainicio1} style={{ position: 'absolute', left: 0, bottom: 0, width: '30%' }} alt="decor" />
      <img src={paginainicio2} style={{ position: 'absolute', right: 0, top: 0, width: '25%' }} alt="decor" />
    </section>
  );
}

function VistaCatalogo({ user, setPantalla }) {
  const productos = [
    { id: 1, nombre: 'Bolso Lucia', precio: 2400, imagen: producto1 },
    { id: 2, nombre: 'Tote Elena', precio: 2900, imagen: producto2 },
    { id: 3, nombre: 'Sombrero Gabrielle', precio: 1200, imagen: producto3 }
  ];
  return (
    <section style={{ padding: '40px 8%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '30px' }}>
      {productos.map((p) => (
        <div key={p.id} onClick={() => user ? setPantalla('pedido') : setPantalla('login')} style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid #fce4ec', padding: '20px', background: '#fff' }}>
          <img src={p.imagen} style={{ width: '100%', height: '450px', objectFit: 'contain' }} alt={p.nombre} />
          <h3 style={{ fontFamily: 'serif', marginTop: '15px' }}>{p.nombre}</h3>
          <p>${p.precio}</p>
        </div>
      ))}
    </section>
  );
}

function VistaRoles({ idioma }) {
  const t = textos[idioma];
  const { user } = useAuthenticator((context) => [context.user]);
  const [grupos, setGrupos] = useState([]);
  const [datos, setDatos] = useState({ username: '', rol: 'cliente' });
  useEffect(() => { if (user) fetchAuthSession().then(s => setGrupos(s.tokens?.idToken?.payload?.['cognito:groups'] || [])); }, [user]);
  if (!grupos.includes('admin')) return <div style={{ padding: '80px 8%', textAlign: 'center' }}><h1>{t.vistaPublica}</h1><p>{t.soloAdmin}</p></div>;
  const asignarRol = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/admin/asignar-rol', datos);
      Swal.fire(t.exito, 'Rol actualizado', 'success');
      setDatos({ username: '', rol: 'cliente' });
    } catch (err) { Swal.fire(t.error, 'Error', 'error'); }
  };
  return (
    <div style={{ padding: '60px 8%' }}>
      <h1>{t.gestionRoles}</h1>
      <form onSubmit={asignarRol}>
        <input style={formInputStyle} placeholder={t.correo} value={datos.username} onChange={(e) => setDatos({ ...datos, username: e.target.value })} required />
        <select style={formInputStyle} value={datos.rol} onChange={(e) => setDatos({ ...datos, rol: e.target.value })}>
          <option value="cliente">Cliente</option><option value="empleado">Empleado</option><option value="admin">Admin</option>
        </select>
        <button type="submit" style={botonNegroStyle}>{t.guardar}</button>
      </form>
    </div>
  );
}

// COMPONENTE DE CABECERA PARA EL LOGIN
const components = {
  Header() {
    return (
      <View textAlign="center" padding="large">
        <Image src={logoImage} alt="Jeudi Shop Logo" style={{ width: '80px' }} />
        <Text variation="primary" fontWeight="bold" fontSize="1.5rem" marginTop="10px">
          JEUDI SHOP
        </Text>
      </View>
    );
  },
};

function Content({ pantalla, setPantalla, idioma, setIdioma }) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  useEffect(() => { if (user && pantalla === 'login') setPantalla('inicio'); }, [user, pantalla, setPantalla]);

  return (
    <>
      <Navbar user={user} signOut={signOut} pantalla={pantalla} setPantalla={setPantalla} idioma={idioma} setIdioma={setIdioma} />
      <main>
        {pantalla === 'inicio' && <VistaInicio idioma={idioma} setPantalla={setPantalla} />}
        {pantalla === 'catalogo' && <VistaCatalogo user={user} setPantalla={setPantalla} />}
        {pantalla === 'pedido' && user && <VistaPedidos idioma={idioma} />}
        {pantalla === 'roles' && <VistaRoles idioma={idioma} />}
        {pantalla === 'login' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Authenticator 
              components={components} 
              loginMechanisms={['username', 'email']} 
              signUpAttributes={['email']} 
            />
          </div>
        )}
      </main>
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

// ESTILOS FINALES
const botonNegroStyle = { background: '#1a1a1a', color: '#fff', border: 'none', padding: '12px 30px', cursor: 'pointer', marginTop: '20px' };
const botonNegroStyleSmall = { ...botonNegroStyle, padding: '8px 15px', marginTop: 0 };
const botonNegroClaro = { background: 'none', border: '1px solid #1a1a1a', padding: '8px 15px', cursor: 'pointer' };
const botonIdiomaStyle = { background: '#fce4ec', border: '1px solid #f8bbd0', padding: '5px 10px', cursor: 'pointer' };
const formInputStyle = { width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #f8bbd0', outline: 'none' };
const tableCellStyle = { padding: '15px', borderBottom: '1px solid #fce4ec', textAlign: 'left' };