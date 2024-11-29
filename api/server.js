const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: 'postgresql://postgres:KoAhRTsHVPEnTVAzryXhCFdpHRZSxOSq@autorack.proxy.rlwy.net:49504/railway',
});

app.use(bodyParser.json());

// Ruta raíz para verificar el funcionamiento del servidor
app.get('/', (req, res) => {
  res.send('Servidor funcionando. Usa /api/survey para enviar datos.');
});

// Ruta para manejar los envíos de encuestas
app.post('/api/survey', async (req, res) => {
  const {
    nombre,
    nrohab,
    check_in,
    hab,
    bath,
    redp,
    manolo,
    desay,
    rmserv,
    pool,
    check_out,
    gneral
  } = req.body;

  try {
    // Consulta SQL para insertar los datos en la tabla encuestas
    const query = `
      INSERT INTO encuestas (
        nombre, nrohab, check_in, hab, bath, redp, manolo, desay,
        rmserv, pool, check_out, gneral
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, nombre, nrohab, check_in, hab, bath, redp, manolo,
        desay, rmserv, pool, check_out, gneral;
    `;

    const values = [
      nombre, nrohab, check_in, hab, bath, redp, manolo, desay,
      rmserv, pool, check_out, gneral
    ];

    const result = await pool.query(query, values);

    console.log(result.rows[0]); // Verifica que el resultado esté correcto
    res.status(201).json({
      message: 'Encuesta guardada exitosamente.',
      result: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar la encuesta:', error);
    res.status(500).json({ error: 'Error al guardar la encuesta.' });
  }
});

// Inicia el servidor en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
