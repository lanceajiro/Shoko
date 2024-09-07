module.exports = {
    config: {
        name: "notify",
        author: "Lance Ajiro",
        description: "Send a notification to all chat groups",
        access: "operator",
        category: "operator",
        usage: "[message]"
    },
    initialize: async function ({ bot, chatId, args, usages }) {
        const message = args.join(' ');
        if (!message) {
            return usages();
        }

        const chatGroups = global.data.groups;
        const totalGroups = chatGroups.size;

        if (totalGroups === 0) {
            return bot.sendMessage(chatId, "No chat groups found to send the message.");
        }

        let successCount = 0;
        let failureCount = 0;

        for (const [groupId, groupData] of chatGroups) {
            try {
                await bot.sendMessage(groupId, message);
                successCount++;
            } catch (error) {
                console.error(`Error sending message to group ${groupId}:`, error);
                failureCount++;
            }
        }

        const resultMessage = `
Notification sent to all chat groups.
${global.config.symbols} Success: ${successCount} groups
${global.config.symbols} Failed: ${failureCount} groups
        `;
        bot.sendMessage(chatId, resultMessage);
    }
};