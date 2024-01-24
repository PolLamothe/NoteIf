var axios = require("axios")
const MongoClient = require('mongodb').MongoClient
const Mongo = require('mongodb')
const { createHash } = require('crypto')

const DBName = 'NoteIf'

async function getClient(){
    const url = 'mongodb://127.0.0.1:27017'
    return await MongoClient.connect(url)
}

function getNode(){
    var url = 'https://notes.iut-nantes.univ-nantes.fr/services/data.php?q=dataPremièreConnexion';
    const headers = {
    "Host": "notes.iut-nantes.univ-nantes.fr",
    "Cookie": "PHPSESSID=SESSIONPHP",//a remplacer par le cookie de la session
    "Content-Length": "0",
    "Origin": "https://notes.iut-nantes.univ-nantes.fr"
}
    const data = {};

    // Envoi de la requête POST
    axios.post(url, data, { headers })
        .then(response => {
            // Traitement de la réponse
            console.log(response.data["relevé"]);
        })
        .catch(error => {
            // Gestion des erreurs
            console.error('Erreur lors de la requête:', error.message);
        });
}

async function createUser(NomPromo,NuméroGroupe){
    if (NomPromo == undefined || NuméroGroupe == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var objectId = (await collection.insertOne({NomPromo : NomPromo,NuméroGroupe : NuméroGroupe})).insertedId
    if (!await doesTDExist(NomPromo,NuméroGroupe)){
        await createTD(NomPromo,NuméroGroupe)
    }
    await addUser(NomPromo,NuméroGroupe,objectId)
    return objectId
}

async function doesTDExist(NomPromo,NuméroGroupe){
    if (NomPromo == undefined || NuméroGroupe == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var result = await collection.find({NomPromo: NomPromo, NuméroGroupe: NuméroGroupe}).toArray()
    if (result.length == 0){
        return false
    }
    return true
}

async function createTD(NomPromo,NuméroGroupe){
    if (NomPromo == undefined || NuméroGroupe == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    await collection.insertOne({NomPromo: NomPromo, NuméroGroupe: NuméroGroupe, Client: [],AllSESSIONID:{},AllNoteHash:{}})
}

async function addUser(NomPromo,NuméroGroupe,ClientID){
    if (NomPromo == undefined || NuméroGroupe == undefined || ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var allUser = (await collection.findOne({NomPromo: NomPromo, NuméroGroupe: NuméroGroupe})).Client
    allUser.push(ClientID)
    await collection.updateOne({NomPromo: NomPromo, NuméroGroupe: NuméroGroupe},{$set: {Client: allUser}})
}

async function DoesUserExist(id){
    if(id == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var objectID = id
    var result = await collection.findOne({"_id": objectID})
    if (result != undefined){
        return true
    }
    return false
}

async function InsertSessionID(ClientID,SESSIONID){
    if (ClientID == undefined || SESSIONID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var result = await collection.findOne({"_id" : new Mongo.ObjectId(ClientID)})
    var collection = client.db(DBName).collection('TD')
    result = await collection.findOne({"NomPromo" : result.NomPromo, "NuméroGroupe" : result.NuméroGroupe})
    result.AllSESSIONID[ClientID] = SESSIONID
    await collection.updateOne({"NomPromo" : result.NomPromo, "NuméroGroupe" : result.NuméroGroupe},{$set: {"AllSESSIONID": result.AllSESSIONID}})
}

async function RemoveSessionID(ClientID){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var result = await collection.findOne({"_id" : new Mongo.ObjectId(ClientID)})
    var collection = client.db(DBName).collection('TD')
    result = await collection.findOne({"NomPromo" : result.NomPromo, "NuméroGroupe" : result.NuméroGroupe})
    delete result.AllSESSIONID[ClientID]
    await collection.updateOne({"NomPromo" : result.NomPromo, "NuméroGroupe" : result.NuméroGroupe},{$set: {"AllSESSIONID": result.AllSESSIONID}})
}

async function GetGrade(ClientID){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var group = await GetUserTDAndPromo(ClientID)
    var result = (await collection.findOne({"NomPromo" : group.NomPromo, "NuméroGroupe" : group.NuméroGroupe})).AllSESSIONID[ClientID]
    var url = 'https://notes.iut-nantes.univ-nantes.fr/services/data.php?q=dataPremièreConnexion';
    const headers = {
    "Host": "notes.iut-nantes.univ-nantes.fr",
    "Cookie": "PHPSESSID="+result,//a remplacer par le cookie de la session
    "Content-Length": "0",
    "Origin": "https://notes.iut-nantes.univ-nantes.fr"
    }
    const data = {}
    var moyenne
    try {
        moyenne = (await axios.post(url, data, { headers })).data["relevé"]["semestre"].notes.value
    }catch(e){
        await RemoveSessionID(ClientID)
        return false
    }
    return createHash('sha256').update(moyenne).digest('hex');
}

async function GetUserTDAndPromo(ClientID){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var result = await collection.findOne({"_id" : new Mongo.ObjectId(ClientID)})
    return {"NomPromo": result.NomPromo, "NuméroGroupe": result.NuméroGroupe}
}

async function StoreNewGrade(ClientID){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var group = await GetUserTDAndPromo(ClientID)
    group = await GetTDData(group.NomPromo,group.NuméroGroupe)
    group.AllNoteHash[ClientID] = await GetGrade(ClientID)
    await collection.updateOne({"NomPromo" : group.NomPromo, "NuméroGroupe" : group.NuméroGroupe},{$set: {"AllNoteHash": group.AllNoteHash}})
}

async function GetTDData(NomPromo,NuméroGroupe){
    if (NomPromo == undefined || NuméroGroupe == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var result = await collection.findOne({NomPromo: NomPromo, NuméroGroupe: NuméroGroupe})
    return result
}

module.exports = {
    getNode,
    createUser,
    doesTDExist,
    createTD,
    addUser,
    DoesUserExist,
    InsertSessionID,
    RemoveSessionID,
    GetUserTDAndPromo,
    GetGrade,
    StoreNewGrade,
    GetTDData,
}