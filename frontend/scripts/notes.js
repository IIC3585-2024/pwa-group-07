import { addNotebookDB, addNoteDB, deleteNoteDB, updateNoteDB, deleteNotebookDB, getNotebookDB, getNoteDB, getNotebookNotesDB, getNotebooksDB } from "./indexeddb.js";

async function addNotebook() {
    let name = document.getElementById("notebookInput").value;
    document.getElementById("notebookInput").value = "";

    if (name.trim() === "") {
        alert("Please enter a notebook name");
        return null;
    }

    if (online) {
        // add notebook to online DB
        const response = await fetch(`${""}/notebooks`, {
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
        const result = await addNotebookDB(notebook);
        
        const notebookWithId = {
            name: notebook.name,
            id: result,
            id_remote: notebook.id_remote,
            synced: notebook.synced,
        };
        return notebookWithId;
    }

    const notebook = {
        name: name,
        id_remote: "offline",
        synced: false,
    };

    // add notebook to indexedDB
    const result = await addNotebookDB(notebook);

    const notebookWithId = {
        name: notebook.name,
        id: result,
        id_remote: notebook.id_remote,
        synced: notebook.synced,
    };

    return notebookWithId;
}

async function getNotes(notebook_id){

    if (online) {

        // get notebook from online DB
        const notebook = await getNotebookDB(notebook_id);

        if (!notebook) {
            alert("Notebook not found");
            return;
        }

        // get online id of notebook
        const online_id = notebook.id_remote;

        const response = await fetch(`${""}/notebooks/${online_id}/notes`);
        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        const data = await response.json();

        // update notes in indexedDB
        const notes = data.notes;
        for (let note of notes) {
            const noteDB = await getNoteDB(note.id);
            if (!noteDB) {
                newNote = {
                    content: note.content,
                    checked: note.checked,
                    color: note.color,
                    id_remote: note.id,
                    notebook_id: notebook_id,
                    synced: true,
                    deleted: false,
                    updated: false,
                };
                addNoteDB(newNote);
            } else {
                if (
                    noteDB.content !== note.content ||
                    noteDB.checked !== note.checked ||
                    noteDB.color !== note.color
                ) {
                    noteDB.content = note.content;
                    noteDB.checked = note.checked;
                    noteDB.color = note.color;
                    updateNoteDB(noteDB);
                }
            }
        }
    }

    const notes = getNotebookNotesDB(notebook_id);
    return notes;
}

async function addNote(notebook_id) {
    let content = document.getElementById("noteInput").value;

    if (online) {

        // get notebook from indexedDB
        const notebook = await getNotebookDB(notebook_id);

        if (!notebook) {
            alert("Notebook not found");
            return;
        }

        // get online id of notebook
        const online_id = notebook.id_remote;

        // add note to online DB
        const response = await fetch(`${""}/notebooks/${online_id}/notes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content, checked: false, color: "blue" }),
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
        addNoteComponent(newNote);
        return;
    }

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

    const id = await addNoteDB(newNote);
    newNote.id = id;
    return newNote;
}

async function deleteNote(noteId) {
    
    if (online) {
        const noteDB = await getNoteDB(noteId);
        const notebook_id = localStorage.getItem("notebookId");
        const notebook = await getNotebookDB(notebook_id);
        const online_id = notebook.id_remote;
        
        const response = await fetch(`${""}/notebooks/${online_id}/notes/${noteDB.id_remote}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        await deleteNoteDB(noteId);
        return;
    }

    const noteDB = await getNoteDB(noteId);
    noteDB.deleted = true;
    noteDB.synced = false;

    await updateNoteDB(noteDB);
}

async function noteColor(noteId, color) {  
    
    if (online) {

        const noteDB = await getNoteDB(noteId);
        const notebook_id = localStorage.getItem("notebookId");
        const notebook = await getNotebookDB(notebook_id);
        const online_id = notebook.id_remote;

        const updatedNote = {
            content: noteDB.content,
            checked: noteDB.checked,
            color: color,
        };

        const response = await fetch(`${""}/notebooks/${online_id}/notes/${noteDB.id_remote}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedNote),
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        const data = await response.json();
        noteDB.color = data.color;
        noteDB.synced = true;
        noteDB.updated = false;
        updateNoteDB(noteDB);
        return data.color;        
       
    }

    const noteDB = await getNoteDB(noteId);
    noteDB.color = color;
    noteDB.synced = false;
    noteDB.updated = true;
    updateNoteDB(noteDB);

    return color;
}



async function updateNoteChecked(noteId) {
    
    if (online) {

        const noteDB = await getNoteDB(noteId);
        const notebook_id = localStorage.getItem("notebookId");
        const notebook = await getNotebookDB(notebook_id);
        const online_id = notebook.id_remote;

        const updatedNote = {
            content: noteDB.content,
            checked: !noteDB.checked,
            color: noteDB.color,
        };

        const response = await fetch(`${""}/notebooks/${online_id}/notes/${noteDB.id_remote}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedNote),
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        const data = await response.json();
        noteDB.checked = data.checked;
        noteDB.synced = true;
        noteDB.updated = false;
        updateNoteDB(noteDB);
        return data.checked;
    }

    const noteDB = await getNoteDB(noteId);
    noteDB.checked = !noteDB.checked;
    noteDB.synced = false;
    noteDB.updated = true;
    updateNoteDB(noteDB);
    return noteDB.checked;
}

async function updateNote(noteId,content) {
    
    if (online) {

        const noteDB = await getNoteDB(noteId);
        const notebook_id = localStorage.getItem("notebookId");
        const notebook = await getNotebookDB(notebook_id);
        const online_id = notebook.id_remote;

        const updatedNote = {
            content: content,
            checked: noteDB.checked,
            color: noteDB.color,
        };

        const response = await fetch(`${""}/notebooks/${online_id}/notes/${noteDB.id_remote}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedNote),
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
            return;
        }

        const data = await response.json();
        noteDB.content = data.content;
        noteDB.synced = true;
        noteDB.updated = false;
        updateNoteDB(noteDB);
        return data.content;
    }
    const noteDB = await getNoteDB(noteId);
    noteDB.content = content;
    noteDB.synced = false;
    noteDB.updated = true;
    const updatedNote = await updateNoteDB(noteDB);
    return noteDB;
}

async function updateNotebookId(notebook) {
    const response = await fetch("/notebooks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: notebook.name }),
    });

    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return notebook;
    }

    const data = await response.json();
    notebook.id_remote = data.id;
    notebook.synced = true;
    await updateNotebookDB(notebook);

    return notebook;
}

async function updateNoteId(notebook,note) {
    const response = await fetch(`/notebooks/${notebook.id_remote}/notes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: note.content, checked: note.checked, color: note.color }),
    });

    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return note;
    }

    const data = await response.json();
    note.id_remote = data.id;
    note.synced = true;
    note.updated = false;
    await updateNoteDB(note);
    return note;
}

