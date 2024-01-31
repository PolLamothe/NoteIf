var axios = require("axios")
const MongoClient = require('mongodb').MongoClient
const Mongo = require('mongodb')
const { createHash } = require('crypto')
const webpush = require('web-push')
var vapidKey = require("./vapidKey.js")
const { error } = require("console")

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
    await collection.insertOne({NomPromo: NomPromo, NuméroGroupe: NuméroGroupe, Client: [],AllNoteHash:{},AllDSHash:{}})
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

async function getSessionNumber(ServerData){
    if(ServerData == undefined){
        throw "missing argument"
    }
    try{
        return await ServerData.config.session
    }catch(e){
        throw "error"
    }
}

async function GetGrade(ClientID,ServerData){
    if (ClientID == undefined || ServerData == undefined){
        throw "missing argument"
    }
    try {
        moyenne = ServerData["relevé"]["semestre"].notes.value
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
    try{
        result = result.notification
        const pushSubscription = {
            endpoint: result.endpoint,
            keys: result.keys
        }
        webpush.sendNotification(pushSubscription)
    }catch(e){
        throw "notification error" 
    }
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

async function getServerData(SESSIONID){
    if(SESSIONID == null){
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
    return await (await axios.post(url, data, { headers })).data
}

async function getDSHash(ServerData){
    if(ServerData == undefined){
        throw "missing argument"
    }
    try{
        ServerData = ServerData.relevé.ressources
        var sum = 0
        for (const property in ServerData){
            var currentRessource = ServerData[property]
            for (i in currentRessource.evaluations){
                var currentEval = currentRessource.evaluations[i]
                if(currentEval.description == "DS"){
                    if (currentEval.note.value != "~"){
                        sum += currentEval.note.value
                    }
                }
            }
        }
        return createHash("sha256").update(sum.toString()).digest("hex")
    }catch(e){
        console.log(e)
        throw error
    }
}

async function setAllPromoUserToTrue(ClientID,Promo){
    if(Promo == undefined || ClientID == undefined){
        throw "missing argument in setAllPromoUserToTrue"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var result = await collection.find({NomPromo : Promo}).toArray()
    for (i in result){
        SetAllTDUserTrue(ClientID,Promo,result[i].NuméroGroupe)
    }
}

async function SendNotifToPromo(ClientID,Promo){
    if(Promo == undefined || ClientID == undefined){
        throw "missing argument in SendNotifToPromo"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var result = await collection.find({NomPromo : Promo}).toArray()
    for (i in result){
        SendNotifToGroupe(ClientID,Promo,result[i].NuméroGroupe)
    }
}

async function GetLocalUserDSHash(ClientID){
    if(ClientID == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var groupe = await GetUserTDAndPromo(ClientID)
    var result = await collection.findOne({NomPromo : groupe.NomPromo,NuméroGroupe : groupe.NuméroGroupe})
    return result.AllDSHash[ClientID]
}

async function UpdateDSHash(ClientID,DSHash){
    if(ClientID == undefined || DSHash == undefined){
        throw "missing argument"
    }
    var client = await getClient()
    var collection = client.db(DBName).collection('TD')
    var groupe = await GetUserTDAndPromo(ClientID)
    var result = await collection.findOne({NomPromo : groupe.NomPromo,NuméroGroupe : groupe.NuméroGroupe})
    result.AllDSHash[ClientID] = DSHash
    await collection.updateOne({NomPromo : groupe.NomPromo,NuméroGroupe : groupe.NuméroGroupe},{$set : {AllDSHash : result.AllDSHash}})
}

module.exports = {
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
    getServerData,
    getDSHash,
    setAllPromoUserToTrue,
    SendNotifToPromo,
    GetLocalUserDSHash,
    UpdateDSHash,
}