const db = require('../db');
const auth = require('../auth/auth.service');

module.exports = {
    getVisas,
    getVisaByIdWithEntries,
    createVisa,
    createVisaEntry,
    getVisaEntryById,
    updateVisa,
    updateVisaEntry,
    deleteVisa,
    deleteVisaEntry
}

async function getVisas(accountId){
   const account = await auth.getAccountById(accountId);

   const visasResponse = await account.getVisas({
       attributes: ["id", "country", "type", "entriesType", "durationOfStay", "createdBy"], 
       where: {deleted: 0},
       include:[
           {
               model: db.User,
               attributes: ["id", "accountId", "name"],
           }
       ]
   });

   return visasResponse;
}

async function getVisaByIdWithEntries(visaId, accountId){
    const account = await auth.getAccountById(accountId);
    await getVisaById(visaId);

    await userOwnsVisa(account, visaId);
 
    const visaResponse = await db.Visa.findByPk(visaId, {
        attributes: ["id", "country", "type", "entriesType", "durationOfStay", "createdBy"], 
        where: {deleted: 0},
        include:[
            {
                model: db.User,
                attributes: ["id", "accountId", "name"],
            },
            {
             model: db.VisaEntry,            
             attributes: [
                 "id", 
                 "entryCountry", 
                 "entryCity",
                 "entryTransport",
                 "entryDate",
                 "hasExit",
                 "exitCountry",
                 "exitCity",
                 "exitTransport",
                 "exitDate"
             ],
         }
        ]
    });
 
    return visaResponse;
 }

 async function getVisaEntryById(visaId, entryId, accountId){
    const account = await auth.getAccountById(accountId);
    await getVisaById(visaId);
    await getEntryById(entryId);

    await userOwnsVisa(account, visaId);
 
    const entryResponse = await db.VisaEntry.findByPk(entryId, {
        attributes: [
            "id", 
            "entryCountry", 
            "entryCity",
            "entryTransport",
            "entryDate",
            "hasExit",
            "exitCountry",
            "exitCity",
            "exitTransport",
            "exitDate"
        ],
    });
 
    return entryResponse;
 }



async function createVisa(visa, userId, accountId){
    const account = await auth.getAccountById(accountId);
    const user = await auth.getUserById(userId);

    await auth.accountOwnsUser(account, user.id);
 
    const newVisa = await db.Visa.create(visa);    

    await newVisa.setAccount(account);
    await newVisa.setUser(user);
 
    const visaResponse = await db.Visa.findByPk(newVisa.id, {
        attributes: ["id", "country", "type", "entriesType", "durationOfStay", "createdBy"],
        include:[
            {
                model: db.User,
                attributes: ["id", "accountId", "name"],
            }
        ]
    });
    return visaResponse;
 }

 async function updateVisa(updVisa, visaId, accountId){
    const account = await auth.getAccountById(accountId);
    const visa = await getVisaById(visaId);

    await userOwnsVisa(account, visaId);
 
    await visa.update(updVisa);   
 
    const visaResponse = await db.Visa.findByPk(visaId, {
        attributes: ["id", "country", "type", "entriesType", "durationOfStay", "createdBy"], 
        where: {deleted: 0},
        include:[
            {
                model: db.User,
                attributes: ["id", "accountId", "name"],
            },
            {
             model: db.VisaEntry,            
             attributes: [
                 "id", 
                 "entryCountry", 
                 "entryCity",
                 "entryTransport",
                 "entryDate",
                 "hasExit",
                 "exitCountry",
                 "exitCity",
                 "exitTransport",
                 "exitDate"
             ],
         }
        ]
    });
    return visaResponse;
 }

 async function deleteVisa(visaId, accountId){
    const account = await auth.getAccountById(accountId);   

    const visa = await getVisaById(visaId);

    await userOwnsVisa(account, visaId);
 
    await db.Visa.destroy(visa);
    
    return "Ok";
 }

 async function deleteVisaEntry(entryId, accountId){
    const account = await auth.getAccountById(accountId);

    const entry = await getEntryById(entryId);
    const visa = await entry.getVisa();

    await userOwnsVisa(account, visa.id);
 
    await db.VisaEntry.destroy(entry);
    
    return "Ok";
 }

 async function createVisaEntry(visaId, visaEntry, accountId){
    const account = await auth.getAccountById(accountId);
    const visa = await getVisaById(visaId);

    await userOwnsVisa(account, visaId);
    
    const newEntry = await db.VisaEntry.create(visaEntry);    

    await newEntry.setVisa(visa);
        
    const entryResponse = await db.VisaEntry.findByPk(newEntry.id, {
        attributes: [
            "id", 
            "entryCountry", 
            "entryCity",
            "entryTransport",
            "entryDate",
            "hasExit",
            "exitCountry",
            "exitCity",
            "exitTransport",
            "exitDate"
        ],
    });
 
    return entryResponse;
 }

 async function updateVisaEntry(entryId, visaEntry, accountId){
    const account = await auth.getAccountById(accountId);
    const entry = await getEntryById(entryId);
    const visa = await entry.getVisa();

    await userOwnsVisa(account, visa.id);
    
    await entry.update(visaEntry);
    
    const entryResponse = await db.VisaEntry.findByPk(entry.id, {
        attributes: [
            "id", 
            "entryCountry", 
            "entryCity",
            "entryTransport",
            "entryDate",
            "hasExit",
            "exitCountry",
            "exitCity",
            "exitTransport",
            "exitDate"
        ],
    });
 
    return entryResponse;
 }

 async function getVisaById(visaId){
    const visa = await db.Visa.findByPk(visaId);
    if(!visa) throw 'Visa not found';
    return visa;
}

async function getEntryById(entryId){
    const entry = await db.VisaEntry.findByPk(entryId);
    if(!entry) throw 'Visa entry not found';
    return entry;
}

async function userOwnsVisa(account, visaId){
    const accountVisas = await account.getVisas({ where: {deleted: 0, id: visaId}});

    if(accountVisas.length == 0) throw "No permissions for this visa";
    return true;
}