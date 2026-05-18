require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');

const app = express();
const USER_POOL_ID = 'us-west-2_VdZApaQEQ';
const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-west-2' });

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
// RUTA OBTENER PEDIDOS (EL CAMBIO CLAVE)
// ===============================
app.get('/pedidos', async (req, res) => {
  try {
    const { email } = req.query; 
    let result;

    if (email && email !== 'undefined') {
      // Usamos ILIKE y trim() para que no importe si hay mayúsculas o espacios accidentales
      const queryText = 'SELECT * FROM pedidos WHERE nombre_cliente ILIKE $1 ORDER BY id DESC';
      result = await pool.query(queryText, [email.trim()]);
      
      console.log(`🔍 Filtrando pedidos para: ${email}`);
    } else {
      // Si no hay email (Admin), enviamos todo
      result = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
      console.log('📋 Enviando todos los pedidos (Vista Admin)');
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error en GET /pedidos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// RESTO DE RUTAS (SIN CAMBIOS)
// ===============================
app.post('/pedidos', async (req, res) => {
  const { nombre_cliente, tipo_articulo, descripcion_extra } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pedidos (nombre_cliente, tipo_articulo, descripcion_extra) VALUES ($1, $2, $3) RETURNING *',
      [nombre_cliente.trim(), tipo_articulo, descripcion_extra]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/pedidos/:id/estatus', async (req, res) => {
  const { id } = req.params;
  const { nuevo_estatus } = req.body;
  try {
    await pool.query('UPDATE pedidos SET estatus = $1 WHERE id = $2', [nuevo_estatus, id]);
    res.json({ message: 'Estatus actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/pedidos', async (req, res) => {
  // Usamos .trim() para quitar espacios antes o después del nombre
  const { nombre_cliente, tipo_articulo, descripcion_extra } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pedidos (nombre_cliente, tipo_articulo, descripcion_extra) VALUES ($1, $2, $3) RETURNING *',
      [nombre_cliente.trim(), tipo_articulo, descripcion_extra]
    );
    console.log("✅ Pedido guardado para:", nombre_cliente.trim());
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Backend JEUDI SHOP corriendo en puerto 3000');
});