const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.config = {
    name: 'image',
    description: 'Search for images using Unsplash',
    author: 'Shinpei',
    access: 'anyone',
    usage: '[query]',
    category: 'media',
};

exports.initialize = async function ({ bot, chatId, args }) {
    try {
        let searchQuery = args.join(' ');

        if (!searchQuery) {
            await bot.sendMessage(chatId, 'Now send your search query to proceed');
        } else {
            await searchAndSendImages(bot, chatId, searchQuery);
        }
    } catch (error) {
        console.error(error);
        await bot.sendMessage(chatId, "🚫 An error occurred while fetching data.");
    }
};

exports.reply = async function ({ bot, chatId, replyMsg }) {
    try {
        const searchQuery = replyMsg.text.trim();
        if (searchQuery.toLowerCase() === 'cancel') {
            await bot.sendMessage(chatId, '❌ Search canceled.');
        } else if (searchQuery) {
            await searchAndSendImages(bot, chatId, searchQuery);
        } else {
            await bot.sendMessage(chatId, '🚫 Invalid search query. Please provide a valid search query.');
        }
    } catch (error) {
        console.error("Error handling reply:", error);
        await bot.sendMessage(chatId, "🚫 An error occurred while handling your reply. Please try again later.\n" + error.message);
    }
};

async function searchAndSendImages(bot, chatId, searchQuery) {
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
    }

    let loadingMessage;
    try {
        loadingMessage = await bot.sendMessage(chatId, '🕟 Searching for images on Unsplash, please wait...');

        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                page: 1,
                per_page: 10,
                query: searchQuery,
                client_id: 'oWmBq0kLICkR_5Sp7m5xcLTAdkNtEcRG7zrd55ZX6oQ'
            }
        });

        const results = response.data.results;
        if (results.length === 0) {
            await bot.editMessageText('🚫 No images found for the query.', { chat_id: chatId, message_id: loadingMessage.message_id });
            return;
        }

        const media = [];
        const storedPath = [];

        for (let i = 0; i < results.length; i++) {
            const imagePath = path.join(cacheDir, `unsplash_${i + 1}.jpg`);
            const imageResponse = await axios.get(results[i].urls.regular, { responseType: 'arraybuffer' });
            fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));
            storedPath.push(imagePath);
            media.push({ type: 'photo', media: fs.createReadStream(imagePath) });
        }

        await bot.editMessageText('✔️ Images found. Sending now...', { chat_id: chatId, message_id: loadingMessage.message_id });
        await bot.sendMediaGroup(chatId, media);

        // Delete the loading message after success
        await bot.deleteMessage(chatId, loadingMessage.message_id);
    } catch (error) {
        console.error(error);
        if (loadingMessage) {
            await bot.editMessageText('🚫 An error occurred while fetching data.', { chat_id: chatId, message_id: loadingMessage.message_id });
        } else {
            await bot.sendMessage(chatId, '🚫 An error occurred while fetching data.');
        }
    }
}