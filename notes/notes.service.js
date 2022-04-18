const db = require('../db');
const auth = require('../auth/auth.service');
const tagsService = require('../tags/tags.service');
const tripsService = require('../trips/trips.service');
const { Op, where } = require("sequelize");

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNoteByIdWithTags,
    deleteNoteTag,
    addNoteTag,
    addNoteTrip,
    deleteNoteTrip,
    updateNoteImage,
    getTripNotes
}

async function getNotes(accountId){
    const user = await auth.getUserByAccountId(accountId);
   
    return notes = await user.getNotes({
        attributes: [
            "id",
            "userId",
            "title",
            "content",
            "image",
            "createdDate",
            "updatedDate"
        ],
        where: {deleted: 0}, 
        include: [
            {
                model: db.Tag,
                attributes: ["id", "name"],
                as: "tags",
                through: {attributes: []}
            },
            {
                model: db.Trip,
                attributes: ["id", "name"],
                as: "trip"
            }
        ]
    });
}

async function getTripNotes(accountId, tripId){
    const account = await auth.getAccountById(accountId);

    await tripsService.userOwnsTrip(account, tripId);

    const notesResponse = await getTripNotesResponse(tripId);
 
    return notesResponse;
 }

async function createNote(note, accountId){    
    const user = await auth.getUserByAccountId(accountId);

    var newNote = await db.Note.create(note);
    await newNote.setUser(user);
    return await getNoteByIdWithTags(newNote.id);
}

async function updateNote(updNote, noteId){
    const note = await getNoteById(noteId);
    
    await note.update(updNote);
    return await getNoteByIdWithTags(noteId);
}

async function deleteNote(noteId, currentAccount){
    const user = await auth.getUserByAccountId(currentAccount.id);

    await userOwnsNote(user, noteId);
    
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

async function addNoteTrip(noteId, tripId){
    const note = await getNoteById(noteId);
    const trip = await tripsService.getTripById(tripId);

    await note.setTrip(trip);
    return await getNoteByIdWithTags(noteId);
}

async function deleteNoteTrip(noteId, tripId){
    const note = await getNoteById(noteId);
    const trip = await tripsService.getTripById(tripId);

    await trip.removeNote(note);
    return await getNoteByIdWithTags(noteId);
}

async function updateNoteImage(noteId, image, accountId){
    const account = await auth.getUserByAccountId(accountId);    

    const note = await getNoteById(noteId);

    await userOwnsNote(account, note.id);
    if(image != null){
        note.image = image.buffer;
    }else{
        note.image = null;
    }   

    await note.save();
 
    return await getNoteByIdWithTags(noteId);
 }

 async function getNoteById(noteId){
    const note = await db.Note.findByPk(noteId);
    if(!note) throw 'Note not found';
    return note;
}

async function getNoteByIdWithTags(noteId){
    const note = await db.Note.findByPk(noteId, {
        attributes: [
            "id",
            "userId",
            "title",
            "content",
            "image",
            "createdDate",
            "updatedDate"
        ],
        include: [
        {
            model: db.Tag,
            attributes: ["id", "name"],
            as: "tags",
            through: {attributes: []}
        },
        {
            model: db.Trip,
            attributes: ["id", "name"],
            as: "trip",
            //through: {attributes: []}
        }
    ]});
    if(!note) throw 'Note not found';
    return note;
}

async function getTripNotesResponse(tripId){
    const notesResponse = await db.Note.findAll(
        {  attributes: [
            "id",
            "userId",
            "title",
            "content",
            "image",
            "createdDate",
            "updatedDate"
        ],
        where: {[Op.and]:[
            {
                tripId: tripId,
                deleted: 0
            }
           ]},
        include: [
            {
                model: db.Tag,
                attributes: ["id", "name"],
                as: "tags",
                through: {attributes: []}
            },
            {
                model: db.Trip,
                attributes: ["id", "name"],
                as: "trip"
            }
        ]
    });
 
    return notesResponse;
}

async function userOwnsNote(user, noteId){
    const accountNotes = await user.getNotes({ where: {deleted: 0, id: noteId}});

    if(accountNotes.length == 0) throw "No permissions for this note";
    return true;
}