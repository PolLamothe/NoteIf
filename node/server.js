express = require('express');
var axios = require('axios');
app = express();

function getNode(){
    var url = 'https://notes.iut-nantes.univ-nantes.fr/services/data.php?q=dataPremièreConnexion';
    const headers = {
    "Host": "notes.iut-nantes.univ-nantes.fr",
    "Cookie": "PHPSESSID=SESSIONPHP",//a remplacer par le cookie de la session
    "Content-Length": "0",
    "Origin": "https://notes.iut-nantes.univ-nantes.fr"
}
    const data = {};

    // Envoi de la requête POST
    axios.post(url, data, { headers })
        .then(response => {
            // Traitement de la réponse
            console.log(response.data["relevé"]);
        })
        .catch(error => {
            // Gestion des erreurs
            console.error('Erreur lors de la requête:', error.message);
        });
}

app.get('/', function(req, res) {
    getNode();
    res.send('Hello World!');
})

app.listen(3000)