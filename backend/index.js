require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const app = express();
const USER_POOL_ID = 'us-west-2_SAazwJL7u';
const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-west-2' });

const client = new MercadoPagoConfig({
  accessToken: 'TEST-7918913625259572-052510-7c883ca418b8d4939ac170f9791cb692-1065937150'
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' })); // Permitir imágenes en base64 de tamaño grande

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function inicializarBaseDeDatos() {
  try {
    // 1. Crear tabla categorias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT
      )
    `);

    // 2. Crear tabla productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        precio NUMERIC NOT NULL,
        imagen TEXT,
        descripcion TEXT,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL
      )
    `);

    // 3. Crear tabla pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        nombre_cliente VARCHAR(255) NOT NULL,
        tipo_articulo VARCHAR(255) NOT NULL,
        descripcion_extra TEXT,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Agregar columna estatus si no existe
    try {
      await pool.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estatus VARCHAR(50) DEFAULT 'pendiente'");
    } catch (err) {
      // Ignorar error si ya existe
    }

    // Agregar columna estatus_pago si no existe
    try {
      await pool.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estatus_pago VARCHAR(50) DEFAULT 'pendiente_pago'");
    } catch (err) {
      // Ignorar error si ya existe
    }

    // 4. Crear tabla usuarios_perfil
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios_perfil (
        username VARCHAR(255) PRIMARY KEY,
        nombre_display VARCHAR(255),
        foto_base64 TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Crear tabla ventas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
        cliente VARCHAR(255),
        producto VARCHAR(255),
        monto NUMERIC,
        metodo_pago VARCHAR(50),
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        estatus_pago VARCHAR(50),
        mp_procesado VARCHAR(10)
      )
    `);

    // 6. Sembrar categorias por defecto si esta vacio
    const catCheck = await pool.query('SELECT COUNT(*) FROM categorias');
    if (parseInt(catCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO categorias (id, nombre, descripcion) VALUES
        (1, 'Bolsos', 'Bolsos hechos de lona y cuero vegano.'),
        (2, 'Sombreros', 'Sombreros de algodon natural.'),
        (3, 'Accesorios', 'Totes y pequeños accesorios.')
      `);
      await pool.query("SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias))");
    }

    // 7. Sembrar productos por defecto si esta vacio
    const prodCheck = await pool.query('SELECT COUNT(*) FROM productos');
    if (parseInt(prodCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO productos (id, nombre, precio, imagen, descripcion, categoria_id) VALUES
        (1, 'Bolso Lucia', 2400, 'producto1', 'Bolso artesanal de cuero vegano. Perfecto para el dia a dia.', 1),
        (2, 'Tote Elena', 2900, 'producto2', 'Tote bag de lona resistente con bordados exclusivos.', 1),
        (3, 'Sombrero Gabrielle', 1200, 'producto3', 'Sombrero tejido a mano con hilo de algodon natural.', 2)
      `);
      await pool.query("SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos))");
    }

    console.log('Base de datos inicializada correctamente (tablas creadas y sembradas).');
  } catch (err) {
    console.error('Error al inicializar base de datos:', err.message);
  }
}

// ===============================
// PEDIDOS — GET
// ===============================
app.get('/pedidos', async (req, res) => {
  try {
    const { email } = req.query;
    let result;
    if (email && email !== 'undefined') {
      result = await pool.query(
        'SELECT * FROM pedidos WHERE nombre_cliente ILIKE $1 ORDER BY id DESC',
        [email.trim()]
      );
    } else {
      result = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// PEDIDOS — POST
// ===============================
app.post('/pedidos', async (req, res) => {
  const { nombre_cliente, tipo_articulo, descripcion_extra } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO pedidos (nombre_cliente, tipo_articulo, descripcion_extra, estatus, estatus_pago) VALUES ($1, $2, $3, 'pendiente', 'pendiente_pago') RETURNING *",
      [nombre_cliente.trim(), tipo_articulo, descripcion_extra]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// PEDIDOS — PATCH estatus
// ===============================
app.patch('/pedidos/:id/estatus', async (req, res) => {
  const { id } = req.params;
  const { nuevo_estatus } = req.body;
  try {
    await pool.query('UPDATE pedidos SET estatus = $1 WHERE id = $2', [nuevo_estatus, id]);
    res.json({ message: 'Estatus actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// PEDIDOS — PATCH estatus-pago
// ===============================
app.patch('/pedidos/:id/estatus-pago', async (req, res) => {
  const { id } = req.params;
  const { estatus_pago } = req.body;
  try {
    await pool.query('UPDATE pedidos SET estatus_pago = $1 WHERE id = $2', [estatus_pago, id]);
    res.json({ message: 'Estatus de pago actualizado con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// PEDIDOS — DELETE
// ===============================
app.delete('/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// PERFIL — GET
// ===============================
app.get('/perfil/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query('SELECT nombre_display, foto_base64 FROM usuarios_perfil WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.json({ nombre_display: null, foto_base64: null });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// PERFIL — POST
// ===============================
app.post('/perfil', async (req, res) => {
  const { username, nombre_display, foto_base64 } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO usuarios_perfil (username, nombre_display, foto_base64, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (username) DO UPDATE
      SET nombre_display = EXCLUDED.nombre_display,
          foto_base64 = EXCLUDED.foto_base64,
          updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [username, nombre_display, foto_base64]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// MERCADO PAGO — Crear preferencia
// ===============================
app.post('/crear-preferencia', async (req, res) => {
  const { items, nombre_cliente, pedido_id } = req.body;
  try {
    const preference = new Preference(client);
    
    // Mapear los items reales asegurando tipos correctos
    const itemsMP = items.map(item => ({
      title: item.title,
      quantity: parseInt(item.quantity),
      currency_id: item.currency_id || 'MXN',
      unit_price: parseFloat(item.unit_price)
    }));

    const result = await preference.create({
      body: {
        items: itemsMP,
        payer: { name: nombre_cliente },
        back_urls: {
          success: 'http://44.245.212.173/?status=approved',
          failure: 'http://44.245.212.173/?status=rejected',
          pending: 'http://44.245.212.173/?status=pending'
        },
        auto_return: 'approved',
        statement_descriptor: 'JEUDI SHOP'
      }
    });
    res.json({ init_point: result.init_point, id: result.id });
  } catch (err) {
    console.error('Error completo en crear-preferencia:', err);
    res.status(500).json({ error: err.message, detail: err });
  }
});

// ===============================
// MERCADO PAGO — Ruta de test
// ===============================
app.get('/test-mp', async (req, res) => {
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ title: 'Test', quantity: 1, unit_price: 100, currency_id: 'MXN' }],
        back_urls: { 
          success: 'http://44.245.212.173', 
          failure: 'http://44.245.212.173', 
          pending: 'http://44.245.212.173' 
        }
      }
    });
    res.json({ ok: true, init_point: result.init_point });
  } catch (err) {
    res.json({ ok: false, error: err.message, detail: err });
  }
});

// ===============================
// ADMIN — Asignar rol
// ===============================
app.post('/admin/asignar-rol', async (req, res) => {
  const { username, rol } = req.body;
  try {
    const groupsToRemove = ['Admin', 'admin', 'Empleado', 'empleado'];
    for (const g of groupsToRemove) {
      try {
        await cognitoClient.send(new AdminRemoveUserFromGroupCommand({
          UserPoolId: USER_POOL_ID, Username: username, GroupName: g
        }));
      } catch (err) {}
    }
    if (rol !== 'Cliente') {
      await cognitoClient.send(new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID, Username: username, GroupName: rol
      }));
    }
    res.json({ message: `Rol ${rol} asignado a ${username} correctamente` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ADMIN — Crear usuario
// ===============================
app.post('/admin/crear-usuario', async (req, res) => {
  const { username, password, rol } = req.body;
  try {
    await cognitoClient.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: [
        { Name: 'email', Value: username },
        { Name: 'email_verified', Value: 'true' }
      ],
      MessageAction: 'SUPPRESS'
    }));
    await cognitoClient.send(new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID, Username: username, Password: password, Permanent: true
    }));
    if (rol !== 'Cliente') {
      await cognitoClient.send(new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID, Username: username, GroupName: rol
      }));
    }
    res.status(201).json({ message: `Usuario ${username} creado con exito y asignado al rol ${rol}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ADMIN — Listar usuarios de Cognito
// ===============================
app.get('/admin/usuarios', async (req, res) => {
  try {
    const listCommand = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
    });
    const data = await cognitoClient.send(listCommand);

    const usersWithRoles = await Promise.all((data.Users || []).map(async (user) => {
      const groupsCommand = new AdminListGroupsForUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.Username,
      });
      const groupsData = await cognitoClient.send(groupsCommand).catch(() => ({ Groups: [] }));
      const roles = (groupsData.Groups || []).map(g => g.GroupName);
      
      const emailAttr = (user.Attributes || []).find(a => a.Name === 'email');
      return {
        username: user.Username,
        email: emailAttr ? emailAttr.Value : '—',
        rol: roles.join(', ') || 'Cliente',
        enabled: user.Enabled,
        status: user.UserStatus,
        created: user.UserCreateDate,
      };
    }));

    res.json(usersWithRoles);
  } catch (err) {
    console.error("Error al obtener usuarios de Cognito:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — Activar / Desactivar usuario
// ===============================
app.patch('/admin/usuarios/:username/status', async (req, res) => {
  const { username } = req.params;
  const { enable } = req.body;
  try {
    if (enable) {
      await cognitoClient.send(new AdminEnableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
      }));
    } else {
      await cognitoClient.send(new AdminDisableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
      }));
    }
    res.json({ message: `Usuario ${username} ${enable ? 'activado' : 'desactivado'} con exito.` });
  } catch (err) {
    console.error("Error al cambiar estado de usuario:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// CATEGORIAS — CRUD
// ===============================
app.get('/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/categorias', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categorias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/categorias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
    res.json({ message: 'Categoria eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// PRODUCTOS — CRUD
// ===============================
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, precio, imagen, descripcion as desc, fecha_creacion as "fechaCreacion", categoria_id as "categoriaId" FROM productos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/productos', async (req, res) => {
  const { nombre, precio, imagen, desc, categoriaId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, precio, imagen, descripcion, categoria_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, precio, imagen, descripcion as "desc", fecha_creacion as "fechaCreacion", categoria_id as "categoriaId"',
      [nombre, parseFloat(precio), imagen, desc, categoriaId ? parseInt(categoriaId) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, imagen, desc, categoriaId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE productos SET nombre = $1, precio = $2, imagen = $3, descripcion = $4, categoria_id = $5 WHERE id = $6 RETURNING id, nombre, precio, imagen, descripcion as "desc", fecha_creacion as "fechaCreacion", categoria_id as "categoriaId"',
      [nombre, parseFloat(precio), imagen, desc, categoriaId ? parseInt(categoriaId) : null, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// VENTAS — CRUD
// ===============================
app.get('/ventas', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, pedido_id as "pedidoId", cliente, producto, monto, metodo_pago as "metodoPago", fecha, estatus_pago as "estatusPago", mp_procesado as "mpProcesado" FROM ventas ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/ventas', async (req, res) => {
  const { pedidoId, cliente, producto, monto, metodoPago, estatusPago, mpProcesado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ventas (pedido_id, cliente, producto, monto, metodo_pago, estatus_pago, mp_procesado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, pedido_id as "pedidoId", cliente, producto, monto, metodo_pago as "metodoPago", fecha, estatus_pago as "estatusPago", mp_procesado as "mpProcesado"',
      [pedidoId ? parseInt(pedidoId) : null, cliente, producto, parseFloat(monto), metodoPago, estatusPago, mpProcesado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

inicializarBaseDeDatos().then(() => {
  app.listen(3000, () => {
    console.log('Backend JEUDI SHOP corriendo en puerto 3000');
  });
});
