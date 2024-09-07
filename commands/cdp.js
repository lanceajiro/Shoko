const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

exports.config = {
    name: 'cdp',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Get two random character display pictures (CDP) from Tamako Market.',
    category: 'Fun',
    usage: ''
};

exports.initialize = async function ({ bot, chatId }) {
    try {
        // Define cache directory and file
        const cacheDir = path.join(__dirname, 'cache');
        const cacheFile = path.join(cacheDir, 'cdp.json');

        // Ensure cache directory exists
        await fs.ensureDir(cacheDir);

        // Check if we have cached data
        let cdpData;
        if (await fs.exists(cacheFile)) {
            cdpData = await fs.readJson(cacheFile);
        } else {
            // If not, fetch the data from the API
            const response = await axios.get('https://ajiro-api.onrender.com/cdp');
            cdpData = response.data;
            // Cache the data for future use
            await fs.writeJson(cacheFile, cdpData);
        }

        // Select two random avatars
        const shuffledAvatars = cdpData.avatar.sort(() => 0.5 - Math.random());
        const selectedAvatars = shuffledAvatars.slice(0, 2);

        // Prepare media group with photos
        const mediaGroup = selectedAvatars.map(avatar => ({
            type: 'photo',
            media: avatar
        }));

        // Send the media group
        await bot.sendMediaGroup(chatId, mediaGroup);

        // Send the caption as a separate message
        const caption = `Character: ${cdpData.character}\nAnime: ${cdpData.anime}`;
        await bot.sendMessage(chatId, caption);

    } catch (error) {
        console.error("Error executing command:", error);
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};
