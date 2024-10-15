const express = require('express');
const bodyParser = require('body-parser');
const exceljs = require('exceljs');
const cors = require('cors'); // Añadimos el paquete cors
const app = express();

app.use(cors()); // Usamos cors para permitir solicitudes de origen cruzado
app.use(bodyParser.json());

app.post('/submit-survey', async (req, res) => {
  try {
    const data = req.body;

    // Verifica que los datos se reciban correctamente
    console.log('Datos recibidos:', data);
    if (Object.keys(data).length === 0) {
      console.error('No se recibieron datos.');
      res.status(400).json({ message: 'No se recibieron datos.' });
      return;
    }

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Survey Data');

    worksheet.columns = [
      { header: 'Nombre', key: 'nombre' },
      { header: 'Habitación', key: 'habitacion' },
      // otros encabezados
    ];

    worksheet.addRow(data);

    await workbook.xlsx.writeFile('data/survey_data.xlsx');
    console.log('Archivo guardado en data/survey_data.xlsx');
    res.json({ message: 'Survey submitted and data exported to Excel' });

    const { exec } = require('child_process');
    exec('git add data/survey_data.xlsx && git commit -m "Update survey data" && git push', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ message: 'Error exporting data to Excel' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
