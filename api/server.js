const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la conexión a PostgreSQL
const dbPool = new Pool({
  connectionString: 'postgresql://postgres:KoAhRTsHVPEnTVAzryXhCFdpHRZSxOSq@autorack.proxy.rlwy.net:49504/railway',
});

app.use(bodyParser.json());

// Configuración de Octokit con el token de GitHub
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, 
});

// Función para exportar datos a Excel y subir a GitHub
const exportToExcel = async () => {
  try {
    console.log('Exportando datos a Excel...');

    // Obtener los datos de la base de datos
    const query = 'SELECT * FROM encuestas';
    const result = await dbPool.query(query);
    const data = result.rows;

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Encuestas');

    // Definir las columnas del archivo Excel
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'NroHab', key: 'nrohab', width: 10 },
      { header: 'Check_In', key: 'check_in', width: 15 },
      { header: 'Hab', key: 'hab', width: 10 },
      { header: 'Bath', key: 'bath', width: 10 },
      { header: 'Redp', key: 'redp', width: 10 },
      { header: 'Manolo', key: 'manolo', width: 10 },
      { header: 'Desay', key: 'desay', width: 10 },
      { header: 'Rmserv', key: 'rmserv', width: 10 },
      { header: 'Pool', key: 'pool', width: 10 },
      { header: 'Check_Out', key: 'check_out', width: 15 },
      { header: 'Gneral', key: 'gneral', width: 10 },
    ];

    // Agregar los datos al archivo Excel
    worksheet.addRows(data);

    // Guardar el archivo en un buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const content = buffer.toString('base64');

    console.log('Archivo Excel creado en memoria.');

    // Intentar obtener el SHA del archivo si ya existe en el repositorio
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: 'ldpalma24',
        repo: 'hmanantialencuesta',
        path: 'encuestas.xlsx',
      });
      sha = data.sha;
    } catch (err) {
      console.log('El archivo no existe en el repositorio. Se creará uno nuevo.');
    }

    // Subir o actualizar el archivo en GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: 'ldpalma24',
      repo: 'hmanantialencuesta',
      path: 'encuestas.xlsx',
      message: 'Actualizando archivo encuestas.xlsx',
      content: content,
      sha: sha, // Si el archivo no existe, `sha` será undefined
    });

    console.log('Archivo subido exitosamente a GitHub.');
  } catch (error) {
    console.error('Error al exportar datos a Excel o subir a GitHub:', error.message, error.stack);
    throw error;
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
    gneral,
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
      rmserv, pool, check_out, gneral,
    ];

    const result = await dbPool.query(query, values);

    console.log(result.rows[0]);
    res.status(201).json({
      message: 'Encuesta guardada exitosamente.',
      result: result.rows[0],
    });

    // Exportar datos a Excel y subir a GitHub
    await exportToExcel();
  } catch (error) {
    console.error('Error al guardar la encuesta:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Inicia el servidor en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
