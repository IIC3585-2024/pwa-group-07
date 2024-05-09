const express = require('express');
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, deleteDoc } = require('firebase/firestore');

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
initializeApp(firebaseConfig);

// Get a Firestore reference
const db = getFirestore();

// Create an Express app
const app = express();

// Use the body-parser middleware
app.use(bodyParser.json());

// Define the port
const port = 3000;

app.post('/notebooks', async (req, res) => {
    try {
        const { name } = req.body;
        
        const data = {
            name: name,
        };

        //const checkNotebooksRef = await db.collection('notebooks').where('name', '==', name).get();

        //if (!checkNotebooksRef.empty) {
        //    return res.status(400).json({ error: 'Notebook name already exists' });
        //}

        const notebookRef = doc(db, 'notebooks', '1');
        let notebook = await setDoc(notebookRef, data);
        
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: 'Failed to create notebook' });
    }
});

// TO DO: update other methods

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

app.get('/:notebook_id/notes', async (req, res) => {
    try {
        const { notebook_id } = req.params;

        const noteRef = db.collection('notes').where('notebook_id', '==', notebook_id).get();
        const notes = noteRef.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/:notebook_id/notes', async (req, res) => {
    try {
        const { notebook_id } = req.params;
        const { title, content } = req.body;

        const noteRef = await db.collection('notes').add({
            title,
            content,
            notebook_id
        });
        
        res.json({
            id: noteRef.id,
            title,
            content,
            notebook_id
        });
        
    } catch (err) {
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.get('/:notebook_id', async (req, res) => {
    try {
        const { notebook_id } = req.params;

        const notebookDoc = await db.collection('notebooks').doc(notebook_id).get();

        if (!notebookDoc.exists) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        res.json({
            id: notebookDoc.id,
            ...notebookDoc.data()
        });

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