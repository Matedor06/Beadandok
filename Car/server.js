import express from 'express';
import db from './database.js'

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/cars',(req, res)=>{
    try{
        const cars = db.prepare('SELECT * From cars').all();
        res.json(cars);
    }
    catch(error)
    {
        console.log(error)
    }
})

app.get('/cars/:id', (req, res) => {
    try{
        const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);

        if(!car){
            return res.status(404).json({error: 'konyv nem talalhato'})
        }
    }
    catch(error)
    {
        console.log(error)
    }
});


app.post('/cars', (req, res)=>{
    try{
        const {brand, model, year} = req.body;
        if(!brand || !author || year)
        {
            return res.status(400).json({error:"baj van"});
        }
        const stmt = db.prepare('INSERT INTO cars (brand, model, year) VALUES (?,?,?)')
        const result = stmt.run(brand,model,year);
    }
    catch(error)
    {
        console.log(error)
    }
});

app.listen(PORT, () => {
    console.log(`A szerver fut a http://localhost:${PORT}`)
})