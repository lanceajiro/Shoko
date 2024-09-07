const cron = require('node-cron');
const axios = require('axios');

exports.meme = async function({ bot }) {
    // Function to fetch a meme from the API using Axios
    const fetchMeme = async () => {
        try {
            const response = await axios.get('https://meme-api.com/gimme');
            return { title: response.data.title, url: response.data.url };
        } catch (err) {
            return null;
        }
    };

    // Function to send a meme with its title to all groups where meme sending is enabled
    const sendMemeToAllGroups = async () => {
        const chatIds = [...global.data.groups.keys()];  // List of chat IDs from the global data

        for (const chatId of chatIds) {
            const groupSettings = global.data.groups.get(chatId.toString());
            if (groupSettings && groupSettings.meme) {  // Check if meme sending is enabled for the group
                const meme = await fetchMeme();
                if (meme) {
                    const { title, url } = meme;
                    try {
                        await bot.sendPhoto(chatId, url, { caption: title });
                    } catch (err) {
                        // Handle error if needed
                    }
                } else {
                    // Handle case where meme data is null if needed
                }
            }
        }
    };

    // Schedule the bot to send a meme every 5 seconds to all groups where meme sending is enabled
    cron.schedule('*/15 * * * *', async () => {
        await sendMemeToAllGroups();
    });
};
