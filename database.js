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

// Función para crear tablas si no existen
const createTablesIfNotExist = async () => {
  try {
    const client = await pool.connect();
    
    console.log('🔧 Verificando/Creando tablas...');

    // Crear tabla _articulos
    await client.query(`
      CREATE TABLE IF NOT EXISTS _articulos (
        codart NUMERIC(5,0) PRIMARY KEY,
        npm VARCHAR(200) DEFAULT NULL,
        stock NUMERIC(10,0),
        pcosto NUMERIC(11,4) DEFAULT NULL,
        pordif NUMERIC(6,2) DEFAULT NULL
      )
    `);
    console.log('✅ Tabla _articulos verificada/creada');

    // Crear tabla _listas
    await client.query(`
      CREATE TABLE IF NOT EXISTS _listas (
        codlis SMALLINT PRIMARY KEY,
        nomlis VARCHAR(50) DEFAULT NULL,
        porlis NUMERIC(4,2) DEFAULT NULL
      )
    `);
    console.log('✅ Tabla _listas verificada/creada');

    // Insertar datos básicos en _listas si no existen
    await client.query(`
      INSERT INTO _listas (codlis, nomlis, porlis) VALUES
      (1, 'ENTIDADES PUBLICAS', 45.00),
      (2, 'INSTITUCIONES PRIVADAS', 40.00),
      (3, 'FARMACIAS', 37.00)
      ON CONFLICT (codlis) DO NOTHING
    `);
    console.log('✅ Datos básicos de listas insertados');

    client.release();
    console.log('🎉 Todas las tablas están listas para usar');
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
  }
};

// Función para probar la conexión y crear tablas
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL correctamente');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    client.release();
    
    // Crear tablas después de verificar la conexión
    await createTablesIfNotExist();
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    console.log('🔧 Verifica las credenciales en el archivo .env');
  }
};

// Verificar conexión y crear tablas al iniciar
testConnection();

// Manejar eventos de conexión
pool.on('connect', () => {
  console.log('🔄 Nueva conexión establecida con PostgreSQL');
});

pool.on('error', (err) => {
  console.error('💥 Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;