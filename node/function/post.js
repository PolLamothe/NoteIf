module.exports = function (app,fonction) {
    app.post("/createUser",async function(req,res){
        try{
            res.send(await fonction.createUser(req.body.nomPromo,req.body.numeroGroupe))
        }catch(e){
            console.log(e)
            res.send(false)
        }
    })
}