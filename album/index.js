const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// SQLite adatbázis kapcsolat
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './albums.sqlite'
});

// Album modell
const Album = sequelize.define('Album', {
  band: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 10
    }
  }
});

// Adatbázis inicializálás
(async () => {
  await sequelize.sync({ force: true });
  console.log('Adatbázis kész!');
  
  // Tesztadatok
  await Album.bulkCreate([
    { band: 'Metallica', title: 'Master of Puppets', year: 1986, genre: 'Thrash Metal', rating: 9.5 },
    { band: 'Pink Floyd', title: 'The Dark Side of the Moon', year: 1973, genre: 'Progressive Rock', rating: 9.7 },
    { band: 'Iron Maiden', title: 'The Number of the Beast', year: 1982, genre: 'Heavy Metal', rating: 9.0 }
  ]);
})();

// Szerver beállítások
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API végpontok
// Összes album
app.get('/albums', async (req, res) => {
  try {
    const albums = await Album.findAll();
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Új album
app.post('/albums', async (req, res) => {
  try {
    const album = await Album.create(req.body);
    res.status(201).json(album);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Egy album
app.get('/albums/:id', async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album nem található' });
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Album frissítése
app.put('/albums/:id', async (req, res) => {
  try {
    const [updated] = await Album.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated === 0) return res.status(404).json({ error: 'Album nem található' });
    const updatedAlbum = await Album.findByPk(req.params.id);
    res.json(updatedAlbum);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Album törlése
app.delete('/albums/:id', async (req, res) => {
  try {
    const deleted = await Album.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) return res.status(404).json({ error: 'Album nem található' });
    res.json({ message: 'Album törölve' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Szerver indítása
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut: http://localhost:${PORT}`);
});