const fs = require("fs-extra");
const path = require("path");

exports.config = {
    name: 'help',
    aliases: ['h'],
    author: 'Lance Ajiro',
    access: 'anyone',
    description: 'Shows the command list and their descriptions',
    category: 'General',
    usage: ['command name', 'page number', 'all']
};

this.initialize = async function ({ bot, chatId, userId, args, usages, messageId }) {
    const pageNumber = parseInt(args[0]) || 1;
    const commandsPerPage = 15;
    const start = (pageNumber - 1) * commandsPerPage;
    const end = start + commandsPerPage;
    const commandsDir = path.join(process.cwd(), "commands");

    try {
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));
        const commandConfigs = commandFiles.map(file => {
            const commandPath = path.join(commandsDir, file);
            const script = require(commandPath);
            return script.config || {};
        });

        // Ensure userId is defined and valid before filtering
        if (!userId) {
            throw new Error("User ID is undefined or null");
        }

        // Convert userId to string and handle the case where userId might not be defined
        const userIdStr = userId ? userId.toString() : "";

        // Filter commands based on user access
        const filteredCommands = commandConfigs.filter(command => {
            const isOperatorCommand = command.category === "operator" || command.access === "operator";
            const isOperator = global.config.operator.includes(userIdStr);
            return !isOperatorCommand || isOperator;
        });

        const commandQuery = args[0] ? args[0].toLowerCase() : '';
        const specificCommand = filteredCommands.find(command => {
            const commandNames = [command.name, ...(command.aliases || [])].map(alias => alias.toLowerCase());
            return commandNames.includes(commandQuery);
        });

        if (specificCommand) {
            const { name, description, usage, author, category, access } = specificCommand;
            const formattedUsage = Array.isArray(usage) ? usage.map(u => `/${name} ${u}`).join('\n') : `/${name} ${usage}`;
            const usageMessage = `${global.config.symbols} Usages: ${formattedUsage}`;
            const commandInfo = `『 ${name} 』\n${description}\n\n` +
                `${global.config.symbols} Access: ${access}\n`  +              
                `${global.config.symbols} Category: ${category}\n` +
                `${global.config.symbols} Author: ${author}\n` +
                `${usageMessage}`;
            return bot.sendMessage(chatId, commandInfo);
        }

        if (args[0] && (args[0].toLowerCase() === "all" || args[0].toLowerCase() === "-all" || args[0].toLowerCase() === "-a")) {
            const allCommands = {};

            filteredCommands.forEach(command => {
                const { category } = command;
                if (category) {
                    if (!allCommands[category]) {
                        allCommands[category] = [];
                    }
                    allCommands[category].push(command);
                }
            });

            const helpMessage = Object.keys(allCommands).map(category => {
                const commands = allCommands[category];
                const commandNames = commands.map(command => `/${command.name}`).join(", ");
                return `『 ${category.toUpperCase()} 』\n${commandNames}\n`;
            }).join("\n");

            return bot.sendMessage(chatId, helpMessage);
        }

        const totalCommands = filteredCommands.length;
        const totalPages = Math.ceil(totalCommands / commandsPerPage);

        if (pageNumber < 1 || pageNumber > totalPages) {
            return bot.sendMessage(chatId, `Invalid page number. Please use a number between 1 and ${totalPages}.`);
        }

        const slicedCommands = filteredCommands.slice(start, end);
        const commandList = slicedCommands.map(command => `${global.config.symbols} /${command.name}`).join("\n");

        const helpMessage = `List of Commands\n\n${commandList}\n\nPage: ${pageNumber}/${totalPages}\nTotal Commands: ${totalCommands}`;

        // Create the inline keyboard dynamically based on the current page
        const inlineKeyboard = [];

        if (pageNumber > 1) {
            inlineKeyboard.push({ text: 'Previous', callback_data: `help:${pageNumber - 1}` });
        }

        if (pageNumber < totalPages) {
            inlineKeyboard.push({ text: 'Next', callback_data: `help:${pageNumber + 1}` });
        }

        // Check if updating an existing message or sending a new one
        if (messageId) {
            return bot.editMessageText(helpMessage, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [inlineKeyboard]
                }
            });
        } else {
            return bot.sendMessage(chatId, helpMessage, {
                reply_markup: {
                    inline_keyboard: [inlineKeyboard]
                }
            });
        }

    } catch (error) {
        console.error("Error executing command:", error.message);
        bot.sendMessage(chatId, "An error occurred while executing the command. Please try again later.");
    }
};

// Handle callback queries for pagination
const bot = global.client.bot;
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const userId = callbackQuery.from.id;
    const messageId = message.message_id;

    const [command, pageNumber] = callbackQuery.data.split(':');
    if (command === 'help') {
        const args = [pageNumber];
        await this.initialize({ bot, chatId, userId, args, usages: [], messageId });
    }

    // Acknowledge the callback
    bot.answerCallbackQuery(callbackQuery.id);
});
