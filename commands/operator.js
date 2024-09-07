// Command configuration
exports.config = {
    name: "operator",
    access: "anyone",
    category: "system",
    description: "Operator management command",
    usage: "[add/list/remove]",
    author: "Deku"
};

// Command initialization
exports.initialize = async function ({ bot, chatId, msg, args, usages }) {
    // Access the operators directly from global.config
    let operators = global.config.operator || [];

    let command = args[0];
    let targetId = args[1] || (msg.reply_to_message ? msg.reply_to_message.from.id : null);

    // Extract user ID from mentions if present
    if (msg.reply_to_message && !targetId) {
        targetId = msg.reply_to_message.from.id;
    } else if (args.length > 1) {
        targetId = args[1];
    }

    // Function to get user info by ID
    async function getUserInfo(userId) {
        try {
            const userInfo = await bot.getChat(userId);
            return userInfo;
        } catch (err) {
            console.error("Error fetching user info:", err);
            return null;
        }
    }

    // Handle the 'list' command
    if (command === "list") {
        if (operators.length === 0) {
            return bot.sendMessage(chatId, "There are currently no operators.");
        }

        let message = "List of System Operators:\n\n";
        for (let operatorId of operators) {
            try {
                const userInfo = await getUserInfo(operatorId);
                if (userInfo) {
                    const name = userInfo.first_name + ' ' + (userInfo.last_name || '');
                    message += `${global.config.symbols || ''} ${name}\nhttps://t.me/${userInfo.username || operatorId}\n\n`;
                }
            } catch (err) {
                console.error("Error fetching user info:", err);
            }
        }
        return bot.sendMessage(chatId, message);
    }

    // Handle the 'add' command
    if (command === "add" || command === "-a" || command === "a") {
        if (!operators.includes(msg.from.id.toString())) {
            return bot.sendMessage(chatId, "You don't have permission to use this command. Only operators can use this method.");
        }

        let id = parseInt(targetId);
        if (isNaN(id)) {
            return bot.sendMessage(chatId, "⚠️ The ID provided is invalid.");
        }

        if (operators.includes(id.toString())) {
            return bot.sendMessage(chatId, "This user is already an operator.");
        }

        operators.push(id.toString());
        global.config.operator = operators; // Update the operator list in the global config

        const userInfo = await getUserInfo(id);
        const userName = userInfo ? `${userInfo.first_name} ${userInfo.last_name || ''}` : 'User';
        return bot.sendMessage(chatId, `${userName} has been successfully added as an operator.`);
    }

    // Handle the 'remove' command
    if (command === "remove" || command === "-r" || command === "r") {
        if (!operators.includes(msg.from.id.toString())) {
            return bot.sendMessage(chatId, "You don't have permission to use this command. Only operators can use this method.");
        }

        if (operators.length === 0) {
            return bot.sendMessage(chatId, "There are no operators to remove.");
        }

        let id = parseInt(targetId);
        if (isNaN(id)) {
            return bot.sendMessage(chatId, "⚠️ The ID provided is invalid.");
        }

        if (!operators.includes(id.toString())) {
            return bot.sendMessage(chatId, "This user is not an operator.");
        }

        global.config.operator = operators.filter(a => a !== id.toString());

        const userInfo = await getUserInfo(id);
        const userName = userInfo ? `${userInfo.first_name} ${userInfo.last_name || ''}` : 'User';
        return bot.sendMessage(chatId, `${userName} has been successfully removed as an operator.`);
    }

    // Handle invalid or unknown commands
    return usages();
};
