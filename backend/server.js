const express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase/app');
require('firebase/firestore');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDi_Ku4d07op7w8v4Nh8VdPEQ72g-iREC8",
  authDomain: "pwa-g7.firebaseapp.com",
  projectId: "pwa-g7",
  storageBucket: "pwa-g7.appspot.com",
  messagingSenderId: "12229005519",
  appId: "1:12229005519:web:a2e6761d10bca20e3167ba",
  measurementId: "G-JPDQW9S45S"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a Firestore reference
const db = firebase.firestore();

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

        const noteRef = db.collection('notes').doc(id);
        await noteRef.update({ title, content });

        res.json({ id, title, content });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const noteRef = db.collection('notes').doc(id);
        await noteRef.delete();

        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// TO DO: update other methods
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