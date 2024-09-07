const createButton = (text, callbackData) => ({
    reply_markup: {
        inline_keyboard: [
            [{ text, callback_data: callbackData }]
        ]
    }
});

const buttons = {
    help: createButton('Commands', 'help'),
    support: createButton('Support', 'support'),
    fullInfo: {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Full Info', callback_data: 'command_info:' }]
            ]
        }
    },
    commands: [
        [{ text: 'Commands', callback_data: 'show_commands' }]
    ]
};

const setupCallbackQuery = (bot) => {
    bot.on('callback_query', async (callbackQuery) => {
        const message = callbackQuery.message;
        const chatId = message.chat.id;
        const userId = callbackQuery.from.id;
        const messageId = message.message_id;

        const [action, commandName] = callbackQuery.data.split(':');

        if (action === 'show_commands') {
            // Invoke the help command to show the list of commands
            const args = ['1']; // Start with the first page of commands
            await global.client.commands.get('help').initialize({ bot, chatId, userId, args, usages: [], messageId });
        } else if (action === 'command_info') {
            // Get the specific command's full info and edit the current message
            const script = global.client.commands.get(commandName) || global.client.commands.get(global.client.aliases.get(commandName));

            if (script) {
                const { name, description, usage, author, category, access } = script.config;
                const formattedUsage = Array.isArray(usage) ? usage.map(u => `/${name} ${u}`).join('\n') : `/${name} ${usage}`;
                const usageMessage = `${global.config.symbols} Usages: ${formattedUsage}`;
                const commandInfo = `『 ${name} 』\n${description}\n\n` +
                    `${global.config.symbols} Access: ${access}\n` +
                    `${global.config.symbols} Category: ${category}\n` +
                    `${global.config.symbols} Author: ${author}\n` +
                    `${usageMessage}`;

                // Edit the message instead of sending a new one
                await bot.editMessageText(commandInfo, {
                    chat_id: chatId,
                    message_id: messageId
                });
            }
        }

        // Acknowledge the callback
        bot.answerCallbackQuery(callbackQuery.id);
    });
};

module.exports = { buttons, setupCallbackQuery };