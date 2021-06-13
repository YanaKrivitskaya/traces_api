const db = require('../db');
const auth = require('../auth/auth.service');

module.exports = {
    getNotes,
    createNote,
    updateNote,
    getNoteById
}

async function getNotes(userId){
    const user = await auth.getById(userId);
    
    return notes = await user.getNotes({where: {deleted: 0}});
}

async function createNote(note, userId){
    const user = await auth.getById(userId);

    var newNote = await db.Note.create(note);
    await newNote.setUser(user);
    return newNote;
}

async function updateNote(updNote, noteId){
    const note = await getNoteById(noteId);
    
    return note.update(updNote);
}

async function getNoteById(noteId){
    const note = await db.Note.findByPk(noteId);
    if(!note) throw 'Note not found';
    return note;
}