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
  			    "url": "http://" + baseUrl + "/res/" + this.abv + ".png"
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
			TC : new Departement("Télécommunications, Services & Usages", "TC", "/res/departs/TC.png", "https://telecom.insa-lyon.fr/", "alo la ter issi la lunne"),
			GE : new Departement("Génie Electrique", "GE", "/res/departs/GE.png", "https://ge.insa-lyon.fr/", "tazer bzzt bzzt elektrisité lol"),
			IF : new Departement("Informatique", "IF", "/res/departs/IF.png", "https://if.insa-lyon.fr/", "\"l1nUx m4sT3r r4c3\""),
			GM : new Departement("Génie Mécanique", "GM", "/res/departs/GM.png", "https://gm.insa-lyon.fr/", "vroum voitur haha marto lol maital"),
			GEN : new Departement("Génie Energétique et Environnement", "GEN", "/res/departs/GEN.png", "https://gen.insa-lyon.fr/", "haha nuclear go brrrr"),
			SGM : new Departement("Science et Génie des Matériaux", "SGM", "/res/departs/SGM.png", "https://sgm.insa-lyon.fr/", "ça c du bon plastoc"),
			GI : new Departement("Génie Industriel", "GI", "/res/departs/GI.png", "https://gi.insa-lyon.fr/", "haha conveyor belt go brrrrr"),
			GCU : new Departement("Génie Civil et Urbanisme", "GCU", "/res/departs/GCU.png", "https://www.insa-lyon.fr/fr/formation/genie-civil-et-urbanisme/", "tkt met du scotch ça tient"),
			BS : new Departement("Biosciences", "BS", "/res/departs/BS.png", "https://biosciences.insa-lyon.fr/", "fake hospital"),
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