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
  origin: 'https://hmanantialencuesta.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

app.post('/api/submit-survey', async (req, res) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No se recibieron datos.' });
    }

    await pool.query('INSERT INTO encuestas (data) VALUES ($1)', [data]);
    res.json({ message: 'Survey submitted and data saved to PostgreSQL' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error saving data to PostgreSQL' });
  }
});

// Exporta el controlador para que Vercel lo maneje
module.exports = app;
