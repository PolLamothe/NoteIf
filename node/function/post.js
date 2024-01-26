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
            if (await fonction.GetSessionNumber(req.body.ClientID) == fonction.createHash("sha256").update(sessionNumber).digest("hex")){
                await fonction.StoreNewGrade(req.body.ClientID,await fonction.GetGrade(req.body.ClientID,req.body.SESSIONID))
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