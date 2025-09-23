import express from "express";
import * as db from "./data/database.js"; // Corrected file path

const PORT = 3000;

const app = express();
app.use(express.json());

app.listen(PORT, () => {
    console.log(`A szerver fut localhost:${PORT}-on`);
});

app.get("/books", (req, res) => {
    const books = db.getBook();
    res.json(books);
});

app.get("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const book = db.getBookByID(id);
    if (book) {
        res.json(book);
    } else {
        res.status(404).send("Book not found");
    }
});

app.post("/books", (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).send("Title and author are required");
    }
    db.saveBook(title, author);
    res.status(201).send("Book saved");
});

app.put("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).send("Title and author are required");
    }
    db.updateBook(id, title, author);
    res.send("Book updated");
});

app.delete("/books/:id", (req, res) => {
    const id = parseInt(req.params.id);
    db.deleteBook(id);
    res.send("Book deleted");
});