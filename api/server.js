require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const { Octokit } = require('@octokit/rest');
const dbPool = require('./dbPool');

const app = express();
app.use(bodyParser.json());

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function exportDataToExcel() {
  try {
    // Obtener todos los datos de la tabla encuestas
    const result = await dbPool.query('SELECT * FROM encuestas');
    const data = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Encuestas');

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

    worksheet.addRows(data);

    const buffer = await workbook.xlsx.writeBuffer();
    const content = buffer.toString('base64');

    console.log('Archivo Excel creado en memoria.');

    // Obtener el SHA del archivo si ya existe en el repositorio
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: 'ldpalma24',
        repo: 'hmanantialencuesta',
        path: 'encuestas.xlsx',
      });
      sha = data.sha;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    // Subir o actualizar el archivo en GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: 'ldpalma24',
      repo: 'hmanantialencuesta',
      path: 'encuestas.xlsx',
      message: 'Actualizando archivo encuestas.xlsx',
      content: content,
      sha: sha || undefined,
    });

    console.log('Archivo subido a GitHub');
  } catch (error) {
    console.error('Error al exportar datos a Excel:', error);
    throw new Error('Error al exportar datos a Excel');
  }
}

app.post('/submit-encuesta', async (req, res) => {
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
    const query = `
      INSERT INTO encuestas (
        nombre, nrohab, check_in, hab, bath, redp, manolo, desay,
        rmserv, pool, check_out, gneral
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const values = [nombre, nrohab, check_in, hab, bath, redp, manolo, desay, rmserv, pool, check_out, gneral];

    const result = await dbPool.query(query, values);

    await exportDataToExcel();

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al enviar la encuesta:', error);
    res.status(500).send('A server error has occurred');
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
