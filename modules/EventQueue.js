module.exports = {
    
    CreateQueue: function (newFile, title, alias, arg) {
        this.eventQueue = new Array;
        this.fileName = newFile;
        this.queueTitle = title;
        this.queueAlias = alias;
        this.queueArg = arg;

        if (!newFile) {
            return console.log('No file name was given for the event queue.');
        }
        if (!title) {
            return console.log('No title was given for the event queue.');
        };
        if (!alias) {
            return console.log('No alias was given for the event queue.');
        }

        this.ClearQueue = function(message) {
            this.eventQueue.splice(0, this.eventQueue.length);     
            try {
                fs.unlinkSync(this.fileName);
            } catch (err) {
                console.error(err);
            }
            return message.channel.send(`${this.queueTitle} cleared!`);
        };

        this.UpdateJSON = function () {
        
            //generate JSON string to push onto event queue
            const queueJSON = JSON.stringify(this.eventQueue);
        
            //write JSON to file
            fs.writeFile(this.fileName, queueJSON, 'utf8', function (err) {
                if (err) {
                    console.log('An error occurred while saving queueJSON to eventQueue.json.');
                    return console.log(err);
                }
            });
        };

        this.RemoveUser = function (userName, userId) {
            const userToFind = {name: userName, id: userId};
            if (!this.eventQueue.some(u => (u.name === userName || u.name === userId))) {
                return false;
            }
            const removeAt = this.eventQueue.map(function(q) {return q.id}).indexOf(userToFind.id);
            this.eventQueue.splice(removeAt, 1);

            //generate JSON string to push onto event queue
            this.UpdateJSON();
            return true;
        };

        this.JoinQueue = function(message) {
            //get user's name
            const userName = message.author.username;
            //get user's id
            const userId = message.author.id;
            //create user object to push into event queue
            const newUser = {name: userName, id: userId};
    
            //if user is already in the queue
            if (this.eventQueue.some(u => u.id === newUser.id)) {     
                return message.reply(`you are already in the ${this.queueAlias} queue!`);;
            }
    
            //if user is not in the queue, add them to the queue
            this.eventQueue.push(newUser);
    
            //give them event role
    
    
            this.UpdateJSON();
    
    
            return message.reply(`you have successfully joined the ${this.queueAlias} queue.`);
        };

        
        this.LeaveQueue = function(message) {
            const userName = message.author.username;
            const userId = message.author.id;
            if(!this.RemoveUser(userName, userId)) {
                return message.reply('you are not in the queue!');
            };
            
    
            return message.reply(`you have successfully left the ${this.queueAlias} queue.`);
        };

        this.ListQueue = function(message) {
            const participants = this.eventQueue.map(a => a.name).join('\r\n') || 'No participants.';
            return message.channel.send(`\*\*${this.queueTitle}:\*\*\r\n\r\n${participants}`);
        };

        this.FinishGame = function(message) {
            //shift queue
            
            if (this.eventQueue.length === 0) {
                return message.reply(`${this.queueTitle} is empty!`)
            }
            const currentUser = eventQueue[0];
            
            if (this.eventQueue.length === 1) {
                this.eventQueue.shift();
                this.UpdateJSON();
                return message.channel.send(`Thanks for playing, <@${currentUser.id}>!`)
            };
            const nextUser = eventQueue[1];
            if (this.eventQueue.length > 1) {
                this.eventQueue.shift();
                this.UpdateJSON();
                return message.channel.send(`Thanks for playing, <@${currentUser.id}>! <@${nextUser.id}>, you're up next!`);
            }
            return console.log('Something went wrong...');            
        };

        this.DelayCurrent = function(message) {
            
            if (this.eventQueue.length === 0) {
                return message.reply(`${this.queueTitle} is empty!`);
            } else if (this.eventQueue.length === 1) {
                return message.reply(`${this.queueTitle} has only one user.  ${this.eventQueue[0].name} is still next.`)
            } else if (this.eventQueue.length > 1) {
                const temp = eventQueue[0];
                this.eventQueue.splice(0, 1, eventQueue[1]);
                this.eventQueue.splice(1, 0, temp);

                return message.channel.send(`<@${eventQueue[1].id}> has been moved back a spot. <@${eventQueue[0].id}>, you're up next!`);
            }            
        };

        this.SkipCurrent = function(message) {
            if (this.eventQueue.length === 0) {
                return message.reply(`${this.queueTitle} is empty!`);
            } else {
                message.channel.send(`<$${eventQueue[0]}>, you've been removed from the ${this.queueAlias} queue.`)
                return this.eventQueue.shift();
            }
        }

        this.PromoteByMention = function(userName, userId) {
            const userToFind = {name: userName, id: userId};
            index = this.eventQueue.map(function(ev) {return ev.id}).indexOf(userToFind.id);
            
            if (this.eventQueue.length === 0) {
                return message.reply(`${this.queueTitle} is empty!`);

            } else if(index === -1) {
                return message.reply(`${userName} isn't in ${queueAlias} queue`);
            } else if (index === 0) {
                return message.reply(`${userName} is already playing.`);
            } else {
                const temp = this.eventQueue[index];
                this.eventQueue.splice(index, 1);
                this.eventQueue.splice(1, 0, temp);
                return (message.channel.send(`<@${eventQueue[0]}>, you're up!`))
            }
        }

        this.RemoveUserByMention = function(message) {
            const userName = message.mentions.users.first().username;
            const userId = message.mentions.users.first().id;
            if(this.RemoveUser(userName, userId) === false) {
                return message.reply('user not found in queue.')
            };

            return message.reply(`<@${userName}> was successfully removed from the ${this.queueAlias} queue.`);
        };
        



        //If file already exists at fileName
        if (fs.existsSync(this.fileName)) {
            const that = this;

            //Read it from disc
            fs.readFile(this.fileName, 'utf8', function(err, data) {
                if (err) {
                    return console.log(err);
                }
                //add JSON to event queue
                if (data) {
                    
                    that.eventQueue = JSON.parse(data);
                    
                }
                
            })
            
            return console.log('Event queue loaded.');
            
        }

        this.eventQueue = this.eventQueue.splice(0, this.eventQueue.length);
        const queueJSON = JSON.stringify(this.eventQueue);

        

        fs.writeFile(this.fileName, queueJSON, 'utf8', function (err) {
            if (err) {
                console.log('Error in creating new event queue file.');
                return console.log(err);
            }
        });
        
        return console.log(`File not found.  New ${this.queueAlias} queue created.`)
    },
}