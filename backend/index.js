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

const mpClient = new MercadoPagoConfig({
  accessToken: 'TEST-7918913625259572-052510-7c883ca418b8d4939ac170f9791cb692-1065937150'
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

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
      'INSERT INTO pedidos (nombre_cliente, tipo_articulo, descripcion_extra) VALUES ($1, $2, $3) RETURNING *',
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
// MERCADO PAGO — Crear preferencia
// ===============================
app.post('/crear-preferencia', async (req, res) => {
  const { nombre_producto, precio, nombre_cliente } = req.body;
  try {
    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [{
          title: nombre_producto,
          quantity: 1,
          currency_id: 'MXN',
          unit_price: parseFloat(precio)
        }],
        payer: { name: nombre_cliente },
        back_urls: {
          success: 'http://54.245.68.19',
          failure: 'http://54.245.68.19',
          pending: 'http://54.245.68.19'
        },
        auto_return: 'approved',
        statement_descriptor: 'JEUDI SHOP'
      }
    });
    res.json({ init_point: result.init_point, id: result.id });
  } catch (err) {
    console.error('Error Mercado Pago:', err.message);
    res.status(500).json({ error: err.message });
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

// ===============================
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

app.listen(3000, () => {
  console.log('Backend JEUDI SHOP corriendo en puerto 3000');
});
