exports.config = {
    name: 'toggle',
    author: 'Lance Cochangco',
    access: 'admin',
    description: 'Toggle AI, Bot, Meme, OnlyAdmin, or Event settings for this group or view current status.',
    category: 'group',
    usage: [
        '[ ai | bot | meme | event | onlyadmin ] on',
        '[ ai | bot | meme | event | onlyadmin ] off',
        'status' 
    ] // Array of usage examples
};

exports.initialize = async function ({ bot, chatId, args, usages, data }) {
        // Check if the group is registered
        if (!global.data.groups.has(chatId.toString())) {
            bot.sendMessage(chatId, 'This group is not registered.');
            return;
        }
    
    const setting = args[0]; // Get the setting (e.g., ai, bot, meme, event or status)
    const state = args[1]; // Get the desired state (on or off)

    // If 'status' is the command, show the current status of settings
    if (setting && setting.toLowerCase() === 'status') {
        if (global.data.groups.has(chatId.toString())) {
            const groupSettings = global.data.groups.get(chatId.toString());
            const statusMessage = `
                Current settings for this group:
                
${global.config.symbols} AI: ${groupSettings.ai ? 'Enabled' : 'Disabled'}
${global.config.symbols} Bot: ${groupSettings.bot ? 'Enabled' : 'Disabled'}
${global.config.symbols} Meme: ${groupSettings.meme ? 'Enabled' : 'Disabled'}
${global.config.symbols} Event: ${groupSettings.event ? 'Enabled' : 'Disabled'}
${global.config.symbols} Only Admin: ${groupSettings.onlyadmin ? 'Enabled' : 'Disabled'}`;
            bot.sendMessage(chatId, statusMessage);
        } else {
            bot.sendMessage(chatId, "Group not found in the database.");
        }
        return;
    }

    if (!setting || !state) {
        return usages(); // Show usage if setting or state is missing
    }

    // Validate the state
    const stateValue = state.toLowerCase() === 'on';

    try {
        const resultMessage = data.toggle(chatId, setting.toLowerCase(), stateValue); // Toggle the setting
        bot.sendMessage(chatId, resultMessage); // Send a message to the chat with the result
    } catch (error) {
        console.error("Error executing command:", error);
        bot.sendMessage(chatId, "An error occurred while toggling the setting. Please try again later.");
    }
};
