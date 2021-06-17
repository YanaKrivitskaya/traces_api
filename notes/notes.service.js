const db = require('../db');
const auth = require('../auth/auth.service');
const tagsService = require('../tags/tags.service');

module.exports = {
    getNotes,
    createNote,
    updateNote,
    getNoteById,
    getNoteByIdWithTags,
    deleteNoteTag,
    addNoteTag
}

async function getNotes(userId){
    const user = await auth.getById(userId);
    
    return notes = await user.getNotes({where: {deleted: 0}, include: db.Tag });
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

async function addNoteTag(noteId, body){
    const note = await getNoteById(noteId);
    const tag = await tagsService.getTagById(body.tagId);

    await tag.addNote(note);
    return await getNoteByIdWithTags(noteId);
}

async function deleteNoteTag(noteId, body){
    const note = await getNoteById(noteId);
    const tag = await tagsService.getTagById(body.tagId);

    await tag.removeNote(note);
    return await getNoteByIdWithTags(noteId);
}

async function getNoteById(noteId){
    const note = await db.Note.findByPk(noteId);
    if(!note) throw 'Note not found';
    return note;
}

async function getNoteByIdWithTags(noteId){
    const note = await db.Note.findByPk(noteId, {include: [
        {
            model: db.Tag,
            attributes: ["id", "name"],
            as: "tags",
            through: {
                attributes: [],
            },
        }
    ]});
    if(!note) throw 'Note not found';
    return note;
}