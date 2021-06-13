const db = require('../db');

module.exports = {
    getNotes,
    createNote,
    updateNote,
    getNoteById
}

async function getNotes(userId){
    const user = await validateUser(userId);
    
    return notes = await user.getNotes();
}

async function createNote(note, userId){
    const user = await validateUser(userId);    

    var newNote = await db.Note.create(note);
    newNote.setUser(user);
    return getNoteById(newNote.id);
}

async function updateNote(updNote, noteId){
    const note = await getNoteById(noteId);
    if(!note) throw 'Note not found';

    return note.update(updNote);
}

async function getNoteById(noteId){
    return await db.Note.findByPk(noteId);
}

async function validateUser(userId){
    const user = await db.User.findByPk(userId);
    if(!user) throw "User not found";
    return user;
}