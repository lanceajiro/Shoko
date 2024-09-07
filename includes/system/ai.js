const axios = require('axios');

const apiUrl = 'https://deku-rest-api.gleeze.com/gpt4?prompt=';

exports.ai = async function({ bot, chatId, userId, msg, isGroup }) {
    const text = msg.text?.trim(); // Ensure the text is valid

    if (!text) return; // Exit early if there's no text to process

    try {
        const response = await axios.get(`${apiUrl}${encodeURIComponent(text)}&uid=${userId}`);
        const aiReply = response.data?.gpt4?.trim(); // Extract the response from the JSON

        // Check if the AI response is not empty before sending it
        if (aiReply && aiReply.length > 0) {
            bot.sendMessage(chatId, aiReply);
        }
    } catch (error) {
        console.error('Error with AI API:', error);
        bot.sendMessage(chatId, "Sorry, I couldn't process that.\n\n" + error.message);
    }
};
