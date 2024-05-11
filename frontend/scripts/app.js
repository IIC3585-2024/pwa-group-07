import { openDB, addNotebookDB, addNoteDB, deleteNoteDB, updateNoteDB, deleteNotebookDB, getNotebookDB, getNoteDB } from "./indexeddb.js";


window.onload = function () {
    openDB();
    document.addEventListener("click", function (event) {
        if (event.target.id === "addNotebookButton") {
            addNotebook();
        }
        else if (event.target.id === "addNoteButton") {
            const notebookName = document.getElementById("notebookName").textContent;
            const notebookId = document.getElementById("notebookName").dataset.id;
            addNote(notebookId);
        }
        else if (event.target.className.includes("color-button")) {
            const color = event.target.dataset.color;
            const noteId = event.target.dataset.noteId;
            const notebookId = event.target.dataset.notebookId;
            updateNoteColor(noteId, color, notebookId);
        }
        else if (event.target.className.includes("check-button")) {
            const noteId = event.target.dataset.noteId;
            const notebookId = event.target.dataset.notebookId;
            updateNoteChecked(noteId, notebookId);
        }
        else if (event.target.className.includes("delete-button")) {
            const noteId = event.target.dataset.noteId;
            deleteNote(noteId);
            // remove note from view
            event.target.parentElement.remove();
        }
        else if (event.target.className.includes("update-button")) {
            const noteId = event.target.dataset.noteId;
            updateNoteContent(noteId);
        }
        else if (event.target.id === "homeButton") {
            window.location.href = "/frontend/index.html";
        }
        else if (event.target.id === "sortButton") {
            sortNotes();
        }
    });
};

async function addNotebook() {
    let name = document.getElementById("notebookInput").value;
    if (name.trim() === "") {
        alert("Please enter a notebook name");
        return;
    }

    // check if page is online
    if (navigator.onLine) {
        // add notebook to online DB
        const response = await fetch("/notebooks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: name }),
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        const data = await response.json();

        const notebook = {
            name: name,
            id_remote: data.id,
            synced: true,
        };
        
        // add notebook to indexedDB
        addNotebookDB(notebook);

        document.getElementById("notebookInput").value = "";
        displayNotebook(name);
        return;
    }
    const notebook = {
        name: name,
        id_remote: "offline",
        synced: false,
    };

    // add notebook to indexedDB
    addNotebookDB(notebook);
    document.getElementById("notebookInput").value = "";
    displayNotebook(notebook);
    
}

function displayNotebook(notebook) {
    // move to notes page
    window.location.href = "/frontend/notes.html"
    // wait for notes page to load
    window.addEventListener("load", function () {
        // update view to show notebook
        const notebookName = document.getElementById("notebookName");
        notebookName.textContent = notebook.name;
        notebookName.dataset.id = notebook.id;

        getNotes(notebook.id);
    });
}

async function addNote(notebook_id) {
    let content = document.getElementById("noteInput").value;

    if (window.onLine) {

        // get notebook from indexedDB
        const notebook = await getNotebookDB(notebook_id);

        if (!notebook) {
            alert("Notebook not found");
            return;
        }

        // get online id of notebook
        const online_id = notebook.id_remote;

        // add note to online DB
        const response = await fetch(`/notebooks/${online_id}/notes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content, checked: false, color: "white" }),
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        const data = await response.json();

        const newNote = {
            content: content,
            checked: false,
            color: "white",
            id_remote: data.id,
            notebook_id: notebook_id,
            synced: true,
            deleted: false,
            updated: false,
        };
        
        // add note to indexedDB
        addNoteDB(newNote);

        document.getElementById("noteInput").value = "";
        displayNote({ content: content });
        return;
    }

    const newNote = {
        content: content,
        checked: false,
        color: "white",
        id_remote: "offline",
        notebook_id: notebook_id,
        synced: false,
        deleted: false,
        updated: false,
    };

    addNoteDB(note);
    document.getElementById("noteInput").value = "";
    displayNote(note);   
}

async function updateNote(note){
    // update note in online DB
    if (navigator.onLine) {

        // get notebook from indexedDB
        const notebook = await getNotebookDB(note.notebook_id);

        if (!notebook) {
            alert("Notebook not found");
            return;
        }

        // get online id of notebook
        const online_id = notebook.id_remote;
        
        const response = await fetch(`/notebooks/${online_id}/notes/${note.id_remote}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: note.content, checked: note.checked, color: note.color }),
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        const data = await response.json();
        note.synced = true;
        note.updated = false;
        updateNoteDB(note);
        return;
    }

    note.updated = true;
    updateNoteDB(note);
}

function displayNote(note) {
    // update view to show note
    const noteList = document.getElementById("noteList");
    const noteItem = document.createElement("li");
    noteItem.textContent = note.content;
    noteList.appendChild(noteItem);
}

async function displayNotes(notebook_id) {
    if (navigator.onLine) {
        // get notes from online DB
        const response = await fetch(`/notebooks/${notebook_id}/notes`);

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        const data = await response.json();

        for (let note of data) {
            displayNote(note);
        }
        return;
    }
}

async function deleteNote(note) {
    // delete note from online DB
    if (navigator.onLine) {

        // get notebook from indexedDB
        const notebook = await getNotebookDB(note.notebook_id);

        if (!notebook) {
            alert("Notebook not found");
            return;
        }

        // get online id of notebook
        const online_id = notebook.id_remote;

        const response = await fetch(`/notebooks/${online_id}/notes/${note.id_remote}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        deleteNoteDB(note.id);
        return;
    }

    note.deleted = true;
}
    

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}
