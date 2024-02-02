
<div align="center">

![Note If { }](extension/img/logo_noteIf_banner.png)

![GitHub contributors](https://img.shields.io/github/contributors/PolLamothe/NoteIf?style=for-the-badge&logo=github&labelColor=%23152039&color=%23ffe34f)
</div>

NoteIf est un projet open source qui sert aux étudiants de l'IUT de nantes à être averti à chaque nouvelle note publiée sur leu bulletin.

# Installation
*if you want to run it locally*

In the node folder and in the extension folder:

*install all the node modules required*
```
npm install
```

Setup Mongodb :

**run this command to connect to your local MONGODB**
```
mongosh
```
Once you'r connected to the mongodb database, run this to create the required database:
```
use NoteIf
```
Now that you are into this database, run these commands to create the required collections :
```
db.createCollection('Client')
db.createCollection('TD')
```

Then go back to the node folder and run this to start the server :
```
nodemon server
```

# Vapid key

to use the service worker system you need to use vapid key and so, generate them and make them accessible from the server

generate your vapid key with this command : `./node/node_modules/.bin/web-push generate-vapid-keys`

create a `vapidKey.js` file in the `node/function` folder with this content :

```
const privateKey = "YOUR_PRIVATE_KEY"
const publicKey = "YOUR_PUBLIC_KEY"

module.exports = {privateKey,publicKey}
```

### Tech Stack
+ Node JS
+ Mongo DB