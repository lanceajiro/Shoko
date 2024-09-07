exports.config = {
    name: 'join',
    author: 'Lance Cochangco',
    access: 'anyone',
    description: 'Join a group where the bot is present.',
    category: 'Utility',
    usage: ['join'],
};

exports.initialize = async function ({ bot, chatId, msg }) {
    const groupList = await Promise.all(
        Array.from(global.data.groups.entries()).map(async ([id, settings], index) => {
            let name;
            try {
                const chat = await bot.getChat(id);
                name = chat.title;
            } catch (error) {
                console.error(`Error fetching group name for ${id}:`, error);
                name = `Group ${index + 1}`;
            }
            return {
                index: index + 1,
                id,
                name,
                settings,
            };
        })
    );

    if (groupList.length === 0) {
        await bot.sendMessage(chatId, "No groups found in the database.");
        return;
    }

    let message = "Please reply with the number of the group you want to join:\n\n";
    groupList.forEach(group => {
        message += `${group.index}. ${group.name}\n`;
    });

    try {
        await bot.sendMessage(chatId, message);
    } catch (error) {
        console.error("Error sending group list:", error);
        bot.sendMessage(chatId, "An error occurred while processing your request. Please try again later.");
    }
};

exports.reply = async function ({ bot, chatId, args, replyMsg }) {
    const selectedNumber = parseInt(replyMsg.text.trim());
    const groupList = await Promise.all(
        Array.from(global.data.groups.entries()).map(async ([id, settings], index) => {
            let name;
            try {
                const chat = await bot.getChat(id);
                name = chat.title;
            } catch (error) {
                console.error(`Error fetching group name for ${id}:`, error);
                name = `Group ${index + 1}`;
            }
            return {
                index: index + 1,
                id,
                name,
                settings,
            };
        })
    );

    if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > groupList.length) {
        bot.sendMessage(chatId, "Invalid selection. Please reply with a valid number.");
        return;
    }

    const selectedGroup = groupList[selectedNumber - 1];

    try {
        const inviteLink = await bot.exportChatInviteLink(selectedGroup.id);
        await bot.sendMessage(chatId, `Click the link to join the group "${selectedGroup.name}": ${inviteLink}`);
    } catch (error) {
        console.error("Error generating invite link:", error);
        let errorMessage = "An error occurred while processing your request.";
        if (error.response && error.response.status === 403) {
            errorMessage += " The bot might not have the necessary permissions to generate an invite link.";
        }
        bot.sendMessage(chatId, errorMessage);
    }
};