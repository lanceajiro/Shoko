const axios = require('axios');

exports.config = {
    name: 'gpt4o',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Interact with the GPT4O AI model.',
    category: 'AI',
    usage: ['[query]']
};

exports.initialize = async function ({ bot, chatId, userId, msg, args, usages }) {
    try {
        const userMessage = args.join(' '); // Extract prompt from message

        if (!userMessage) {
            await usages();
            return;
        }

        await bot.sendChatAction(chatId, 'typing');

        // Send a waiting response message
        const waitingMessage = await bot.sendMessage(chatId, `${this.config.name} is processing your request...`);

        // Make a POST request to the Claude AI model with the user’s message
        const apiUrl = 'https://free-ai-models.vercel.app/v1/chat/completions';
        const response = await axios.post(apiUrl, {
            model: 'gpt-4o-free',
            messages: [
                { 
                    role: 'system', 
                    content: '' 
                },
                { 
                    role: 'user', 
                    content: userMessage 
                }
            ]
        });

        if (response.status === 200 && response.data.response) {
            // Edit the waiting message with the response from Claude
            await bot.editMessageText(response.data.response, { chat_id: chatId, message_id: waitingMessage.message_id, parse_mode: 'Markdown' });
        } else {
            await bot.editMessageText('Failed to retrieve a response from Claude.', { chat_id: chatId, message_id: waitingMessage.message_id });
        }
    } catch (error) {
        console.error("Error executing command:", error);
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};
