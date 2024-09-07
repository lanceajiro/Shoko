const axios = require('axios');

exports.config = {
    name: 'ian',
    aliases: [],
    author: 'Christian Hadestia',
    access: 'anyone',
    description: 'Interact with Blackbox AI to generate a response based on a given prompt.',
    category: 'AI',
    usage: ['<prompt>', 'reply to a message']
};

exports.initialize = async function ({ bot, chatId, msg, args, usages }) {
    try {
        let prompt = args.join(' ');
        if (!prompt)
            return usages();

        if (msg.reply_to_message && msg.reply_to_message.text) {
            prompt = `"${msg.reply_to_message.text}", ${prompt}`;
        }

        const headers = {
            "Cookie": "YOUR COOKIE",
            "Content-Type": "application/json",
            "Origin": "https://www.blackbox.ia",
            "Referer": "https://www.blackbox.ia/agent/IanYQ3mknU",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
        };
        const config = {
            "messages": [{
                "id": "SVNaDhsdI_FlPHGFGlDyB",
                "content": `${prompt}`,
                "role": "user"
            }],
            "id": "SVNaDhsdI_FlPHGFGlDyB",
            "previewToken": null,
            "userId": null,
            "codeModelMode": true,
            "agentMode": {
                "mode": true,
                "id": "IanYQ3mknU",
                "name": "Ian"
            },
            "trendingAgentMode": {},
            "isMicMode": false,
            "maxTokens": 1024,
            "isChromeExt": false,
            "githubToken": null,
            "clickedAnswer2": false,
            "clickedAnswer3": false,
            "clickedForceWebSearch": false,
            "visitFromDelta": false,
            "mobileClient": false,
            "withCredentials": true
        };

        await bot.sendChatAction(chatId, 'typing');

        await Promise.race([
            axios.post('https://www.blackbox.ai/api/chat', config, { headers }),
            new Promise((_, rej) => setTimeout(() => rej(`Request Timeout for prompt: "${prompt}"`), 600000))
        ]).then(async (response) => {
            const reply = (response.data).replace(/\**/g, '').replace(/^\$@\$.*?\$@\$/g, '');

            await bot.sendMessage(chatId, `${reply}`);
        }).catch(async (err) => {
            console.error(err);
            await bot.sendMessage(chatId, `An error occurred: ${err.message}`);
        });
    } catch (error) {
        console.error("Error executing command:", error);
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};
