// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Registrierung
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({ error: 'Benutzername bereits vergeben' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Anmeldung
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign({ id: user.id }, 'geheimesToken', { expiresIn: '1h' });
    res.json({ token });
  });
});

// Benutzerdaten abrufen
router.get('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }

  jwt.verify(token, 'geheimesToken', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Ungültiges Token' });
    }

    db.get('SELECT id, username FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'Benutzer nicht gefunden' });
      }
      res.json(user);
    });
  });
});

// alle Benutzer abrufen
router.get('/users', (req, res) => {
  db.all('SELECT id, username FROM users', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Fehler beim Abrufen der Benutzer' });
    }
    res.json(rows);
  });
});

module.exports = router;
