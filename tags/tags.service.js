const db = require('../db');
const auth = require('../auth/auth.service');

module.exports = {
    getTags,
    createTag,
    updateTag,
    getTagById
}

async function getTags(accountId){
    const account = await auth.getAccountById(accountId);

    return notes = await account.getTags({where: {deleted: 0}});
}

async function createTag(tag, accountId){
    const account = await auth.getAccountById(accountId);    

    var newTag = await db.Tag.create(tag);
    await newTag.setAccount(account);
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