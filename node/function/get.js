module.exports = function (app,fonction,monEmetteur) {
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
    app.get("/waitForNotif/:ID",async function(req,res){
        console.log("waitForNotif")
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            monEmetteur.once(req.params.ID, function() {
                res.send(true)
            });
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
}