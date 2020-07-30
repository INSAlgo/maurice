// aucune idée du scope de ce truc mais ça marche
let baseUrl = "";

class Departement {
	
	constructor(nom, abv, img_path, link, doodoo) {

		this.nom = nom;
		this.abv = abv;
		this.link = link;
		this.img_path = img_path
		this.dumb_ass_answer_txt = doodoo;
	}

	respond(msg) {


		msg.channel.send(
		{
  			"embed": {
  			  "title": "Nom complet : " + this.nom,
  			  "color": 4275708,
  			  "image": {
  			    "url": this.img_path
  			  },
  			  "footer": {
  			    "text": "Logo officiel |  " + this.link
  			  },
  			  "author": {
  			    "name": "Voici plus d'infos sur le Départ' " + this.abv
    		  }
  			}
		});

		return true;
	}
}

module.exports = function(url) {
	
		baseUrl = url;
		return {
			baseUrl : url,
			prefix : "!",
			TC : new Departement("Télécommunications, Services & Usages", "TC", "https://i.imgur.com/rI6ZiJp.png", "https://telecom.insa-lyon.fr/", "alo la ter issi la lunne"),
			GE : new Departement("Génie Electrique", "GE", "https://i.imgur.com/5k2JHx1.png", "https://ge.insa-lyon.fr/", "tazer bzzt bzzt elektrisité lol"),
			IF : new Departement("Informatique", "IF", "https://i.imgur.com/rM1sZvR.png", "https://if.insa-lyon.fr/", "\"l1nUx m4sT3r r4c3\""),
			GM : new Departement("Génie Mécanique", "GM", "https://i.imgur.com/CM3mmkk.png", "https://gm.insa-lyon.fr/", "vroum voitur haha marto lol maital"),
			GEN : new Departement("Génie Energétique et Environnement", "GEN", "https://i.imgur.com/vvepEs4.png", "https://gen.insa-lyon.fr/", "haha nuclear go brrrr"),
			SGM : new Departement("Science et Génie des Matériaux", "SGM", "https://i.imgur.com/cY6BUCy.png", "https://sgm.insa-lyon.fr/", "ça c du bon plastoc"),
			GI : new Departement("Génie Industriel", "GI", "https://i.imgur.com/hJ7EQfY.png", "https://gi.insa-lyon.fr/", "haha conveyor belt go brrrrr"),
			GCU : new Departement("Génie Civil et Urbanisme", "GCU", "https://i.imgur.com/1CP0G3C.png", "https://www.insa-lyon.fr/fr/formation/genie-civil-et-urbanisme/", "tkt met du scotch ça tient"),
			BS : new Departement("Biosciences", "BS", "https://i.imgur.com/EDeElRK.png", "https://biosciences.insa-lyon.fr/", "fake hospital"),
			tryDeparts : function(str, msg) {

				for (obj in this) {
					if (this[obj].constructor.name === "Departement" && str.toUpperCase() === this[obj].abv) {
		
						console.log("found the depart :")
						console.log(this[obj])
						return this[obj].respond(msg);
					}
				}
		
				return false;
			}
		}
	}