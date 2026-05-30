require('dotenv').config({ path: '../backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log("Conectando a la base de datos...");
    
    // Consultar perfiles de usuario existentes
    const usersResult = await pool.query('SELECT username FROM usuarios_perfil LIMIT 10');
    console.log("Usuarios en la base de datos:", usersResult.rows);

    // Escribir un par de pedidos simulados pagados
    // Si no hay usuarios, usaremos correos y nombres simulados
    const users = usersResult.rows.length > 0 ? usersResult.rows.map(u => u.username) : ['maria@example.com', 'cliente_demo@example.com'];

    const articulosSimulados = [
      { tipo: 'Collar de flores rosa', desc: 'Edición limitada con perlas de fantasía y broche de plata' },
      { tipo: 'Pulsera tejida tejana', desc: 'Hilo rosa pastel con dije de bota plateada' },
      { tipo: 'Aretes de corazón acrílico', desc: 'Color rojo transparente, gancho hipoalergénico' },
      { tipo: 'Anillo ajustable perla', desc: 'Perla cultivada sobre base ajustable de oro rosa' }
    ];

    console.log("Insertando pedidos pagados...");
    for (const username of users) {
      // Insertar 2 pedidos para cada usuario
      for (let i = 0; i < 2; i++) {
        const articulo = articulosSimulados[Math.floor(Math.random() * articulosSimulados.length)];
        const res = await pool.query(
          "INSERT INTO pedidos (nombre_cliente, tipo_articulo, descripcion_extra, estatus, estatus_pago) VALUES ($1, $2, $3, 'pendiente', 'pagado') RETURNING *",
          [username, `${articulo.tipo} #${i + 1}`, articulo.desc]
        );
        console.log(`Pedido insertado con éxito: ID #${res.rows[0].id} para ${username} (Estatus Pago: Pagado)`);
      }
    }
  } catch (err) {
    console.error("Error ejecutando la simulación:", err);
  } finally {
    await pool.end();
  }
}

main();
