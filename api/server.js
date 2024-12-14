const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { put } = require('@vercel/blob');
const ExcelJS = require('exceljs');

const app = express();
const port = process.env.PORT || 3000;

// Token de Vercel Blob desde las variables de entorno
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Configuración de PostgreSQL
const dbPool = new Pool({
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
    // Insertar datos en la base de datos
    const query = `
      INSERT INTO encuestas (
        nombre, nrohab, check_in, hab, bath, redp, manolo, desay,
        rmserv, pool, check_out, gneral
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [
      nombre, nrohab, check_in, hab, bath, redp, manolo, desay,
      rmserv, pool, check_out, gneral
    ];

    const result = await dbPool.query(query, values);

    // Exportar a Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Encuestas');

    worksheet.columns = [
      { header: 'Nombre', key: 'nombre' },
      { header: 'Nro Hab', key: 'nrohab' },
      { header: 'Check In', key: 'check_in' },
      { header: 'Hab', key: 'hab' },
      { header: 'Bath', key: 'bath' },
      { header: 'RedP', key: 'redp' },
      { header: 'Manolo', key: 'manolo' },
      { header: 'Desay', key: 'desay' },
      { header: 'RMServ', key: 'rmserv' },
      { header: 'Pool', key: 'pool' },
      { header: 'Check Out', key: 'check_out' },
      { header: 'General', key: 'gneral' }
    ];

    worksheet.addRow(result.rows[0]);

    const buffer = await workbook.xlsx.writeBuffer();

    // Subir el archivo a Vercel Blob con un nombre fijo para un enlace estático
    const fileName = 'uploads/encuestas-latest.xlsx';
    const { url } = await put(fileName, buffer, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN
    });

    console.log('Archivo subido exitosamente:', url);

    res.status(201).json({
      message: 'Encuesta guardada exitosamente.',
      data: result.rows[0],
      fileUrl: url
    });
  } catch (error) {
    console.error('Error al guardar la encuesta:', error);
    res.status(500).json({ error: 'Error al guardar la encuesta' });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
