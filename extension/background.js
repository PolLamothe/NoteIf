chrome.webNavigation.onCompleted.addListener(async function(details) {
    var targetUrl = "https://notes.iut-nantes.univ-nantes.fr/"
    if(details.url == targetUrl){
        if (await isSubscribed() == undefined){
            await requestNotificationPermission()
        }
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

async function isSubscribed(){
    var LocalId = new Promise((resolve,reject)=>{
        chrome.storage.local.get('subscribed',(result)=>{
            console.log(result)
            resolve(result.subscribed)
        })
    })
    console.log(await LocalId)
    return await LocalId
}

async function requestNotificationPermission(){
    if ('serviceWorker' in navigator) {
        await navigator.serviceWorker
        .register('./service-worker.js')
        .then((registration) => {
            console.log('Service Worker enregistré avec succès:', registration);
        })
        .catch((error) => {
            console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
        });
        console.log('requestNotificationPermission')
        if ('Notification' in window && navigator.serviceWorker) {
            Notification.requestPermission().then(async (permission) => {
            if (permission === 'granted') {
                await subscribeToPushNotifications()
            }
            });
        }
    }
};

async function subscribeToPushNotifications(){
    console.log('subscribeToPushNotifications')
    if (navigator.serviceWorker) {
        console.log('Service worker dans le Browser')
        await navigator.serviceWorker.ready.then(async (registration) => {
            console.log('le service worker est ready')
            registration.pushManager
            .subscribe({
            userVisibleOnly: true,
            applicationServerKey: "BFiJK1S0uoKcKLzesQYlJ6HBC9OQ0GdKdSnefZmSsaA0FjkfGyItKSuSTvngSpVRcXmS--0tzSlNhi_YzsgaJIU",
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
                    response = await response.json()
                    if (response == true){
                        await chrome.storage.local.set({'subscribed': true})
                    }
                })
            }).catch((error) => {
            console.error('Erreur lors de l\'abonnement aux notifications push:', error);
        })
}}
