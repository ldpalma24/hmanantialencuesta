const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();

const uri = "mongodb+srv://sudomanantial:<password>@hmvalencia2024.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors({ 
  origin: 'https://ldpalma24.github.io', 
  methods: ['GET', 'POST'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Habilita 'Access-Control-Allow-Credentials'
}));

app.use(bodyParser.json());

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

      res.json({ message: 'Survey submitted and data saved to Cosmos DB' });
    } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ message: 'Error saving data to Cosmos DB' });
    }
  });

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
