// require Express.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const uniqid = require('uniqid');

// instantiate the server
const app = express();

// middleware
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('Develop/public'));


const PORT = process.env.PORT || 3001;
// create a route that the front-end can request data from
const { notes } = require('./Develop/db/notes')

// create a new note
function createNewNote(body, notesArray) {
  const note = body;
  notesArray.push(note);
  fs.writeFileSync(
    path.join(__dirname, './Develop/db/notes.json'),
    JSON.stringify({ notes: notesArray }, null, 2)
  );
  // return finished code to post route for response
  return note;
};

function deleteNote(body, notes) {
  const foundNote = body;
  const filteredArray = notes.filter( note => note.id !== foundNote.id);
  console.log(filteredArray)
  fs.writeFileSync(
    path.join(__dirname, './Develop/db/notes.json'),
    JSON.stringify({ notes: filteredArray }, null, 2)
  )
  return filteredArray;
}

// Validate Notes
function validateNote(note) {
  if (!note.title || typeof note.title !== 'string') {
    return false;
  }
  if (!note.text || typeof note.text !== 'string') {
    return false;
  }
  return true;
}

// Find by ID
function findById(id, notesArray) {
  const result = notesArray.filter(note => note.id === id)[0];
  return result;
}



// GET notes should return the notes.html file

// GET * should return the index.html file


// the following API routes should be created:

// GET /api/notes should read the db.json file and return all saved notes as JSon

// POST /api/notes should receive a new note to save on the request body, add it to the db.json file, and then return the new note to the client. 
// You'll need to find a way to give each note a unique id when it saved 
// look into npm packages that could do this for you

app.get('/api/notes',  (req, res) => {
  res.json(notes);
});

// app.get('/notes', (req, res) => {
//   let results = notes;
//   if (req.query) {
//     results 
//   }
// })

app.post('/api/notes', (req, res) => {

  // set id based on what the next index of the array will be
  req.body.id = uniqid.process()
  console.log(req.body.id)
  // notes.length.toString();

  // if any data in req.body is incorrect, send 400 error back
  if (!validateNote(req.body)) {
    res.status(400).send('The note is not properly formatted')
  } else {
  // add note to json file and notes array in this function
  // req.body is where our incoming content will be
  const note = createNewNote(req.body, notes);

  res.json(note);
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const result = findById(req.params.id, notes);
  console.log(result)
  if (result) {
    const returnedNotesArray = deleteNote(result, notes);
    res.json(returnedNotesArray)
  } else {
    res.send(404);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './Develop/public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './Develop/public/notes.html'));
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './Develop/public/index.html'));
});

// tell the server to listen for requests
app.listen(PORT, () => {
  console.log(`API server on port ${PORT}!`)
})
// bonus
// DELETE /api/notes/:id
// should receive a query parameter containing the id of a note to delete. In order to delete a note, you'll need to read all notes from the db.json file, 
// remove the note with the given id property, and then rewrite the notes to the db.json file.