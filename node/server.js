express = require('express');
const bodyParser = require('body-parser')//module qui sert a traiter les données json
const cors = require("cors");
var fonction = require("./function/function.js");
const EventEmitter = require('events'); 

class MonEmetteur extends EventEmitter {}

const monEmetteur = new MonEmetteur();

app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors());

require('./function/get.js')(app,fonction,monEmetteur);
require('./function/post.js')(app,fonction,monEmetteur);

app.listen(3000)