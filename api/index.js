// Middleware para habilitar CORS
app.use(
  cors({
    origin: 'https://hmanantialencuesta.vercel.app', // Permite solicitudes desde tu frontend en Vercel
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Rutas
app.options('/api/submit-survey', cors());  // Asegúrate de que OPTIONS sea manejado correctamente

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
