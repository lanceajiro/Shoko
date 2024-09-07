const fs = require('fs');
const path = require('path'); // Use path for better path management
const restartStatusFile = path.join(__dirname, './restartStatus.json'); // Correct __dirname usage

// Sleep function to introduce delays
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.config = {
    name: 'restart',
    author: 'Lance Cochangco',
    access: 'operator',  // Control who can restart the bot
    description: 'Restart the bot and notify when it\'s back online.',
    category: 'Utility',
    usage: ['']
};

exports.initialize = async function ({ bot, chatId, userId, msg, args, usages }) {
    try {
        // Write to the status file to indicate a restart is pending
        fs.writeFileSync(restartStatusFile, JSON.stringify({ pending: true, chatId }));

        // Send a message indicating the restart is happening
        await bot.sendMessage(chatId, 'Restarting the bot...');

        // Wait for 2 seconds to ensure the message is sent
        await sleep(2000);

        // Exit the process to trigger a restart (handled by your hosting platform)
        process.exit(0);  // Gracefully exit, letting the hosting platform restart the bot
    } catch (error) {
        console.error("Error executing restart command:", error);
        await bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
};

// This should be called when the bot starts to check if it was restarted
exports.onBotStart = async function ({ bot }) {
    try {
        // Check if there was a pending restart
        if (fs.existsSync(restartStatusFile)) {
            const statusData = JSON.parse(fs.readFileSync(restartStatusFile, 'utf8'));

            if (statusData.pending) {
                // Send a success message to the same chat
                await bot.sendMessage(statusData.chatId, 'The bot has been successfully restarted!');

                // Clear the restart status
                fs.writeFileSync(restartStatusFile, JSON.stringify({ pending: false }));
            }
        }
    } catch (error) {
        console.error("Error during bot start:", error);
    }
};
