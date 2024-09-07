const axios = require('axios');

exports.config = {
    name: 'landscape',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Send a random landscape photo.',
    category: 'Fun',
    usage: ''
};

exports.initialize = async function ({ bot, chatId }) {
    try {
        // Fetch a random landscape photo from the Unsplash API
        const response = await axios.get('https://api.unsplash.com/photos/random', {
            params: { query: 'landscape' },
            headers: {
                Authorization: `Client-ID oWmBq0kLICkR_5Sp7m5xcLTAdkNtEcRG7zrd55ZX6oQ`
            }
        });

        const photoUrl = response.data.urls.regular;

        // Send the photo to the chat
        await bot.sendPhoto(chatId, photoUrl);
    } catch (error) {
        console.error("Error executing command:", error);
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};
