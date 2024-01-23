### Ce fichier nous sert a stocker et mettre au point la structure JSON des données stockées

**Structure stockage Client-SESSIONID** :

```json
{
	ClientID : string
	SESSIONID : string
	NouvelleNote : bool
}
```

Le ClientID est une chaine de caractère unique servant a identifier chaque utilisateur

SESSIONID est une chaine de caractère utilisée par https://notes.iut-nantes.univ-nantes.fr/ comme "clé d'authentification" et qui va donc nous permettre de récupérer les notes d'un utilisateur

NouvelleNote sert a savoir si l'utilisateur a pris conaissance de l'ajout d'une nouvelle note

**Structure stockage Groupe de TD** :
```json
{
	NomPromo : string	
	NuméroGroupe : int
	Client : [ClientID]
}
```

Client contient tout les ClientID qui appartiennent à ce groupe