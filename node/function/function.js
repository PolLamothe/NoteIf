var axios = require("axios")
const MongoClient = require('mongodb').MongoClient
const Mongo = require('mongodb')
const { createHash } = require('crypto')
const webpush = require('web-push')
var vapidKey = require("./vapidKey.js")

webpush.setVapidDetails(
    'mailto:',
    "BFiJK1S0uoKcKLzesQYlJ6HBC9OQ0GdKdSnefZmSsaA0FjkfGyItKSuSTvngSpVRcXmS--0tzSlNhi_YzsgaJIU",
    vapidKey.privateKey
  );

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
    await collection.insertOne({NomPromo: NomPromo, NuméroGroupe: NuméroGroupe, Client: [],AllNoteHash:{}})
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

async function getSessionNumber(SESSIONID){
    var url = 'https://notes.iut-nantes.univ-nantes.fr/services/data.php?q=dataPremièreConnexion';
    const headers = {
    "Host": "notes.iut-nantes.univ-nantes.fr",
    "Cookie": "PHPSESSID="+SESSIONID,//a remplacer par le cookie de la session
    "Content-Length": "0",
    "Origin": "https://notes.iut-nantes.univ-nantes.fr"
    }
    const data = {}
    return (await axios.post(url,data,{headers})).data["config"].session
}

async function GetGrade(ClientID,SESSIONID){
    if (ClientID == undefined || SESSIONID == undefined){
        throw "missing argument"
    }
    var url = 'https://notes.iut-nantes.univ-nantes.fr/services/data.php?q=dataPremièreConnexion';
    const headers = {
    "Host": "notes.iut-nantes.univ-nantes.fr",
    "Cookie": "PHPSESSID="+SESSIONID,//a remplacer par le cookie de la session
    "Content-Length": "0",
    "Origin": "https://notes.iut-nantes.univ-nantes.fr"
    }
    const data = {}
    var moyenne
    try {
        moyenne = (await axios.post(url, data, { headers })).data["relevé"]["semestre"].notes.value
    }catch(e){
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

async function StoreNewGrade(ClientID,Grade){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var group = await GetUserTDAndPromo(ClientID)
    group = await GetTDData(group.NomPromo,group.NuméroGroupe)
    if (group.AllNoteHash[ClientID] != Grade){
        console.log("new grade")
    }
    group.AllNoteHash[ClientID] = Grade
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

async function AddNotifData(ClientID,endpoint,keys){
    if (ClientID == undefined || endpoint == undefined || keys == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    await collection.updateOne({"_id" : new Mongo.ObjectId(ClientID)},{$set: {"notification":{"endpoint": endpoint, "keys": keys}}})
}

async function SendNotif(ClientID){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var result = await collection.findOne({"_id" : new Mongo.ObjectId(ClientID)})
    result = result.notification
    const pushSubscription = {
        endpoint: result.endpoint,
        keys: result.keys
    }
    webpush.sendNotification(pushSubscription)
}

async function AddSessionNumber(ClientID,SessionNumber){
    if (ClientID == undefined || SessionNumber == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var result = await collection.findOne({"_id" : new Mongo.ObjectId(ClientID)})
    result.SessionNumber = createHash('sha256').update(SessionNumber).digest('hex');
    await collection.updateOne({"_id" : new Mongo.ObjectId(ClientID)},{$set: {"SessionNumber": result.SessionNumber}})
}

async function GetSessionNumber(ClientID){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var result = await collection.findOne({"_id" : new Mongo.ObjectId(ClientID)})
    return result.SessionNumber
}

async function SetAllTDUserTrue(ClientID,nomPromo,NuméroTD){
    if(ClientID == undefined || nomPromo == undefined || NuméroTD == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var result = await collection.findOne({"NomPromo" : nomPromo,"NuméroGroupe":NuméroTD})
    result = result.Client
    for(i=0;i<result.length;i++){
        if(result[i] != ClientID){
            SetUserToTrue(result[i])
        }   
    }
}

async function SetUserToTrue(ClientID){
    if(ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    await collection.updateOne({"_id" : new Mongo.ObjectId(ClientID)},{$set: {"NouvelleNote": true}})
}

async function SendNotifToGroupe(ClientID,nomPromo,NuméroTD){
    if (nomPromo == undefined || NuméroTD == undefined || ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var result = await collection.findOne({"NomPromo" : nomPromo,"NuméroGroupe":NuméroTD})
    result = result.Client
    for(i=0;i<result.length;i++){
        if (result[i] != ClientID){
            SendNotif(result[i])
        }
    }
}

async function GetStoredGrade(ClientID,nomPromo,NuméroTD){
    if(ClientID == undefined || nomPromo == undefined || NuméroTD == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var result = await collection.findOne({"NomPromo" : nomPromo,"NuméroGroupe":NuméroTD})
    return result.AllNoteHash[ClientID]
}

async function IsUserAwared(ClientID){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    var result = await collection.findOne({"_id" : new Mongo.ObjectId(ClientID)})
    return !result.NouvelleNote
}

async function SetUserAsAwared(ClientID){
    if (ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('Client')
    await collection.updateOne({"_id" : new Mongo.ObjectId(ClientID)},{$set : {"NouvelleNote": false}})
}

module.exports = {
    getNode,
    createUser,
    doesTDExist,
    createTD,
    addUser,
    DoesUserExist,
    GetUserTDAndPromo,
    GetGrade,
    StoreNewGrade,
    GetTDData,
    AddNotifData,
    SendNotif,
    AddSessionNumber,
    GetSessionNumber,
    createHash,
    getSessionNumber,
    SetUserToTrue,
    SetAllTDUserTrue,
    SendNotifToGroupe,
    GetStoredGrade,
    IsUserAwared,
    SetUserAsAwared,
}