
  module.exports = {
    func: async (msg, args) => {if (msg.member.permission.has("kickMembers")==true){
      try {
      msg.channel.guild.kickMember(msg.mentions[0].id,args.join(" "))

      }
      catch (error){
          msg.channel.createMessage("That didn't work!")
      }
  }},
    options:{
      requirements: {
        "manageRoles": true
    },
    argsRequired: true,
    guildOnly: true,
    description: "Gives a user a role!",
    fullDescription: "Gives a user a role. Make sure the bot has the needed perms.",
    usage: "`sk role @user rolename`"
    },
    name: "kick"
}