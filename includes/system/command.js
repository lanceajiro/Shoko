const path = require('path');
const fs = require('fs');
const { similar } = require('./similarity');
const { buttons, setupCallbackQuery } = require('./button');

// Set the commands button globally
global.client.buttons = buttons;

// Set up the callback query handler
setupCallbackQuery(global.client.bot);

const setUpBotCommands = async (bot) => {
    const commandsToSet = [];

    for (const [commandName, script] of global.client.commands) {
        if (script.config.access === 'operator' || script.config.category === 'operator') {
            continue;
        }

        if (script.config.name && script.config.description) {
            commandsToSet.push({
                command: script.config.name.toLowerCase(),
                description: script.config.description
            });
        }
    }

    try {
        await bot.setMyCommands(commandsToSet);
    } catch (error) {
        // Error handling can be implemented here if needed
    }
};

const registerCommands = () => {
    const commandsDir = path.resolve(__dirname, '../../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    commandFiles.forEach(file => {
        const command = require(path.join(commandsDir, file));
        const commandName = path.basename(file, '.js');

        if (!global.client.commands.has(commandName)) {
            global.client.commands.set(commandName, command);

            (command.config.aliases || []).forEach(alias => {
                global.client.aliases.set(alias, commandName);
            });
        }
    });

    setUpBotCommands(global.client.bot);
};

registerCommands();

exports.command = async function({ bot, chatId, userId, commandName, args, data, msg }) {
    if (!commandName) {
        return bot.sendMessage(chatId, "You typed only the prefix. Please provide a command.", global.client.buttons.help);
    }

    try {
        if (commandName.includes('@')) {
            const [name, username] = commandName.split('@');
            if (username.toLowerCase() !== global.client.info.username.toLowerCase()) {
                return;
            }
            commandName = name.toLowerCase();
        }

        const script = global.client.commands.get(commandName) || global.client.commands.get(global.client.aliases.get(commandName));

        if (!script) {
            const commandNames = [...global.client.commands.keys()];
            const similarCommand = similar(commandName, commandNames);
            return bot.sendMessage(chatId, `The command '${commandName}' is not found in my system. Did you mean '${similarCommand}'?`);
        }

        if (script.config.category === 'group' && script.config.access === 'admin' && msg.chat.type === 'private') {
            return bot.sendMessage(chatId, "This command is not available in private chats.");
        }

        const hasAccess = async (accessLevel) => {
            if (accessLevel === 'anyone') return { hasAccess: true };

            if (accessLevel === 'admin') {
                const chatAdmins = await bot.getChatAdministrators(chatId);
                const isAdmin = chatAdmins.some(admin => admin.user.id === userId);
                if (!isAdmin) {
                    return { hasAccess: false, message: `You don't have permission to use ${script.config.name}. Only group admins can use it.` };
                }
                return { hasAccess: true };
            }

            if (accessLevel === 'operator') {
                if (!global.config.operator.includes(userId.toString())) {
                    return { hasAccess: false, message: `You don't have permission to use '${script.config.name}'. Only the operator can use it.` };
                }
                return { hasAccess: true };
            }

            return { hasAccess: false, message: `Invalid access level for command ${script.config.name}.` };
        };

        const access = await hasAccess(script.config.access);
        if (!access.hasAccess) {
            return bot.sendMessage(chatId, access.message);
        }

        const usages = () => {
            let usageMessage = `${global.config.symbols} Usage:\n`;

            if (Array.isArray(script.config.usage)) {
                script.config.usage.forEach(usage => {
                    usageMessage += `/${script.config.name} ${usage}\n`;
                });
            } else if (typeof script.config.usage === 'string') {
                usageMessage += `/${script.config.name} ${script.config.usage}\n`;
            }

            // Use the fullInfo button and modify its callback_data
            const fullInfoButton = JSON.parse(JSON.stringify(global.client.buttons.fullInfo));
            fullInfoButton.reply_markup.inline_keyboard[0][0].callback_data += script.config.name;

            bot.sendMessage(chatId, usageMessage.trim(), fullInfoButton);
        };

        // Lock AI responses if bot.once is used within this command
        const originalOnce = bot.once.bind(bot);
        bot.once = (eventName, listener) => {
            if (eventName === 'message') {
                global.client.restrictAi = true; // Lock AI responses when a bot.once listener is registered
            }
            originalOnce(eventName, async (...args) => {
                try {
                    await listener(...args);
                } finally {
                    global.client.restrictAi = false; // Unlock AI responses after the bot.once listener is done
                }
            });
        };

        // Execute the command
        await script.initialize({ bot, chatId, userId, args, usages, data, msg, help: global.client.buttons.help });

        // Handle replies using script.reply if it exists
        if (script.reply) {
            bot.once('message', async replyMsg => {
                if (replyMsg.text.toLowerCase() === 'cancel') {
                    return bot.sendMessage(chatId, 'Command cancelled.');
                }

                try {
                    await script.reply({ bot, chatId, userId, args, replyMsg, data, msg, help: global.client.buttons.help });
                } catch (error) {
                    bot.sendMessage(chatId, "An error occurred while processing your reply.\n\n" + error.message);
                }
            });
        }

    } catch (error) {
        global.client.restrictAi = false; // Ensure the lock is released in case of errors
        bot.sendMessage(chatId, "An error occurred while processing your command.\n\n" + error.message);
    }
};