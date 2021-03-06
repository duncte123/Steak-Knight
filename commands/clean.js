const serv = require("../server.js");
let bot = serv.bot;
const config = require("../config.json")
module.exports = {
  func: async (msg) => {
    // checks for permissions. Either you need to be able to ban members or be me, will work on making cleaner
    if (
      config.ids.includes(msg.author.id) ||
      msg.member.permission.has("banMembers") == true
    ) {
      bot.purgeChannel(msg.channel.id, 20, function (msg) {
        return msg.author.id == "397898847906430976"
      })
    }


  },
  options: {
    description: "Cleans the bot's messages",
    fullDescription: "Cleans all SK's messages from the last 20 sent",
    usage: "`sk clean`"
  },
  name: "clean"
};
