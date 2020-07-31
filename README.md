Maurice, le bot Discord d'[INSAlgo](https://insalgo.fr/)

# Maurice
Challenge, Compétition, Algorithmie

## C'est quoi cette bestiole
Pour stimuler et faire vivre l'association après les [crises majeures](https://prologin.org/news/2020/03/29/prologin-2020-et-le-coronavirus-2019/) de 2020, notre génial bureau a pensé à créer un [robot Discord](https://top.gg/) offrant un nouveau moyen en temps réel de se [mesurer aux autres](https://fr.wikipedia.org/wiki/Bataille_de_pouces), et d'aller toujours plus loin pour progresser dans la discipline.

## Commandes du bot
* `!ping` Pour savoir si le bot est en marche
* `!dep [département]` Pour avoir des infos fiables et vérifées sur un département insalien (9 dispos, nique le FIMI)
* `!register @<utilisateur_discord> <pseudo_Hackerrank>` Inscrire un utilisateur dans le scoreboard INSAlgo 
* `!mult <slug-challenge> <multiplicateur>` Changer le multiplicateur de points d'un challenge
* `!multcat <categorie> <multiplicateur>` Changer les multiplicateurs de points des challenges d'une catégorie : 
* `!refreshlb` Forcer le rafraichissement automatique du scoreboard à s'effectuer (cooldown=10s)

## Configuration
`TODO`

## Comment ça marche ?
* On remplit les fichiers de config, puis on fait `node server.js`
* L'appli se connecte à notre base de données
* Un client [discord.js](https://discord.js.org/) se crée et se connecte à l'[API Discord](https://discord.com/developers/docs/intro)
* Un serveur web est aussi créé. Il servira de web API au bot pour communiquer avec [Hackerrank](https://www.hackerrank.com/)
* Le client Discord réagit aux [commandes](https://github.com/INSAlgo/maurice/blob/master/commands/) faites dans les 3 channels donnés dans la config et parle à l'API qui va s'occuper de :
  * communiquer avec [Hackerrank](https://www.hackerrank.com/)
  * recalculer les scores périodiquement (période configurable : dans `web_api_config.json`) et mettre à jour la db
  * executer les requêtes effectuées par **Maurice** et lui renvoyer les résultats
  * d'autres choses (voir les différents [endpoints](https://github.com/INSAlgo/maurice/blob/master/routes))
* Le serveur web réagit aux requêtes faites sur les [endpoints](https://github.com/INSAlgo/maurice/blob/master/routes) prévus puis répond
* Périodiquement, l'API recalcule les points des utilisateurs et **Maurice** met à jour les messages contenant les scoreboard sur discord


## Déploiement du bot
(Une fois docker installé)
```bash
git clone https://github.com/INSAlgo/maurice
cd maurice
nano config/maurice_config.json # Mettre le token Discord
docker-compose up -d --build
docker exec -i maurice-db psql -U maurice < sql/make_schema.sql # Charger le schéma postgres
docker-compose down # Relance du serveur
docker-compose up -d
```

Pour arrêter le serveur : `docker-compose down`

Conseil pour le dev : utiliser nodemon en décommentant la ligne dans le Dockerfile pour avoir accès au live-reload 
