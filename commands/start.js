const axios = require('axios');

exports.config = {
    name: 'start', 
    author: 'Lance Cochangco', 
    access: 'anyone',
    description: 'Initiates The Bot', 
    category: 'Utility', 
    usage: [''] 
};

exports.initialize = async function ({ bot, chatId, args, help }) {
    bot.sendMessage(chatId, 'Hello There. Press the button below to get all of the available commands', help);
};