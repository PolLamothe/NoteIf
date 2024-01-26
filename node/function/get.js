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
    app.get('/SetAsAwared/:ID',async function(req,res){
        try{
            await fonction.SetUserAsAwared(req.params.ID)   
            res.send(true)
        }catch(e){
            console.log(e)  
            res.send(false)
        }
    })
}