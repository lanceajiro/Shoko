const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

exports.config = {
    name: 'shoti',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Send a random TikTok video with the username as a caption.',
    category: 'media',
    usage: []
};

exports.initialize = async function ({ bot, chatId }) {
    try {
        // Send a loading message to the chat
        const loadingMessage = await bot.sendMessage(chatId, 'Loading...');

        // Fetch random TikTok video data from the Shoti API
        const apiUrl = `https://shoti-srv2.onlitegix.com/api/v1/request-f`;
        const response = await axios.get(apiUrl);

        if (response.data.code !== 200) {
            await bot.editMessageText('Failed to retrieve video. Please try again later.', {
                chat_id: chatId,
                message_id: loadingMessage.message_id
            });
            return;
        }

        const videoUrl = response.data.data.url;
        const username = response.data.data.user.username;

        // Download the video to the cache folder
        const videoPath = path.join(__dirname, 'cache', `${username}.mp4`);

        const videoResponse = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });
        const videoStream = videoResponse.data.pipe(fs.createWriteStream(videoPath));
        await new Promise(resolve => videoStream.on('finish', resolve));

        // Edit the loading message to indicate sending
        await bot.editMessageText('Sending...', {
            chat_id: chatId,
            message_id: loadingMessage.message_id
        });

        // Send the video with the username as the caption
        await bot.sendVideo(chatId, videoPath, { caption: `@${username}` });

        // Delete the loading/sending message with a "Thanos snap" effect
        await bot.deleteMessage(chatId, loadingMessage.message_id);

        // Clean up the cache
        fs.removeSync(videoPath);

    } catch (error) {
        console.error("Error executing shoti command:", error);
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};
