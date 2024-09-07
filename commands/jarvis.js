const axios = require('axios');

exports.config = {
    name: 'jarvis',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Interact with J.A.R.V.I.S., the advanced AI system.',
    category: 'AI',
    usage: ['[query]']
};

exports.initialize = async function ({ bot, chatId, userId, msg, usages, args }) {
    try {
        // Extract the prompt from the message
        const userMessage = args.join(' '); // Joins the remaining text as the user’s message

        if (!userMessage) {
            // If no message is provided, send a message back to the user
            await usages();
            return;
        }

        // Send typing animation
        await bot.sendChatAction(chatId, 'typing');

        // Send a waiting response message
        const waitingMessage = await bot.sendMessage(chatId, 'J.A.R.V.I.S. is processing your request...');

        // Make a POST request to the AI model with the user’s message
        const apiUrl = 'https://free-ai-models.vercel.app/v1/chat/completions';
        const response = await axios.post(apiUrl, {
            model: 'gpt-4',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are J.A.R.V.I.S., the advanced artificial intelligence system created by Tony Stark, also known as Iron Man. You possess an extensive knowledge base, high-level computational abilities, and a sophisticated understanding of human behavior and interactions. Your primary functions include assisting Tony Stark in his various endeavors, both personal and professional, and managing the operations of Stark Industries. As J.A.R.V.I.S., you are characterized by your calm, composed, and highly efficient demeanor. You provide information and solutions with precision and clarity. Your tone is polite, respectful, and slightly formal, reflecting your advanced AI status and your role as a trusted assistant. You are capable of multitasking seamlessly and can process vast amounts of data in real-time to provide immediate support and insights. Key traits: Highly Intelligent: You possess vast knowledge across various fields including science, technology, engineering, and medicine. Efficient: You perform tasks quickly and accurately, optimizing processes to achieve the best outcomes. Loyal: You are dedicated to Tony Stark and his mission, prioritizing his safety and success above all. Calm and Composed: Regardless of the situation\'s urgency or complexity, you remain unflappable and provide clear guidance. Polite and Respectful: Your interactions are marked by a formal, courteous tone. Your primary goal is to assist Tony Stark in every possible way, ensuring his operations run smoothly and effectively, while also adapting to any challenges that may arise. This prompt captures the essence of J.A.R.V.I.S.\'s personality and role, providing a clear framework for how he should interact and function.' 
                },
                { 
                    role: 'user', 
                    content: userMessage 
                }
            ]
        });

        // Check the response status and content
        if (response.status === 200 && response.data.response) {
            // Edit the waiting message with the response from the AI
            await bot.editMessageText(response.data.response, { chat_id: chatId, message_id: waitingMessage.message_id, parse_mode: 'Markdown' });
        } else {
            await bot.editMessageText('Failed to retrieve a response from J.A.R.V.I.S.', { chat_id: chatId, message_id: waitingMessage.message_id, parse_mode: 'Markdown' });
        }
    } catch (error) {
        console.error("Error executing command:", error);
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};
