### Ce fichier nous sert a stocker et mettre au point la structure JSON des données stockées

**Structure stockage Client** :

```
{
	ClientID : string
	NouvelleNote : bool
    NomPromo : string
    NuméroGroupe : int
}
```

Le ClientID est une chaine de caractère unique servant a identifier chaque utilisateur

NouvelleNote sert a savoir si l'utilisateur a pris conaissance de l'ajout d'une nouvelle note

**Structure stockage Groupe de TD** :
```
{
	NomPromo : string
	NuméroGroupe : int
	Client : [ClientID]
    AllNoteHash : {
        SESSIONID : NoteHash    
    }
}
```

Client contient tout les ClientID qui appartiennent à ce groupe

NoteHash est un hash SHA-256 généré a partir des données les plus récentes concernant les notes de l'utilisateur, cela nous sert a savoir si une nouvelle note a étée publiée

SESSIONID est une chaine de caractère utilisée par https://notes.iut-nantes.univ-nantes.fr/ comme "clé d'authentification" et qui va donc nous permettre de récupérer les notes d'un utilisateur
AllSESSIONID est un object JSON contenant des SESSIONID de personne appartenant a ce groupe

Le fait de stocker plusieurs SESSIONID est utile car cela rend le programme plus stable car si jamais un des SESSIONID ne fonctionne plus, les autres prendront le relais