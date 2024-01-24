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
        chrome.storage.local.get('id',(result)=>{
            sendSESSIONID(result.id,$('#SESSIONIDInput').val())
        })
    }
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
            if (isIDValid(result.id)){
            }else{
                chrome.storage.local.clear()
            }
        }
    })
    await UpdateSESSIONID()
}

var LocalId = new Promise((resolve,reject)=>{
    chrome.storage.local.get('id',(result)=>{
        resolve(result.id)
    })
})

var LocalsessionID = new Promise((resolve,reject)=>{
    chrome.storage.local.get('sessionID',(result1)=>{
        resolve (result1.sessionID)
    })
})

async function UpdateSESSIONID(){ 
    var sessionID = await LocalsessionID
    var Id = await LocalId
    console.log(Id,sessionID)
    if (sessionID == undefined && Id != undefined){
        $(".SESSIONIDSend").css('display','inherit')
    }else{
        $(".SESSIONIDSend").css('display','none')
    }
}

UpdateSESSIONID()
UpdateClientID()

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
    console.log("j'envoie")
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
        if (response == true){
            chrome.storage.local.set({'sessionID': SESSIONID})
            UpdateSESSIONID()
        }else{
            alert("Une erreur est survenue")
        }
}