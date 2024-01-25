module.exports = function (app,fonction) {
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
            fonction.StoreNewGrade(req.body.ClientID,await fonction.GetGrade(req.body.ClientID,req.body.SESSIONID))
            res.send(true)
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
    app.post('/receiveWebPushData',async function(req,res){
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            console.log(req.body)
            fonction.AddNotifData(req.body.ClientID,req.body.PushSubscription.endpoint,req.body.PushSubscription.keys)
            res.send(true)
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
}