

module.exports = {
    func: async (msg, args) => {
        // checks for permissions. Either you need to be able to ban members or be me, will work on making cleaner
        if ((msg.author.id == "107563269484490752") || (msg.member.permission.has("banMembers") == true))
        // super duper messy but works, deletes its own messages
        msg.channel.getMessages(parseInt(args[0] + 1)).then(m => {
            for (let message of m) {
                if (message.author.id == "397898847906430976") {
                    message.channel.deleteMessage(message.id);
                }
            }
        });
    },
    options: {

    },
    name: "clean"
}