module.exports = {
    name: 'ping',
    description: 'Sends a message to see if the bot is responding.',
    execute(message, args){
        message.channel.send('pong!');
    }

}