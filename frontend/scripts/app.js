import { openDB, addNotebookDB, addNoteDB, deleteNoteDB, updateNoteDB, deleteNotebookDB, getNotebookDB, getNoteDB, getNotebookNotesDB } from "./indexeddb.js";

let online;
window.onload = async function () {
    await openDB();

    if (window.navigator.onLine) {
        online = true;
    } else {
        online = false;
    }

    document.addEventListener("online", function () {
        online = true;
    });

    document.addEventListener("offline", function () {
        online = false;
    });

    document.addEventListener("click",async function (event) {

        if (event.target.id === "addNotebookButton") {
            addNotebook();
        }
        else if (event.target.id === "addNoteButton") {
            const notebookId = localStorage.getItem("notebookId");
            addNote(notebookId);
        }
        else if (event.target.id.startsWith("style-")) {
            const noteId = parseInt(event.target.id.split("-")[1]);
            noteColor(noteId);
        }
        else if (event.target.id.startsWith("check-")) {
            const noteId = parseInt(event.target.id.split("-")[1]);
            const check = await updateNoteChecked(noteId);
            checkNoteComponent(noteId, check);
        }
        else if (event.target.id.startsWith("delete-")) {
            const noteId = parseInt(event.target.id.split("-")[1]);
            await deleteNote(noteId);
            // remove note from view
            removeNoteComponent(noteId);
        }
        else if (event.target.id.startsWith("edit-")) {
            const noteId = parseInt(event.target.id.split("-")[1]);
            updateNoteContent(noteId);
        }
        else if (event.target.id === "homeButton") {
            window.location.href = "/frontend/index.html";
        }
        else if (event.target.id === "sortButton") {
            sortNotes();
        }
    });

    if (document.readyState === "complete" || document.readyState === "interactive") {
        if (window.location.pathname === "/frontend/notes.html") {
            displayNotes();
        }
    } else {
        document.addEventListener("load", function () {
            if (window.location.pathname === "/frontend/notes.html") {
                displayNotes();
            }
        });
    }
}

async function addNotebook() {
    let name = document.getElementById("notebookInput").value;
    if (name.trim() === "") {
        alert("Please enter a notebook name");
        return;
    }

    // check if page is online
    // if (online) {
    //     // add notebook to online DB
    //     const response = await fetch("/notebooks", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ name: name }),
    //     });

    //     if (!response.ok) {
    //         const data = await response.json();
    //         alert(data.error);
    //         return;
    //     }

    //     const data = await response.json();

    //     const notebook = {
    //         name: name,
    //         id_remote: data.id,
    //         synced: true,
    //     };
        
    //     // add notebook to indexedDB
    //     addNotebookDB(notebook);

    //     document.getElementById("notebookInput").value = "";
    //     displayNotebook(notebook);
    //     return;
    // }
    const notebook = {
        name: name,
        id_remote: "offline",
        synced: false,
    };

    // add notebook to indexedDB
    const result = await addNotebookDB(notebook);
    document.getElementById("notebookInput").value = "";

    const notebookWithId = {
        name: notebook.name,
        id: result,
        id_remote: notebook.id_remote,
        synced: notebook.synced,
    };

    displayNotebook(notebookWithId);
    
}

function displayNotebook(notebook) {

    localStorage.setItem("notebookName",notebook.name);
    localStorage.setItem("notebookId",notebook.id)

    // move to notes page and change notebook name
    window.location.href = "/frontend/notes.html";
}

async function displayNotes() {

    const notebookName = localStorage.getItem("notebookName");
    const notebookId = localStorage.getItem("notebookId");

    const notes = await getNotes(notebookId);
    for (let note of notes) {
        
        addNoteComponent(note);
    }
}

