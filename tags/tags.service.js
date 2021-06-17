const db = require('../db');
const auth = require('../auth/auth.service');

module.exports = {
    getTags,
    createTag,
    updateTag,
    getTagById
}

async function getTags(userId){
    const user = await auth.getUserById(userId);

    return notes = await user.getTags({where: {deleted: 0}});
}

async function createTag(tag, userId){
    const user = await auth.getUserById(userId);

    var newTag = await db.Tag.create(tag);
    await newTag.setUser(user);
    return newTag;
}

async function updateTag(updTag, tagId){
    const tag = await getTagById(tagId);   

    return tag.update(updTag);
}

async function getTagById(tagId){
    const tag = await db.Tag.findByPk(tagId);
    if(!tag) throw 'Tag not found';
    return tag;
}