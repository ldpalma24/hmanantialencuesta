require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3000;

const dbPool = new Pool({
  connectionString: 'postgresql://postgres:KoAhRTsHVPEnTVAzryXhCFdpHRZSxOSq@autorack.proxy.rlwy.net:49504/railway',
});

app.use(bodyParser.json());

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Usa la variable de entorno
});

// Ruta raíz para verificar el funcionamiento del servidor
app.get('/', (req, res) => {
  res.send('Servidor funcionando. Usa /api/survey para enviar datos.');
});

// Función para exportar datos a Excel y subir a GitHub
const exportToExcel = async () => {
  try {
    const query = 'SELECT * FROM encuestas';
    const result = await dbPool.query(query);

    const data = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Encuestas');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'NroHab', key: 'nrohab', width: 10 },
      { header: 'Check_In', key: 'check_in', width: 10 },
      { header: 'Hab', key: 'hab', width: 10 },
      { header: 'Bath', key: 'bath', width: 10 },
      { header: 'Redp', key: 'redp', width: 10 },
      { header: 'Manolo', key: 'manolo', width: 10 },
      { header: 'Desay', key: 'desay', width: 10 },
      { header: 'Rmserv', key: 'rmserv', width: 10 },
      { header: 'Pool', key: 'pool', width: 10 },
      { header: 'Check_Out', key: 'check_out', width: 10 },
      { header: 'Gneral', key: 'gneral', width: 10 }
    ];

    worksheet.addRows(data);

    const filePath = 'encuestas.xlsx';
    await workbook.xlsx.writeFile(filePath);
    console.log('Datos exportados a encuestas.xlsx');

    const content = await fs.readFile(filePath, 'base64');

    const { data: { sha } } = await octokit.repos.getContent({
      owner: 'ldpalma24',
      repo: 'hmanantialencuesta',
      path: filePath
    }).catch(() => ({ data: { sha: null } }));

    await octokit.repos.createOrUpdateFileContents({
      owner: 'ldpalma24',
      repo: 'hmanantialencuesta',
      path: filePath,
      message: 'Actualizando archivo encuestas.xlsx',
      content: content,
      sha: sha || undefined,
    });

    console.log('Archivo subido a GitHub');
  } catch (error) {
    console.error('Error al exportar los datos a Excel o subir a GitHub:', error.message, error.stack);
  }
};

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
    res.status(201).json({
      message: 'Encuesta guardada exitosamente.',
      result: result.rows[0]
    });

    console.log('Llamando a exportToExcel');
    await exportToExcel(); // Exporta los datos a Excel y sube a GitHub cada vez que se inserten nuevos datos

  } catch (error) {
    console.error('Error al guardar la encuesta:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Inicia el servidor en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
