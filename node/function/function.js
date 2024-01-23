var axios = require("axios")
const MongoClient = require('mongodb').MongoClient

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
    var objectId = (await collection.insertOne({})).insertedId
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

module.exports = {
    getNode,
    createUser,
    doesTDExist,
    createTD,
    addUser,
}