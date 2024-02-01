chrome.webNavigation.onCompleted.addListener(async function(details) {
    var targetUrl = "https://notes.iut-nantes.univ-nantes.fr/"
    if(details.url == targetUrl){
        if (await isSubscribed() == undefined){
            await requestNotificationPermission()
        }
        chrome.cookies.get({"url":"https://notes.iut-nantes.univ-nantes.fr/","name":"PHPSESSID"}, async function(cookie) {
            await sendSESSIONID(await getLocalID(),cookie.value)
            checkNotif()
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

async function checkNotif(){
    var response = await fetch(IP+"/AmIAwared/"+(await getLocalID()));
    response = await response.json()
    if(response == false){
        chrome.browserAction.setIcon({path: "./img/notif_icon.png"})
    }else{
        chrome.browserAction.setIcon({path: "./img/icon_128.png"})
    }
}

checkNotif()

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
            resolve(result.subscribed)
        })
    })
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

async function checkServiceWorker(){
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (event) => {
            checkNotif();
           });
    }else{
        console.log("serviceWorker not in navigator")
        while(true){
            await fetch(IP+"/waitForNotif/"+(await getLocalID()))
            await checkNotif()
            let notif = new Notification('Vous avez une nouvelle note !', {
                body: "Une nouvelle note a étée publié sur notes.iut-nantes.univ-nantes.fr",
            });
        }
    }
}

checkServiceWorker()