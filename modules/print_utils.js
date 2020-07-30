const table_format = require('ascii-data-table').default;

module.exports = {

  markdownPrettyPrint : markdownPrettyPrint,
  uglyPrintScoreboard : uglyPrintScoreboard,
  prettyPrintScoreboard : prettyPrintScoreboard
}

function uglyPrintScoreboard(qres) {

  return '**Hacker Rank Leaderboard**\n' + qres.map( (userdata, i) => {

    let temp;
    
    // WARNING : risky, maybe (idk for what reason) the user isn't cached. will get undefined instead of it's name
    //discord_name = ((temp = client.users.cache.get(userdata.discord_id)) && temp.username) || "not cached";
    return `${qres.length - i}. <@${userdata.discord_id}>  ${userdata.score}`
  }).join("\n");
}

function prettyPrintScoreboard(qres) {

  const toFormat = [];
  let last_challenge_slug, discord_name;

  for (let userdata of qres) {

    // WARNING : risky, maybe (idk for what reason) the user isn't cached. will get undefined instead of it's name
    let temp;
    discord_name = ((temp = client.users.cache.get(userdata.discord_id)) && temp.username) || "not cached";
    last_challenge_slug = userdata.last_challenge_slug || " X "
    toFormat.push([discord_name, userdata.hr_username, userdata.score, last_challenge_slug])
  }
  toFormat.unshift(["discord", "hackerrank", "score", "dernier"])
  return table_format.table(toFormat).replace(/"/g," ");
}

function markdownPrettyPrint(qres) {

      const table = prettyPrintScoreboard(qres).replace('╒', '╞').replace('╕', '╡')
      const title = '** Hacker Rank Leaderboard **'
      const top_bar = `╒${'═'.repeat(table.indexOf('\n') - 2 )}╕`;
      const first_half_spacer = ' '.repeat( Math.ceil((top_bar.length - 2 - title.length)*.5) );
      const scd_half_spacer = ' '.repeat(top_bar.length - first_half_spacer.length - 2 - title.length);
      const middle_bar = `│${first_half_spacer}${title}${scd_half_spacer}│`

      return `\`\`\`${top_bar}\n${middle_bar}\n${table}\`\`\``
}