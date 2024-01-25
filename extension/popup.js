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

async function getLocalID(){
    var LocalId = new Promise((resolve,reject)=>{
        chrome.storage.local.get('id',(result)=>{
            resolve(result.id)
        })
    })
    return await LocalId
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