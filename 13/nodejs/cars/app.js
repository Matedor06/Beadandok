import express from 'express';

const PORT = 3000;

const app = express();

app.use(express.json());

app.listen(PORT, () => {
    console.log(`A szerver fut ${PORT} on`);
});

app.get('/cars', (req, res) => {
    res.status(200).json(cars);
});

app.get('/cars/:id', (req, res) => {
    const id = +req.params.id;
    const car = cars.find((car) => car.id === id);
    if (!car) {
        return res.status(404).json({ message: 'Car not found' });
    }
    return res.status(200).json(car);
});

app.post('/cars', (req, res) => {
    const { brand, model } = req.body;
    if (!brand || !model) {
        return res.status(400).json({ message: 'Invalid Credentials' });
    }
    const id = cars.length ? cars[cars.length - 1].id : 1;
    const car = { id, brand, model };

    cars.push(cars);
    return res.status(201).json(car);
});

app.put('/cars/:id', (req, res) => {
    const id = +req.params.id;

    let car = cars.find((car) => car.id === id);
    if (!car) {
        res.status(404).json({ message: 'Car not found' });
    }
    const { brand, model } = req.body;
    if (!brand || !model) {
        res.status(400).json({ message: 'Invalid credentials' });
    }
    const index = cars.indexOf(car);
    //car = {...car,brand,model}
    car = {
        id: car.id,
        brand: brand,
        model: model,
    };
    cars[index] = car;
    res.status(200).json(car);
});

app.delete('/cars/:id', (req, res) => {
    const id = +req.params.id;
    cars = cars.filter((c) => c.id !== id);
    res.status(200).json({ message: 'Deleted Succesfully' });
});

let cars = [
    { id: 1, brand: 'BMW', model: '320d' },
    { id: 2, brand: 'Opel', model: 'Astra G' },
    { id: 3, brand: 'Volkswagen', model: 'Golf IV' },
];
