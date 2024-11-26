const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();

const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: 'postgresql://postgres:KoAhRTsHVPEnTVAzryXhCFdpHRZSxOSq@autorack.proxy.rlwy.net:49504/railway',
});

app.use(bodyParser.json());

// Esta es la ruta raíz que solo sirve una respuesta de texto
app.get('/', (req, res) => {
  res.send('Servidor funcionando. Usa /api/survey para enviar datos.');
});

// Ruta para manejar los envíos de encuestas
app.post('/api/survey', async (req, res) => {
  const { response } = req.body;
  try {
    const result = await pool.query('INSERT INTO encuestas (response) VALUES ($1) RETURNING *', [response]);
    console.log(result); // Verifica que el resultado esté correcto
    res.status(201).json({ message: 'Response saved', result: result.rows });
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ error: 'Error saving response' });
  }
});

// Asegúrate de que el servidor esté escuchando en el puerto correcto
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
