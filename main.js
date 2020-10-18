const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = "-"

global.fs = require("fs");

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}


const brFileName = 'battleRoster.json';
const brName = 'Battle Roster';
const brAlias = 'viewer battles';
const brArg = 'viewerbattles';
const brRole = "Viewer Battles";

const srFileName = 'simulRoster.json';
const srName = 'Simuls Roster';
const srAlias = 'simuls';
const srArg = 'simuls';
const srRole = "DDK Simuls"

const EventQueue = require('./modules/EventQueue');

const BattleRoster = new EventQueue.CreateQueue(brFileName, brName, brAlias, brArg);

const SimulRoster = new EventQueue.CreateQueue(srFileName, srName, srAlias, srArg);


const CheckAdmin = function (message) {
    if (message.member.permissions.has("ADMINISTRATOR")){
        return true;
    }
    message.reply('you don\'t have the permissions for that command.');
    return false;
}



client.once('ready', () => {
    console.log('Cadsbot is online!');
    
});

client.on('message', async message =>{
    //if message is a command, and isn't from the bot
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    //get arguments
    const args = message.content.slice(prefix.length).split(/ +/);
    //get commands
    const command = args.shift().toLowerCase();
    
    console.log(`${command}`);
    console.log(`${args}`);

    if(command === 'ping') {

        client.commands.get('ping').execute(message, args);
        
    } else if (command === 'join') {
        if (args.length === 0) {
            return message.reply("no roster specified, please try again.");
        } else if (args[0] === BattleRoster.queueArg) {
            const role = message.guild.roles.cache.find(r => r.name === brRole);
            message.member.roles.add(role);
            return BattleRoster.JoinQueue(message);
        } else if (args[0] === SimulRoster.queueArg) {
            const role = message.guild.roles.cache.find(r => r.name === srRole)
            message.member.roles.add(role);
            return SimulRoster.JoinQueue(message);
        } else {
            return message.reply('invalid queue name.');
        }

        

    } else if (command === 'leave') {
        if (args.length === 0) {
            return message.reply("no roster specified, please try again.");
        } else if (args[0] === BattleRoster.queueArg) {
            const role = message.guild.roles.cache.find(r => r.name === brRole);
            message.member.roles.remove(role);
            return BattleRoster.LeaveQueue(message);
        } else if (args[0] === SimulRoster.queueArg) {
            const role = message.guild.roles.cache.find(r => r.name === srRole)
            message.member.roles.remove(role);
            return SimulRoster.LeaveQueue(message);
        } else {
            return message.reply('invalid queue name.');
        }
        

    } else if (command === 'listqueue' || command === 'list') {

        if (args.length === 0) {
            return message.reply("no roster specified, please try again.");
        } else if (args[0] === BattleRoster.queueArg) {
            return BattleRoster.ListQueue(message);
        } else if (args[0] === SimulRoster.queueArg) {
            return SimulRoster.ListQueue(message);
        } else {
            return message.reply('invalid queue name.');
        }

    } 
    else if (command === 'finishgame') {
        if (CheckAdmin(message)) {
            if (args.length === 0) {
                return message.reply("no roster specified, please try again.");
            } else if (args[0] === BattleRoster.queueArg) {
                const role = message.guild.roles.cache.find(r => r.name === brRole);
                message.member.roles.remove(role);
                return BattleRoster.FinishGame(message);
            } else if (args[0] === SimulRoster.queueArg) {
                const role = message.guild.roles.cache.find(r => r.name === srRole)
                message.member.roles.remove(role);
                return SimulRoster.FinishGame(message);
            } else {
                return message.reply('invalid queue name.');
            }
        } 
        

    } else if (command === 'delaycurrent' || command === 'delay') {
        if (CheckAdmin(message)) {
            if (args.length === 0) {
                return message.reply('no roster specified, please try again.');
            } else if (args[0] === BattleRoster.queueArg) {
                return BattleRoster.DelayNext(message);
            } else if (args[0] === SimulRoster.queueArg) {
                return SimulRoster.DelayNext(message);
            } else {
                return message.reply('invalid queue name.');
            }
        }
    } else if (command === 'skipcurrent' || command === 'skip') {
        if (CheckAdmin(message)) {
            if (args.length === 0) {
                return message.reply('no roster specified, please try again.');
            } else if (args[0] === BattleRoster.queueArg) {
                const role = message.guild.roles.cache.find(r => r.name === brRole);
                message.member.roles.remove(role);
                return BattleRoster.SkipCurrent(message);
            } else if (args[0] === SimulRoster.queueArg) {
                const role = message.guild.roles.cache.find(r => r.name === srRole);
                message.member.roles.remove(role);
                return SimulRoster.SkipCurrent(message);
            } else {
                return message.reply('invalid queue name.');
            }
        }
    } else if (command === 'remove'){
        if (CheckAdmin(message)) {
            if (args.length === 0) {
                return message.reply('no arguments found, please try again.');
            } else if (args.length === 1) {
                if (args[0] !== brArg && args[0] !== srArg) {
                    return message.reply('no roster specified, please try again.');
                }
                return message.reply('no user mentioned, please try again.');
            } else if (args[0] === BattleRoster.queueArg) {
                const role = message.guild.roles.cache.find(r => r.name === brRole);
                removeMember = message.guild.member(message.mentions.users.first());
                removeMember.roles.cache.remove(role);
                return BattleRoster.RemoveUserByMention(message);
            } else if (args[0] === SimulRoster.queueArg) {
                const role = message.guild.roles.cache.find(r => r.name === srRole);
                removeMember = message.guild.member(message.mentions.users.first());
                removeMember.roles.cache.remove(role);
                return SimulRoster.RemoveUserByMention(message);
            } else {
                return message.reply('invalid queue name.');
            }
        }

    } else if (command === 'playnow' || command === 'promote') {
        if(CheckAdmin(message)) {
            if (args.length == 0) {
                return message.reply('no arguments found, please try again.');
            } else if (args.length === 1) {
                if (args[0] !== brArg && args[0] !== srArg) {
                    return message.reply('no roster specified, please try again.');
                }
                return message.reply('no user mentioned, please try again.');
            } else if (args[0] === BattleRoster.queueArg) {
                const userName = message.mentions.users.first().username;
                const userId = message.mentions.users.first().id;
                return BattleRoster.PromoteByMention(userName, userId);
            } else if (args[0] === SimulRoster.queueArg) {
                const userName = message.mentions.users.first().username;
                const userId = message.mentions.users.first().id;
                return SimulRoster.PromoteByMention(userName, userId);
            } else {
                return message.reply('invalid queue name.');
            }
        }
    }else if (command === 'clearqueue' || command === 'clear') {
        if (CheckAdmin(message)) {
            if (args.length === 0) {
                return message.reply('no roster specified, please try again.');
            } else if (args[0] === BattleRoster.queueArg) {
                const role = message.guild.roles.cache.find(r => r.name === brRole);
                message.guild.members.cache.forEach(member => {
                    if(!member.roles.cache.find(r => r.name === brRole)) return;
                    member.roles.remove(role)
                            .then(function() { console.log(`Removed role from user ${member.user.tag}!`);
                    })
                })
                return BattleRoster.ClearQueue(message);
            } else if (args[0] === SimulRoster.queueArg) {
                const role = message.guild.roles.cache.find(r => r.name === srRole);
                message.guild.members.cache.forEach(member => {
                    if(member.roles.cache.find(r => r.name === brRole)) member.roles.remove(role).then(function() { console.log(`Removed role from user ${member.user.tag}!`);
                    })
                })
                return SimulRoster.ClearQueue(message);
            } else {
                return message.reply('invalid queue name.');
            };
        };
    };
    
});

client.on('exit', () => {
    client.destroy();
});










client.login(process.env.TOKEN);


