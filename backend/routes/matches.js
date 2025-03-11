// backend/routes/matches.js
const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Verfügbare Zeiten eintragen
router.post('/available-times', (req, res) => {
  const { userId, startTime, endTime } = req.body;

  db.run(
    'INSERT INTO available_times (user_id, start_time, end_time) VALUES (?, ?, ?)',
    [userId, startTime, endTime],
    function (err) {
      if (err) {
        return res.status(400).json({ error: 'Fehler beim Speichern der Zeiten' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Match vorschlagen
router.post('/propose-match', (req, res) => {
  const { player1Id, player2Id, proposedTime } = req.body;

  db.run(
    'INSERT INTO matches (player1_id, player2_id, proposed_time) VALUES (?, ?, ?)',
    [player1Id, player2Id, proposedTime],
    function (err) {
      if (err) {
        return res.status(400).json({ error: 'Fehler beim Vorschlagen des Matches' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Match bestätigen oder ablehnen
router.put('/match/:id', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE matches SET status = ? WHERE id = ?',
    [status, id],
    function (err) {
      if (err) {
        return res.status(400).json({ error: 'Fehler beim Aktualisieren des Matches' });
      }
      res.json({ message: 'Match aktualisiert' });
    }
  );
});

// Verfügbare Zeiten eines anderen Nutzers abrufen
router.get('/available-times/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    'SELECT * FROM available_times WHERE user_id = ?',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Fehler beim Abrufen der Zeiten' });
      }
      res.json(rows);
    }
  );
});

router.get('/proposed-matches', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }

  jwt.verify(token, 'geheimesToken', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Ungültiges Token' });
    }

    db.all(
      `SELECT m.id, m.proposed_time, u.username AS opponent_username
       FROM matches m
       JOIN users u ON m.player1_id = u.id
       WHERE m.player2_id = ? AND m.status = 'pending'`,
      [decoded.id],
      (err, rows) => {
        if (err) {
          console.error('Datenbankfehler:', err);
          return res.status(500).json({ error: 'Fehler beim Abrufen der vorgeschlagenen Termine' });
        }
        res.json(rows);
      }
    );
  });
});

// Eigene verfügbare Zeiten abrufen
router.get('/my-available-times', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }

  jwt.verify(token, 'geheimesToken', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Ungültiges Token' });
    }

    db.all(
      'SELECT * FROM available_times WHERE user_id = ?',
      [decoded.id],
      (err, rows) => {
        if (err) {
          console.error('Datenbankfehler:', err);
          return res.status(500).json({ error: 'Fehler beim Abrufen der Zeiten' });
        }
        res.json(rows);
      }
    );
  });
});

// Verfügbare Zeit löschen
router.delete('/available-times/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }

  jwt.verify(token, 'geheimesToken', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Ungültiges Token' });
    }

    const { id } = req.params;

    db.run(
      'DELETE FROM available_times WHERE id = ? AND user_id = ?',
      [id, decoded.id],
      function (err) {
        if (err) {
          console.error('Datenbankfehler:', err);
          return res.status(500).json({ error: 'Fehler beim Löschen der Zeit' });
        }
        res.json({ message: 'Zeit erfolgreich gelöscht' });
      }
    );
  });
});

module.exports = router;
