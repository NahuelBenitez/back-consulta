const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL correctamente');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    client.release();
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    console.log('🔧 Verifica las credenciales en el archivo .env');
  }
};

// Verificar conexión al iniciar
testConnection();

// Manejar eventos de conexión
pool.on('connect', () => {
  console.log('🔄 Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
  console.error('💥 Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;