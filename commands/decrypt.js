const axios = require('axios');

exports.config = {
    name: 'decrypt',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Decrypts an obfuscated code from a provided URL.',
    category: 'tools',
    usage: ['decrypt <url>']
};

exports.initialize = async function ({ bot, chatId, args, usages }) {
    const url = args[0];

    if (!url || !url.startsWith("https://")) {
        return bot.sendMessage(chatId, "Please provide a valid URL and make sure the URL is raw and contains an obfuscated code.");
    }

    try {
        const { data: { result } } = await axios.post("https://apiv3-2l3o.onrender.com/decrypt", {
            url,
            token: "" // gist token (optional to upload to your own gist)
        });

        bot.sendMessage(chatId, result);
    } catch (error) {
        console.error("Error executing command:", error);
        bot.sendMessage(chatId, error.response?.data?.error || error.message || "An error occurred while executing the command. Please try again later.");
    }
};