async function getNotes(notebook_id){

    // if (online) {

    //     // get notebook from online DB
    //     const notebook = await getNotebookDB(notebook_id);

    //     if (!notebook) {
    //         alert("Notebook not found");
    //         return;
    //     }

    //     // get online id of notebook
    //     const online_id = notebook.id_remote;


    //     const response = await fetch(`/notebooks/${online_id}/notes`);
    //     if (!response.ok) {
    //         const data = await response.json();
    //         alert(data.error);
    //         return;
    //     }
    //     const data = await response.json();
    //     // update notes in indexedDB

    //     const notes = data.notes;
    //     for (let note of notes) {
    //         const noteDB = await getNoteDB(note.id);
    //         if (!noteDB) {
    //             newNote = {
    //                 content: note.content,
    //                 checked: note.checked,
    //                 color: note.color,
    //                 id_remote: note.id,
    //                 notebook_id: notebook_id,
    //                 synced: true,
    //                 deleted: false,
    //                 updated: false,
    //             };
    //             addNoteDB(newNote);
    //         } else {
    //             if (
    //                 noteDB.content !== note.content ||
    //                 noteDB.checked !== note.checked ||
    //                 noteDB.color !== note.color
    //             ) {
    //                 noteDB.content = note.content;
    //                 noteDB.checked = note.checked;
    //                 noteDB.color = note.color;
    //                 updateNoteDB(noteDB);
    //             }
    //         }
    //     }
    //     return notes;
    // }

    const notes = getNotebookNotesDB(notebook_id);
    return notes;
}

async function addNote(notebook_id) {
    let content = document.getElementById("noteInput").value;

    // if (online) {

    //     // get notebook from indexedDB
    //     const notebook = await getNotebookDB(notebook_id);

    //     if (!notebook) {
    //         alert("Notebook not found");
    //         return;
    //     }

    //     // get online id of notebook
    //     const online_id = notebook.id_remote;

    //     // add note to online DB
    //     const response = await fetch(`/notebooks/${online_id}/notes`, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ content: content, checked: false, color: "white" }),
    //     });

    //     if (!response.ok) {
    //         const data = await response.json();
    //         alert(data.error);
    //         return;
    //     }

    //     const data = await response.json();

    //     const newNote = {
    //         content: content,
    //         checked: false,
    //         color: "white",
    //         id_remote: data.id,
    //         notebook_id: notebook_id,
    //         synced: true,
    //         deleted: false,
    //         updated: false,
    //     };
        
    //     // add note to indexedDB
    //     addNoteDB(newNote);

    //     document.getElementById("noteInput").value = "";
    //     addNoteComponent(newNote);
    //     return;
    // }

    const newNote = {
        content: content,
        checked: false,
        color: "blue",
        id_remote: "offline",
        notebook_id: notebook_id,
        synced: false,
        deleted: false,
        updated: false,
    };

    addNoteDB(newNote)
    document.getElementById("noteInput").value = "";
    addNoteComponent(newNote);
}

async function deleteNote(noteId) {
    // delete note from online DB
    // if (online) {

    //     // get notebook from indexedDB
    //     const notebook = await getNotebookDB(note.notebook_id);

    //     if (!notebook) {
    //         alert("Notebook not found");
    //         return;
    //     }

    //     // get online id of notebook
    //     const online_id = notebook.id_remote;

    //     const response = await fetch(`/notebooks/${online_id}/notes/${note.id_remote}`, {
    //         method: "DELETE",
    //     });

    //     if (!response.ok) {
    //         const data = await response.json();
    //         alert(data.error);
    //         return;
    //     }

    //     deleteNoteDB(note.id);
    //     return;
    // }

    // get note from indexedDB

    const noteDB = await getNoteDB(noteId);
    noteDB.deleted = true;
    noteDB.synced = false;

    await updateNoteDB(noteDB);
}

