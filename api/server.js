const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: 'postgresql://postgres:KoAhRTsHVPEnTVAzryXhCFdpHRZSxOSq@autorack.proxy.rlwy.net:49504/railway',
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Servidor funcionando. Usa /api/survey para enviar datos.');
});

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

  console.log('Datos recibidos:', req.body);

  const nrohabInt = parseInt(nrohab, 10);
  const checkInInt = parseInt(check_in, 10);
  const habInt = parseInt(hab, 10);
  const bathInt = parseInt(bath, 10);
  const redpInt = parseInt(redp, 10);
  const manoloInt = parseInt(manolo, 10);
  const desayInt = parseInt(desay, 10);
  const rmservInt = parseInt(rmserv, 10);
  const poolInt = parseInt(pool, 10);
  const checkOutInt = parseInt(check_out, 10);
  const gneralInt = parseInt(gneral, 10);

  if (
    [nrohabInt, checkInInt, habInt, bathInt, redpInt, manoloInt, desayInt, rmservInt, poolInt, checkOutInt, gneralInt]
    .some(val => isNaN(val))
  ) {
    return res.status(400).json({ error: 'Todos los campos numéricos deben ser enteros.' });
  }

  try {
    const query = `
      INSERT INTO encuestas (
        nombre, nrohab, check_in, hab, bath, redp, manolo, desay,
        rmserv, pool, check_out, gneral
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      nombre, nrohabInt, checkInInt, habInt, bathInt, redpInt, manoloInt, desayInt,
      rmservInt, poolInt, checkOutInt, gneralInt
    ];

    const result = await pool.query(query, values);

    console.log('Resultado de la inserción:', result.rows[0]);
    res.status(201).json({
      message: 'Encuesta guardada exitosamente.',
      result: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar la encuesta:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
