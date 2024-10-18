const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();

const uri = "mongodb+srv://sudomanantial:<password>@hmvalencia2024.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"; // Reemplaza con tu cadena de conexión de Cosmos DB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors({
  origin: 'https://ldpalma24.github.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://ldpalma24.github.io');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204).end();
  }
  next();
});

client.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos', err);
    return;
  }

  const collection = client.db("test").collection("encuestas");

  app.post('/submit-survey', async (req, res) => {
    try {
      const data = req.body;
      console.log('Datos recibidos:', data);

      if (Object.keys(data).length === 0) {
        console.error('No se recibieron datos.');
        res.status(400).json({ message: 'No se recibieron datos.' });
        return;
      }

      await collection.insertOne(data);
      console.log('Datos insertados en la base de datos');

      res.json({ message: 'Survey submitted and data saved to Azure Cosmos DB' });
    } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ message: 'Error saving data to Azure Cosmos DB' });
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