async function updateNoteChecked(noteId) {
    
    // if (online) {
    //     // get note from online DB

    //     const notebook_id = localStorage.getItem("notebookId");
    //     const notebook = await getNotebookDB(notebook_id);
    //     const online_id = notebook.id_remote;

    //     const noteDB = await getNoteDB(noteId);

    //     const response = await fetch(`/notebooks/${online_id}/notes/${noteDB.id_remote}`, {
    //         method: "PUT",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ checked: !noteDB.checked }),
    //     });
    //     if (!response.ok) {
    //         const data = await response.json();
    //         alert(data.error);
    //         return;
    //     }

    //     const data = await response.json();
    //     noteDB.checked = data.checked;

    //     updateNoteDB(noteDB);
    //     return noteDB.checked;
    // }

    const noteDB = await getNoteDB(noteId);
    noteDB.checked = !noteDB.checked;
    noteDB.synced = false;
    noteDB.updated = true;
    updateNoteDB(noteDB);
    return noteDB.checked;
}

async function noteColor(noteId) {
    
    // show color picker
    const color = await showColorPicker();
    if (!color) {
        return;
    }
    
    // if (online) {
    //     // get note from online DB
    //     const noteDB = await getNoteDB(noteId);
    //     const notebook_id = localStorage.getItem("notebookId");
    //     const notebook = await getNotebookDB(notebook_id);
    //     const online_id = notebook.id_remote;
    //     noteDB.color = color;
    //     const updatedNote = {
    //         noteDB.content,
    //         noteDB.checked,
    //         color: color,
    //     };

    //     const response = await fetch(`/notebooks/${online_id}/notes/${noteDB.id_remote}`, {
    //         method: "PUT",
    //         headers: {
    //             "Content-Type": "application/json",

    //         },
    //         body: JSON.stringify(updatedNote),
    //     });

    //     if (!response.ok) {
    //         const data = await response.json();
    //         alert(data.error);
    //         return;
    //     }

    //     const data = await response.json();
    //     updateNoteDB(noteDB);
    //     return;
    
    // }
    const noteDB = await getNoteDB(noteId);
    noteDB.color = color;
    noteDB.synced = false;
    noteDB.updated = true;
    updateNoteDB(noteDB);
    
    changeNoteColor(noteId, color);
}

async function showColorPicker() {
    const colorSelect = document.getElementById("colorSelector");
    colorSelect.style.display = "block";

    return new Promise((resolve, reject) => {
        document.addEventListener("click", function (event) {
            if (event.target.id === "colorCloseButton") {
                colorSelect.style.display = "none";
                resolve(null);
            }
            else if (event.target.id === "blue") {
                colorSelect.style.display = "none";
                resolve("blue");
            }
            else if (event.target.id === "green") {
                colorSelect.style.display = "none";
                resolve("green");
            }
            else if (event.target.id === "red") {
                colorSelect.style.display = "none";
                resolve("red");
            }
            else if (event.target.id === "yellow") {
                colorSelect.style.display = "none";
                resolve("yellow");
            }
        });
    });
}

function changeNoteColor(noteId, color) {
    const note = document.getElementById(`note-${noteId}`);
    note.className = `note ${color}-note`;
}

async function updateNoteContent(noteId) {
    const content = await showNoteEditor(noteId)
    if (!content) {
        return;
    }

    // if (online) {
    //     // get note from online DB
    //     const noteDB = await getNoteDB(noteId);
    //     const notebook_id = localStorage.getItem("notebookId");
    //     const notebook = await getNotebookDB(notebook_id);
    //     const online_id = notebook.id_remote;
    //     noteDB.content = content;
    //     const updatedNote = {
    //         content: content,
    //         noteDB.checked,
    //         noteDB.color,
    //     };
    //
    //     const response = await fetch(`/notebooks/${online_id}/notes/${noteDB.id_remote}`, {
    //         method: "PUT",
    //         headers: {
    //             "Content-Type": "application/json",
    //
    //         },
    //         body: JSON.stringify(updatedNote),
    //     });
    //
    //     if (!response.ok) {
    //         const data = await response.json();
    //         alert(data.error);
    //         return;
    //     }
    //
    //     const data = await response.json();
    //     updateNoteDB(noteDB);
    //     return;
    // }
    const noteDB = await getNoteDB(noteId);
    noteDB.content = content;
    noteDB.synced = false;
    noteDB.updated = true;
    updateNoteDB(noteDB);
    editNoteComponent(noteId, content);
}

