app.post('/submit-survey', async (req, res) => {
  try {
    const data = req.body;

    console.log('Datos recibidos:', data);

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Survey Data');

    worksheet.columns = [
      { header: 'Nombre', key: 'nombre' },
      { header: 'Habitación', key: 'habitacion' },
      // ... otros encabezados
    ];

    worksheet.addRows([data]);

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
