// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Statische Dateien servieren
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API-Routen
app.use('/auth', authRoutes);
app.use('/matches', matchRoutes);

// Fallback für alle anderen Anfragen (für Single-Page-Apps)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf http://192.168.0.45:${PORT}`);
});
