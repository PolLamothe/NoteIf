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

requestNotificationPermission()

async function requestNotificationPermission(){
    console.log('requestNotificationPermission')
    if ('Notification' in window && navigator.serviceWorker) {
        Notification.requestPermission().then(async (permission) => {
        if (permission === 'granted') {
            await subscribeToPushNotifications()
        }
        });
    }
};

async function subscribeToPushNotifications(){
    console.log('subscribeToPushNotifications')
    if (navigator.serviceWorker) {
        console.log('Service worker dans le Browser')
        navigator.serviceWorker.ready.then((registration) => {
            console.log('le service worker est ready')
        registration.pushManager
            .subscribe({
            userVisibleOnly: true,
            applicationServerKey: "BIqB-A5ylsWSFARgxJtEdrGy8-gXjzVOG162fPG5WZjz4EYGH_13ytbogRDTnoids3yB9AW9n1g8n224mQpYKgo",
            })
            .then(async (sub) => {
                console.log('starting function')
                var response = await fetch(IP+"/receiveWebPushData",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "PushSubscription": sub,
                        "ClientID": await getLocalID()})
                    })
                })
            .catch((error) => {
            console.error('Erreur lors de l\'abonnement aux notifications push:', error);
            })
        })
}}
