module.exports = function (app,fonction) {
    var axios = require("axios")
    app.post("/createUser",async function(req,res){
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.send(await fonction.createUser(req.body.nomPromo,req.body.numeroGroupe))
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
    app.post('/sendSessionID',async function(req,res){
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            var sessionNumber = await fonction.getSessionNumber(req.body.SESSIONID)
            if (await fonction.GetSessionNumber(req.body.ClientID) == undefined){
                await fonction.AddSessionNumber(req.body.ClientID,sessionNumber)
            }
            if (await fonction.GetSessionNumber(req.body.ClientID) == await fonction.createHash("sha256").update(sessionNumber).digest("hex")){
                var groupe = await fonction.GetUserTDAndPromo(req.body.ClientID)
                if (await fonction.GetGrade(req.body.ClientID,req.body.SESSIONID) != await fonction.GetStoredGrade(req.body.ClientID,groupe.NomPromo,groupe.NuméroGroupe)){
                    await fonction.StoreNewGrade(req.body.ClientID,await fonction.GetGrade(req.body.ClientID,req.body.SESSIONID))
                    if (await fonction.IsUserAwared(req.body.ClientID) == true){
                        await fonction.SetAllTDUserTrue(req.body.ClientID,groupe.NomPromo,groupe.NuméroGroupe)
                        await fonction.SendNotifToGroupe(req.body.ClientID,groupe.NomPromo,groupe.NuméroGroupe)
                    }
                }
                res.send(true)
            }else{
                throw "SessionID is not valid"
            }
        }catch(e){
            console.log(e,await fonction.createHash("sha256").update(sessionNumber).digest("hex"))
            res.send(false)
        }
    })
    app.post('/receiveWebPushData',async function(req,res){
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            fonction.AddNotifData(req.body.ClientID,req.body.PushSubscription.endpoint,req.body.PushSubscription.keys)
            res.send(true)
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
}