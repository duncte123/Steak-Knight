const serv = require("../server.js");
let client = serv.client;
let droll = serv.droll;
const guildcd = new Set();
function cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
module.exports = {
    func: async (msg, args) => {


        if (args[0] == "find") {
            let snark = [];
            client.query("Select * from players where player_id = $1", [msg.author.id]).then(p => {
                if (typeof p.rows[0] == "undefined") {
                    msg.channel.createMessage({ embed: { description: "You haven't started your adventure yet! Use `sk rpg`" } })

                }
                else {
                    if (p.rows[0].player_level > 5) {
                        snark[0] = "Steakdragon"
                    }
                    else if (p.rows[0].player_level > 2) {
                        snark[0] = "Steakorc"
                    }
                    else {
                        snark[0] = "Steakgoblin"
                    }

                    snark[1] = 1234
                    snark[2] = Math.ceil(p.rows[0].player_level)
                    snark[3] = msg.author.id
                    snark[4] = 8 + 5 * Math.ceil(p.rows[0].player_level) + 2 * Math.ceil(p.rows[0].player_level)
                    snark[5] = 2 + 1 * Math.ceil(p.rows[0].player_level)




                    client.query("SELECT * FROM monsters where player_id = $1", [msg.author.id]).then(m => {
                        let monster = m.rows[0];
                        if (typeof monster == "undefined") {
                            client.query("INSERT INTO monsters (monster_name, monster_id, monster_level, player_id, hp,  atk ) values ($1, $2, $3, $4, $5, $6)", snark)
                            msg.channel.createMessage({ embed: { description: "You found a " + snark[0] + "! It is level " + snark[2] + ", has " + snark[4] + " health, and has an attack of 2d3+" + snark[5] + "." } })
                        }
                        else {
                            client.query("SELECT * FROM monsters where player_id = $1", [msg.author.id]).then(m => {
                                let monster = m.rows[0];
                                msg.channel.createMessage({
                                    embed: {
                                        description: "You are currently fighting a level "
                                            + monster.monster_level + " " + monster.monster_name +
                                            " with " + monster.hp + " hp, and  an attack of 2d3+" + monster.atk + "."
                                    }
                                })
                            })
                        }

                    })

                }
            })
        }
        if (args[0] == "fight") {
            var attack;
            var defense;
            var playerHit;
            var monsterHit;
            if (guildcd.has(msg.channel.id)) {
                msg.channel.createMessage("This command is on cooldown!");
            } else {
                client.query("SELECT * FROM monsters where player_id = $1", [msg.author.id]).then(m => {
                    let monster = m.rows[0];
                    if (typeof monster == "undefined") {
                        msg.channel.createMessage({ embed: { description: "You haven't found a monster yet! Use `sk rpg find`" } })
                        return;
                    }
                    else {

                        client.query("SELECT * FROM players where player_id = $1", [msg.author.id]).then(p => {
                            client.query("SELECT * FROM items where player_id = $1", [msg.author.id]).then(i => {
                                let player = p.rows[0]


                                playerHit = droll.roll(`2d6+${player.player_atk}`).total;
                                monsterHit = droll.roll(`2d3+${monster.atk}`).total;
                                attack = "You dealt the monster " + playerHit + " damage"
                                defense = "The monster dealt you " + monsterHit + " damage"
                                i.rows.forEach(function (item) {
                                    if (typeof item !== "undefined")
                                        if (item.item_name == "Sword") {
                                            playerHit = droll.roll(`2d6+${player.player_atk}`).total + droll.roll(`1d4`).total;
                                            attack = "You dealt the monster " + playerHit + " damage with your mighty sword"

                                        }
                                    if (item.item_name == "Shield") {
                                        monsterHit = droll.roll(`2d3+${monster.atk}`).total - 2;
                                        defense = "The monster dealt you " + monsterHit + " damage after you blocked with your shield"
                                    }

                                })
                                client.query("SELECT * FROM classes where player_id = $1", [msg.author.id]).then(cla => {
                                    if (args[1] == "skill") {
                                        if (player.player_level < 5) {

                                        }
                                        else {

                                            let c = cla.rows[0];
                                            if (c.type === 'a') {
                                                playerHit += c.value
                                                if (c.class_name === "Barbarian") {
                                                    attack += ", buffed thanks to your Mighty Swing"
                                                }
                                                else if (c.class_name === "Mage") {
                                                    attack += ", buffed thanks to your Frost Barrage"
                                                }


                                            }
                                            else if (c.type === 'd') {
                                                monsterHit -= c.value
                                                if (c.class_name === "Guardian") {
                                                    defense += ", reduced thanks to your Steadfast Will"
                                                }
                                                else if (c.class_name === "Priest") {
                                                    attack += ", reduced thanks to your Magical Shield"
                                                }

                                            }


                                        }

                                    }

                                    if (0 >= monster.hp - playerHit) {
                                        attack = "You killed the monster! Hooray! You gained " + monster.monster_level * 20 + " xp"
                                        defense = "You also gained " + monster.monster_level * 5 + " <:steak:481449443204530197>! You can check your balance with `sk currency` and see what to spend it on with `sk rpg shop` "
                                        client.query("INSERT INTO currency (id, money) values ($1, $2) ON CONFLICT (id) DO UPDATE SET money = currency.money + $2 WHERE currency.id = $1", [player.player_id, monster.monster_level * 5])
                                        client.query("DELETE FROM monsters where player_id = $1", [player.player_id]);
                                        if (player.player_xp + monster.monster_level * 20 >= player.player_next_level) {
                                            client.query("UPDATE players SET (player_xp, player_hp, player_atk, player_level, player_next_level, player_maxhp) = (0, players.player_maxhp + 10 , players.player_atk + 1, players.player_level+1, players.player_next_level + 100, players.player_maxhp+10)   where player_id = $1", [player.player_id]);
                                            attack += "\nAlso, you leveled up! You are now level " + (player.player_level + 1)
                                            if (player.player_level = 5) {
                                                attack += "\nYou can now choose a class! Use `sk rpg class` to see the class list and `sk rpg class <classname>` to pick a class"
                                            }
                                        }
                                        else {
                                            client.query("UPDATE players SET player_xp = players.player_xp + $1 where player_id = $2", [monster.monster_level * 20, player.player_id]);
                                        }
                                    }
                                    else if (0 >= player.player_hp - monsterHit) {
                                        attack = "Oh no, you were killed by the monster! You'll have to find another one to fight!"
                                        defense = ""
                                        client.query("DELETE FROM monsters  where player_id = $1", [player.player_id]);
                                        client.query("UPDATE players SET player_hp = $1 where player_id = $2", [player.player_maxhp, player.player_id]);
                                    }
                                    else {
                                        client.query("UPDATE players SET player_hp = players.player_hp - $1 where player_id = $2", [monsterHit, player.player_id]);
                                        client.query("UPDATE monsters SET hp = monsters.hp - $1 where player_id = $2", [playerHit, player.player_id]);
                                    }



                                    msg.channel.createMessage(
                                        {
                                            embed:
                                            {
                                                description: attack + "!\n" + defense + "!"
                                            }
                                        })

                                })

                            })
                        })
                    }

                })


                guildcd.add(msg.channel.id);
                setTimeout(() => {
                    guildcd.delete(msg.channel.id);
                }, 4000);
            }


        }
        if (args[0] == "heal" && process.env.ids.includes(msg.author.id)) {
            return true;
        }
        let classArray = ["Barbarian", "Mage", "Guardian", "Priest"]
        if (args[0] == "class") {
            if (typeof args[1] !== "undefined"){

            if (classArray.includes(cap(args[1]))) {
                client.query("SELECT * FROM players where player_id = $1", [msg.author.id]).then(p => {
                    client.query("SElect * from classes where player_id = $1", [msg.author.id]).then(cla => {
                        let player = p.rows[0];
                        if (typeof cla.rows[0] == "undefined"){
                            if (player.player_level > 4) {
                                if(cap(args[1]) == "Barbarian") 
                                 {
                                     client.query("insert into classes (class_name, type, value, player_id) values ($1, $2, $3, $4)", ["Barbarian", 'a', 5, msg.author.id])
                                    msg.channel.createMessage("You are now a "+cap(args[1]+"! You can use `sk rpg fight skill` to use your skill in battle!"))
                                    }
                                 
                                else if(cap(args[1]) == "Mage"){
                                  client.query("insert into classes (class_name, type, value, player_id) values ($1, $2, $3, $4)", ["Mage", 'a', 5, msg.author.id])
                                  msg.channel.createMessage("You are now a "+cap(args[1]+"! You can use `sk rpg fight skill` to use your skill in battle!"))

                                }
                                  else if(cap(args[1]) == "Guardian") {
                                  client.query("insert into classes (class_name, type, value, player_id) values ($1, $2, $3, $4)", ["Guardian", 'd', 5, msg.author.id])
                                  msg.channel.createMessage("You are now a "+cap(args[1]+"! You can use `sk rpg fight skill` to use your skill in battle!"))

                                }
                                  else if(cap(args[1]) == "Priest") {
                                 client.query("insert into classes (class_name, type, value, player_id) values ($1, $2, $3, $4)", ["Priest", 'd', 5, msg.author.id])
                                 msg.channel.createMessage("You are now a "+cap(args[1]+"! You can use `sk rpg fight skill` to use your skill in battle!"))

                                }
                                 else {
                                    msg.channel.createMessage("That's not a valid class!")
                                }
                            }
                            else {
                                msg.channel.createMessage("You aren't Level 5 yet!")
                            }
                        }
                        else {
                            msg.channel.createMessage("You've already chosen a class!")
                        }
                        

                    })
                   

                })
            }
        }
            else{
                msg.channel.createMessage({embed:{description:
                    "Barbarian - attack focused strong man\n"
                    +"Mage - attack focused spellcaster\n"
                    +"Guardian - defending melee man\n"
                    +"Priest - defensive holy dude\n"
                    +"You can choose one of these classes with `sk rpg class <classname> if you are level 5 or higher and don't already have a class!"

                }})
            }

        }
        if (args[0] == "shop") {

            if (args[1] == "buy") {
                let shopList = ["Sword", "Shield"]
                let cost = 0;
                let ownedItems = [];
                client.query("SELECT * FROM items where player_id = $1", [msg.author.id]).then(i => {

                    i.rows.forEach(function (item) {
                        if (typeof item !== "undefined") ownedItems.push(item.item_name)

                    })
                    if (shopList.includes(cap(args[2])) && !(ownedItems.includes(cap(args[2])))) {
                        if (args[2].toLowerCase() == "sword") cost = 200;
                        if (args[2].toLowerCase() == "shield") cost = 300;
                        client.query("SELECT * from currency where id = $1", [msg.author.id]).then(cur => {
                            c = cur.rows[0]
                            if (c.money - cost < 0) {
                                msg.channel.createMessage({ embed: { description: "You don't have enough money to buy that!" } })
                            }
                            else {
                                msg.channel.createMessage({ embed: { description: "You bought a " + args[2] + " for " + cost + " <:steak:481449443204530197> !" } })
                                client.query("UPDATE currency SET money = currency.money - $2 WHERE currency.id = $1", [msg.author.id, cost])
                                client.query("INSERT INTO items (item_name, player_id) values ($1, $2)", [cap(args[2].toLowerCase()), msg.author.id])

                            }


                        })


                    }
                    else {
                        msg.channel.createMessage({ embed: { description: "You already own this item!" } })
                    }
                })
            }
            else {
                msg.channel.createMessage({
                    embed: {
                        description: "List of items to buy:\n"
                            + "Sword: 200 steaks - increases damage by 1d4\n"
                            + "Shield: 300 steaks - decreases damage taken by 2"
                    }
                })
            }
        }



        if (args[0] == "help") {
            msg.channel.createMessage({ embed: { description: "You can use `sk rpg` to check your stats, `sk rpg find` to find a monster to fight, and `sk rpg fight` or `srf` to fight a monster! Please use `sk rpg` first!" } });
        }
        if (args[0] == null) {
            let snark = [];
            snark[0] = msg.author.id
            snark[1] = 1
            snark[2] = 50
            snark[3] = 1
            snark[4] = 0
            snark[5] = 100
            snark[6] = 50
            let items = '\n';
            let playerClass = "none (you'll get one at level 5)";
            client.query("SELECT * FROM players where player_id = $1", [msg.author.id]).then(p => {
                let player = p.rows[0];
                if (typeof player == "undefined") {
                    client.query("INSERT INTO players (player_id, player_level, player_hp, player_atk, player_xp, player_next_level, player_maxhp) values ($1, $2, $3, $4, $5, $6, $7)", snark)
                    msg.channel.createMessage({ embed: { description: "You are level 1, have 50 hp, and have an attack of 2d6+1. You haven't done anything yet, so you have 0xp." } })
                }
                else {
                    client.query("SELECT * FROM classes where player_id = $1", [msg.author.id]).then(cla => {
                        client.query("SELECT * FROM items where player_id = $1", [msg.author.id]).then(i => {
                            c = cla.rows[0];
                            if (typeof c !== "undefined") {
                                playerClass = c.class_name;
                            }

                            i.rows.forEach(function (item) {
                                if (typeof item !== "undefined")
                                    items += item.item_name + "\n";

                            })

                            msg.channel.createMessage({
                                embed: {
                                    description: "You are level " + player.player_level + ", have " + player.player_hp + " out of " + player.player_maxhp + " hp, and have an attack of 2d6+" + player.player_atk + ".\n"
                                        + "You have " + player.player_xp + " xp and you hit the next level at " + player.player_next_level + " xp.\n"
                                        + "Items: " + items + "Class: " + playerClass
                                }
                            })
                        })
                    })
                }
            })
        }




    },
    options: {
        description: "Fight some baddies for loot and glory!",
        fullDescription: "You can use `sk rpg` to check your stats, `sk rpg find` to find a monster to fight, and `sk rpg fight` to fight a monster! Please use `sk rpg` first!",
        usage: "`sk rpg`"
    },
    name: "rpg"
};
