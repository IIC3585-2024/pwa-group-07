import { openDB, addNotebookDB, addNoteDB, deleteNoteDB } from "./indexeddb.js";


window.onload = function () {
    openDB();
    const addNotebookButton = document.getElementById("addNotebookButton");
    addNotebookButton.addEventListener("click", addNotebook);
};

function addNotebook() {
    let name = document.getElementById("notebookInput").value;
    if (name.trim() === "") {
        alert("Please enter a notebook name");
        return;
    }

    addNotebookDB(name);

    console.log("Notebook added");
    document.getElementById("notebookInput").value = "";
    displayNotebook(name);
    
}

function displayNotebook(name) {
    // display notes for the notebook, format in notes.html
    
}

function addNote(name) {
    let content = document.getElementById("noteInput").value;

    let note = {
        content: content,
        checked: false,
        color: "white",
    };

    addNoteDB(note);
    document.getElementById("noteInput").value = "";
    displayNote(note);
    
}

function deleteNote(note_id) {
    
    deleteNoteDB(note_id);
    // remove note from display
}

    

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}
