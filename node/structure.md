### Ce fichier nous sert a stocker et mettre au point la structure JSON des données stockées

**Structure stockage Client** :

```
{
	ClientID : string
	NouvelleNote : bool
    NomPromo : string
    NuméroGroupe : int
    notification : {
        endpoint : string
        keys: {
            p256dh: string,
            auth: string
        }
    }
    SessionNumber : string
}
```

Le ClientID est une chaine de caractère unique servant a identifier chaque utilisateur

NouvelleNote sert a savoir si l'utilisateur a pris conaissance de l'ajout d'une nouvelle note

SessionNumber est le numéro étudiant de l'utilisateur hashé en SHA-256, afin de préserver l'anonymat, cette donnée nous servira a vérifier que la connection qui vient d'être effectuée provient du bonne utilisateur

**Structure stockage Groupe de TD** :
```
{
	NomPromo : string
	NuméroGroupe : int
	Client : [ClientID]
    AllNoteHash : {
        ClientID : NoteHash
    }
    AllDSHash : {
        ClientID : AllDShash
    }
}
```

Client contient tout les ClientID qui appartiennent à ce groupe

NoteHash est un hash SHA-256 généré a partir des données les plus récentes concernant les notes de l'utilisateur, cela nous sert a savoir si une nouvelle note a étée publiée

AllDSHash est un object JSON stockant pour chaque utilisateur, la somme des notes de DS hashée en SHA-256, cela nous servira a savoir si une note de DS a étée publiée et donc a prévenir toute la promo au lieu de juste le groupe de TD