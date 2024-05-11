let db;

window.onload = function () {
    let request = window.indexedDB.open("anonynote_db", 1);

    request.onerror = function () {
        console.error("Database failed to open");
    };

    request.onsuccess = function () {
        db = request.result;
    };

    request.onupgradeneeded = function (e) {
        let db = e.target.result;
        let notebooks = db.createObjectStore("notebooks", { keyPath: "id", autoIncrement: true });
        notebooks.createIndex("name", "name", { unique: false });
        let notes = db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
        notes.createIndex("note", "note", { unique: false });
    };
    
};


function addNotebook() {
    let name = document.getElementById("notebookInput").value;
    if (name.trim() === "") {
        alert("Please enter a notebook name");
        return;
    }

    let newNotebook = { name: name };
    let transaction = db.transaction(["notebooks"], "readwrite");
    let objectStore = transaction.objectStore("notebooks");
    let request = objectStore.add(newNotebook);

    request.onsuccess = function () {
        console.log("New notebook added");
        displayNotebook(name);
        document.getElementById("notebookInput").value = "";
    };

    request.onerror = function () {
        console.error("Error adding notebook");
    };
}

function displayNotebook(name) {
    // display notes for the notebook, format in notes.html
    window.location.href = "./notes.html";
    let transaction = db.transaction(["notebooks"], "readonly");
    let objectStore = transaction.objectStore("notebooks");
    let request = objectStore.openCursor();

    let noteList = document.getElementById("noteList");
    noteList.innerHTML = "";

    document.getElementById("notebookName").textContent = name;

    request.onsuccess = function (e) {
        let cursor = e.target.result;

        if (cursor) {
            let li = document.createElement("li");
            li.textContent = cursor.value.note;
            noteList.appendChild(li);

            cursor.continue();
        }
    };
}

function addNote(name) {
    let note = document.getElementById("noteInput").value;
    if (note.trim() === "") {
        alert("Please enter a note");
        return;
    }
    console.log(note)

    let newNote = { note: note };
    let transaction = db.transaction(["notes"], "readwrite");
    let objectStore = transaction.objectStore("notes");
    let request = objectStore.add(newNote);

    request.onsuccess = function () {
        console.log("New note added");
        addNoteComponent(newNote.note)
        document.getElementById("noteInput").value = "";
    };

    request.onerror = function () {
        console.error("Error adding note");
    };
}

function addNoteComponent(noteName) {
    let noteList = document.getElementById("noteList")
    
    // Create note li
    let li = document.createElement("li")
    li.id = noteName
    li.className = "note"

    // Create styleButton
    let styleButton = document.createElement("button")
    styleButton.textContent = "🎨"
    styleButton.className = "blank-button margin-right inline-block"
    styleButton.id = `style-${noteName}`
    li.appendChild(styleButton)

    // Create checkbox
    let checkbox = document.createElement("button")
    checkbox.textContent = "☐"
    checkbox.className = "blank-button margin-right inline-block"
    checkbox.id = `check-${noteName}`
    li.appendChild(checkbox)

    // Create actions div
    let actions = document.createElement("div")
    actions.className = "actions inline-block"

    // Create delete button
    let deleteBtn = document.createElement("button")
    deleteBtn.textContent = "🗑"
    deleteBtn.className = "blank-button margin-right"
    deleteBtn.id = `delete-${noteName}`

    // Create edit button
    let editBtn = document.createElement("button")
    editBtn.textContent = "🖊"
    editBtn.className = "blank-button margin-right"
    editBtn.id = `edit-${noteName}`

    actions.appendChild(deleteBtn)
    actions.appendChild(editBtn)
    li.appendChild(actions)

    // Add noteName
    let nameParagraph = document.createElement("p")
    nameParagraph.textContent = noteName
    li.appendChild(nameParagraph)
    
    noteList.appendChild(li)
}
    

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
  }