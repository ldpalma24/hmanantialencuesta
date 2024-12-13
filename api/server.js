const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la conexión a la base de datos
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuración de Octokit para acceder a la API de GitHub
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

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

    const result = await dbPool.query(query, values);

    console.log(result.rows[0]); // Verifica que el resultado esté correcto

    // Exportar datos a Excel y subir a GitHub
    await exportToExcelAndPushToGitHub();

    res.status(201).json({
      message: 'Encuesta guardada exitosamente.',
      result: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar la encuesta:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Función para exportar datos a un archivo Excel en memoria y subirlo a GitHub
async function exportToExcelAndPushToGitHub() {
  try {
    // Obtener todos los datos de la tabla encuestas
    const result = await dbPool.query('SELECT * FROM encuestas');
    const data = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Encuestas');

    // Agregar encabezados
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

    // Agregar las filas con los datos
    worksheet.addRows(data);

    // Crear el archivo Excel en memoria
    const buffer = await workbook.xlsx.writeBuffer();
    const content = buffer.toString('base64');

    console.log('Archivo Excel creado en memoria.');

    // Intentar obtener el SHA del archivo si ya existe en el repositorio
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path: 'encuestas.xlsx',
      });
      sha = data.sha;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    // Subir el archivo a GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: 'encuestas.xlsx',
      message: 'Actualización de encuestas.xlsx',
      content: content,
      sha: sha || undefined,
    });

    console.log('Archivo subido a GitHub con éxito.');
  } catch (error) {
    console.error('Error al exportar y subir el archivo Excel:', error.message);
    throw new Error('Error al exportar y subir el archivo Excel');
  }
}

// Inicia el servidor en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
