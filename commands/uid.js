exports.config = {
    name: 'uid',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Get your own userId or the userId of the replied-to user.',
    category: 'Utility',
    usage: ['', 'replied it to other user\'s message']
};

exports.initialize = async function ({ bot, chatId, userId, msg }) {
    try {
        let targetUserId = msg.from.id;  // Default to the user who issued the command

        // Check if the command is a reply to another user's message
        if (msg.reply_to_message) {
            targetUserId = msg.reply_to_message.from.id;  // Get the userId of the replied-to message sender
        }

        // Send the target user's ID back to the chat
        await bot.sendMessage(chatId, `${targetUserId}`);
    } catch (error) {
        console.error("Error executing command:", error);
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};