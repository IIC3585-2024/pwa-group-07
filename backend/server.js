const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Create a pool for connecting to the database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Anonynote',
    password: 'postgres',
    port: 5432,
});

// Connect to the database
pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Failed to connect to the database', err));

// Create an Express app
const app = express();

// Use the body-parser middleware
app.use(bodyParser.json());

// Define the port
const port = 3000;

// Define API routes for notes
app.put('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const query = 'UPDATE notes SET name = $1, content = $2 WHERE id = $3 RETURNING *';
        const values = [title, content, id];
        const note = await pool.query(query, values);
        res.json(note.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM notes WHERE id = $1';
        const values = [id];
        await pool.query(query, values);
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.post('/notebooks', async (req, res) => {
    try {
        const { name } = req.body;
        // check if notebook name already exists
        const checkQuery = 'SELECT * FROM notebooks WHERE name = $1';
        const checkValues = [name];
        const checkNotebook = await pool.query(checkQuery, checkValues);
        if (checkNotebook.rows.length > 0) {
            return res.status(400).json({ error: 'Notebook name already exists' });
        }
        const query = 'INSERT INTO notebooks (name) VALUES ($1) RETURNING *';
        const values = [name];
        const notebook = await pool.query(query, values);
        res.json(notebook.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create notebook' });
    }
});

app.get('/:notebook_id/notes', async (req, res) => {
    try {
        const { notebook_id } = req.params;
        const query = 'SELECT * FROM notes WHERE notebook_id = $1';
        const values = [notebook_id];
        const notes = await pool.query(query, values);
        res.json(notes.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/:notebook_id/notes', async (req, res) => {
    try {
        const { notebook_id } = req.params;
        const { title, content } = req.body;
        const query = 'INSERT INTO notes (title, content, notebook_id) VALUES ($1, $2, $3) RETURNING *';
        const values = [title, content, notebook_id];
        const note = await pool.query(query, values);
        res.json(note.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.get('/:notebook_id', async (req, res) => {
    try {
        const query = 'SELECT * FROM notebooks WHERE id = $1';
        const values = [req.params.notebook_id];
        const notebook = await pool.query(query, values);
        res.json(notebook.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notebook' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});