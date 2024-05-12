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
            

function displayNotebook(notebook) {

    localStorage.setItem("notebookName",notebook.name);
    localStorage.setItem("notebookId",notebook.id)

    // move to notes page and change notebook name
    window.location.href = "/frontend/notes.html";
}

async function displayNotes(notes) {
    for (let note of notes) {
        
        addNoteComponent(note);
    }
}

function addNoteComponent(note) {
    let noteList = document.getElementById("notesDisplaySection")
    
    // Create note li
    let noteDiv= document.createElement("div")
    noteDiv.id = `note-${note.id}`
    noteDiv.className = `note ${note.color}-note`

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

export { displayNotebook, displayNotes, addNoteComponent, removeNoteComponent, editNoteComponent, checkNoteComponent, changeNoteColor, removeAllNoteComponents, showNoteEditor, showColorPicker };