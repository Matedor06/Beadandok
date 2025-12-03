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
            return res.status(404).json({error: 'car nem talalhato'})
        }
        
        res.json(car);
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
});


app.post('/cars', (req, res)=>{
    try{
        const {brand, model, year} = req.body;
        if(!brand || !model || !year)
        {
            return res.status(400).json({error:"baj van"});
        }
        const stmt = db.prepare('INSERT INTO cars (brand, model, year) VALUES (?,?,?)')
        const result = stmt.run(brand,model,year);
        
        res.status(201).json({
            id: result.lastInsertRowid,
            brand,
            model,
            year
        });
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
});

app.put('/cars/:id', (req, res) => {
    try{
        const {brand, model, year} = req.body;
        
        if(!brand || !model || !year)
        {
            return res.status(400).json({error: 'Minden mezo kotelezo'});
        }
        
        const checkCar = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
        
        if(!checkCar){
            return res.status(404).json({error: 'car nem talalhato'});
        }
        
        const stmt = db.prepare('UPDATE cars SET brand = ?, model = ?, year = ? WHERE id = ?');
        stmt.run(brand, model, year, req.params.id);
        
        res.json({
            id: req.params.id,
            brand,
            model,
            year
        });
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
});


app.listen(PORT, () => {
    console.log(`A szerver fut a http://localhost:${PORT}`)
})