async function showNoteEditor(noteId) {
    const noteEditor = document.getElementById("noteEditor");
    noteEditor.style.display = "block";
    const noteEditorInput = document.getElementById("editorInput");
    noteEditorInput.value = document.getElementById(`p-${noteId}`).textContent;

    return new Promise((resolve, reject) => {
        document.addEventListener("click", function (event) {
            if (event.target.id === "editorCloseButton") {
                noteEditor.style.display = "none";
                resolve(null);
            }
            else if (event.target.id === "editorSaveButton") {
                noteEditor.style.display = "none";
                const content = document.getElementById("editorInput").value;
                resolve(content);
            }
        });
    });
}
            



function addNoteComponent(note) {
    let noteList = document.getElementById("notesDisplaySection")
    
    // Create note li
    let noteDiv= document.createElement("div")
    noteDiv.id = `note-${note.id}`
    noteDiv.className = `note ${note.color}-note`
    noteDiv.dataset.id = note.id
    noteDiv.dataset.notebookId = note.notebook_id
    noteDiv.dataset.synced = note.synced
    noteDiv.dataset.deleted = note.deleted
    noteDiv.dataset.updated = note.updated
    noteDiv.dataset.color = note.color
    noteDiv.dataset.checked = note.checked

    // Create styleButton
    let styleButton = document.createElement("button")
    styleButton.textContent = "🎨"
    styleButton.className = "blank-button margin-right inline-block"
    styleButton.id = `style-${note.id}`
    noteDiv.appendChild(styleButton)

    // Create checkbox
    let checkbox = document.createElement("button")
    if (note.checked) {
        checkbox.textContent = "☑"
    } else {
        checkbox.textContent = "☐"
    }
    checkbox.className = "blank-button margin-right inline-block"
    checkbox.id = `check-${note.id}`
    noteDiv.appendChild(checkbox)

    // Create actions div
    let actions = document.createElement("div")
    actions.className = "actions inline-block"
    actions.id = `actions-${note.id}`

    // Create delete button
    let deleteBtn = document.createElement("button")
    deleteBtn.textContent = "🗑"
    deleteBtn.className = "blank-button margin-right"
    deleteBtn.id = `delete-${note.id}`

    // Create edit button
    let editBtn = document.createElement("button")
    editBtn.textContent = "🖊"
    editBtn.className = "blank-button margin-right"
    editBtn.id = `edit-${note.id}`

    actions.appendChild(deleteBtn)
    actions.appendChild(editBtn)
    noteDiv.appendChild(actions)

    // Add noteName
    let nameParagraph = document.createElement("p")
    nameParagraph.textContent = note.content
    nameParagraph.id = `p-${note.id}`
    nameParagraph.className = "inline-block"
    noteDiv.appendChild(nameParagraph)
    
    noteList.appendChild(noteDiv)
}

function removeNoteComponent(note_id) {
    let note = document.getElementById(`note-${note_id}`)
    while (note.firstChild) {
        note.removeChild(note.firstChild)
    }
    note.parentNode.removeChild(note)
}

function checkNoteComponent(note_id, check) {
    let checkbox = document.getElementById(`check-${note_id}`)
    if (check) {
        checkbox.textContent = "☑"
    } else {
        checkbox.textContent = "☐"
    }
}

function editNoteComponent(note_id, newContent) {
    let nameParagraph = document.getElementById(`p-${note_id}`)
    nameParagraph.textContent = newContent
}

function removeAllNoteComponents() {
    let noteList = document.getElementById("notesDisplaySection")
    while (noteList.firstChild) {
        removeNoteComponent(noteList.firstChild.id)
    }
}


if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/frontend/serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}
