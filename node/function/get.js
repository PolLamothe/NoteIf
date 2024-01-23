module.exports = function (app,fonction) {
    app.get('/', function(req, res) {
        fonction.getNode()
        res.send('Hello World!');
    })
}