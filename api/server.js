const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const { Octokit } = require('@octokit/rest');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de PostgreSQL
const dbPool = new Pool({
  connectionString: 'postgresql://postgres:KoAhRTsHVPEnTVAzryXhCFdpHRZSxOSq@autorack.proxy.rlwy.net:49504/railway',
});

// Configuración del token de GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'ldpalma'; // Cambia esto por tu usuario de GitHub
const REPO_NAME = 'hmanantialencuesta'; // Cambia esto por el nombre de tu repositorio
const FILE_PATH = 'data/encuestas.xlsx'; // Ruta del archivo en el repositorio

const octokit = new Octokit({ auth: GITHUB_TOKEN });

app.use(bodyParser.json());

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
      RETURNING id;
    `;
    const values = [nombre, nrohab, check_in, hab, bath, redp, manolo, desay, rmserv, pool, check_out, gneral];
    await dbPool.query(query, values);

    // Actualizar archivo Excel
    const workbook = new ExcelJS.Workbook();
    let worksheet;

    try {
      // Descargar el archivo actual desde GitHub
      const { data: fileData } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: FILE_PATH,
        mediaType: { format: 'raw' },
      });
      await workbook.xlsx.load(Buffer.from(fileData));
    } catch (error) {
      // Si no existe el archivo, crearlo
      worksheet = workbook.addWorksheet('Encuestas');
      worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Nro Habitación', key: 'nrohab', width: 15 },
        { header: 'Check-in', key: 'check_in', width: 10 },
        { header: 'Hab', key: 'hab', width: 10 },
        { header: 'Bath', key: 'bath', width: 10 },
        { header: 'Redp', key: 'redp', width: 10 },
        { header: 'Manolo', key: 'manolo', width: 10 },
        { header: 'Desay', key: 'desay', width: 10 },
        { header: 'RMServ', key: 'rmserv', width: 10 },
        { header: 'Pool', key: 'pool', width: 10 },
        { header: 'Check-out', key: 'check_out', width: 10 },
        { header: 'General', key: 'gneral', width: 10 },
      ];
    }

    worksheet = workbook.getWorksheet('Encuestas');
    worksheet.addRow({
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
    });

    // Guardar el archivo en un buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Subir el archivo actualizado a GitHub
    const { data: existingFile } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: 'Actualizar encuestas',
      content: buffer.toString('base64'),
      sha: existingFile.sha,
    });

    res.status(201).json({ message: 'Encuesta guardada y archivo actualizado.' });
  } catch (error) {
    console.error('Error al guardar la encuesta:', error);
    res.status(500).json({ error: 'Error al guardar la encuesta.' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
