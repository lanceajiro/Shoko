const fs = require('fs');
const log = require('./log');
const data = require('./database');

const request = (bot, chatId, userId) => {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Agree', callback_data: `auth_agree_${userId}` },
                    { text: 'Disagree', callback_data: `auth_disagree_${userId}` }
                ]
            ]
        }
    };

    fs.readFile(__dirname + '/manual.txt', 'utf8', (err, manualContent) => {
        if (err) {
            log.erro('Error reading manual.txt: ' + err.message);
            bot.sendMessage(chatId, "An error occurred while loading the bot's policy. Please try again later.");
            return;
        }

        const policyMessage = `
To use the bot's features, you need to agree to the following policy:

${manualContent}

If you agree, you'll be able to use all bot features. If you disagree you won't be able to use bot commands or AI features until you agree.`;

        bot.sendMessage(chatId, policyMessage, options);
    });
};

const response = async (bot, callbackQuery) => {
    const userId = callbackQuery.from.id.toString();
    const chatId = callbackQuery.message.chat.id;
    const dataParts = callbackQuery.data.split('_');

    if (dataParts[0] !== 'auth') {
        return;
    }

    const action = dataParts[1];

    let responseText;
    if (action === 'agree') {
        const userLog = data.addUser(userId);
        if (userLog) log.data(userLog);
        responseText = 'Thank you for agreeing! You have been registered and can now use all bot features.';
    } else if (action === 'disagree') {
        responseText = 'You disagreed with the policy. You can still send messages, but won\'t be able to use bot commands or AI features.';
    } else {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Invalid authorization action.' });
        return;
    }

    try {
        await bot.editMessageText(responseText, {
            chat_id: chatId,
            message_id: callbackQuery.message.message_id
        });
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('Error updating message:', error);
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'An error occurred. Please try again.' });
    }
};

module.exports = {
    request,
    response
};