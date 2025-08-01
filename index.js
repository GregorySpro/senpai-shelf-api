// index.js
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connexion à Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API en ligne 😎');
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username et password requis' });
  }

  try {
    // 1. Vérifier si username existe déjà
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Nom d\'utilisateur déjà pris' });
    }

    // 2. Insérer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, password]
    );

    res.status(201).json({ message: 'Utilisateur enregistré', user: result.rows[0] });
  } catch (err) {
    console.error('[ERREUR REGISTER]', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement' });
  }
});




app.listen(port, () => {
  console.log(`Serveur en ligne sur le port ${port}`);
});
