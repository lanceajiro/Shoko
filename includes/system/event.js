const log = require('./log');

exports.event = async function({ bot, chatId, msg }) {
    try {
        const operatorId = global.config.operator[0] || global.config.operator; // Get the operator's ID from the config
        const botId = global.client.info.id; // Get the bot's ID

        // Handle new chat members joining
        if (msg.new_chat_members) {
            const chatInfo = await bot.getChat(chatId); // Fetch the chat information
            const title = chatInfo.title || "the group"; // Use a fallback if the title is undefined

            // Check if the bot itself is one of the new members
            const isBotAdded = msg.new_chat_members.some(member => member.id === botId);

            if (isBotAdded) {
                const actionBy = `${msg.from.first_name}${msg.from.last_name ? ' ' + msg.from.last_name : ''}`;
                // Notify the operator that the bot was added
                await bot.sendMessage(operatorId, `I was added to ${title} by ${actionBy}.`);

                const chatMember = await bot.getChatMember(chatId, botId);
                if (chatMember.status !== 'administrator') {
                    // The bot was added but not as an admin
                    const botname = global.client.info.first_name;
                    const symbol = global.config.symbols;
                    await bot.sendMessage(chatId, `🎉 ${botname} has been successfully connected!
            
Thank you for inviting me to ${title}. To unlock my full range of features, please consider granting me admin privileges.

${symbol} Available Commands: ${global.client.commands.size}
${symbol} Registered Users: ${global.data.users.size}
${symbol} Registered Groups: ${global.data.groups.size}

Click the button below to explore the commands I can assist you with. Let's make this chat even better together!`, global.client.buttons.help);

                }
            } else {
                // Welcome message for other new members
                const newMembers = msg.new_chat_members
                    .map(({ first_name, last_name }) => `${first_name}${last_name ? ' ' + last_name : ''}`)
                    .join(', ');
                await bot.sendMessage(chatId, `Hi ${newMembers}, Welcome to ${title}. Please enjoy your time here! 🥳♥`);
            }
        }

        // Handle members leaving the group
        if (msg.left_chat_member) {
            const { first_name, last_name } = msg.left_chat_member;
            const fullName = `${first_name}${last_name ? ' ' + last_name : ''}`;

            // If the bot was removed from the group
            if (msg.left_chat_member.id === botId) {
                try {
                    const chatInfo = await bot.getChat(chatId); // Fetch the chat information
                    const title = chatInfo.title || "the group"; // Use a fallback if the title is undefined
                    const actionBy = `${msg.from.first_name}${msg.from.last_name ? ' ' + msg.from.last_name : ''}`;

                    // Notify the operator that the bot was removed
                    await bot.sendMessage(operatorId, `I was removed from ${title} by ${actionBy}.`);

                    // Log a warning for the removal
                    log.warn(`Bot was removed from ${title} by ${actionBy}.`);
                } catch (error) {
                    // If the bot is forbidden from performing any actions after being removed
                    await bot.sendMessage(operatorId, `I was removed from a group but could not retrieve the group details or notify the chat due to permissions issues.`);
                    log.warn('Error handling bot removal due to permissions: ' + error.message);
                }
            } else {
                // Send a goodbye message if another member leaves
                const goodbyeMessage = msg.from.id === msg.left_chat_member.id
                    ? `${fullName} has left the group. We'll miss you!`
                    : `Goodbye, ${fullName}. You were removed by an admin.`;

                await bot.sendMessage(chatId, goodbyeMessage);
            }
        }

    } catch (error) {
        log.erro('Error handling event:\n' + error.message);
        await bot.sendMessage(operatorId, "An error occurred while processing the event.\n\n" + error.message);
    }
};