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
        notebooks.createIndex("name", "name", { unique: false });
        const notes = db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
        notes.createIndex("id", "id", { unique: true });
        notes.createIndex("id_remote", "id_remote", { unique: false });
        notes.createIndex("notebook_id", "notebook_id", { unique: false });
    };
};

function addNotebookDB(notebook) {

    if (notebook.online_id === undefined) {
        notebook.id_remote = "offline"
    }
    const transaction = db
        .transaction(["notebooks"], "readwrite")
        .objectStore("notebooks")
        .add(notebook);

    transaction.onsuccess = function () {
        console.log("Notebook added");
    }

    transaction.onerror = function () {
        console.error("Failed to add notebook");
    }

};

function addNoteDB(note) {

    const transaction = db
        .transaction(["notes"], "readwrite")
        .objectStore("notes")
        .add(newNote);

    transaction.onsuccess = function () {
        console.log("Note added");
    }

    transaction.onerror = function () {
        console.error("Failed to add note");
    }
}

function getNotebookNotesDB(notebook_id) {
    const transaction = db
        .transaction(["notes"], "readonly")
        .objectStore("notes")
        .index("notebook_id")
        .getAll(notebook_id);

    transaction.onsuccess = function () {
        console.log(transaction.result);
    }

    transaction.onerror = function () {
        console.error("Failed to get notes");
    }
}

function updateNoteDB(note) {
    const transaction = db
        .transaction(["notes"], "readwrite")
        .objectStore("notes")
        .put(note);

    transaction.onsuccess = function () {
        console.log("Note updated");
    }

    transaction.onerror = function () {
        console.error("Failed to update note");
    }
}

function deleteNoteDB(note_id) {
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
}

function getNotebookDB(notebook_id) {
    const transaction = db
        .transaction(["notebooks"], "readonly")
        .objectStore("notebooks")
        .index("id")
        .get(notebook_id);

    transaction.onsuccess = function () {
        console.log(transaction.result);
    }

    transaction.onerror = function () {
        console.error("Failed to get notebook");
    }
}

function getNoteDB(note_id) {
    const transaction = db
        .transaction(["notes"], "readonly")
        .objectStore("notes")
        .index("id")
        .get(note_id);

    transaction.onsuccess = function () {
        console.log(transaction.result);
    }

    transaction.onerror = function () {
        console.error("Failed to get note");
    }
}


export { openDB, addNotebookDB, addNoteDB, getNotebookNotesDB, updateNoteDB, deleteNoteDB, deleteNotebookDB, getNotebookDB, getNoteDB }