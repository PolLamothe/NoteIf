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
            await fonction.InsertSessionID(req.body.ClientID,req.body.SESSIONID)
            res.send(true)
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
    app.post('/removeSessionID',async function(req,res){
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            await fonction.RemoveSessionID(req.body.ClientID)
            res.send(true)
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
}