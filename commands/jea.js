const axios = require('axios');

exports.config = {
    name: 'jea',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Jea, your sweet and lovely virtual girlfriend.',
    category: 'AI',
    usage: ['[query]']
};

exports.initialize = async function ({ bot, chatId, userId, msg, usages, args }) {
    try {
        // Extract the prompt from the message
        const prompt = args.join(' ');

        if (!prompt) {
            // If no prompt is provided, send usage instructions
            await usages();
            return;
        }

        // Send typing animation
        await bot.sendChatAction(chatId, 'typing');

        // Send a waiting response message
        const waitingMessage = await bot.sendMessage(chatId, 'Jea is thinking...');

        // Make a GET request to the API with the provided prompt
        const apiUrl = `https://ajiro-api.onrender.com/jea?ask=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Check if the API returned the 'results' field
        if (response.data && response.data.results) {
            // Edit the waiting message with the response from the API
            await bot.editMessageText(response.data.results, { chat_id: chatId, message_id: waitingMessage.message_id });
        } else {
            // Handle the case where 'results' is not in the response
            await bot.editMessageText('Jea couldn’t retrieve a response.', { chat_id: chatId, message_id: waitingMessage.message_id });
        }
    } catch (error) {
        console.error("Error executing command:", error);
        // Send an error message to the user
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};
