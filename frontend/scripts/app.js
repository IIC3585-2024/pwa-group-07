import { openDB } from "./indexeddb.js";
import { displayNotebook, displayNotes, addNoteComponent, removeNoteComponent, editNoteComponent, checkNoteComponent, changeNoteColor, removeAllNoteComponents, showNoteEditor, showColorPicker } from "./ui.js";
import { addNotebook, getNotes, addNote, deleteNote, noteColor, updateNoteChecked, updateNote } from "./notes.js";

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
        switch (event.target.id) {
            case "addNotebookButton":
                const notebook = await addNotebook();
                displayNotebook(notebook);
                break;
            case "addNoteButton":
                const notebookId = localStorage.getItem("notebookId");
                const newNote = await addNote(notebookId);
                console.log(newNote)
                document.getElementById("noteInput").value = "";
                addNoteComponent(newNote);
                break;
            case "homeButton":
                window.location.href = "/frontend/index.html";
                break;
            case "sortButton":
                //sortNotes();
                break;
            default:
                if (event.target.id.startsWith("style-")) {
                    
                    const noteId = parseInt(event.target.id.split("-")[1]);
                    const color = await showColorPicker();
                    if (!color) {
                        return;
                    }
                    noteColor(noteId, color).then( _ => {
                        changeNoteColor(noteId, color);
                    });
                }
                else if (event.target.id.startsWith("check-")) {
                    const noteId = parseInt(event.target.id.split("-")[1]);
                    updateNoteChecked(noteId).then(check => {
                        checkNoteComponent(noteId, check);
                    });
                }
                else if (event.target.id.startsWith("delete-")) {
                    const noteId = parseInt(event.target.id.split("-")[1]);
                    deleteNote(noteId).then(() => {
                        removeNoteComponent(noteId);
                    });
                }
                else if (event.target.id.startsWith("edit-")) {
                    const noteId = parseInt(event.target.id.split("-")[1]);
                    const content = await showNoteEditor(noteId)
                    if (!content) {
                        return;
                    }
                    updateNote(noteId, content).then(() => {
                        editNoteComponent(noteId, content);
                    });
                }
                break;
        }
    });

    if (document.readyState === "complete" || document.readyState === "interactive") {
        if (window.location.pathname === "./notes.html") {
            const notebookId = localStorage.getItem("notebookId");
            const notes = await getNotes(notebookId);
            displayNotes(notes);
        }
    } else {
        document.addEventListener("load", async function () {
            if (window.location.pathname === "./notes.html") {
                const notebookId = localStorage.getItem("notebookId");
                const notes = await getNotes(notebookId);
                displayNotes(notes);
            }
        });
    }
}


if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("./serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}
