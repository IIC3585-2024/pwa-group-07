const express = require('express');
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, getDocs, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } = require('firebase/firestore');


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


app.put('/notebooks/:notebook_id/notes/:id', async (req, res) => {
    try {

        const { notebook_id, id } = req.params;

        const { content, checked, color} = req.body;

        const data = {
            content: content,
            checked: checked,
            color: color,
        };

        const notebookRef = doc(db, 'notebooks', notebook_id);
        const docSnap = await getDoc(notebookRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        const notesRef = collection(notebookRef, 'notes');
        const noteRef = doc(notesRef, id);
        await updateDoc(noteRef, data);

        res.json({ id, ...data });
        
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/notebooks/:notebook_id/notes/:id', async (req, res) => {
    try {

        const { notebook_id, id } = req.params;

        const notebookRef = doc(db, 'notebooks', notebook_id);
        const docSnap = await getDoc(notebookRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        const notesRef = collection(notebookRef, 'notes');
        const noteRef = doc(notesRef, id);
        await deleteDoc(noteRef);

        res.json({ message: 'Note deleted' });

    } catch (err) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

function filterNotes(filters, notes) {
    let filteredNotes = notes;
    if (!filters) {
        return filteredNotes;
    }
    if (filters.color) {
        // sort alphabetically based on color
        filteredNotes = filteredNotes.sort((a, b) => a.color.localeCompare(b.color));

    }
    if (filters.checked) {
        const checked = filters.checked === 'true';
        filteredNotes = filteredNotes.sort((a, b) => {
            if (a.checked === checked && b.checked !== checked) {
                return -1;
            }
            if (a.checked !== checked && b.checked === checked) {
                return 1;
            }
            return 0;
        });
    }
    if (filters.orderBy) {
        //order from a-z or z-a based on content
        filteredNotes = filteredNotes.sort((a, b) => {
            if (filters.orderBy === 'a-z') {
                return a.content.localeCompare(b.content);
            }
            return b.content.localeCompare(a.content);
        });
    }
    return filteredNotes;
}

app.get('/notebooks/:notebook_id/notes', async (req, res) => {
    try {
        
        const { notebook_id } = req.params;
        const filters = req.query;

        const notebookRef = doc(db, 'notebooks', notebook_id);
        const docSnap = await getDoc(notebookRef);

        if (!docSnap.exists()) {
            // if notebook not found, return empty array
            return res.json([]);
        }

        const notesRef = collection(notebookRef, 'notes');
        const notesSnapshot = await getDocs(notesRef);
        const notes = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // filter notes based on query parameters
        const filteredNotes = filterNotes(filters, notes);
        
        res.json(filteredNotes);

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/notebooks/:notebook_id/notes', async (req, res) => {
    try {
        const { notebook_id } = req.params;

        const { content, checked, color} = req.body;

        const data = {
            content: content,
            checked: checked,
            color: color,
            createdAt: serverTimestamp(),
        };

        // create new note inside collection notes inside the notebook
        const notebookRef = doc(db, 'notebooks', notebook_id);
        const docSnap = await getDoc(notebookRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Notebook not found' });
        }
        
        const notesRef = collection(notebookRef, 'notes');
    
        const newNoteRef = await addDoc(notesRef, data);

        res.json({ 
            id: newNoteRef.id,
            content: data.content,
            checked: data.checked,
            color: data.color
        });
            
        
    } catch (err) {
        res.status(500).json({ error: 'Failed to create note' });
    }
});

app.get('/notebooks/:notebook_id', async (req, res) => {
    try {
        const { notebook_id } = req.params;

        const notebookRef = doc(db, 'notebooks', notebook_id);
        const docSnap = await getDoc(notebookRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        const notebook = docSnap.data();
        res.json({ id: docSnap.id, ...notebook });
        
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notebook' });
        console.log(err);
    }
});

app.delete('/notebooks/:notebook_id', async (req, res) => {
    try {
        const { notebook_id } = req.params;

        const notebookRef = doc(db, 'notebooks', notebook_id);

        await deleteDoc(notebookRef);

        res.json({ message: 'Notebook deleted' });

    } catch (err) {
        res.status(500).json({ error: 'Failed to delete notebook' });
    }
});

app.post('/notebooks', async (req, res) => {
    try {
        const { name } = req.body;
        
        const data = {
            name: name,
        };

        // check if the name is empty
        if (!data.name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // check if notebook already exists
        const notebooksRef = collection(db, 'notebooks');
        const querySnapshot = await getDocs(notebooksRef);
        const notebooks = querySnapshot.docs.map(doc => doc.data());

        if (notebooks.some(notebook => notebook.name === data.name)) {
            const notebook = notebooks.find(notebook => notebook.name === data.name);
            return res.json({ id: notebook.id, ...notebook });
        }

        // create new notebook
        const docRef = await addDoc(notebooksRef, data);

        res.json({ id: docRef.id, ...data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create notebook' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});