let db;
function openDB() {
    
    const request = window.indexedDB.open("notiwis_db", 1);

    request.onerror = function () {
        console.error("Database failed to open");
    };

    request.onsuccess = function () {
        db = request.result;
    };

    request.onupgradeneeded = function (e) {
        const db = e.target.result;
        const notebooks = db.createObjectStore("notebooks", { keyPath: "id", autoIncrement: true });
        notebooks.createIndex("id", "id", { unique: true });
        notebooks.createIndex("id_remote", "id_remote", { unique: false });
        notebooks.createIndex("name", "name", { unique: true });
        const notes = db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
        notes.createIndex("id", "id", { unique: true });
        notes.createIndex("id_remote", "id_remote", { unique: false });
        notes.createIndex("notebook_id", "notebook_id", { unique: false });
    };

    // wait for db to be opened
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            console.log("Database opened");
            if (db) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
};

function getDB() {
    return db;
}

function addNotebookDB(notebook) {
    return new Promise((resolve, reject) => {

        const db = getDB();
        
        // if notebook already in online DB
        const transaction = db
            .transaction(["notebooks"], "readonly")
            .objectStore("notebooks")
            .index("name")
            .get(notebook.name);

        transaction.onsuccess = function () {
            if (transaction.result) {
                resolve(transaction.result.id);
            } else {
                
                if (notebook.online_id === undefined) {
                    notebook.id_remote = "offline"
                }
            
                const transaction = db
                    .transaction(["notebooks"], "readwrite")
                    .objectStore("notebooks")
                    .add(notebook);
            
                transaction.onsuccess = function () {
                    console.log("Notebook added");
                    resolve(transaction.result);
                }
            
                transaction.onerror = function () {
                    console.error("Failed to add notebook");
                }
            }
        }

        transaction.onerror = function () {
            console.error("Failed to get notebook");
        }
    });
};

function addNoteDB(note) {

    return new Promise((resolve, reject) => {
        const db = getDB();

        const transaction = db
            .transaction(["notes"], "readwrite")
            .objectStore("notes")
            .add(note);

        transaction.onsuccess = function () {
            return resolve(transaction.result);
        }

        transaction.onerror = function () {
            console.error("Failed to add note");
        }
    });
}

async function getNotebookNotesDB(notebook_id) {
    return new Promise((resolve, reject) => {
        const db = getDB();

        const transaction = db
            .transaction(["notes"], "readonly")
            .objectStore("notes")
            .index("notebook_id")
            .openCursor(notebook_id)
        

        const notes = [];
        // iterate over cursor
        transaction.onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
                if (cursor.value.deleted === false) {
                    notes.push(cursor.value);
                }
                cursor.continue();
            } else {
                resolve(notes);
            }        
        }

        transaction.onerror = function () {
            console.error("Failed to get notes");
        }
    })
}

function updateNoteDB(note) {
    return new Promise((resolve, reject) => {
        const db = getDB();

        const transaction = db
            .transaction(["notes"], "readwrite")
            .objectStore("notes")
            .get(note.id);

        transaction.onsuccess = function () {
            if (transaction.result) {
                const transaction = db
                    .transaction(["notes"], "readwrite")
                    .objectStore("notes")
                    .put(note);
            
                transaction.onsuccess = function () {
                    console.log("Note updated");
                    resolve(transaction.result);
                }
            
                transaction.onerror = function () {
                    console.error("Failed to update note");
                }
            } else {
                console.error("Note not found");
            }
        }

        transaction.onerror = function () {
            console.error("Failed to get note");
        }
    });
}

function deleteNoteDB(note_id) {

    const db = getDB();

    // delete note with id note_id, note_id is the online DB id, not the indexedDB id
    const transaction = db
        .transaction(["notes"], "readwrite")
        .objectStore("notes")
        .index("id")
        .delete(note_id);

    transaction.onsuccess = function () {
        console.log("Note deleted");
    }

    transaction.onerror = function () {
        console.error("Failed to delete note");
    }
}

function deleteNotebookDB(notebook_id) {

    const db = getDB();

    const transaction = db
        .transaction(["notebooks"], "readwrite")
        .objectStore("notebooks")
        .index("id")
        .delete(notebook_id);

    transaction.onsuccess = function () {
        console.log("Notebook deleted");
    }

    transaction.onerror = function () {
        console.error("Failed to delete notebook");
    }

    // delete all notes from notebook
    const transaction_notes = db
        .transaction(["notes"], "readwrite")
        .objectStore("notes")
        .index("notebook_id")
        .delete(notebook_id);
    
    transaction_notes.onsuccess = function () {
        console.log("Notes deleted");
    }

    transaction_notes.onerror = function () {
        console.error("Failed to delete notes");
    }
}

function getNotebookDB(notebook_id) {
    return new Promise((resolve, reject) => {
        const db = getDB();

        const transaction = db
            .transaction(["notebooks"], "readonly")
            .objectStore("notebooks")
            .index("id")
            .get(notebook_id);

        transaction.onsuccess = function () {
            resolve(transaction.result);
        }

        transaction.onerror = function () {
            console.error("Failed to get notebook");
        }
    });
}

function getNoteDB(note_id) {

    return new Promise((resolve, reject) => {
        const db = getDB();

        const transaction = db
            .transaction(["notes"], "readonly")
            .objectStore("notes")
            .get(note_id);

        transaction.onsuccess = function () {
            resolve(transaction.result);
        }

        transaction.onerror = function () {
            console.error("Failed to get note");
        }
    });
}


export { openDB, addNotebookDB, addNoteDB, getNotebookNotesDB, updateNoteDB, deleteNoteDB, deleteNotebookDB, getNotebookDB, getNoteDB};