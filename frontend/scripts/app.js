import { openDB, clearDB } from "./indexeddb.js";
import { displayNotebook, displayNotes, addNoteComponent, removeNoteComponent, editNoteComponent, checkNoteComponent, changeNoteColor, showNoteEditor, showColorPicker, showSyncPrompt } from "./ui.js";
import { addNotebook, getNotes, addNote, deleteNote, colorNote, updateNoteChecked, updateNotesChecked, updateNote, syncData } from "./notes.js";

window.onload = async function () {
    await openDB();

    window.addEventListener("online", async function () {
        this.localStorage.setItem("online", true);
        const sync = await showSyncPrompt();
        if (sync) {
            syncData();
            return;
        }
        clearDB();
        if (window.location.pathname.endsWith("notes.html")) {
            const notebookId = localStorage.getItem("notebookId");
            const notebookName = localStorage.getItem("notebookName");
            // add notebook to offline DB
            const notebook = await addNotebook(notebookName);
        }
        window.location.href = "./notes.html";
    });

    window.addEventListener("offline", function () {
        console.log("offline")
        localStorage.setItem("online", false);
    });

    if (window.navigator.onLine) {
        localStorage.setItem("online", true);
        
    } else {
        localStorage.setItem("online", false);
    }

    document.addEventListener("click",async function (event) {
        switch (event.target.id) {
            case "addNotebookButton":
                let name = document.getElementById("notebookInput").value;
                const notebook = await addNotebook(name);
                document.getElementById("notebookInput").value = "";
                displayNotebook(notebook);
                break;
            case "addNoteButton":
                const notebookId = localStorage.getItem("notebookId");
                const newNote = await addNote(notebookId);
                document.getElementById("noteInput").value = "";
                addNoteComponent(newNote);
                break;
            case "homeButton":
                window.location.href = "./index.html";
                break;
            case "sortButton":
                //sortNotes();
                break;
            case "changeAllColors":
                const color = await showColorPicker();
                if (!color) {
                    return;
                }
                const colorNotes = await getNotes(parseInt(localStorage.getItem("notebookId")));
                for (const note of colorNotes) {
                    colorNote(note.id, color).then( _ => {
                        changeNoteColor(note.id, color);
                    });
                }
                break;
            case "checkAll":
                const checkNotes = await getNotes(parseInt(localStorage.getItem("notebookId")));
                const check = event.target.dataset.checked === "true" ? false : true;
                event.target.dataset.checked = check;
                event.target.textContent = check ? "☑" : "☐";
                console.log(check)
                for (const note of checkNotes) {
                    updateNotesChecked(note.id,check).then(check => {
                        checkNoteComponent(note.id, check);
                    });
                }
                break;
            default:
                if (event.target.id.startsWith("style-")) {
                    
                    const noteId = parseInt(event.target.id.split("-")[1]);
                    const color = await showColorPicker();
                    if (!color) {
                        return;
                    }
                    colorNote(noteId, color).then( _ => {
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
        
        if (window.location.pathname.endsWith("notes.html")) {
            const notebookId = localStorage.getItem("notebookId");
            const notes = await getNotes(notebookId);
            displayNotes(notes);
        }
    } else {
        document.addEventListener("DOMContentLoaded", async function () {
            if (window.location.pathname.endsWith("notes.html")) {
                const notebookId = localStorage.getItem("notebookId");
                const notes = await getNotes(notebookId);
                displayNotes(notes);
            }
        }
        );
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
