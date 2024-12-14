const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { put } = require('@vercel/blob');
const ExcelJS = require('exceljs');
require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 3000;


const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:KoAhRTsHVPEnTVAzryXhCFdpHRZSxOSq@autorack.proxy.rlwy.net:49504/railway',
});

app.use(bodyParser.json());

// Ruta raíz para verificar el funcionamiento del servidor
app.get('/', (req, res) => {
  res.send('Servidor funcionando. Usa /api/survey para enviar datos.');
});

// Función para exportar datos a Excel y subir a Vercel Blob
async function exportToVercelBlob(data) {
  try {
    // Crear el archivo Excel en memoria
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Encuestas');

    // Definir encabezados
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
      { header: 'General', key: 'gneral', width: 10 },
    ];

    // Agregar fila de datos
    worksheet.addRow(data);

    // Guardar el archivo en memoria como buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Subir el archivo a Vercel Blob
    const result = await put('encuestas.xlsx', buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN, // Token de entorno
    });

    console.log('Archivo subido a Vercel Blob:', result.url);
    return result.url; // Devuelve la URL del archivo subido
  } catch (error) {
    console.error('Error al exportar o subir archivo a Vercel Blob:', error);
    throw error;
  }
}

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
      RETURNING *;
    `;

    const values = [
      nombre, nrohab, check_in, hab, bath, redp, manolo, desay,
      rmserv, pool, check_out, gneral
    ];

    const result = await dbPool.query(query, values);

    // Exportar a Excel y subir a Vercel Blob
    const fileUrl = await exportToVercelBlob(result.rows[0]);

    res.status(201).json({
      message: 'Encuesta guardada y archivo subido exitosamente.',
      fileUrl: fileUrl, // Devolver la URL del archivo subido
      result: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar la encuesta:', error.message);
    res.status(500).json({ error: 'Error al guardar la encuesta' });
  }
});

// Inicia el servidor en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