async function syncNoteUpdate(notebook,note) {
    const response = await fetch(`/notebooks/${notebook.id_remote}/notes/${note.id_remote}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: note.content, checked: note.checked, color: note.color }),
    });

    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return note;
    }

    const data = await response.json();
    note.synced = true;
    note.updated = false;
    await updateNoteDB(note);
    return note;
}

async function syncNoteDelete(notebook,note) {
    const response = await fetch(`/notebooks/${notebook.id_remote}/notes/${note.id_remote}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
        return;
    }

    await deleteNoteDB(note.id);
}


async function syncData() {
    if (online) {
        const notebooks = await getNotebooksDB();
        for (let notebook of notebooks) {
            if (!notebook.synced) {
                if (notebook.id_remote === "offline") {
                    notebook = await updateNotebookId(notebook);
                }
                const notes = await getNotebookNotesDB(notebook.id);
                for (let note of notes) {
                    if (!note.synced) {
                        if (note.id_remote === "offline") {
                            note = await updateNoteId(notebook,note);
                        } 
                        if (note.updated) {
                            note = await syncNoteUpdate(notebook,note);
                        }
                        if (note.deleted) {
                            await syncNoteDelete(notebook,note);
                        }
                    }
                }
            }
        }
    }
}

export { addNotebook, getNotes, addNote, deleteNote, noteColor, updateNoteChecked, updateNote, syncData };