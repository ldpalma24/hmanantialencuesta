// Dependencias
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Inicializar la aplicación Express
const app = express();

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL de la base de datos
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false // SSL en producción
});

// Prefijo dinámico (Railway podría requerirlo)
const basePath = process.env.BASE_PATH || ''; // Define BASE_PATH en Railway si es necesario

// Middleware para habilitar CORS
app.use(
  cors({
    origin: '*', // Cambiar a 'https://hmanantialencuesta.vercel.app' si es necesario.
    methods: ['GET', 'POST', 'OPTIONS'], // Permite GET, POST y OPTIONS.
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Middleware para parsear JSON
app.use(express.json());

// Ruta para la solicitud POST
app.post(`${basePath}/api/submit-survey`, async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No se recibieron datos.' });
    }

    // Inserta los datos en la base de datos
    await pool.query('INSERT INTO encuestas (data) VALUES ($1)', [data]);

    res.status(200).json({ message: 'Encuesta enviada y guardada correctamente.' });
  } catch (error) {
    console.error('Error al guardar datos:', error.message);
    res.status(500).json({ message: 'Error al guardar los datos en PostgreSQL.' });
  }
});

// Ruta para OPTIONS (preflight CORS)
app.options(`${basePath}/api/submit-survey`, (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://hmanantialencuesta.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Ruta de prueba
app.get(`${basePath}/test`, (req, res) => {
  res.status(200).json({ message: 'Ruta /test funcionando correctamente.' });
});

// Middleware para registrar todas las solicitudes entrantes y rutas no encontradas
app.use((req, res, next) => {
  console.log(`Solicitud no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Registrar todas las rutas activas
console.log('Rutas registradas en el servidor:');
app._router.stack.forEach(function (middleware) {
  if (middleware.route) { // Rutas registradas
    console.log(`  ${middleware.route.path}`);
  }
});

// Inicializar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
