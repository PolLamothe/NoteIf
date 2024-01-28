class Tabs {
    constructor(tabsList, indicator) {
        this.tabsList = tabsList
        this.indicator = indicator
        this.activeTab = tabsList[0]
        this.activeTab[0].addClass("active")
        this.tabsList.forEach(tab => {
            if (tab !== this.activeTab) {
                tab[2].css("display", "none")
            }
        })
    }
    changeActive(tab) {
        if (this.activeTab !== tab) {
            this.activeTab[0].removeClass("active")
            this.activeTab[2].css("display", "none")
            this.activeTab = tab
            this.activeTab[0].addClass("active")
            this.activeTab[2].css("display", "block")
            this.indicator.css("margin-left", tab[1])
        }
    }
    setListener() {
        this.tabsList.forEach(tab =>  {
            tab[0].on('click', () => {
                this.changeActive(tab)
            })
        })
    }
}

let navList = [
    [$('#notifications'), "0", $('#notifTab')],
    [$('#configuration'), "49%", $('#configTab')]
]
let nav = new Tabs(navList, $('#indicator'))
nav.setListener()



$('#notif').on('click', function() {
    let notif = new Notification('Note If : Vous avez une nouvelle note !', {
        icon: 'img/icon_128.png',
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


async function checkNotif(){
    var response = await fetch(IP+"/AmIAwared/"+(await getLocalID()));
    response = await response.json()
    if(response == false){
        chrome.browserAction.setIcon({path: "./img/notif_icon.png"})
    }else{
        chrome.browserAction.setIcon({path: "./img/icon_128.png"})
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