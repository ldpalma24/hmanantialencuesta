const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydatabase',
  password: 'mypassword',
  port: 5432
});

app.use(cors({
  origin: 'https://tu-dominio.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://tu-dominio.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204).end();
  }
  next();
});

app.post('/submit-survey', async (req, res) => {
  try {
    const data = req.body;
    console.log('Datos recibidos:', data);

    if (Object.keys(data).length === 0) {
      console.error('No se recibieron datos.');
      res.status(400).json({ message: 'No se recibieron datos.' });
      return;
    }

    await pool.query('INSERT INTO encuestas (data) VALUES ($1)', [data]);
    console.log('Datos insertados en la base de datos');

    res.json({ message: 'Survey submitted and data saved to PostgreSQL' });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ message: 'Error saving data to PostgreSQL' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
