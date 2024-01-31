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
            var serverData = await fonction.getServerData(req.body.SESSIONID)
            var sessionNumber = await fonction.getSessionNumber(serverData)
            if (await fonction.GetSessionNumber(req.body.ClientID) == undefined){
                if (await fonction.IsClientNumberAlreadyUsed(sessionNumber) == false){
                    await fonction.AddSessionNumber(req.body.ClientID,sessionNumber)
                }else{
                    await fonction.deleteUser(await fonction.getIDFromNumber(sessionNumber))
                    await fonction.AddSessionNumber(req.body.ClientID,sessionNumber)
                }
            }
            if (await fonction.GetSessionNumber(req.body.ClientID) == await fonction.createHash("sha256").update(sessionNumber).digest("hex")){ //si le nom d'utilisateur de sessionID est le même que celui dui sessionID
                var groupe = await fonction.GetUserTDAndPromo(req.body.ClientID)
                try{
                    if (await fonction.GetGrade(req.body.ClientID,serverData) != await fonction.GetStoredGrade(req.body.ClientID,groupe.NomPromo,groupe.NuméroGroupe)){//si la moyenne a changé
                        await fonction.StoreNewGrade(req.body.ClientID,await fonction.GetGrade(req.body.ClientID,serverData))
                        if (await fonction.IsUserAwared(req.body.ClientID) == true){ // Si l'utilisateur n'a pas de nouvelle note en attente
                            if(await fonction.GetLocalUserDSHash(req.body.ClientID) == "error"){
                                await fonction.UpdateDSHash(req.body.ClientID,await fonction.getDSHash(serverData))
                            }
                            if (await fonction.GetLocalUserDSHash(req.body.ClientID) == await fonction.getDSHash(serverData)){ //Si la somme des notes de DS n'a pas changé
                                await fonction.SetAllTDUserTrue(req.body.ClientID,groupe.NomPromo,groupe.NuméroGroupe)
                                await fonction.SendNotifToGroupe(req.body.ClientID,groupe.NomPromo,groupe.NuméroGroupe)
                            }else{
                                await fonction.UpdateDSHash(req.body.ClientID,await fonction.getDSHash(serverData))
                                await fonction.setAllPromoUserToTrue(req.body.ClientID,groupe.NomPromo)
                                await fonction.SendNotifToPromo(req.body.ClientID,groupe.NomPromo)
                            }
                        }
                }
                }catch(e){
                    console.log(e)
                    throw "Error while checking grade"
                }
                await fonction.SetUserAsAwared(req.body.ClientID)
                res.send(true)
            }else{
                throw "SessionID is not valid"
            }
        }catch(e){
            console.log(e)
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