const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const pool = require('./database'); // Importar el pool para verificar conexión
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Verificar conexión a la base de datos al iniciar
const initializeApp = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a la base de datos verificada correctamente');
    client.release();
  } catch (error) {
    console.error('❌ No se pudo verificar la conexión a la base de datos:', error.message);
  }
};

// Rutas
app.use('/api/articulos', require('./routes/articulos'));
app.use('/api/listas', require('./routes/listas'));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de Artículos funcionando correctamente',
    documentation: '/api-docs',
    endpoints: {
      articulos: '/api/articulos',
      listas: '/api/listas'
    },
    timestamp: new Date().toISOString()
  });
});

// Ruta de health check
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    res.json({
      status: 'OK',
      database: 'Conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Desconectado',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check disponible en http://localhost:${PORT}/health`);
  
  // Verificar conexión a la base de datos
  await initializeApp();
});

module.exports = app;