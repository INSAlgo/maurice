Maurice, le bot Discord d'[INSAlgo](https://insalgo.fr/)

# Maurice
Challenge, Compétition, Algorithmie

## C'est quoi cette bestiole
Pour stimuler et faire vivre l'association après les [crises majeures](https://prologin.org/news/2020/03/29/prologin-2020-et-le-coronavirus-2019/) de 2020, notre génial bureau a pensé à créer un [robot Discord](https://top.gg/) offrant un nouveau moyen en temps réel de se [mesurer aux autres](https://fr.wikipedia.org/wiki/Bataille_de_pouces), et d'aller toujours plus loin pour progresser dans la discipline.

## Qu'est-ce qu'il va faire exactement?
Au programme, scraping des profiles d'[Hackerrank](https://www.hackerrank.com/) pour établir un scoreboard des résolutions récentes des membres actifs de l'asso. Un cahier des charges précis va suivre.

Actuellement, le bot permet de :
* mettre à jour périodiquement le tableau des scores (période configurable : dans `maurice_config.json`) dans deux channels (un avec affichage joli pour desktop, un avec un affichage moins beau mais plus simple pour les utilisateurs mobile / à petit écran)
* limiter l'accès des commandes à certains channels et à un certain rang (voir section `permissions` dans `maurice_config.json`)
* changer les multiplicateurs de points d'un challenge : `!mult <slug-challenge> <multiplier>`
* changer les multiplicateurs de points des challenges d'une catégorie : `!multcat <category> <multiplier>`
* inscrire un utilisateur dans le scoreboard INSAlgo : `!register @MentionnerL'Utilisateur <compte hackerrank>` 
* forcer le rafraichissement automatique du scoreboard à s'effectuer : `!refreshlb` (ne fonctionne que si la dernière tentative de rafraichissement date de plus de 10 secondes (hardcodé), peu importe le résultat de cette tentative)
* savoir si le bot fonctionne : `!ping`

## Comment ça marche ?
* On remplit les fichiers de config, puis on fait `node server.js`
* L'appli se connecte à notre [base de données](#requirements)
* Un client [discord.js](https://discord.js.org/) se crée et se connecte à l'[API Discord](https://discord.com/developers/docs/intro)
* Un serveur web est aussi créé. Il servira de web API au bot pour communiquer avec [Hackerrank](https://www.hackerrank.com/)
* Le client Discord réagit aux [commandes](https://github.com/INSAlgo/maurice/blob/master/commands/) faites dans les 3 channels donnés dans la config et parle à l'API qui va s'occuper de :
  * communiquer avec [Hackerrank](https://www.hackerrank.com/)
  * recalculer les scores périodiquement (période configurable : dans `web_api_config.json`) et mettre à jour la db
  * executer les requêtes effectuées par **Maurice** et lui renvoyer les résultats
  * d'autres choses (voir les différents [endpoints](https://github.com/INSAlgo/maurice/blob/master/routes))
* Le serveur web réagit aux requêtes faites sur les [endpoints](https://github.com/INSAlgo/maurice/blob/master/routes) prévus puis répond
* Périodiquement, l'API recalcule les points des utilisateurs et **Maurice** met à jour les messages contenant les scoreboard sur discord

## De quoi il a besoin ? <a name="requirements"></a>
* Node ~12.18.2, le reste des modules est normalement installé tout seul par node grâce aux fichiers `package.json` et `package-lock.json`
* Une connexion internet, mais bon c'est logique, c'est un bot discord et un serveur web quand même
* Un [token de bot Discord](https://discord.com/developers/applications)
* Un port ouvert pour les entrées et sorties du serveur web / API
* Une base de données PostgreSQL (à renseigner dans `web_api_config.json`). Les tables du schéma utilisé (le nom de schéma est configurable) peuvent être générées grâce au script [`make_tables.sql`](https://github.com/INSAlgo/maurice/blob/master/sql/make_tables.sql)

## Why
for the [memes](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
