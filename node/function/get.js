module.exports = function (app,fonction) {
    app.get('/doesThisUserExist/:ID',async function(req,res){
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.send(await fonction.DoesUserExist(req.params.ID))
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
    app.get('/AmIAwared/:ID',async function(req,res){
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.send(await fonction.IsUserAwared(req.params.ID))
        }catch(e){
            console.log(e)
            res.send(true)
        }
    })
    app.get("/testNotif/:ID",async function(req,res){
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            await fonction.SendNotif(req.params.ID)
            res.send(true)
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
}