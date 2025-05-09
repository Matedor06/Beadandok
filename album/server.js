const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// SQLite adatbázis inicializálása
const db = new sqlite3.Database('albums.db', (err) => {
  if (err) {
    console.error('Hiba történt az adatbázis kapcsolatban: ', err);
  } else {
    console.log('Adatbázis kapcsolódva!');
    db.run('CREATE TABLE IF NOT EXISTS albums (id INTEGER PRIMARY KEY, band TEXT, title TEXT, release_year INTEGER, genre TEXT)', (err) => {
      if (err) {
        console.error('Hiba történt a tábla létrehozásakor: ', err);
      }
    });
  }
});

// Middlewares
app.use(bodyParser.json());
app.use(express.static('public'));

// Új album hozzáadása
app.post('/albums', (req, res) => {
  const { band, title, release_year, genre } = req.body;
  const sql = 'INSERT INTO albums (band, title, release_year, genre) VALUES (?, ?, ?, ?)';
  db.run(sql, [band, title, release_year, genre], function (err) {
    if (err) {
      return res.status(500).send('Hiba történt az album hozzáadásakor.');
    }
    res.status(201).send({ id: this.lastID, band, title, release_year, genre });
  });
});

// Albumok listázása
app.get('/albums', (req, res) => {
  db.all('SELECT * FROM albums', (err, rows) => {
    if (err) {
      return res.status(500).send('Hiba történt az albumok listázásakor.');
    }
    res.json(rows);
  });
});

// Egy album megjelenítése
app.get('/albums/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM albums WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).send('Hiba történt az album megjelenítésekor.');
    }
    if (!row) {
      return res.status(404).send('Az album nem található.');
    }
    res.json(row);
  });
});

// Album módosítása
app.put('/albums/:id', (req, res) => {
  const { band, title, release_year, genre } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE albums SET band = ?, title = ?, release_year = ?, genre = ? WHERE id = ?';
  db.run(sql, [band, title, release_year, genre, id], function (err) {
    if (err) {
      return res.status(500).send('Hiba történt az album módosításakor.');
    }
    res.send({ message: 'Album módosítva!', id, band, title, release_year, genre });
  });
});

// Album törlése
app.delete('/albums/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM albums WHERE id = ?';
  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).send('Hiba történt az album törlésénél.');
    }
    res.send({ message: 'Album törölve!', id });
  });
});

// Szerver indítása
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
