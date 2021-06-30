const db = require('../db');
const auth = require('../auth/auth.service');
const tagsService = require('../tags/tags.service');

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNoteByIdWithTags,
    deleteNoteTag,
    addNoteTag
}

async function getNotes(accountId){
    const account = await auth.getAccountById(accountId);
    
    return notes = await account.getNotes({
        where: {deleted: 0}, 
        include: [
            {
                model: db.Tag,
                //attributes: ["id", "name"],
                as: "tags",
                /*through: {
                    attributes: [],
                },*/
            }
        ]
    });
}

async function createNote(note, accountId){
    const account = await auth.getAccountById(accountId);

    var newNote = await db.Note.create(note);
    await newNote.setAccount(account);
    return await getNoteByIdWithTags(newNote.id);
}

async function updateNote(updNote, noteId){
    const note = await getNoteById(noteId);
    
    await note.update(updNote);
    return await getNoteByIdWithTags(noteId);
}

async function deleteNote(noteId, currentAccount){
    const note = await getNoteById(noteId);   
    const account = await auth.getAccountById(currentAccount.id);

    const accountNotes = await account.getNotes({ where: {deleted: 0}});
    account.ownsNote = note => !!accountNotes.find(n => n.id === note.id);

    if(!account.ownsNote) throw "No permissions to delete this note";
    
    await db.Note.update({ 
        deleted: 1,
        deletedDate: Date.now()
     }, {
        where: {
          id: noteId
        }
      });
}

async function addNoteTag(noteId, tagId){
    const note = await getNoteById(noteId);
    const tag = await tagsService.getTagById(tagId);

    await tag.addNote(note);
    return await getNoteByIdWithTags(noteId);
}

async function deleteNoteTag(noteId, tagId){
    const note = await getNoteById(noteId);
    const tag = await tagsService.getTagById(tagId);

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
            as: "tags"
        }
    ]});
    if(!note) throw 'Note not found';
    return note;
}