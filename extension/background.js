chrome.runtime.onInstalled.addListener(async function() {
    chrome.storage.local.get('id', function(result) {
        var valeur = result.id;
        if (valeur == undefined){
            getNewID()
        }
      });
});

async function getNewID(){
    var response = await fetch("http://localhost:3000/createUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "nomPromo": "BUT1",
            "numeroGroupe": "1"})
        });
        response = await response.json()
        chrome.storage.local.set({'id': response.toString()})
}