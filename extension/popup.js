$('#button').on('click', function() {
    chrome.cookies.get({"url":"https://notes.iut-nantes.univ-nantes.fr/","name":"PHPSESSID"}, function(cookie) {
        console.log(cookie.value)
    })})

$('#notif').on('click', function() {
    let notif = new Notification('Vous avez une nouvelle note !', {
        body: "Nouvelle note dans la matière R101",
    });
})

$('#registerValidate').on('click', async function() {
    if ($('#PromoInput').val() == "" || $('#TDInput').val() == ""){
        alert("Veuillez remplir tout les champs")
    }else{  
        await getNewID($('#PromoInput').val(),$('#TDInput').val())
        chrome.storage.local.get('id',(result)=>{
            id = result.id
            if (isIDValid(id)){
                UpdateClientID()
            }
        })
    }
})

$('#SESSIONIDButton').on('click',async function(){
    if($('#SESSIONIDInput').val()==""){
        alert("Veuillez remplir tout les champs")
    }else{
        sendSESSIONID(await getLocalID(),$('#SESSIONIDInput').val())
    }
})


$("#DeleteSESSIONIDButton").on('click',async function(){
    deleteSessionID(await getLocalID())
})

const IP = "http://localhost:3000"

async function UpdateClientID(){
    await chrome.storage.local.get('id',(result)=>{
        if (result.id == undefined){
            $('#GlobalDiv').css('display','none')
            $('#NotRegisteredDiv').css('display','inherit')
        }else{
            $('#GlobalDiv').css('display','inherit')
            $('#NotRegisteredDiv').css('display','none')
            if (!isIDValid(result.id)){
                chrome.storage.local.clear()
            }
        }
    })
}

UpdateClientID()
UpdateSESSIONID()

async function getLocalID(){
    var LocalId = new Promise((resolve,reject)=>{
        chrome.storage.local.get('id',(result)=>{
            resolve(result.id)
        })
    })
    return await LocalId
}

async function getLocalSESSIONID(){
    var LocalsessionID = new Promise((resolve,reject)=>{
        chrome.storage.local.get('sessionID',(result1)=>{
            resolve (result1.sessionID)
        })
    })
    return await LocalsessionID
}


async function UpdateSESSIONID(){ 
    var sessionID = await getLocalSESSIONID()
    var Id = await getLocalID()
    console.log(sessionID,Id)
    if (sessionID == undefined && Id != undefined){
        $("#SESSIONIDDiv").css('display','inherit')
        $('#DeleteSESSIONIDButton').css('display','none')
    }else{
        $("#SESSIONIDDiv").css('display','none')
        $('#DeleteSESSIONIDButton').css('display','inherit')
    }
}


async function getNewID(Promo,TD){
    var response = await fetch(IP+"/createUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "nomPromo": Promo,
            "numeroGroupe": TD})
        });
        response = await response.json()
        chrome.storage.local.set({'id': response.toString()})
        UpdateClientID()
}

async function isIDValid(id){
    var response = await fetch(IP+"/doesThisUserExist/"+id, {
        method: "GET"})
        response = await response.json()
        return response
}

async function sendSESSIONID(ClientID,SESSIONID){
    var response = await fetch(IP+"/sendSessionID", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "ClientID": ClientID,
            "SESSIONID": SESSIONID})
    });
    response = await response.json()
    console.log(response)
    if (response == true){
        chrome.storage.local.set({'sessionID': SESSIONID})
        UpdateSESSIONID()
    }else{
        alert("Une erreur est survenue")
    }

}

async function deleteSessionID(ClientID){
    var response = await fetch(IP+"/removeSessionID", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "ClientID": ClientID})
    });
    response = await response.json()
    if (response == true){
        await chrome.storage.local.remove('sessionID')
        UpdateSESSIONID()
    }else{
        alert("Une erreur est survenue")
    }
}