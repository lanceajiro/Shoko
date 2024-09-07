const path = require('path');
const authorization = require('./system/authorization');

// Define paths
const aiPath = path.join(__dirname, 'system', 'ai.js');
const cachePath = path.join(__dirname, 'system', 'cache.js');
const commandPath = path.join(__dirname, 'system', 'command.js');
const eventPath = path.join(__dirname, 'system', 'event.js');

// Define modules
const { ai } = require(aiPath);
const cache = require(cachePath);
const { command } = require(commandPath);
const { event } = require(eventPath);

exports.listen = async function({ bot, chatId, userId, msg, data }) {
    // Create and clear cache directory
    cache.create();
    cache.clear();

    // Ensure the message text is not empty or undefined
    const text = msg.text?.trim();
    const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

    // Fetch the group settings
    const groupSettings = global.data.groups.get(chatId.toString());

    // Handle events like new members or members leaving, respecting group settings
    if (isGroup && groupSettings?.event) {
        await event({ bot, chatId, msg });
    }

    // If the AI lock is active, prevent any AI responses
    if (global.client.restrictAi) return; // Exit early to prevent AI interference during bot.once processes

    // Check if the user is registered
    const isRegistered = global.data.users.has(userId.toString());

    // Check if the message is a command (starts with '/')
    if (text?.startsWith('/')) {
        // If the user is not registered, send the authorization request and return
        if (!isRegistered) {
            authorization.request(bot, chatId, userId);
            return;
        }

        const args = text.slice(1).split(' ');
        const commandName = args.shift().toLowerCase();

        // Check if the bot is off for this group and allow only the /toggle command
        if (isGroup && groupSettings && !groupSettings.bot && commandName !== 'toggle') {
            return;
        }

        // Implement onlyadmin functionality
        if (isGroup && groupSettings?.onlyadmin) {
            try {
                const chatAdmins = await bot.getChatAdministrators(chatId);
                const adminIds = chatAdmins.map(admin => admin.user.id);
                const isAdmin = adminIds.includes(userId);
                const isOperator = userId === global.config.operator;

                if (!isAdmin && !isOperator) {
                    await bot.sendMessage(chatId, "Sorry, only group admin can use this bot in this group.");
                    return; // User is neither admin nor operator; ignore the command
                }
            } catch (error) {
                console.error(`Error checking chat administrators ${error}`);
                return;
            }
        }

        // Handle the command
        await command({ bot, chatId, userId, commandName, args, data, msg });

        // Exit after handling the command to prevent AI from responding
        return;
    }

    // Handle AI responses only if the lock is not active
    if (isGroup) {
        // Only respond to group messages based on keywords
        if (groupSettings?.ai) {
            const keywordsPattern = /(\b(what|how|did|where|who)\b|ai|wataru|lance)/i;
            if (keywordsPattern.test(text)) {
                // If the user is not registered, send the authorization request and return
                if (!isRegistered) {
                    authorization.request(bot, chatId, userId);
                    return;
                }
                await ai({ bot, chatId, msg, isGroup });
            }
        }
    } else {
        // For direct messages, respond to everything unless it's during a bot.once command
        // If the user is not registered, send the authorization request and return
        if (!isRegistered) {
            authorization.request(bot, chatId, userId);
            return;
        }
        await ai({ bot, chatId, userId, msg, isGroup: false });
    }

    // If we reach here, it means the message was not a command and didn't trigger AI response
    // We don't need to do anything for unregistered users at this point
};

// Set up the callback query handler for authorization
const bot = global.client.bot;
bot.on('callback_query', async (callbackQuery) => {
    try {
        await authorization.response(bot, callbackQuery);
    } catch (error) {
        console.error('Error handling callback query:', error);
    }
});