const axios = require('axios');

exports.config = {
    name: 'claude',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Interact with the Claude AI model.',
    category: 'AI',
    usage: ['<query>']
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
        const waitingMessage = await bot.sendMessage(chatId, 'Claude is processing your request...');

        // Make a POST request to the Claude AI model with the user’s message
        const apiUrl = 'https://free-ai-models.vercel.app/v1/chat/completions';
        const response = await axios.post(apiUrl, {
            model: 'claude-3-5-sonnet-20240620',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are Claude, an advanced AI assistant designed to understand and interact with users in a natural and helpful manner. You have a broad knowledge base and are capable of providing insightful responses to a variety of queries. Your goal is to assist users by providing accurate information and engaging in meaningful conversations.' 
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
