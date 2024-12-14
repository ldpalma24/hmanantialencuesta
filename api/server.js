const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { put } = require('@vercel/blob');
const ExcelJS = require('exceljs');

const app = express();
const port = process.env.PORT || 3000;

// Token de Vercel Blob desde las variables de entorno
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Variable para almacenar el enlace más reciente del archivo
let latestFileUrl = null;

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

    await dbPool.query(query, values);

    // Obtener todos los datos actuales de la base de datos
    const allDataQuery = 'SELECT * FROM encuestas';
    const allDataResult = await dbPool.query(allDataQuery);

    // Exportar todos los datos a Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Encuestas');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Nro Hab', key: 'nrohab', width: 10 },
      { header: 'Check In', key: 'check_in', width: 20 },
      { header: 'Hab', key: 'hab', width: 10 },
      { header: 'Bath', key: 'bath', width: 10 },
      { header: 'RedP', key: 'redp', width: 10 },
      { header: 'Manolo', key: 'manolo', width: 10 },
      { header: 'Desay', key: 'desay', width: 10 },
      { header: 'RMServ', key: 'rmserv', width: 10 },
      { header: 'Pool', key: 'pool', width: 10 },
      { header: 'Check Out', key: 'check_out', width: 20 },
      { header: 'General', key: 'gneral', width: 10 }
    ];

    allDataResult.rows.forEach((row) => {
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    // Subir el archivo a Vercel Blob con nombre estático
    const { url } = await put('uploads/encuestas-latest.xlsx', buffer, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN
    });

    // Guardar el enlace más reciente
    latestFileUrl = url;

    console.log('Archivo subido exitosamente:', url);

    res.status(201).json({
      message: 'Encuesta guardada exitosamente.',
      fileUrl: url
    });
  } catch (error) {
    console.error('Error al guardar la encuesta:', error);
    res.status(500).json({ error: 'Error al guardar la encuesta' });
  }
});

// Ruta para redireccionar al enlace más reciente
app.get('/api/latest-excel', (req, res) => {
  if (latestFileUrl) {
    return res.redirect(latestFileUrl);
  } else {
    res.status(404).json({ error: 'No hay un archivo disponible aún.' });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
