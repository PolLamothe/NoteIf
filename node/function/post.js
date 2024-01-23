module.exports = function (app,fonction) {
    app.post("/createUser",async function(req,res){
        console.log(req.body)
        try{
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.send(await fonction.createUser(req.body.nomPromo,req.body.numeroGroupe))
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
}