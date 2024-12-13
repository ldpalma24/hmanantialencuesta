const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

const app = express();
const port = process.env.PORT || 3000;

const dbPool = new Pool({
  connectionString: 'postgresql://postgres:KoAhRTsHVPEnTVAzryXhCFdpHRZSxOSq@autorack.proxy.rlwy.net:49504/railway',
});

const git = simpleGit();

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

    // Exportar datos a Excel
    await exportToExcel(result.rows[0]);

    // Hacer commit a GitHub
    await commitToGitHub();

    res.status(201).json({
      message: 'Encuesta guardada exitosamente.',
      result: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar la encuesta:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Función para exportar datos a un archivo Excel
async function exportToExcel(data) {
  const filePath = path.join(__dirname, 'encuestas.xlsx');
  const workbook = new ExcelJS.Workbook();
  let worksheet;

  // Verificar si el archivo ya existe
  if (fs.existsSync(filePath)) {
    // Leer el archivo existente
    await workbook.xlsx.readFile(filePath);
    worksheet = workbook.getWorksheet('Encuestas');
  } else {
    // Crear una nueva hoja de trabajo
    worksheet = workbook.addWorksheet('Encuestas');

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
      { header: 'Desay', key : 'desay', width: 10 },
      { header: 'RMServ', key: 'rmserv', width: 10 },
      { header: 'Pool', key: 'pool', width: 10 },
      { header: 'Check Out', key: 'check_out', width: 20 },
      { header: 'General', key: 'gneral', width: 10 },
    ];
  }

  // Agregar la nueva fila de datos
  worksheet.addRow(data);

  // Escribir el archivo
  await workbook.xlsx.writeFile(filePath);
}

// Función para hacer commit a GitHub
async function commitToGitHub() {
  const filePath = path.join(__dirname, 'encuestas.xlsx');
  try {
    await git.add(filePath);
    await git.commit('Actualización de encuestas.xlsx');
    await git.push('origin', 'main'); // Asegúrate de que 'main' sea la rama correcta
  } catch (error) {
    console.error('Error al hacer commit a GitHub:', error.message);
  }
}

// Inicia el servidor en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 