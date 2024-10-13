const express = require('express');
const exceljs = require('exceljs');

const app = express();
const port = 3000;

app.post('/submit-survey', (req, res) => {
  const data = req.body;

  // Procesar los datos y generar el archivo Excel
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Survey Data');

  // Agregar encabezados de columna
  worksheet.columns = [
    { header: 'Nombre', key: 'nombre' },
    { header: 'Habitación', key: 'habitacion' },
    // ... otros encabezados
  ];

  // Agregar datos de la encuesta
  worksheet.addRows([data]);

  // Guardar el archivo Excel
  workbook.xlsx.writeFile('survey_data.xlsx')
    .then(() => {
      res.json({ message: 'Survey submitted and data exported to Excel' });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error exporting data to Excel' });
    });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
