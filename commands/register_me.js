let { prefix, webUrl } = require('../config/maurice_config.json')
let axios = require('axios')

module.exports = {
    name: 'registerme',
    description: 'lie un compte Hacker Rank à votre utilisateur Discord',
    usage: 'registerme <pseudo_HR>',
    execute(client, msg, args) {

        if (args.length !== 1) {
            msg.reply({
                embed : {
                    description : 'Mauvais nombre d\'arguments donnés. \nEssaye : `' + prefix + this.usage +'`',
                    color : 16711680 // RED
                }
            })
            return;
        }

        console.log(`[discord][register] trying to link HR account ${args[1]} to discord user ${msg.author}`)

        const member = msg.member;
        axios.post(`http://${webUrl}/registerhrusr`,
            {
                discord_id : member.user.id,
                hr_username : args[args.length - 1]
            })
            .then(resp => {

                if (resp.status == 200) {
                    // OK
                    console.log('[discord][register] user registered successfully, updating score')
                    const infos = resp.data;
                    console.log(infos)
                    msg.channel.send({
                        embed : {
                            description : `**${member.user.username}** est maintenant associé au compte Hacker Rank '***${infos.hr_username}**'. Il a déjà réalisé ${infos.more.unknownChallenges.length + infos.more.newChallenges.length} challenges (dont ${infos.more.unknownChallenges.length} non-comptabilisés) ce qui lui octroie un score de ${infos.score} !`,
                            color : 3066993 // GREEN
                        }
                    })
                } else {
                    console.error(`[discord][register] failed to register user ${member.user.id}`)
                    msg.channel.send({
                        embed : {
                            description : `Erreur lors de l'enregistrement du compte Hacker Rank de ${member.user.username}`,
                            color : 16711680 // RED
                        }
                    })
                }
            })
            .catch(err => {
                if (err.response) {
                    console.error(`[discord][register] ${err.response.status} ${err.response.statusText} : ${err.response.data}`)

                    if (err.response.status === 400)
                        msg.reply({
                            embed : {
                                description : `**Erreur** lors de l'association du compte Hacker Rank '**${args[args.length - 1]}**' à l'utilisateur **${member.user.username}**.\n__**Raison**__ : ${err.response.data}`,
                                color : 16711680 // RED
                            }
                        })
                }
                else if (err.errono && err.code && err.address && err.port)
                    console.error(`[discord][register] error ${err.errono} on ${err.syscall} to ${err.address}:${err.port}`)
                else
                    console.error(`[discord][register] unexpected error occurred`, err.stack)
            });
    }
};