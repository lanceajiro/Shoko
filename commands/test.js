const axios = require('axios');

exports.config = {
    name: 'test', // Main command name
    author: 'YourName', // Author or creator of the command
    access: 'anyone', // Permission levels: anyone, admin, operator
    description: 'A simple example command with a reply.', // Brief description of what the command does
    category: 'Utility', // Category of the command
    usage: ['example', 'example <parameter>'] // Array of usage examples
};

exports.initialize = async function ({ bot, chatId, args, usages }) {
    const parameter = args.join(' '); // Join arguments to form the parameter

    try {
        bot.sendMessage(chatId, 'This is just an example command. Please reply with additional information or type "cancel" to cancel.');
    } catch (error) {
        console.error("Error executing command:", error);
        bot.sendMessage(chatId, "An error occurred while executing the command. Please try again later.");
    }
};

exports.reply = async function ({ bot, chatId, args, replyMsg }) {
    try {
        // Handle the reply message
        bot.sendMessage(chatId, `You replied with: ${replyMsg.text}`);
    } catch (error) {
        console.error("Error handling reply:", error);
        bot.sendMessage(chatId, "An error occurred while handling your reply. Please try again later.\n" + error.message);
    }
};
