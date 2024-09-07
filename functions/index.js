const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const XLSX = require("xlsx");
const {logger} = require("firebase-functions");

// Inicializa Firebase Admin SDK
initializeApp();
const db = getFirestore();

// Función para exportar datos a Excel
exports.exportToExcel = onRequest(async (req, res) => {
  try {
    // Referencia a la colección de Firestore que contiene las encuestas
    const encuestasRef = db.collection("encuestas");
    const snapshot = await encuestasRef.get();

    // Verifica si hay datos
    if (snapshot.empty) {
      res.status(404).send("No se encontraron datos.");
      return;
    }

    // Crea un array para almacenar los datos
    const data = [];
    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    // Crea una hoja de trabajo de Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Encuestas");

    // Genera el archivo Excel en formato binario
    const excelBuffer = XLSX.write(
        workbook,
        {type: "buffer", bookType: "xlsx"},
    );

    // Configura la respuesta HTTP para descargar el archivo
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=encuestas.xlsx",
    );
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    // Envía el archivo Excel como respuesta
    res.status(200).send(excelBuffer);
  } catch (error) {
    logger.error("Error al exportar los datos: ", error);
    res.status(500).send("Error al exportar los datos.");
  }
});
