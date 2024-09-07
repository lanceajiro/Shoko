const figlet = require('figlet');
const log = require('./log');

function createLineSeparator() {
    const consoleWidth = process.stdout.columns || 45;
    return `◆${'━'.repeat(consoleWidth - 2)}◆`;
}

async function showInfo() {
    try {
        // Fetch bot information
        global.client.info = await global.client.bot.getMe();

        // Fetch operator (owner) name
        const ownerId = global.config.operator[0];
        let operatorName;
        try {
            const chat = await global.client.bot.getChat(ownerId);
            operatorName = [chat.first_name, chat.last_name].filter(Boolean).join(' ') || 'Unknown';
        } catch (error) {
            log.erro(`Error fetching operator name: ${error.message}`);
            operatorName = 'Unknown';
        }

        // Generate and log figlet text
        figlet(global.package.name, async (err, figletData) => {
            if (err) {
                log.erro(`Error generating figlet text: ${err.message}`);
                return;
            }
            console.clear();
            // Log figlet data and bot info
            log.plain(figletData);
            const lineSeparator = createLineSeparator();
            log.plain(lineSeparator);
            log.plain(`[+] Version   : ${global.package.version}`);
            log.plain(`[+] Developer : ${global.package.author}`);
            log.plain('[+] From      : Philippines');
            log.plain(lineSeparator);

            log.inf('Bot Information');
            log.inf(`Name: ${global.client.info.first_name}`);
            log.inf(`ID: ${global.client.info.id}`);
            log.inf(`Username: @${global.client.info.username}`);
            log.inf(`Owner: ${operatorName}`);
            
            // Animate and log command count
            await log.animateCount(global.client.commands.size);

            // Log user and group counts
            log.inf(`Users: ${global.data.users.size}`);
            log.inf(`Groups: ${global.data.groups.size}`);
            log.plain(lineSeparator);
            log.hm('Bot is now running and ready to use');

            // Validate commands
            global.client.commands.forEach((script, commandName) => {
                if (!script.config.name || !script.config.access || !script.config.category) {
                    log.warn(`Invalid command detected: ${commandName}`);
                }
            });
        });
    } catch (error) {
        log.erro(`Error displaying bot info: ${error.message}`);
    }
}

module.exports = { showInfo };
