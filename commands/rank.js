exports.config = {
    name: 'rank',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Displays the user\'s current rank, experience, and a custom message.',
    category: 'Utility',
    usage: ['Reply to a user\'s message']
};

exports.initialize = async function ({ bot, chatId, userId, data, msg }) {
    try {
        // Default target is the command sender
        let targetUserId = userId;
        let targetFullName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ');

        // Check if the command is replying to a user's message
        if (msg.reply_to_message) {
            targetUserId = msg.reply_to_message.from.id;
            targetFullName = [msg.reply_to_message.from.first_name, msg.reply_to_message.from.last_name].filter(Boolean).join(' ');
        }

        // Rank up the target user and get a response message
        const rankMessage = data.rankUp(targetUserId, targetFullName);

        const user = global.data.users.get(targetUserId.toString());

        if (user) {
            const { level, exp, messageCount } = user;
            const currentRankMessage = `${targetFullName} is currently at level ${level} with ${exp} experience points and ${messageCount} messages.`;

            // If the command is in reply to another user's message
            if (msg.reply_to_message) {
                await bot.sendMessage(chatId, currentRankMessage);
            } else {
                // Normal usage message
                const normalUsageMessage = `${targetFullName}, you are currently at level ${level} with ${exp} experience points and ${messageCount} messages.`;
                await bot.sendMessage(chatId, normalUsageMessage);
            }

            if (rankMessage) {
                // If the user has leveled up, send the rank-up message as well
                await bot.sendMessage(chatId, rankMessage);
            }
        } else {
            await bot.sendMessage(chatId, "User data not found. Please try again later.");
        }
    } catch (error) {
        console.error("Error executing rank command:", error);
        await bot.sendMessage(chatId, "An error occurred while executing the rank command. Please try again later.");
    }
};
