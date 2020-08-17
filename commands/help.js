const { prefix, permissions } = require('../config/maurice_config.json');

module.exports = {
    name: 'help',
    description: 'liste des commandes',
    usage: 'help',
    execute(client, msg, args) {

        const isAdmin = msg.member.roles.cache.get(permissions.admin);
        !permissions.bypass.includes()

        let description = ``
        for (let a of client.commands) {
            if (!(isAdmin || permissions.bypass.includes(a[0]))) continue

            const command = a[1]
            description += `__**+ ${command.name}**__ : *${command.description}*\n`
            description += `----- Usage: ${prefix}${command.usage}\n`
        }

        msg.channel.send({
            content: "Voici la liste des commandes que __**tu**__ peux faire",
            embed : {
                description : description,
                color : 16776960 // YELLOW
            }
        })
    }
};