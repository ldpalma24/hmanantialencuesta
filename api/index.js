const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { createProxyMiddleware } = require('http-proxy-middleware'); // Requerimos el paquete para el proxy

// Inicializar la aplicación de Express
const app = express();

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Lee la URL desde las variables de entorno
  ssl: process.env.NODE_ENV === 'production' // Usa SSL en producción
    ? { rejectUnauthorized: false }
    : false
});

// Middleware para habilitar CORS
app.use(
  cors({
    origin: 'https://hmanantialencuesta.vercel.app', // Permite solicitudes desde tu frontend en Vercel
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Habilita las solicitudes OPTIONS (preflight)
app.options('*', cors()); 

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.post('/api/submit-survey', async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No se recibieron datos.' });
    }

    // Inserta datos en la tabla `encuestas`
    await pool.query('INSERT INTO encuestas (data) VALUES ($1)', [data]);

    res.status(200).json({ message: 'Encuesta enviada y guardada correctamente.' });
  } catch (error) {
    console.error('Error al guardar datos:', error.message);
    res.status(500).json({ message: 'Error al guardar los datos en PostgreSQL.' });
  }
});

// Aquí estamos usando el proxy para redirigir las solicitudes de la API
app.use('/api/submit-survey', createProxyMiddleware({
  target: 'https://nodejs-production-bd02.up.railway.app', // El servidor de Railway
  changeOrigin: true, // Cambia el origen de la solicitud para evitar CORS
  pathRewrite: {
    '^/api/submit-survey': '/api/submit-survey', // Mantenemos la ruta de la API
  },
}));

// Middleware para manejar otras rutas no definidas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Exporta la aplicación para que Vercel la maneje
module.exports = app;
