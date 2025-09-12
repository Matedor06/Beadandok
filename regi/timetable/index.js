const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './timetable.sqlite'
});


const Lesson = sequelize.define('Lesson', {
  day: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  classroom: DataTypes.STRING
});


(async () => {
  await sequelize.sync({ force: true });
  console.log('Adatbázis kész!');
})();


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


app.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.findAll();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Óra nem található' });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/lessons', async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.delete('/lessons/:id', async (req, res) => {
  try {
    const deleted = await Lesson.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) return res.status(404).json({ error: 'Óra nem található' });
    res.json({ message: 'Óra törölve' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/lessons/:id', async (req, res) => {
  try {
    const [updated] = await Lesson.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated === 0) return res.status(404).json({ error: 'Óra nem található' });
    const updatedLesson = await Lesson.findByPk(req.params.id);
    res.json(updatedLesson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut: http://localhost:${PORT}`);
});
