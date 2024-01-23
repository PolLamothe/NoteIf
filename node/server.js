express = require('express');
const bodyParser = require('body-parser')//module qui sert a traiter les données json
var fonction = require("./function/function.js");
app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());

require('./function/get.js')(app,fonction);
require('./function/post.js')(app,fonction);

app.listen(3000)