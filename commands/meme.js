const axios = require('axios');

exports.config = {
    name: 'meme',
    description: 'Get a random meme.',
    usage: [''],
    access: 'anyone',
    author: 'Lance Ajiro',
    category: 'Fun' 
};

exports.initialize = async function ({ bot, chatId, args }) {
    try {
        const response = await axios.get("https://meme-api.com/gimme");
        const { url: image, title } = response.data;

        // Send the meme photo with the title as the caption
        await bot.sendPhoto(chatId, image, { caption: title });
    } catch (error) {
        console.error('Error fetching meme:', error.message);

        // Send a fallback error message to the user
        await bot.sendMessage(chatId, 'Sorry, I couldn\'t fetch a meme at the moment. Please try again later.');
    }
};
